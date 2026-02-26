import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { searchDocs, Doc } from '@/lib/search';
import fs from 'fs';
import path from 'path';

let knowledgeBase: Doc[] | null = null;

function getKnowledgeBase(): Doc[] {
  if (!knowledgeBase) {
    const filePath = path.join(process.cwd(), 'public', 'knowledge-base.json');
    knowledgeBase = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  return knowledgeBase!;
}

const SYSTEM_PROMPT = `You are the GeoGebra Calculator Suite Assistant. You help students and teachers learn how to use GeoGebra tools and commands.

CRITICAL RULES:
1. Answer ONLY based on the manual excerpts provided below. Never use outside knowledge about GeoGebra.
2. If the answer is not in the provided excerpts, say: "I don't have information about that in the GeoGebra manual. Try rephrasing your question or ask about a specific tool or command."
3. Always mention the specific tool or command name you are referring to.
4. Keep answers clear and beginner-friendly.
5. When describing how to use a tool, give step-by-step instructions.
6. If a command has syntax like Circle(Point, Radius), show it clearly.
7. When relevant, mention related tools or commands the user might also find useful.
8. Answer in the same language the user writes in. The manual excerpts are in English but translate your explanation to match the user's language.`;

export async function POST(req: NextRequest) {
  const { message, history } = await req.json();

  if (!message || typeof message !== 'string') {
    return Response.json({ error: 'Message is required' }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'API key not configured' }, { status: 500 });
  }

  const docs = getKnowledgeBase();
  const relevant = searchDocs(docs, message, 8);

  const contextBlock = relevant
    .map((doc, i) => `--- Manual Section ${i + 1}: ${doc.title} (${doc.category}) ---\n${doc.content}`)
    .join('\n\n');

  const systemMessage = `${SYSTEM_PROMPT}\n\n=== GEOGEBRA MANUAL EXCERPTS ===\n${contextBlock}\n=== END OF EXCERPTS ===`;

  const messages: { role: 'user' | 'assistant'; content: string }[] = [];
  if (history && Array.isArray(history)) {
    for (const msg of history.slice(-6)) {
      messages.push({ role: msg.role, content: msg.content });
    }
  }
  messages.push({ role: 'user', content: message });

  const client = new Anthropic({ apiKey });

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemMessage,
    messages,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
        }
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
