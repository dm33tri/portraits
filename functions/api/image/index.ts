export const onRequestPost: PagesFunction<Env> = async (context) => {
	const storage = context.env.R2;
	const id = crypto.randomUUID();
	const request = await context.request.formData();
	const file = request.get("file") as unknown as File;
	const buffer = await file.arrayBuffer();
	const httpMetadata = { contentType: file.type };
	await storage.put(id, buffer, { httpMetadata });
	return Response.json({ id });
};
