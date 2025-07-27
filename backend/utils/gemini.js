import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({apiKey : process.env.GEMINI_API_KEY});

export default async function aiResponse({task}) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{
        parts: [{
          text: task // Make sure to use 'text' field for prompts
        }]
      }]
  });
  return extractHtmlContent(response.text);
}

function extractHtmlContent(text) {
  // Case 1: If wrapped in markdown code blocks
  const markdownMatch = text.match(/```html([\s\S]*?)```/);
  if (markdownMatch) return markdownMatch[1].trim();
  
  // Case 2: If starts with HTML tags
  const htmlMatch = text.match(/<[a-z][\s\S]*>/i);
  if (htmlMatch) return text.slice(htmlMatch.index);
  
  // Default return the whole text if no HTML found
  return text;
}