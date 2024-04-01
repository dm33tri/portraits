import { Icon28ErrorCircleOutline } from "@vkontakte/icons";
import {
	AppRoot,
	Button,
	FormItem,
	Group,
	Header,
	Panel,
	PanelHeader,
	Snackbar,
	SplitCol,
	SplitLayout,
	View,
} from "@vkontakte/vkui";
import { type FormEvent, useState } from "react";

import { Files, Gallery, Photos, Styles } from "~/mini/components";
import { useGenerate } from "~/mini/hooks/useGenerate";

function ErrorSnackbar({
	children,
	setSnackbar,
}: {
	children: React.ReactNode;
	setSnackbar: (snackbar: JSX.Element | null) => void;
}) {
	return (
		<Snackbar
			duration={1000}
			onClose={() => setSnackbar(null)}
			before={
				<Icon28ErrorCircleOutline fill="var(--vkui--color_icon_negative)" />
			}
		>
			{children}
		</Snackbar>
	);
}

function App() {
	const { files, selected, tasks, generate, setSelected, onFile } =
		useGenerate();
	const [style, setStyle] = useState<string>("official");
	const disabled = false;
	const onSubmit = (event: FormEvent) => {
		event.preventDefault();
		generate(style);
	};

	return (
		<AppRoot>
			<SplitLayout header={<PanelHeader />}>
				<SplitCol width="100%" stretchedOnMobile autoSpaced>
					<View activePanel="main">
						<Panel id="main">
							<PanelHeader>Портрет</PanelHeader>
							<Group mode="plain">
								<form onSubmit={onSubmit}>
									<Group header={<Header>1. Выбор фото</Header>}>
										<Photos
											files={files}
											selected={selected}
											setSelected={setSelected}
										/>
										<Files onFile={onFile} />
									</Group>

									<Styles style={style} setStyle={setStyle} />

									<Group header={<Header>3. Создание картинки</Header>}>
										<FormItem>
											<Button
												size="l"
												type="submit"
												disabled={disabled}
												stretched
											>
												Создать
											</Button>
										</FormItem>
									</Group>
								</form>

								<Gallery platform={"web"} tasks={tasks} />
							</Group>
						</Panel>
					</View>
				</SplitCol>
			</SplitLayout>
		</AppRoot>
	);
}

export default App;
