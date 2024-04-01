const handleErrors: PagesFunction<Env> = async (context) => {
	try {
		return await context.next();
	} catch (error) {
		console.error(error.message);
		return Response.json({ error: (error as Error).message }, { status: 400 });
	}
};

export const onRequest = [handleErrors];
