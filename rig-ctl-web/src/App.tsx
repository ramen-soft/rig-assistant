import { useEffect, useRef, useState } from "react";
import { DefaultChatTransport } from "ai";
import "./App.css";
import { useChat } from "@ai-sdk/react";
import { VoiceInput } from "./components/VoiceInput";

function App() {
	const [sessionId] = useState(() => crypto.randomUUID());
	const transport = new DefaultChatTransport({
		api: "http://localhost:4111/chat",
		prepareSendMessagesRequest({ messages }) {
			return {
				body: {
					messages: [messages[messages.length - 1]],
					memory: {
						thread: sessionId,
						resource: "menghi",
					},
				},
			};
		},
	});
	const { messages, sendMessage, status } = useChat({ transport });

	const messagesEndRef = useRef<HTMLDivElement>(null);

	const lastSpokenMessageId = useRef<string | null>(null);

	const inputRef = useRef<HTMLInputElement>(null);
	const [input, setInput] = useState("");

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({
			behavior: "smooth",
		});
	}, [messages]);

	const speak = (text: string) => {
		window.speechSynthesis.cancel();

		const utterance = new SpeechSynthesisUtterance(text);
		utterance.lang = "es-ES";
		utterance.rate = 1;
		utterance.pitch = 1;

		window.speechSynthesis.speak(utterance);
	};

	useEffect(() => {
		const lastAssistantMessage = [...messages]
			.reverse()
			.find((message) => message.role === "assistant");

		if (!lastAssistantMessage) {
			return;
		}

		if (lastAssistantMessage.id === lastSpokenMessageId.current) {
			return;
		}

		// Evita hablar mientras el mensaje sigue creciendo
		if (status === "streaming") {
			return;
		}

		const text = lastAssistantMessage.parts
			.filter((part) => part.type === "text")
			.map((part) => part.text)
			.join("");

		if (!text.trim()) {
			return;
		}

		lastSpokenMessageId.current = lastAssistantMessage.id;

		speak(text);
	}, [messages, status]);

	const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>): void => {
		event.preventDefault();
		if (!input.trim()) {
			return;
		}
		sendMessage({ text: input });

		setInput("");

		requestAnimationFrame(() => {
			inputRef.current?.focus();
		});
	};
	return (
		<div className="app">
			<header className="header">
				<div>
					<h1>Rig Assistant</h1>
					<span className="status">
						<span className="status-dot" />
						Radio conectada
					</span>
				</div>
			</header>

			<main className="chat">
				<div className="messages">
					{messages.length === 0 && (
						<div className="welcome">
							<h2>¿En qué puedo ayudarte?</h2>
							<p>
								Puedes preguntarme por el estado de la radio o darme órdenes
								como:
							</p>

							<div className="examples">
								<button onClick={() => setInput("¿En qué frecuencia estoy?")}>
									¿En qué frecuencia estoy?
								</button>

								<button
									onClick={() => setInput("Pon la frecuencia en 7.125 MHz")}
								>
									Pon la frecuencia en 7.125 MHz
								</button>

								<button onClick={() => setInput("¿Qué modo tengo?")}>
									¿Qué modo tengo?
								</button>
							</div>
						</div>
					)}

					{messages.map((message) => (
						<div key={message.id} className={`message ${message.role}`}>
							<div className="message-label">
								{message.role === "user" ? "Tú" : "Asistente"}
							</div>

							<div className="message-content">
								{message.parts.map((part, index) => {
									if (part.type === "text") {
										return <span key={index}>{part.text}</span>;
									}

									return null;
								})}
							</div>
						</div>
					))}

					{status === "submitted" && (
						<div className="message assistant">
							<div className="message-label">Asistente</div>

							<div className="typing">
								<span />
								<span />
								<span />
							</div>
						</div>
					)}

					<div ref={messagesEndRef} />
				</div>
			</main>

			<footer className="input-area">
				<form onSubmit={handleSubmit}>
					<VoiceInput
						onTranscription={(text) => {
							sendMessage({ text });
							//setInput(text);
						}}
					/>
					<input
						ref={inputRef}
						type="text"
						value={input}
						onChange={(event) => setInput(event.target.value)}
						placeholder="Escribe una orden para la radio..."
						autoComplete="off"
					/>

					<button
						type="submit"
						disabled={!input.trim() || status === "streaming"}
						aria-label="Enviar"
					>
						↑
					</button>
				</form>
			</footer>
		</div>
	);
}

export default App;
