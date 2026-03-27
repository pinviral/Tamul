import { GoogleGenAI, Modality } from "@google/genai";

let ai: GoogleGenAI | null = null;

function getAi() {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
  }
  return ai;
}

export async function generateMeditationAudio(topic: string, description: string): Promise<string | null> {
  const prompt = `أنت كوتش تأمل محترف. قم بإنشاء جلسة تأمل صوتية قصيرة (حوالي دقيقة إلى دقيقتين) باللغة العربية الفصحى بصوت رجولي هادئ جداً ومريح وبطيء.
موضوع الجلسة: ${topic}
وصف الجلسة: ${description}
تحدث ببطء شديد، مع ترك فترات صمت قصيرة بين الجمل. ابدأ بترحيب هادئ وطلب أخذ نفس عميق، ثم ادخل في موضوع الجلسة بكلمات إيجابية ومريحة، واختم الجلسة بسلام.`;

  try {
    const response = await getAi().models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Zephyr' }, // Deep male voice
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("Error generating meditation audio:", error);
    return null;
  }
}
