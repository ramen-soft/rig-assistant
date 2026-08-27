import { McpServer, Server } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import z from "zod";

const server = new McpServer({
	name: "rigctl",
	version: "1.0",
});

server.registerTool(
	"get-time",
	{
		description:
			"Returns the current local date and time of the computer running this MCP server. Use this tool whenever the user asks what time or date it is.",
		inputSchema: z.object({}),
	},
	async () => {
		const d = new Date();
		const fd =
			`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-` +
			`${String(d.getDate()).padStart(2, "0")} ` +
			`${String(d.getHours()).padStart(2, "0")}:` +
			`${String(d.getMinutes()).padStart(2, "0")}:` +
			`${String(d.getSeconds()).padStart(2, "0")}`;

		return {
			content: [
				{
					type: "text",
					text: fd,
				},
			],
		};
	},
);

server.registerTool(
	"calculate",
	{
		description: "Calcula una expresión matemática sencilla.",
		inputSchema: {
			expression: z
				.string()
				.describe("Expresión matemática, por ejemplo 25 * 4 + 10"),
		},
	},
	async ({ expression }) => {
		// Para una prueba podemos hacer algo muy sencillo.
		// No uses eval() en producción.
		const result = Function(`"use strict"; return (${expression})`)();

		return {
			content: [
				{
					type: "text",
					text: String(result),
				},
			],
		};
	},
);

void serveStdio(() => server);

export default server;
