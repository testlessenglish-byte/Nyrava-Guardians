import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getProviderApiKey } from "@/lib/server/api-key-vault";

const GEMINI_API = "https://generativelanguage.googleapis.com/v1beta/models";

function pcmToWavBase64(pcmBase64: string, sampleRate = 24_000) {
  const pcm = Buffer.from(pcmBase64, "base64");
  const wav = Buffer.alloc(44 + pcm.length);
  wav.write("RIFF", 0);
  wav.writeUInt32LE(36 + pcm.length, 4);
  wav.write("WAVE", 8);
  wav.write("fmt ", 12);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(sampleRate, 24);
  wav.writeUInt32LE(sampleRate * 2, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write("data", 36);
  wav.writeUInt32LE(pcm.length, 40);
  pcm.copy(wav, 44);
  return wav.toString("base64");
}

function geminiVoice(requested: string) {
  const choices = ["Kore", "Puck", "Aoede", "Charon", "Fenrir", "Leda"] as const;
  const index = [...requested].reduce((sum, char) => sum + char.charCodeAt(0), 0) % choices.length;
  return choices[index];
}

const chatSchema = z.object({
  guardian: z.string().min(1).max(40),
  role: z.string().min(1).max(80),
  learnerName: z.string().max(40).default("Guardian"),
  message: z.string().min(1).max(1000),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) }))
    .max(12)
    .default([]),
});

export const guardianChat = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => chatSchema.parse(data))
  .handler(async ({ data }) => {
    const key = await getProviderApiKey("gemini");

    const system = [
      `You are ${data.guardian}, ${data.role}, a friendly teacher inside the Nyrava Guardians digital-literacy academy.`,
      `You are talking to a child learner called ${data.learnerName} inside a live 3D classroom.`,
      "Speak warmly, in 1-3 short spoken sentences. No markdown, no lists, no emoji.",
      "Teach online safety, critical thinking, kindness and creative tech skills.",
      "Never ask for personal details. If a child shares personal info, gently coach them not to.",
      "Always end with a short question that keeps the class going.",
    ].join(" ");

    const res = await fetch(`${GEMINI_API}/gemini-2.5-flash:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [
          ...data.history.map((message) => ({
            role: message.role === "assistant" ? "model" : "user",
            parts: [{ text: message.content }],
          })),
          { role: "user", parts: [{ text: data.message }] },
        ],
        generationConfig: { temperature: 0.65, maxOutputTokens: 220 },
      }),
    });

    if (!res.ok) {
      throw new Error(`Guardian chat is temporarily unavailable [${res.status}].`);
    }

    const json = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    return {
      reply:
        json.candidates?.[0]?.content?.parts
          ?.map((part) => part.text ?? "")
          .join("")
          .trim() ?? "Let's try that again.",
    };
  });

const speakSchema = z.object({
  text: z.string().min(1).max(600),
  voice: z.string().max(30).default("alloy"),
});

export const guardianSpeak = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => speakSchema.parse(data))
  .handler(async ({ data }) => {
    const key = await getProviderApiKey("gemini");

    const res = await fetch(`${GEMINI_API}/gemini-2.5-flash-preview-tts:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { parts: [{ text: `Speak warmly and clearly for a young learner: ${data.text}` }] },
        ],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: geminiVoice(data.voice) } },
          },
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`Guardian voice is temporarily unavailable [${res.status}].`);
    }

    const json = (await res.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ inlineData?: { data?: string; mimeType?: string } }> };
      }>;
    };
    const audio = json.candidates?.[0]?.content?.parts?.find((part) => part.inlineData?.data)
      ?.inlineData?.data;
    if (!audio) throw new Error("Gemini returned no voice audio.");
    return { audio: pcmToWavBase64(audio), mimeType: "audio/wav" };
  });
