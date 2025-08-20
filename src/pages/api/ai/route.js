import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";

async function classifyAssistantType(message) {
  const prompt = `
    You are a classifier.  
    Given the following message, determine if it is a **Sales Assistant** type (focused on pitching, selling, or offering products/services)  
    or a **Follow-up Assistant** type (focused on checking in, reminding, or continuing an earlier interaction).  

    Message: """${message}"""
  `;

  const result = await generateObject({
    model: openai("gpt-4o-mini"),
    output: 'enum',
    enum: ['sales', 'followup'],
    prompt,
  });

  return result.object;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return  res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt } = req.body || {};
    if (typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'Missing prompt' });
    }

    const result = await classifyAssistantType(prompt);

    console.log(result);
    
    return res.status(200).json({ assistant: result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal error' });
  }
}


