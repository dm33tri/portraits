import { AdaptivityProvider, ConfigProvider } from "@vkontakte/vkui";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "@vkontakte/vkui/dist/vkui.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<ConfigProvider>
			<AdaptivityProvider>
				<App />
			</AdaptivityProvider>
		</ConfigProvider>
	</React.StrictMode>,
);
