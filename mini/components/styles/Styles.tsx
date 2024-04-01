import { Icon24CheckCircleFillGreen } from "@vkontakte/icons";
import {
	Group,
	Header,
	HorizontalCell,
	HorizontalScroll,
	Image,
	Subhead,
} from "@vkontakte/vkui";

import cartoon from "~/mini/assets/cartoon.jpg";
import cowboy from "~/mini/assets/cowboy.jpg";
import cyberpunk from "~/mini/assets/cyberpunk.jpg";
import dune from "~/mini/assets/dune.jpg";
import gangster from "~/mini/assets/gangster.jpg";
import gold from "~/mini/assets/gold.jpg";
import noir from "~/mini/assets/noir.jpg";
import official from "~/mini/assets/official.jpg";
import poster from "~/mini/assets/poster.jpg";
import steampunk from "~/mini/assets/steampunk.jpg";
import superhero from "~/mini/assets/superhero.jpg";
import watercolor from "~/mini/assets/watercolor.jpg";

type Props = {
	style: string;
	setStyle: (style: string) => void;
};

const styles = {
	official: ["Официальный", official],
	noir: ["Нуар", noir],
	cyberpunk: ["Киберпанк", cyberpunk],
	cartoon: ["Мультфильм", cartoon],
	dune: ["Дюна", dune],
	cowboy: ["Ковбой", cowboy],
	poster: ["Видеоигра", poster],
	gangster: ["Бандит", gangster],
	superhero: ["Супергерой", superhero],
	steampunk: ["Стимпанк", steampunk],
	watercolor: ["Акварель", watercolor],
	gold: ["Роскошь", gold],
} as const;

export function Styles({ style, setStyle }: Props): JSX.Element {
	return (
		<Group header={<Header>2. Выбор стиля</Header>}>
			<HorizontalScroll>
				<div style={{ display: "flex", maxWidth: "0" }}>
					{Object.entries(styles).map(([key, [name, src]]) => (
						<HorizontalCell
							key={key}
							size="l"
							header={
								<Subhead weight="2" style={{ textAlign: "center" }}>
									{name}
								</Subhead>
							}
							onClick={() => setStyle(key)}
						>
							<Image src={src} size={128}>
								{style === key && (
									<Image.Badge>
										<Icon24CheckCircleFillGreen />
									</Image.Badge>
								)}
							</Image>
						</HorizontalCell>
					))}
				</div>
			</HorizontalScroll>
		</Group>
	);
}
