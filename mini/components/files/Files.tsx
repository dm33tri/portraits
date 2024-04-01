import { Icon24Attach, Icon24Camera } from "@vkontakte/icons";
import { ButtonGroup, File, FormItem } from "@vkontakte/vkui";

export type Props = {
	onFile: (file: File) => void;
};

export function Files({ onFile }: Props): JSX.Element {
	const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files.length > 0) {
			onFile(event.target.files[0]);
		}
	};

	return (
		<FormItem>
			<ButtonGroup mode="horizontal" stretched>
				<File
					onChange={onChange}
					mode="secondary"
					before={<Icon24Attach role="presentation" />}
					size="l"
					align="center"
					accept="image/jpeg,image/png,image/webp"
					stretched
				>
					Загрузить
				</File>
				<File
					onChange={onChange}
					mode="secondary"
					before={<Icon24Camera role="presentation" />}
					size="l"
					align="center"
					accept="image/jpeg,image/png,image/webp"
					capture="user"
					stretched
				>
					Сделать фото
				</File>
			</ButtonGroup>
		</FormItem>
	);
}
