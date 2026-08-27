from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel
import tempfile
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = WhisperModel(
    "medium",
    device="cpu",
    compute_type="int8",
    cpu_threads=8,
)

INITIAL_PROMPT = (
    "Comandos de radioafición en español. "
    "Pon la frecuencia. "
    "Pon el modo. "
    "Pon la potencia. "
    "Sube la frecuencia. "
    "Baja la frecuencia. "
    "Consulta la frecuencia. "
    "Consulta el modo. "
    "Consulta la potencia. "
    "Activa el PTT. "
    "Desactiva el PTT."
)

INITIAL_PROMPT = (
    "Audio en español de España con comandos de radioafición o conversacion natural variada. "
    "Pon la frecuencia, "
    "radioafición, frecuencia, megahercios, "
    "kilohertzios, hercios, USB, LSB, CW, FM, AM, "
    "potencia, PTT, Hamlib"
)


@app.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    suffix = os.path.splitext(audio.filename or ".webm")[1]

    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=suffix,
    ) as tmp:
        tmp.write(await audio.read())
        audio_path = tmp.name

    try:
        segments, info = model.transcribe(
            audio_path,
            language="es",
            beam_size=5,
            vad_filter=False,
            initial_prompt=INITIAL_PROMPT
        )

        text = " ".join(
            segment.text.strip()
            for segment in segments
        )

        return {
            "text": text,
            "language": info.language,
            "language_probability": info.language_probability,
        }

    finally:
        os.remove(audio_path)