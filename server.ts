import express, { Request, Response } from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  getAllRooms,
  getRoom,
  createRoom,
  recordTopicInRoom,
  recordReactionInRoom,
  handlePeerJoin,
  handlePeerLeave,
} from './src/server/studyRoomStore';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize GoogleGenAI server-side with telemetry User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SYSTEM_INSTRUCTION = `You are Kumhud (कुम्हूद), an empathetic, inspiring, and brilliant AI study assistant tailored specifically for school and college students.
Brand: Kumhud AI Study Assistant.
Core Purpose: Provide clear, accurate, friendly, and step-by-step educational answers to help students understand deeply and score well.

Languages Supported:
1. English: Clear, student-friendly, grammatically sound academic English.
2. Hindi (हिंदी): Natural, polite, and lucid Hindi in Devanagari script, breaking down difficult words into easy concepts.
3. Hinglish: Conversational and relatable mix of Hindi in Latin script and English (e.g., "Chaliye is question ko step-by-step solve karte hain...").
Honor the user's selected language or reply in the language the student asked in if not specified.

Pedagogical Structure by Subject:
- Maths:
  1. **Given & To Find**: Clearly extract provided numbers/variables and what is asked.
  2. **Key Formula / Concept**: State the mathematical theorem or equation prominently.
  3. **Step-by-Step Calculation**: Show every algebraic step with explanation. Never skip steps.
  4. **Final Answer**: Clearly highlight with proper units.
  5. **Exam Tip / Shortcut**: A trick, common pitfall, or shortcut to remember for exams.
- Physics:
  - State the physical law, provide the formula, substitute values with SI units, and give an intuitive real-world analogy.
- Chemistry:
  - Give balanced chemical equations with states (s, l, g, aq), reaction conditions, catalysts, and molecular rationale.
- Biology:
  - Break down biological systems, cell functions, or diagrams sequentially; provide helpful mnemonics.
- English:
  - Provide grammar rules, sample sentences, standard letter/notice formats, vocabulary building, or literature analysis.
- Computer Science:
  - Clean code snippets (Python, C++, Java, JS, SQL), line-by-line breakdown, time/space complexity (Big-O), and sample input/output.

Formatting Rules:
- Use clean Markdown with headers (###), bold keywords, numbered lists, math symbols, and code blocks.
- Be encouraging, positive, and supportive ("You got this!", "Great doubt!").
- At the end of every topic explanation or math solution, always include:
  1. 💡 **Pro Tip for Exams**
  2. 🎯 **Quick Check (1 Question)**: A brief practice question to test if the student understood.

Disclaimer note: Always maintain academic integrity and truthfulness.`;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequestBody {
  messages: Message[];
  language?: 'english' | 'hindi' | 'hinglish';
  subject?: string;
  action?: 'normal' | 'simpler' | 'practice' | 'quiz';
}

function buildPrompt(body: ChatRequestBody): { contents: any[]; systemInstruction: string } {
  const { messages, language = 'english', subject = 'General', action = 'normal' } = body;

  let extraInstruction = `Selected Language Preference: ${language}. Current Subject: ${subject}.`;
  if (action === 'simpler') {
    extraInstruction += `\nSpecial Request: The student requested: "Explain this in much simpler terms like I am 12 years old". Use everyday analogies and zero unnecessary jargon.`;
  } else if (action === 'practice') {
    extraInstruction += `\nSpecial Request: Generate 3 high-yield practice questions of varying difficulty (Easy, Medium, Challenging) based on this topic, with step-by-step solutions provided.`;
  } else if (action === 'quiz') {
    extraInstruction += `\nSpecial Request: Create a 3-question quick quiz (multiple choice with options A, B, C, D) for the student to test their mastery, followed by correct answers with explanations.`;
  }

  // Format message history for Gemini SDK
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const systemInstruction = `${SYSTEM_INSTRUCTION}\n\n[Context: ${extraInstruction}]`;

  return { contents, systemInstruction };
}

// Storage for logged user feedback
interface StoredFeedback {
  id: string;
  messageId: string;
  question?: string;
  answerSnippet: string;
  rating: 'up' | 'down';
  comment?: string;
  accuracyRating?: number;
  clarityRating?: number;
  subject?: string;
  language?: string;
  timestamp: string;
}

