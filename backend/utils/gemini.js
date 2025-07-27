import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({apiKey : process.env.GEMINI_API_KEY});

export default async function aiResponse({task}) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: {task},
  });
  return response.text;
}