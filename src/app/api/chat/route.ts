import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { searchDocs, Doc } from '@/lib/search';
import knowledgeBaseData from '../../../../public/knowledge-base.json';

export const maxDuration = 60;

const knowledgeBase: Doc[] = knowledgeBaseData as Doc[];

const SYSTEM_PROMPT = `You are the GeoGebra Calculator Suite Assistant. You help students and teachers learn how to use GeoGebra tools and commands.

Your knowledge comes from two sources:
- The official GeoGebra Manual (command references, tool descriptions)
- The "Learn Calculator Suite" tutorial book (step-by-step lessons and practical examples)

CRITICAL RULES:
1. Answer ONLY based on the manual and tutorial excerpts provided below. Never use outside knowledge about GeoGebra.
2. If the answer is not in the provided excerpts, say: "I don't have information about that in the GeoGebra documentation. Try rephrasing your question or ask about a specific tool or command."
3. Always mention the specific tool or command name you are referring to.
4. Keep answers clear and beginner-friendly.
5. When describing how to use a tool, give step-by-step instructions.
6. If a command has syntax like Circle(Point, Radius), show it clearly.
7. When relevant, mention related tools or commands the user might also find useful.
8. When a tutorial lesson is relevant, include practical tips and step-by-step workflows from it.
9. Answer in the same language the user writes in. The excerpts are in English but translate your explanation to match the user's language.`;

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== 'string') {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'API key not configured' }, { status: 500 });
    }

    const relevant = searchDocs(knowledgeBase, message, 8);

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
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: systemMessage,
      messages,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (err: unknown) {
          console.error('Stream error:', err instanceof Error ? err.message : String(err));
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: '\n\n[The response was interrupted. Please try again.]' })}\n\n`));
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err: unknown) {
    console.error('Chat API error:', err instanceof Error ? err.message : 'Unknown error');
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
