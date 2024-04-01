import { Icon56GhostOutline } from "@vkontakte/icons";
import { Group, Header, Placeholder } from "@vkontakte/vkui";
import { useMemo, useState } from "react";

import { Card } from "~/mini/components";
import { useTransitionGroupGallery } from "~/mini/hooks/useTransitionGroupGallery";

import styles from "./Gallery.module.css";

type Props = {
	tasks: Task[];
	platform: string | undefined;
};

export function Gallery({ tasks, platform }: Props): JSX.Element | null {
	const [deleted, setDeleted] = useState<Set<string>>(new Set());
	const transitionGroup = useTransitionGroupGallery();
	const visibleTasks = useMemo(
		() =>
			tasks.filter(
				(task) => !(deleted.has(task.id) || task.status === "error"),
			),
		[tasks, deleted],
	);

	if (!visibleTasks.length) {
		return null;
	}

	const cards = visibleTasks.map((task) => (
		<Card
			task={task}
			key={task.id}
			platform={platform}
			onDelete={() => {
				setDeleted((deleted) => new Set([...deleted, task.id]));
			}}
		/>
	));

	return (
		<Group header={<Header>Результат</Header>}>
			{cards.length === 0 && <Placeholder icon={<Icon56GhostOutline />} />}
			<div className={styles.gallery} ref={transitionGroup}>
				{cards}
			</div>
		</Group>
	);
}
