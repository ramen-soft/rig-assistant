import express from "express";
import net from "net";

const app = express();
const PORT = 3000;
const RIGCTL_HOST = "localhost";
const RIGCTL_PORT = 4532;

app.set;

const sendCommand = (command: string) => {
	return new Promise((resolve, reject) => {
		const client = new net.Socket();
		let buffer = "";

		client.connect(RIGCTL_PORT, RIGCTL_HOST, () => {
			client.write(command + "\n");
		});

		client.on("data", (data) => {
			const d = data; //.toString().trim();
			buffer += d;
			//resolve(d);
			client.end();
		});

		client.on("end", () => {
			resolve(buffer);
		});

		client.on("error", (err) => {
			client.destroy();
			reject(err);
		});
	});
};

app.get("/modes", async (req, res) => {
	try {
		const modes = await sendCommand("M ?");
		res.set("Content-Type", "text/plain");
		res.send(modes);
	} catch (err) {
		if (err instanceof Error) res.status(500).send("Error: " + err.message);
	}
});

app.get("/freq", async (req, res) => {
	try {
		const freq = await sendCommand("f");
		res.set("Content-Type", "text/plain");
		res.send(freq);
	} catch (err) {
		if (err instanceof Error) res.status(500).send("error: " + err.message);
	}
});

app.get("/mode", async (req, res) => {
	try {
		const freq = await sendCommand("m");
		res.set("Content-Type", "text/plain");
		res.send(freq);
	} catch (err) {
		if (err instanceof Error) res.status(500).send("error: " + err.message);
	}
});

app.get("/query", async (req, res) => {
	try {
		const fnc = req.query["op"]?.toString() || "";
		const data = await sendCommand(fnc);
		res.set("Content-Type", "text/plain");
		res.send(data);
	} catch (err) {
		if (err instanceof Error) res.status(500).send("error: " + err.message);
	}
});

app.listen(PORT, () => {
	console.log(`Servidor escuchando en puerto ${PORT}`);
});
