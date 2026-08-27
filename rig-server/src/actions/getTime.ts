export default {
	name: "get_time",
	description: "Allow to get the current date and time",
	parameters: {
		type: "object",
		properties: {},
		required: [],
	},
	async run() {
		return new Promise((resolve, reject) => {
			const d = new Date();
			const fd = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
			resolve({ ok: true, stdout: fd });
		});
	},
};
