import { useRef, useState } from "react";

type VoiceStatus = "idle" | "recording" | "transcribing";

export const VoiceInput = ({
	onTranscription,
}: {
	onTranscription: (text: string) => void;
}) => {
	const [status, setStatus] = useState<VoiceStatus>("idle");

	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	
	const pointerDownRef = useRef(false);

	const streamRef = useRef<MediaStream | null>(null);

	const chunksRef = useRef<Blob[]>([]);

	async function startRecording() {
		if (status !== "idle") return;

		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: true,
			});

			streamRef.current = stream;

			const recorder = new MediaRecorder(stream);

			chunksRef.current = [];

			recorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					chunksRef.current.push(event.data);
				}
			};

			recorder.onstop = async () => {
				setStatus("transcribing");

				try {
					const audio = new Blob(chunksRef.current, {
						type: recorder.mimeType,
					});

					const text = await transcribe(audio);

					if (text.trim()) {
						onTranscription(text);
					}
				} finally {
					streamRef.current?.getTracks().forEach((track) => track.stop());
					streamRef.current = null;
					mediaRecorderRef.current = null;

					setStatus("idle");
				}
			};

			mediaRecorderRef.current = recorder;
			recorder.start();
			setStatus("recording");
			
			if(!pointerDownRef.current){
				recorder.stop();
			}
		} catch (error) {
			console.error("No se pudo acceder al microfono", error);
			setStatus("idle");
		}
	}

	function stopRecording() {
		const recorder = mediaRecorderRef.current;
		if (recorder && recorder.state === "recording") {
			recorder.stop();
		}
	}

	async function transcribe(audio: Blob): Promise<string> {
		const formData = new FormData();

		formData.append("audio", audio, "recording.webm");

		const response = await fetch("http://localhost:8000/transcribe", {
			method: "POST",
			body: formData,
		});

		if (!response.ok) {
			throw new Error(`STT error: ${response.status}`);
		}

		const result = await response.json();

		return result.text;
	}

	const label =
		status === "recording"
			? "Grabando. Suelta para enviar"
			: status === "transcribing"
				? "Transcribiendo"
				: "Mantén pulsado para hablar";

	return (
		<button
			type="button"
			className={`voice-button ${status}`}
			disabled={status === "transcribing"}
			onPointerDown={() => {
				pointerDownRef.current=true;
				startRecording();
			}}
			onPointerUp={()=>{
				pointerDownRef.current=false;
				stopRecording();
			}}
			onPointerCancel={()=>{
				pointerDownRef.current=false;
				stopRecording();
			}}
			onPointerLeave={()=>{
				pointerDownRef.current=false;
				stopRecording();
			}}
			aria-label={label}
			aria-live="polite"
		>
			{status === "recording"
				? "🔴 Grabando"
				: status === "transcribing"
					? "⏳"
					: "🎙"}
		</button>
	);
};