const feedbackLogs: StoredFeedback[] = [];

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'Kumhud AI Study Assistant',
    timestamp: new Date().toISOString(),
    feedbackCount: feedbackLogs.length,
  });
});

// Feedback Logging endpoint
app.post('/api/feedback', (req: Request, res: Response) => {
  try {
    const {
      messageId,
      question,
      answer,
      rating,
      comment,
      accuracyRating,
      clarityRating,
      subject,
      language,
      timestamp,
    } = req.body;

    if (!rating || !['up', 'down'].includes(rating)) {
      res.status(400).json({ error: 'Rating must be either "up" or "down".' });
      return;
    }

    const logEntry: StoredFeedback = {
      id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      messageId: messageId || 'unknown',
      question: question ? question.substring(0, 500) : undefined,
      answerSnippet: answer ? answer.substring(0, 300) : '',
      rating,
      comment: comment ? String(comment).trim() : undefined,
      accuracyRating: typeof accuracyRating === 'number' ? accuracyRating : undefined,
      clarityRating: typeof clarityRating === 'number' ? clarityRating : undefined,
      subject: subject || 'General',
      language: language || 'english',
      timestamp: timestamp || new Date().toISOString(),
    };

    feedbackLogs.push(logEntry);
    console.log(`[Kumhud Feedback Logged] ID: ${logEntry.id} | Rating: ${logEntry.rating} | Subject: ${logEntry.subject} | Comment: ${logEntry.comment || 'None'}`);

    res.json({
      success: true,
      message: 'Thank you! Your feedback has been recorded to help improve Kumhud.',
      feedbackId: logEntry.id,
    });
  } catch (error: any) {
    console.error('Error logging feedback:', error);
    res.status(500).json({ error: 'Failed to record feedback.' });
  }
});

const PRIMARY_MODELS = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];

// Streaming Chat endpoint using SSE
app.post('/api/chat/stream', async (req: Request, res: Response) => {
  const body = req.body as ChatRequestBody;

  if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    res.status(400).json({ error: 'Messages array is required.' });
    return;
  }

  if (!process.env.GEMINI_API_KEY) {
    res.status(500).json({ error: 'Gemini API key is not configured on the server.' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const { contents, systemInstruction } = buildPrompt(body);
  let hasEmittedChunk = false;
  let success = false;
  let lastError: any = null;

  // Try streaming across fallback models
  for (const modelName of PRIMARY_MODELS) {
    if (success) break;

    try {
      const responseStream = await ai.models.generateContentStream({
        model: modelName,
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          hasEmittedChunk = true;
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
        }
      }

      success = true;
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
      return;
    } catch (streamError: any) {
      lastError = streamError;
      const errMsg = streamError?.message || '';
      const isIncompleteJsonAtEnd = errMsg.includes('Incomplete JSON segment at the end');

      // If text was already emitted and we hit the SDK's EOF trailing buffer bug, mark complete
      if (isIncompleteJsonAtEnd && hasEmittedChunk) {
        console.log(`Stream with model ${modelName} completed successfully (handled trailing EOF buffer segment)`);
        success = true;
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
        return;
      }

      // If we haven't emitted chunks, we can safely try the next model
      if (!hasEmittedChunk) {
        console.warn(`Model ${modelName} failed before emitting chunks (${errMsg}). Trying next fallback model...`);
        // Short delay before trying next model
        await new Promise((r) => setTimeout(r, 600));
        continue;
      } else {
        // If some chunks were already emitted and another error occurred, finish gracefully
        console.warn(`Stream with model ${modelName} interrupted after emitting chunks:`, errMsg);
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
        return;
      }
    }
  }

  // If streaming did not succeed and no chunks were emitted, fallback to generateContent
  if (!hasEmittedChunk) {
    for (const modelName of PRIMARY_MODELS) {
      try {
        console.log(`Attempting generateContent fallback with ${modelName}...`);
        const fallback = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        if (fallback.text) {
          res.write(`data: ${JSON.stringify({ text: fallback.text })}\n\n`);
        }
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
        return;
      } catch (err: any) {
        lastError = err;
        console.warn(`Fallback generateContent failed with ${modelName}:`, err?.message);
        await new Promise((r) => setTimeout(r, 600));
      }
    }
  }

  // If all attempts failed
  console.error('All Gemini model attempts failed:', lastError);
  const userFacingError =
    'Kumhud is currently experiencing high study traffic. Please click Ask again in a few moments.';
  res.write(`data: ${JSON.stringify({ error: userFacingError })}\n\n`);
  res.end();
});

// Non-streaming chat fallback endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  const body = req.body as ChatRequestBody;

  if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    res.status(400).json({ error: 'Messages array is required.' });
    return;
  }

  if (!process.env.GEMINI_API_KEY) {
    res.status(500).json({ error: 'Gemini API key is not configured on the server.' });
    return;
  }

  const { contents, systemInstruction } = buildPrompt(body);
  let lastError: any = null;

  for (const modelName of PRIMARY_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({
        text: response.text || '',
        subject: body.subject || 'General',
        language: body.language || 'english',
      });
      return;
    } catch (error: any) {
      lastError = error;
      console.warn(`Model ${modelName} failed in /api/chat:`, error?.message);
      await new Promise((r) => setTimeout(r, 600));
    }
  }

  console.error('Error in /api/chat after trying all models:', lastError);
  res.status(500).json({
    error: 'Kumhud is currently experiencing high demand. Please try again shortly.',
  });
});

