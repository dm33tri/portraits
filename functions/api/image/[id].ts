export const onRequestGet: PagesFunction<Env, "id"> = async (context) => {
	const object = await context.env.R2.get(context.params.id as string);
	const headers = new Headers();
	object.writeHttpMetadata(headers);
	return new Response(object.body, { headers });
};
