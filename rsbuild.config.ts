import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
	source: {
		entry: {
			mini: "./mini/index.tsx",
		},
	},
	plugins: [pluginReact()],
	html: {
		title: "Portraits",
	},
});