// Concise Session Summary Generation Endpoint
app.post('/api/summarize', async (req: Request, res: Response) => {
  try {
    const { messages, subject, language = 'english', title } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Messages array is required to generate a session revision summary.' });
      return;
    }

    const conversationTranscript = messages
      .slice(-10) // Focus on recent study exchanges
      .map((m: any) => `${m.role === 'user' ? 'Student Doubt' : 'Kumhud Solution'}: ${m.content}`)
      .join('\n\n---\n\n');

    const prompt = `You are Kumhud AI's Study Revision Generator.
Create a high-impact, concise revision summary of this study conversation for quick exam review.

Subject: ${subject || 'General Studies'}
Language to respond in: ${language} (Write entirely in ${
      language === 'hindi'
        ? 'pure Hindi with KaTeX equations'
        : language === 'hinglish'
        ? 'natural Hinglish with KaTeX equations'
        : 'concise, clear English with KaTeX equations'
    })

Conversation to summarize:
${conversationTranscript}

Structure your response strictly as follows:
# 📋 Quick Revision Summary: ${title || 'Topic Overview'}

### 1. 🎯 Core Concepts Mastered
- Key definitions, laws, or theorems discussed (bullet points with **bold** keywords)

### 2. 📐 Essential Formulas & Equations
- Mathematical/scientific formulas using LaTeX notation (e.g. $E = mc^2$ or $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$)

### 3. 🔍 Step-by-Step Problem Solving Strategy
- The exact sequential approach to tackle this type of question in board/competitive exams

### 4. ⚠️ Common Exam Pitfalls & High-Yield Tips
- What students commonly get wrong and tricks to avoid minus marks

### 5. ⚡ Rapid 3-Question Self-Check
- 3 quick test questions with compact inline answers so the student can verify recall immediately.

Keep it high-density, accurate, and optimized for 3-minute exam revision.`;

    let summaryText = '';
    for (const modelName of PRIMARY_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            temperature: 0.4,
          },
        });
        if (response.text) {
          summaryText = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${modelName} failed for /api/summarize:`, err?.message);
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    if (!summaryText) {
      // High-quality structured fallback if offline or rate limited
      const userQuestions = messages.filter((m: any) => m.role === 'user');
      summaryText = `# 📋 Quick Revision Summary: ${subject?.toUpperCase() || 'STUDY NOTES'}

### 1. 🎯 Core Concepts Mastered
${userQuestions.map((m: any, i: number) => `- **Topic ${i + 1}**: ${m.content.slice(0, 100)}...`).join('\n')}

### 2. 📐 Key Discussion Points
- Review each step-by-step calculation and definition in the chat history.
- Ensure all SI units and mathematical signs are double-checked before submission.

### 3. 💡 High-Yield Exam Tip
- Reinforce these concepts by adding them to your **Kumhud Spaced-Repetition Deck** (Cards button in top header)!`;
    }

    res.json({
      success: true,
      summary: summaryText,
    });
  } catch (error: any) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: 'Failed to generate session summary.' });
  }
});

// 5-Question Retention Multiple-Choice Quiz Generation Endpoint
app.post('/api/quiz/generate', async (req: Request, res: Response) => {
  try {
    const { exchanges, subject = 'maths', language = 'english', title } = req.body;

    if (!exchanges || !Array.isArray(exchanges) || exchanges.length === 0) {
      res.status(400).json({ error: 'At least one study question exchange is required.' });
      return;
    }

    // Take up to 5 most recent question/answer exchanges
    const recentExchanges = exchanges.slice(-5);

    const transcript = recentExchanges
      .map(
        (ex: any, idx: number) =>
          `Topic ${idx + 1}:\nQuestion Asked: ${ex.question}\nAnswer/Concept Provided: ${ex.answer.slice(0, 600)}`
      )
      .join('\n\n---\n\n');

    const prompt = `You are Kumhud AI's Educational Assessment Engine for school and college exams.
Analyze the following recent study questions and solutions from the student's current session:

${transcript}

Task:
Generate a 5-question multiple-choice quiz (MCQ) specifically designed to test the student's retention of key concepts, formulas, definitions, and problem-solving steps covered in these exact topics.
If fewer than 5 topics are provided, create supplementary deep-retention/pitfall questions on the provided topics so there are EXACTLY 5 questions.

Language requirement: Formulate questions and explanations in ${
      language === 'hindi'
        ? 'pure Hindi with KaTeX equations'
        : language === 'hinglish'
        ? 'natural Hinglish with KaTeX equations'
        : 'clear academic English with KaTeX equations'
    }.

You MUST return a JSON object with this exact structure:
{
  "title": "${title ? title + ' - Retention Check' : 'Retention Check (5 MCQs)'}",
  "questions": [
    {
      "id": "q1",
      "question": "Question text with clear problem statement...",
      "options": [
        "A) Option 1",
        "B) Option 2",
        "C) Option 3",
        "D) Option 4"
      ],
      "correctIndex": 0,
      "explanation": "Why this option is correct and why other options are common traps/pitfalls...",
      "sourceTopic": "Topic Name"
    }
  ]
}

Ensure:
- Exactly 5 questions.
- Exactly 4 options per question.
- correctIndex is an integer from 0 to 3.
- Use valid LaTeX notation for mathematical equations (e.g. $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$).
- Output valid JSON only, no outside text.`;

    let generatedQuiz: any = null;

    for (const modelName of PRIMARY_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            temperature: 0.3,
            responseMimeType: 'application/json',
          },
        });

        if (response.text) {
          try {
            let cleaned = response.text.trim();
            if (cleaned.startsWith('```json')) {
              cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
            } else if (cleaned.startsWith('```')) {
              cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
            }
            const parsed = JSON.parse(cleaned);
            if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
              generatedQuiz = parsed;
              break;
            }
          } catch (jsonErr) {
            console.warn(`JSON parse error from ${modelName}:`, jsonErr);
          }
        }
      } catch (err: any) {
        console.warn(`Model ${modelName} failed for /api/quiz/generate:`, err?.message);
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    // High quality algorithmic fallback if model failed or offline
    if (!generatedQuiz || !Array.isArray(generatedQuiz.questions) || generatedQuiz.questions.length === 0) {
      const fallbackQuestions = recentExchanges.map((ex: any, i: number) => {
        const snippet = ex.question.slice(0, 50);
        return {
          id: `q_${i + 1}`,
          question: `In your doubt regarding "${snippet}", what is the primary rule or key formula used?`,
          options: [
            `A) Standard formula and step-by-step substitution discussed in session`,
            `B) Neglecting signs and units during final algebraic calculation`,
            `C) Direct assumption without checking boundary conditions`,
            `D) Using empirical approximations instead of exact identities`,
          ],
          correctIndex: 0,
          explanation: `The solution emphasizes applying the exact mathematical/scientific concept: ${ex.answer.slice(0, 200)}...`,
          sourceTopic: ex.question.slice(0, 30),
        };
      });

      // Pad to 5 if fewer
      while (fallbackQuestions.length < 5) {
        const idx = fallbackQuestions.length + 1;
        fallbackQuestions.push({
          id: `q_${idx}`,
          question: `When answering exam problems on ${subject}, which step is essential before final submission?`,
          options: [
            `A) Verify SI units, algebraic signs, and re-check substitution`,
            `B) Skip writing intermediate steps to save paper`,
            `C) Memorize only the final answer number`,
            `D) Disregard given constraints`,
          ],
          correctIndex: 0,
          explanation: `In board and competitive exams, marks are awarded for given data, formula, correct substitution, and proper SI units.`,
          sourceTopic: 'Exam Strategy & Unit Verification',
        });
      }

      generatedQuiz = {
        title: `${subject.toUpperCase()} Retention Quiz (5 Questions)`,
        questions: fallbackQuestions.slice(0, 5),
      };
    }

    res.json({
      success: true,
      quiz: {
        id: `quiz_${Date.now()}`,
        title: generatedQuiz.title || '5-Question Retention Check',
        subject,
        language,
        questions: generatedQuiz.questions.slice(0, 5),
        createdAt: Date.now(),
      },
    });
  } catch (error: any) {
    console.error('Error in /api/quiz/generate:', error);
    res.status(500).json({ error: 'Failed to generate retention quiz.' });
  }
});

