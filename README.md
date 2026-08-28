# Pasos instalacion

## Ollama

- Instalar ollama

  `irm https://ollama.com/install.ps1 | iex`

- Descargar modelo Granite 4.1
  `ollama pull granite4.1:3b`

## Mastra

Usaremos mastra como agent harness:

`pnpm create mastra@latest`

hay que configurar bien un assistant.ts y el cliente mcp. mirar:
`/mastra/src/mastra/agents/assistant.ts` y `/mastra/src/mastra/mcp/rigctl.ts`

## STT

Usaremos faster-whisper en python

- Ver \Raul\Proyectos\stt\requirements.txt
