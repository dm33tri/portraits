import { styles } from "./styles";

export class Queue implements DurableObject {
	state: DurableObjectState;
	env: Env;

	constructor(state: DurableObjectState, env: Env) {
		this.state = state;
		this.env = env;
	}

	async fetch(request: Request) {
		if (request.headers.get("Upgrade") !== "websocket") {
			return Response.json(
				{ error: 'expected "Upgrade: websocket"' },
				{ status: 426 },
			);
		}
		const auth = request.headers.get("Auth");
		const { type = "client" } = await this.auth(auth);
		const pair = new WebSocketPair();
		const [client, server] = Object.values(pair);
		console.log("connect", type)
		if (type === "worker") {
			this.state.acceptWebSocket(server, ["worker"]);
			this.run(server);
		} else if (type === "client") {
			this.state.acceptWebSocket(server, ["client"]);
		} else {
			return Response.json({ error: "unauthorized" }, { status: 401 });
		}
		return new Response(null, { status: 101, webSocket: client });
	}

	async put(message: Task) {
		const [queue = 0, count = 0] = await Promise.all([
			this.state.storage.get<number>("queue"),
			this.state.storage.get<number>("count"),
		]);
		const key = `task-${count.toString(10).padStart(6, "0")}`;
		const task = { ...message, status: "queued" as const, queue };
		await Promise.all([
			this.state.storage.put("count", count + 1),
			this.state.storage.put("queue", queue + 1),
			this.state.storage.put(key, task),
			this.next(),
			this.notify(task),
		]);
	}

	async pop() {
		const clients = this.state.getWebSockets("client");
		const [queue = 0, tasks = []] = await Promise.all([
			this.state.storage.get<number>("queue"),
			this.state.storage.list({ prefix: "task-", limit: 1 }),
		]);
		for (const [key, task] of tasks) {
			await Promise.all([
				this.state.storage.put("queue", queue - 1),
				this.state.storage.delete(key),
			]);
			for (const client of clients) {
				let changed = false;
				const tasks = client.deserializeAttachment() || [];
				for (const task of tasks) {
					if (task.queue) {
						changed = true;
						task.queue -= 1;
						client.send(JSON.stringify(task));
					}
				}
				if (changed) {
					client.serializeAttachment(tasks);
				}
			}
			task.queue = undefined;
			return task;
		}
	}

	async next() {
		const workers = this.state
			.getWebSockets("worker")
			.filter((ws) => !ws.deserializeAttachment());
		if (workers.length === 0) {
			return;
		}
		const random = Math.floor(Math.random() * workers.length);
		await this.run(workers[random]);
	}

	async run(ws: WebSocket) {
		console.log("run1", ws.deserializeAttachment())
		if (ws.deserializeAttachment()) {
			return;
		}
		
		const task = await this.pop();
		if (task) {
			const args = styles[task.style] || styles.official;
			console.log("run2", { ...task, args })
			ws.send(JSON.stringify({ ...task, args }));
			ws.serializeAttachment(task);
		}
	}

	async auth(input: string) {
		if (input === "worker") {
			return { type: "worker" };
		}
		return { type: "client" };
	}

	async notify(task: Task) {
		const clients = this.state.getWebSockets("client");
		for (const client of clients) {
			const tasks = client.deserializeAttachment() || [];
			for (let index = 0; index < tasks.length; ++index) {
				if (tasks[index].id === task.id) {
					client.send(JSON.stringify(task));
					tasks[index] = task.status === "done" ? null : task;
					client.serializeAttachment(tasks.filter(Boolean));
					break;
				}
			}
		}
	}

	async handleWorker(ws: WebSocket, message: Task) {
		if (message.status === "done" || message.status === "error") {
			ws.serializeAttachment(null);
			await this.run(ws);
		} else {
			ws.serializeAttachment(message);
		}
		await this.notify(message);
	}

	async handleClient(ws: WebSocket, message: Task) {
		const id = crypto.randomUUID();
		const task = { ...message, id };
		const tasks = ws.deserializeAttachment() || [];
		ws.serializeAttachment([...tasks, task]);
		await this.put(task);
	}

	async webSocketMessage(ws: WebSocket, message: string) {
		const json = JSON.parse(message);
		const tags = this.state.getTags(ws);
		if (tags.includes("worker")) {
			await this.handleWorker(ws, json);
		} else if (tags.includes("client")) {
			await this.handleClient(ws, json);
		}
	}

	async webSocketClose(ws: WebSocket) {
		const tags = this.state.getTags(ws);
		console.log("disconnect", this.state.getTags(ws))
		if (tags.includes("worker")) {
			const task = ws.deserializeAttachment();
			console.log(task, "unfinished")
			// if (task) {
			// 	await this.put(task);
			// }
		}
	}
}