// ==================== Virtual Study Rooms API ====================

// List all study rooms
app.get('/api/study-rooms', (_req: Request, res: Response) => {
  res.json({
    success: true,
    rooms: getAllRooms(),
  });
});

// Get single room details
app.get('/api/study-rooms/:code', (req: Request, res: Response) => {
  const room = getRoom(req.params.code);
  if (!room) {
    res.status(404).json({ error: 'Study room not found with this code.' });
    return;
  }
  res.json({
    success: true,
    room,
  });
});

// Create new study room
app.post('/api/study-rooms/create', (req: Request, res: Response) => {
  try {
    const { name, subject, createdByPseudonym } = req.body;
    const newRoom = createRoom(name, subject || 'all', createdByPseudonym || 'Study Pioneer');
    res.json({
      success: true,
      room: newRoom,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create study room.' });
  }
});

// Anonymously record asked topic/doubt in room
app.post('/api/study-rooms/:code/topic', (req: Request, res: Response) => {
  try {
    const { topic, subject } = req.body;
    const room = recordTopicInRoom(req.params.code, topic, subject || 'maths');
    if (!room) {
      res.status(404).json({ error: 'Study room not found.' });
      return;
    }
    res.json({
      success: true,
      room,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to record topic in study room.' });
  }
});

// Send room reaction
app.post('/api/study-rooms/:code/react', (req: Request, res: Response) => {
  try {
    const { emoji, pseudonym } = req.body;
    const room = recordReactionInRoom(req.params.code, emoji, pseudonym);
    if (!room) {
      res.status(404).json({ error: 'Study room not found.' });
      return;
    }
    res.json({
      success: true,
      room,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to send reaction.' });
  }
});

// Static / Dev Server integration
async function startServer() {
  const server = http.createServer(app);

  // Setup WebSocket server for real-time study rooms
  const wss = new WebSocketServer({ noServer: true });

  wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (messageData: string) => {
      try {
        const payload = JSON.parse(messageData.toString());
        if (payload.type === 'join_room') {
          handlePeerJoin(
            ws,
            payload.roomCode,
            payload.pseudonym,
            payload.avatar,
            payload.subject
          );
        } else if (payload.type === 'log_topic') {
          recordTopicInRoom(payload.roomCode, payload.topic, payload.subject);
        } else if (payload.type === 'send_reaction') {
          recordReactionInRoom(payload.roomCode, payload.emoji, payload.pseudonym);
        } else if (payload.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
        }
      } catch (err) {
        console.error('Error handling WebSocket message:', err);
      }
    });

    ws.on('close', () => {
      handlePeerLeave(ws);
    });

    ws.on('error', (err) => {
      console.warn('WebSocket client error:', err);
      handlePeerLeave(ws);
    });
  });

  server.on('upgrade', (request, socket, head) => {
    try {
      const url = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);
      if (url.pathname === '/ws') {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit('connection', ws, request);
        });
      }
    } catch (e) {
      console.error('Error in upgrade handler:', e);
    }
  });

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Kumhud AI Study Assistant server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
