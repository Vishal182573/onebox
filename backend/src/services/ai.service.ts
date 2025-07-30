import { GoogleGenerativeAI } from '@google/generative-ai';
import { Email } from '../types/email.type';

const MODEL_NAME = 'gemini-2.0-flash-lite';
const API_KEY = process.env.GEMINI_API_KEY;

//possible categories as a type for safety
type EmailCategory = 'Interested' | 'Not Interested' | 'Meeting Booked' | 'Spam' | 'Out of Office' | 'Uncategorized';
class AIService {
  private static instance: AIService;
  private genAI: GoogleGenerativeAI;

  private constructor() {
    if (!API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in the environment variables.');
    }
    this.genAI = new GoogleGenerativeAI(API_KEY);
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }
  public async createEmbedding(text: string): Promise<number[]> {
    const embeddingModel = this.genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
  }

  public async classifyEmail(subject: string, body: string): Promise<EmailCategory> {
    const model = this.genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `
      You are an expert email classifier. Your task is to categorize the following email into one of the five categories: 
      1. Interested
      2. Not Interested
      3. Meeting Booked
      4. Spam
      5. Out of Office

      Analyze the content of the email subject and body provided below. 
      Based on your analysis, return ONLY the category name and nothing else.

      Subject: "${subject}"
      
      Body:
      """
      ${body.substring(0, 4000)}
      """
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim() as EmailCategory;
      const validCategories: EmailCategory[] = ['Interested','Not Interested','Meeting Booked','Spam','Out of Office'];
      if (validCategories.includes(text)) {
        return text;
      }
      console.warn(`[AI Service] Model returned an invalid category: "${text}"`);
      return 'Uncategorized';
    } catch (error) {
      console.error('---!! AI CLASSIFICATION FAILED !!---');
      console.error(`Error classifying email with subject: "${subject}"`);
      console.error('Detailed Error:', (error as Error).message);
      console.error('---!! END OF AI ERROR !!---');
      return 'Uncategorized'; // Return a safe default on error
    }
  }
  public async suggestReply(email: Email, context: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `
      You are a helpful assistant drafting a professional email reply. Your task is to reply to the incoming email based on the context provided.

      ---CONTEXT---
      ${context}
      ---END CONTEXT---

      Below is the email you need to reply to.

      ---INCOMING EMAIL---
      From: ${email.from.name} <${email.from.email}>
      Subject: ${email.subject}
      Body:
      ${email.body.plain}
      ---END EMAIL---

      Instructions:
      1. Draft a helpful and professional reply based on the INCOMING EMAIL and the CONTEXT.
      2. If the context includes instructions like a meeting link, and the email shows positive interest, make sure to include the link.
      3. Reply directly to the sender's message. Do not add a greeting like "Hi [Your Name]".
      4. Do not add a subject line.
      5. Return ONLY the body of the reply and nothing else.
    `;
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error suggesting reply with Gemini:', error);
      return 'Sorry, I could not generate a reply at this time.';
    }
  }
}

export default AIService;