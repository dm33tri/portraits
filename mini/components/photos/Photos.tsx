import {
	Icon24CheckCircleFillGreen,
	Icon56CameraOffOutline,
} from "@vkontakte/icons";
import bridge from "@vkontakte/vk-bridge";
import {
	Button,
	FormItem,
	HorizontalCell,
	HorizontalScroll,
	Image,
	Placeholder,
	Spinner,
} from "@vkontakte/vkui";
import { useEffect, useState } from "react";

import styles from "./Photos.module.css";

export type Props = {
	files: Record<string, File>;
	selected: string | undefined;
	setSelected: (selected: string) => void;
};

const initialAccess = location.search.includes(
	"vk_access_token_settings=photos",
)
	? "probably"
	: undefined;

export function Photos({ files, selected, setSelected }: Props): JSX.Element {
	const [photos, setPhotos] = useState<string[]>();
	const [access, setAccess] = useState<boolean | "probably" | undefined>(
		initialAccess,
	);

	const requestAuthToken = () =>
		bridge
			.send("VKWebAppGetAuthToken", {
				app_id: Number.parseInt(process.env.PUBLIC_APP_ID),
				scope: "photos",
			})
			.then((data) => {
				if (data.scope.includes("photos")) {
					setAccess(true);
					return data.access_token;
				}
				setAccess(false);
			});

	const checkPhotosAccess = async () => {
		if (!bridge.isEmbedded()) {
			setPhotos([]);
			setAccess(true);
			return;
		}
		const { result } = await bridge.send("VKWebAppCheckAllowedScopes", {
			scopes: "photos",
		});
		if (result.find(({ scope, allowed }) => scope === "photos" && allowed)) {
			return requestAuthToken();
		}
		setAccess(false);
	};

	const loadPhotos = async (token?: string) => {
		if (!token) return;

		const { response } = await bridge.send("VKWebAppCallAPIMethod", {
			method: "photos.getAll",
			params: {
				count: 10,
				access_token: token,
				v: "5.199",
			},
		});

		if (response.items) {
			const photos = (response.items as { sizes: { url: string }[] }[]).map(
				(item) => item.sizes[item.sizes.length - 1].url,
			);
			setPhotos(photos);
		}
	};

	useEffect(() => {
		checkPhotosAccess().then(loadPhotos);
	}, []);

	const hasFiles = Object.keys(files).length > 0;

	if (hasFiles) {
		return (
			<FormItem noPadding={!!photos}>
				<HorizontalScroll>
					<div style={{ display: "flex" }}>
						{Object.entries(files).map(([key, file]) => (
							<HorizontalCell
								key={key}
								size="l"
								onClick={() => setSelected(key)}
							>
								<Image src={URL.createObjectURL(file)} size={128}>
									{selected === key && (
										<Image.Badge>
											<Icon24CheckCircleFillGreen />
										</Image.Badge>
									)}
								</Image>
							</HorizontalCell>
						))}
					</div>
				</HorizontalScroll>
			</FormItem>
		);
	}

	if (access && !photos) {
		return (
			<FormItem noPadding>
				<HorizontalScroll>
					<div className={styles.skeleton}>
						<div />
						<div />
						<div />
						<div />
					</div>
				</HorizontalScroll>
			</FormItem>
		);
	}

	if (access === undefined) {
		return (
			<FormItem>
				<Spinner size="large" />
			</FormItem>
		);
	}

	if (access === false) {
		return (
			<FormItem>
				<Button
					onClick={() => requestAuthToken().then(loadPhotos)}
					size="l"
					mode="secondary"
					type="button"
					align="center"
					stretched
				>
					Выбрать из ВКонтакте
				</Button>
			</FormItem>
		);
	}

	return (
		<Placeholder icon={<Icon56CameraOffOutline />} noPadding>
			Нет фото
		</Placeholder>
	);
}
