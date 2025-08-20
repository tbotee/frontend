import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from 'zod';

const assistantPrompts = {
  sales: `
    You are a sales assistant.
    You are given a message and you need to write an email with title and content.
  `,
  followup: `
    You are a follow-up assistant.
    You are given a message and you need to write an email with title and content.
  `,
};


async function getEmail(message, assistant) {
  const prompt = `
    ${assistantPrompts[assistant]}  

    Keep the email under 40 words total. Max 7-10 words/sentence

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


