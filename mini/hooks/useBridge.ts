import bridge from "@vkontakte/vk-bridge";
import { useEffect, useState } from "react";

export const useBridge = () => {
	const [platform, setPlatform] = useState<string>();

	useEffect(() => {
		const initPromise = bridge.send("VKWebAppInit");
		const authPromise = fetch(`/api/init${document.location.search}`).then(
			async (response) => {
				const token = response.headers.get("token");
				if (token) {
					localStorage.setItem("token", token);
				}
			},
		);
		Promise.all([initPromise, authPromise]).then(() => {
			bridge.send("VKWebAppGetClientVersion").then(({ platform }) => {
				setPlatform(platform);
			});
		});
	}, []);

	return { platform };
};
