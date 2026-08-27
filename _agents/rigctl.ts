import { MCPClient } from "@mastra/mcp";

export const rigctl = new MCPClient({
	id: "rigctl",
	servers: {
		rigctl: {
			command: "pnpm",
			args: ["--dir", "/Raul/proyectos/rig/rig-server", "dev"],
		},
	},
});
