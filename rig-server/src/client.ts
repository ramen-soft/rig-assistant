import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

const mcp = new Client({
	name: "rigctl",
	version: "1.0",
});

await mcp.connect(
	new StdioClientTransport({
		command: "pnpm",
		args: ["--dir", "../rig-server", "dev"],
	}),
);

const { tools } = await mcp.listTools();

console.log(tools);
