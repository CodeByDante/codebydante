import { GoogleGenerativeAI } from "@google/generative-ai";

// Use environment variable, fallback to user provided key for this session if needed
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyDyXqHsNwcRssdwvwO7rm8I_dPx1nXpj7E";

const genAI = new GoogleGenerativeAI(apiKey);
const availableModels = ["gemini-1.5-flash", "gemini-pro", "gemini-1.5-pro-latest"];

export const expandSummary = async (text: string): Promise<string> => {
  if (!text || text.length < 3) return text;

  let lastError;

  for (const modelName of availableModels) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const prompt = `
      Actúa como un redactor técnico experto. 
      El usuario te dará un texto corto o un enlace. Tu trabajo es generar un resumen estructurado y detallado.
      
      Entrada del usuario: "${text}"

      Instrucciones:
      1. Explica qué es (tecnología, herramienta, concepto).
      2. Si es un enlace, infiere de qué trata por el nombre o contexto.
      3. Menciona para qué sirve y sus características principales.
      4. Usa un tono profesional pero directo.
      5. No uses markdown complejo (como headers #), usa texto plano o saltos de línea simples.
      6. Mantén la respuesta concisa pero informativa (máximo 150 palabras).
      
      Solo devuelve el texto del resumen mejorado.
    `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.warn(`Model ${modelName} failed:`, error.message);
      lastError = error;
      // Continue to next model
    }
  }

  // If all failed
  console.error("All AI models failed:", lastError);
  const rawMessage = lastError?.message || String(lastError);

  if (rawMessage.includes("API key")) {
    throw new Error("Clave API inválida o no configurada.");
  } else if (rawMessage.includes("403")) {
    throw new Error("Acceso denegado. Revisa tu clave API.");
  } else if (rawMessage.includes("404")) {
    throw new Error("Modelos de IA no encontrados para esta clave.");
  }

  throw new Error(`Error de IA: ${rawMessage}`);
};
