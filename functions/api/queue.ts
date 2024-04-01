export const onRequest: PagesFunction<Env> = async (context) => {
	const id = context.env.QUEUE.idFromName("queue");
	const stub = context.env.QUEUE.get(id);
	return stub.fetch(context.request);
};
