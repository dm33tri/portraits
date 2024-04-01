export const onRequest: PagesFunction<Env> = (context) => {
	return context.env.ASSETS.fetch(context.request);
};
