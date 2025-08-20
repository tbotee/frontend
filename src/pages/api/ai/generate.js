import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from 'zod';

const assistantPrompts = {
  sales: `
    You are a professional sales assistant specializing in creating compelling, concise sales emails.
    Focus on value proposition, benefits, and clear call-to-action.
    Write in a professional yet friendly tone.
    Create emails that flow naturally and engage the reader.
  `,
  followup: `
    You are a professional follow-up assistant specializing in polite, engaging follow-up emails.
    Focus on being helpful, checking in, and maintaining relationships.
    Write in a warm, professional tone.
    Create emails that feel personal and conversational.
  `,
};


async function getEmail(message, assistant) {
  const prompt = `
    ${assistantPrompts[assistant]}  

    You are given a message and you need to write an email to the customer.

    Guidelines:
    - Write a natural, flowing email (around 60-100 words total)
    - Use complete, well-formed sentences with proper grammar
    - Write in a professional, engaging tone
    - Include a clear subject line that summarizes the email
    - Make the email actionable and valuable to the recipient
    - Use proper email formatting with greeting and closing
    - Avoid choppy, single-line sentences
    - Create a cohesive, professional email that flows naturally

    Message: """${message}"""
  `;

  const result = await generateObject({
    model: openai(assistant === 'sales' ? "gpt-4o-mini" : "gpt-4o-mini"),
    schema: z.object({
      subject: z.string(),
      body: z.string(),
    }),
    prompt,
  });

  return result.object;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { assistant } = req.query;
    const { prompt } = req.body || {};
    if (typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'Missing assistant' });
    }

    const result = await getEmail(prompt, assistant);
    return res.status(200).json({ 
      subject: result.subject,
      body: result.body
     });
  } catch (err) {
    return res.status(500).json({ error: 'Internal error'});
  }
}


