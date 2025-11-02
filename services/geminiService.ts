import { GoogleGenAI, Chat, Modality, Type } from "@google/genai";
import { SessionOptions, ChatMessage, MessageAuthor } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
let chat: Chat | null = null;


const generateSessionScript = async (options: SessionOptions): Promise<{title: string, script: string}> => {
    const pauseInstruction = options.type === 'Stretching'
        ? "For this stretching session, it is crucial to include pauses for the user to hold positions or transition. Use the format `[PAUSE=Xs]` where X is the number of seconds for the pause (e.g., `[PAUSE=10s]`)."
        : "";

    const prompt = `
        You are a wellness expert. Create a guided script for a ${options.type} session.
        The session should last approximately ${options.duration} minutes.
        The primary focus is ${options.focus}.
        ${pauseInstruction}
        The tone should be calm, soothing, and encouraging.
        Start with a brief introduction, then the main guidance, and conclude with a gentle closing.
        The output must be a JSON object with two keys: "title" (a creative title for the session) and "script" (the full text script).
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: {
                            type: Type.STRING,
                            description: "A creative title for the session."
                        },
                        script: {
                            type: Type.STRING,
                            description: "The full text script for the guided session."
                        }
                    },
                    required: ['title', 'script']
                }
            }
        });
        const text = response.text.trim();
        return JSON.parse(text);
    } catch (error) {
        console.error("Error generating session script:", error);
        throw new Error("Failed to create session script.");
    }
};

const generateSessionImage = async (title: string, focus: string): Promise<string> => {
    const prompt = `Generate a serene and beautiful image for a wellness session titled "${title}" with a focus on ${focus}. The style should be minimalist, calming, and abstract. A peaceful digital art landscape.`;

    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                aspectRatio: '16:9',
            }
        });
        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages[0].image.imageBytes;
        }
        throw new Error("No image was generated.");
    } catch (error) {
        console.error("Error generating session image:", error);
        throw new Error("Failed to create session image.");
    }
};

const generateSessionAudio = async (script: string): Promise<string> => {
    try {
        const ttsPrompt = `Read the following script in a calm, soothing, and encouraging voice at a slow, relaxed pace (around 120 words per minute). The script may contain pause markers like [PAUSE=Xs]. Please honor these by adding the specified duration of silence in the audio.\n\nScript:\n\n${script}`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: ttsPrompt }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' }, // A calm, soothing voice
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data received from API.");
        }
        return base64Audio;
    } catch (error) {
        console.error("Error generating session audio:", error);
        throw new Error("Failed to create session audio.");
    }
};

export const generateFullSession = async (options: SessionOptions) => {
    const { title, script } = await generateSessionScript(options);
    
    // Run image and audio generation in parallel for speed
    const [imageBase64, audioBase64] = await Promise.all([
        generateSessionImage(title, options.focus),
        generateSessionAudio(script)
    ]);

    return {
        title,
        script,
        imageUrl: `data:image/png;base64,${imageBase64}`,
        audioUrl: audioBase64, // Keep as base64 for the audio player hook
    };
};


export const getChatbotResponse = async (history: ChatMessage[], newMessage: string): Promise<string> => {
    if (!chat) {
        chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: "You are Zenith, a friendly and knowledgeable wellness assistant. You provide supportive advice on exercise, meditation, and general well-being. Keep your answers concise and positive.",
            },
        });
    }

    try {
        const response = await chat.sendMessage({ message: newMessage });
        return response.text;
    } catch (error) {
        console.error("Error getting chatbot response:", error);
        return "I'm sorry, I'm having a little trouble right now. Please try again in a moment.";
    }
};