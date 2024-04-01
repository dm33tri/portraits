interface Task {
	id: string;
	input: string;
	style: string;
	status: "done" | "error" | "queued" | "running";
	queue?: number;
	result?: string;
	error?: string;
}
