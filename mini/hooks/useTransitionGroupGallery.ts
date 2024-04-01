import { useMemo, useRef } from "react";

export const useTransitionGroupGallery = () => {
	const ref = useRef<{
		nodesMap: Map<HTMLElement | string, [number, number, HTMLElement]>;
		element: HTMLElement;
		parentElement: HTMLElement;
		count: number;
		height: number;
	}>();

	const scrolled = useRef(false);

	const callback = useMemo(
		() => (element: Element | null) => {
			if (!element) {
				return;
			}
			if (ref.current && ref.current.count !== element.children.length) {
				const { nodesMap } = ref.current;
				let i = element.children.length;
				// @ts-ignore
				for (const child of element.children) {
					const childHtml = child as HTMLElement;
					childHtml.style.zIndex = `${i--}`;
					childHtml.style.transition = "none";
					const byId = childHtml.id && nodesMap.get(childHtml.id);
					const byNode = nodesMap.get(childHtml);
					const oldNode = byId || byNode;
					if (!oldNode) {
						childHtml.style.transform = "scale(0)";
						childHtml.style.transformOrigin = "center";
						childHtml.style.opacity = "0";
						window.requestAnimationFrame(() => {
							childHtml.style.transition = "transform .2s, opacity .2s";
							childHtml.style.transform = "none";
							childHtml.style.opacity = "1";
							childHtml.ontransitionend = () => {
								childHtml.style.transition = "none";
								childHtml.style.transform = "none";
								childHtml.style.opacity = "1";
							};
						});

						continue;
					}
					if (byId) {
						nodesMap.delete(childHtml.id);
					}
					if (byNode) {
						nodesMap.delete(childHtml);
					}
					const { offsetLeft: left, offsetTop: top } = child as HTMLElement;
					const [oldLeft, oldTop] = oldNode;
					const dx = oldLeft - left;
					const dy = oldTop - top;
					childHtml.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
					window.requestAnimationFrame(() => {
						childHtml.style.transition = "transform .2s";
						childHtml.style.transform = "translate3d(0, 0, 0)";
						childHtml.ontransitionend = () => {
							childHtml.style.transition = "none";
							childHtml.style.transform = "none";
						};
					});
				}
				for (const [key, [left, top, oldNode]] of nodesMap) {
					const oldNodeHtml = oldNode.cloneNode(true) as HTMLElement;
					nodesMap.delete(key);
					oldNodeHtml.style.zIndex = `${i--}`;
					oldNodeHtml.style.transition = "none";
					oldNodeHtml.style.position = "absolute";
					oldNodeHtml.style.left = `${left}px`;
					oldNodeHtml.style.top = `${top}px`;
					oldNodeHtml.style.transform = "scale(1)";
					oldNodeHtml.style.opacity = "1";
					element.parentElement!.appendChild(oldNodeHtml);
					window.requestAnimationFrame(() => {
						oldNodeHtml.style.transition = "transform .2s, opacity .2s";
						oldNodeHtml.style.transform = "scale(0)";
						oldNodeHtml.style.opacity = "0";
						oldNodeHtml.ontransitionend = () => {
							oldNodeHtml.remove();
						};
					});
				}
			} else if (
				(!ref.current || ref.current.count === 0) &&
				element.children.length > 0
			) {
				const htmlElement = element as HTMLElement;
				htmlElement.style.height = "0";
				htmlElement.style.transition = "none";
				window.requestAnimationFrame(() => {
					htmlElement.style.transition = "height .2s";
					htmlElement.style.height = `${htmlElement.scrollHeight}px`;
					htmlElement.ontransitionend = () => {
						htmlElement.style.transition = "none";
						htmlElement.style.height = "auto";
						if (!scrolled.current) {
							scrolled.current = true;
							htmlElement.scrollIntoView({ behavior: "smooth" });
						}
					};
				});
				// @ts-ignore
				for (const child of element.children) {
					const childHtml = child as HTMLElement;
					childHtml.style.transform = "scale(0)";
					childHtml.style.transformOrigin = "center";
					childHtml.style.opacity = "0";
					childHtml.style.transition = "none";
					window.requestAnimationFrame(() => {
						childHtml.style.transition = "transform .2s, opacity .2s";
						childHtml.style.transform = "none";
						childHtml.style.opacity = "1";
						childHtml.ontransitionend = () => {
							childHtml.style.transition = "none";
							childHtml.style.transform = "none";
							childHtml.style.opacity = "1";
						};
					});
				}
			} else if (ref.current && element.children.length === 0) {
				const htmlElement = element as HTMLElement;
				htmlElement.style.height = `${htmlElement.scrollHeight}px`;
				htmlElement.style.transition = "none";
				window.requestAnimationFrame(() => {
					htmlElement.style.transition = "height .2s";
					htmlElement.style.height = "0";
					htmlElement.ontransitionend = () => {
						htmlElement.style.transition = "none";
						htmlElement.style.height = "auto";
					};
				});
			}

			const nodesMap = new Map();
			// @ts-ignore
			for (const child of element.children) {
				const { offsetLeft, offsetTop } = child as HTMLElement;
				if (child.id) {
					nodesMap.set(child.id, [offsetLeft, offsetTop, child]);
				} else {
					nodesMap.set(child, [offsetLeft, offsetTop, child]);
				}
			}
			ref.current = {
				nodesMap,
				count: element.children.length,
				element: element as HTMLElement,
				parentElement: element.parentElement as HTMLElement,
				height: element.scrollHeight,
			};
		},
		[],
	);

	return (element: Element | null) => callback(element);
};
