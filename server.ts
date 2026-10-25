import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = 3000;

// High body limit for base64 audio transcription payloads
app.use(express.json({ limit: '50mb' }));

// Server-side initialization of @google/genai SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 1. Factuality & Authenticity Verification with Google Search Grounding
app.post('/api/check-authenticity', async (req, res) => {
  try {
    const { argumentText, debateTitle } = req.body;
    if (!argumentText) {
      return res.status(400).json({ error: 'argumentText is required' });
    }

    const prompt = `You are an elite, objective fact-checker and truth verifier for a debate platform.
Debate Topic: "${debateTitle || 'Public Debate'}"
User's Comment / Argument to verify:
"""${argumentText}"""

Use Google Search grounding to verify the empirical claims, statistical data, historical references, and factual assertions made in this comment.
Evaluate carefully whether the claim is:
- "Verified Authentic" (accurate, supported by credible records/evidence)
- "Mostly Accurate" (largely true with minor caveats or slight context missing)
- "Questionable / Unverified" (disputed, lacking strong consensus or insufficient public evidence)
- "False or Misleading" (demonstrably untrue, debunked, or cherry-picked to deceive)

Provide your response in valid JSON with this exact structure:
{
  "verdict": "Verified Authentic" | "Mostly Accurate" | "Questionable / Unverified" | "False or Misleading",
  "score": <number between 0 and 100>,
  "analysis": "<detailed 2-3 paragraph objective breakdown of what is true, what is disputed, and the context>",
  "keyTakeaway": "<single sentence takeaway>"
}
Only output the JSON object with no surrounding markdown ticks if possible, or inside standard json markdown.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || '';
    // Extract grounding URLs and titles
    const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: Array<{ title: string; url: string }> = [];
    for (const chunk of rawChunks) {
      if (chunk.web?.uri) {
        sources.push({
          title: chunk.web.title || new URL(chunk.web.uri).hostname,
          url: chunk.web.uri,
        });
      }
    }

    let parsed: any = {};
    try {
      const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        verdict: text.includes('False') || text.includes('Misleading')
          ? 'False or Misleading'
          : text.includes('Mostly Accurate')
          ? 'Mostly Accurate'
          : text.includes('Questionable')
          ? 'Questionable / Unverified'
          : 'Verified Authentic',
        score: 75,
        analysis: text,
      };
    }

    res.json({
      verdict: parsed.verdict || 'Verified Authentic',
      score: typeof parsed.score === 'number' ? parsed.score : 80,
      analysis: parsed.analysis || text,
      sources,
      checkedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error checking authenticity:', error);
    res.status(500).json({ error: error.message || 'Failed to check authenticity' });
  }
});

// 2. Audio Voice Speech Transcription with gemini-3.5-transcribe
app.post('/api/transcribe-audio', async (req, res) => {
  try {
    const { audioData, mimeType = 'audio/webm' } = req.body;
    if (!audioData) {
      return res.status(400).json({ error: 'audioData base64 is required' });
    }

    const base64Clean = audioData.replace(/^data:audio\/[a-zA-Z0-9]+;base64,/, '');

    const audioPart = {
      inlineData: {
        mimeType: mimeType.split(';')[0] || 'audio/webm',
        data: base64Clean,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          {
            text: 'Transcribe this voice speech verbatim in the exact language spoken. Output only the clear transcribed text with no meta-commentary.',
          },
        ],
      },
    });

    res.json({ text: response.text ? response.text.trim() : '' });
  } catch (error: any) {
    console.error('Error transcribing audio:', error);
    res.status(500).json({ error: error.message || 'Failed to transcribe audio' });
  }
});

// 3. AI Debate Summary
app.post('/api/summarize-debate', async (req, res) => {
  try {
    const { title, argumentsList = [] } = req.body;
    const forArgs = argumentsList.filter((a: any) => a.side === 'for');
    const againstArgs = argumentsList.filter((a: any) => a.side === 'against');

    const prompt = `You are a neutral, highly perceptive debate analyst and synthesizer.
Debate Topic: "${title}"
Total arguments: ${argumentsList.length} (${forArgs.length} For, ${againstArgs.length} Against)

Arguments in favor:
${forArgs.slice(0, 10).map((a: any, i: number) => `${i + 1}. ${a.content}`).join('\n') || 'None yet'}

Arguments against:
${againstArgs.slice(0, 10).map((a: any, i: number) => `${i + 1}. ${a.content}`).join('\n') || 'None yet'}

Provide an executive, balanced AI summary of this debate in JSON format:
{
  "overview": "<2-3 sentence overview framing the core conflict>",
  "forPoints": ["<key pillar 1 for>", "<key pillar 2 for>", "<key pillar 3 for>"],
  "againstPoints": ["<key counter-argument 1>", "<key counter-argument 2>", "<key counter-argument 3>"],
  "consensusPoints": ["<area of common ground or agreed facts>"],
  "frictionPoints": ["<the primary point of disagreement or values clash>"],
  "keyTakeaway": "<thought-provoking concluding takeaway>"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const text = response.text || '';
    let parsed: any = {};
    try {
      const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        overview: text,
        forPoints: ['Key arguments presented supporting the motion'],
        againstPoints: ['Key counter-arguments highlighting risks and alternative perspectives'],
        consensusPoints: ['Broad agreement on the underlying importance of the topic'],
        frictionPoints: ['Fundamental differences in priorities and trade-offs'],
        keyTakeaway: 'A nuanced debate with compelling perspectives from both sides.',
      };
    }

    res.json({
      ...parsed,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error summarizing debate:', error);
    res.status(500).json({ error: error.message || 'Failed to summarize debate' });
  }
});

// 4. Interactive Debate Assistant & Moderator Chatbot
app.post('/api/debate-chat', async (req, res) => {
  try {
    const { messages = [], debateContext } = req.body;
    const systemInstruction = `You are an objective, sharp, and fair Debate Assistant & Analyst for the debate topic: "${debateContext?.title || 'Current Debate'}".
Debate stats: ${debateContext?.forVotes || 0} votes FOR, ${debateContext?.againstVotes || 0} votes AGAINST, ${debateContext?.argumentsCount || 0} community arguments.

Your role:
- Answer questions from participants about facts, perspectives, strengths, and weaknesses of both sides.
- Identify logical fallacies or biases objectively if asked.
- Help users strengthen their arguments with well-researched reasoning without taking a personal side.
- Keep responses engaging, concise, and structured with bullet points.`;

    const contents = messages.map((m: any) => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.text || m.content || '' }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction,
      },
    });

    res.json({ text: response.text || '' });
  } catch (error: any) {
    console.error('Error in debate chat:', error);
    res.status(500).json({ error: error.message || 'Failed to process chat message' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
