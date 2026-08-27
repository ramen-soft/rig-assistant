import path from "node:path";
import { Agent } from "@mastra/core/agent";
import { ollama } from "ollama-ai-provider-v2";
import { rigctl } from "../mcp/rigctl";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";

const tools = await rigctl.listTools();

console.log("=================================");
console.log("RIGCTL TOOLS:", Object.keys(tools));
console.log("=================================");

const memory = new Memory({
	options: {
		workingMemory: {
			enabled: true,
			scope: "resource",
		},
	},
	storage: new LibSQLStore({
		id: "radio-memory",
		url: `file:${path.join(process.cwd(), "storage", "memory.db")}`,
	}),
});

export const assistant = new Agent({
	id: "assistant",
	name: "Assistant",

	instructions: `
You are a helpful assistant.

You have access to tools.

When the user asks for the current time,
use rigctl_get-time.

Answer in Spanish.

/no_think
`,

	model: ollama("granite4.1:3b"),

	tools,
	memory,
});
