import {
	Icon20DownloadOutline,
	Icon20TrashSimpleOutline,
} from "@vkontakte/icons";
import bridge from "@vkontakte/vk-bridge";
import { Button, Headline, Spinner, Card as VkCard } from "@vkontakte/vkui";
import { type ElementType, useState } from "react";

import styles from "./Card.module.css";

export type Props = {
	task: Task;
	platform: string | undefined;
	onDelete: () => void;
};

const STATUSES = {
	error: "Ошибка",
	done: "Готово",
	queued: "В очереди",
	running: "Обработка",
} as const;

function DownloadButton({ task, platform }: Pick<Props, "task" | "platform">) {
	if (task.status !== "done") {
		return null;
	}

	const downloadProps =
		platform === "ios" || platform === "android"
			? {
					onClick: () => {
						bridge.send("VKWebAppDownloadFile", {
							url: `${document.location.origin}/api/image/${task.result}`,
							filename: "IMG_app.png",
						});
					},
				}
			: {
					Component: "a" as ElementType,
					href: `/api/image/${task.result}`,
					download: "IMG_app.png",
				};

	return (
		<Button
			{...downloadProps}
			before={<Icon20DownloadOutline />}
			appearance="overlay"
			mode="secondary"
			label="Скачать"
			size="m"
			className={styles.button}
		/>
	);
}

export function Card({ task, platform, onDelete }: Props) {
	const { status, result, queue, id } = task;
	const [loaded, setLoaded] = useState(false);
	const message = loaded ? null : `${STATUSES[status]} ${queue || ""}`;

	return (
		<VkCard mode="shadow" className={styles.card} id={id}>
			<div className={styles.container}>
				<div className={styles.content}>
					{result ? (
						<img
							alt="Результат"
							src={`/api/image/${result}`}
							onLoad={() => setLoaded(true)}
							className={`${styles.image} ${!loaded ? styles.transparent : ""}`}
						/>
					) : null}
				</div>
				{!loaded ? (
					<div className={styles.content}>
						<Spinner size="large" />
					</div>
				) : null}
				<div className={styles.body}>
					{message ? (
						<Headline
							weight="2"
							level="1"
							Component="span"
							className={styles.text}
						>
							{message}
						</Headline>
					) : null}
					<DownloadButton task={task} platform={platform} />
					<Button
						before={
							<Icon20TrashSimpleOutline fill="var(--vkui--color_background_negative)" />
						}
						appearance="overlay"
						mode="secondary"
						label="Удалить"
						size="m"
						className={styles.button}
						onClick={onDelete}
					/>
				</div>
			</div>
		</VkCard>
	);
}
