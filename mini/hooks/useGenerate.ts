import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";

const MAX_SIZE = 640;

const resizeImage = (file: File) =>
	new Promise<File>((resolve, reject) => {
		const reader = new FileReader();
		const image = new Image();

		image.onload = () => {
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d")!;
			let { width, height } = image;

			if (width > height && width > MAX_SIZE) {
				height *= MAX_SIZE / width;
				width = MAX_SIZE;
			} else if (height > MAX_SIZE) {
				width *= MAX_SIZE / height;
				height = MAX_SIZE;
			}

			canvas.width = width;
			canvas.height = height;
			ctx.drawImage(image, 0, 0, width, height);
			canvas.toBlob((blob) => {
				if (!blob) {
					reject();
					return;
				}
				const file = new File([blob], `${crypto.randomUUID()}.jpg`, {
					type: "image/jpeg",
				});
				resolve(file);
			}, "image/jpeg");
		};

		reader.onload = () => {
			image.src = reader.result as string;
		};

		reader.readAsDataURL(file);
	});

const uploadImage = async (file: File): Promise<string> => {
	const body = new FormData();
	body.append("file", file);
	const request = await fetch("/api/image", { method: "post", body });
	const json = await request.json();
	return json.id;
};

export function useGenerate() {
	const wsRef = useRef<WebSocket>();
	const [files, setFiles] = useState<Record<string, File>>({});
	const [uploaded, setUploaded] = useState<Record<string, string>>({});
	const [selected, setSelected] = useState<string>();
	const [tasks, setTasks] = useState<Task[]>([]);

	if (!wsRef.current) {
		const init = () => {
			const ws = new WebSocket(
				location.protocol === "https:"
					? `wss://${location.host}/api/queue`
					: `ws://${location.host}/api/queue`,
			);
			ws.onclose = () => {
				init();
			};
			ws.onmessage = (event: MessageEvent<string>) => {
				const data = JSON.parse(event.data);
				setTasks((results) => {
					const existing = results.find((result) => result.id === data.id);
					if (existing) {
						return results.map((result) =>
							result === existing ? data : result,
						);
					}
					return [data, ...results];
				});
			};
			wsRef.current = ws;
		};
		init();
	}

	const onFile = async (file: File) => {
		const resized = await resizeImage(file);
		const buffer = await resized.arrayBuffer();
		const hash = await crypto.subtle.digest("SHA-1", buffer);
		const hex = Array.from(new Uint8Array(hash))
			.map((x) => x.toString(16).padStart(2, "0"))
			.join("");
		setFiles((files) => ({ [hex]: resized, ...files }));
		setSelected(hex);
	};

	const generate = async (style: string) => {
		if (!selected) {
			throw new Error("image not selected");
		}

		let input: string;
		if (!(selected in uploaded)) {
			input = await uploadImage(files[selected]);
			setUploaded({ ...uploaded, [selected]: input });
		} else {
			input = uploaded[selected];
		}

		if (wsRef.current) {
			wsRef.current.send(
				JSON.stringify({ input, style } satisfies Pick<
					Task,
					"input" | "style"
				>),
			);
		}
	};

	return { files, selected, tasks, setSelected, onFile, generate };
}
