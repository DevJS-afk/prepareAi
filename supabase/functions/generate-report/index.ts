
import { GoogleGenAI, Type } from 'npm:@google/genai@0.2.1'
import { corsHeaders } from '../_shared/cors.ts'

// In a real monorepo, these interfaces would be in a shared package.
interface TranscriptionEntry {
  speaker: 'user' | 'ai';
  text: string;
}

interface FeedbackEntry {
  userText: string;
  feedbackText: string;
}

interface InterviewConfig {
  name: string;
  description: string;
  systemInstruction: string;
}

interface InterviewReport {
  overallSummary: string;
  keyStrengths: string[];
  areasForImprovement: string[];
  actionableAdvice: string[];
  skillRatings: {
    skillName: string;
    rating: number;
    justification: string;
  }[];
  overallScore: number;
  clarityRating?: number; 
  pacingRating?: number; 
  detectedKeywords?: string[];
}

interface SuggestedResource {
    title: string;
    uri: string;
}

// Access Deno global with type assertion to avoid TS errors in environments where Deno types are not fully configured.
declare const Deno: any;

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { transcription, feedback, config } = await req.json() as {
      transcription: TranscriptionEntry[];
      feedback: FeedbackEntry[];
      config: InterviewConfig;
    };

    // Initialize AI client with environment variable.
    // This must be set in your Supabase project's Function settings.
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables.");
    }
    const ai = new GoogleGenAI({ apiKey });
    // Switched to gemini-2.5-flash for better rate limits and speed
    const model = 'gemini-2.5-flash';
    
    // 1. Generate the main report
    const transcriptText = transcription.map(e => `${e.speaker.toUpperCase()}: ${e.text}`).join('\n');
    const feedbackText = feedback.map(f => `On the answer "${f.userText}", the feedback was: "${f.feedbackText}"`).join('\n');

    const summaryPrompt = `You are an expert career coach providing feedback for a job interview simulation. The user was interviewed for the role of: ${config.name}. Here is the full transcript:\n${transcriptText}\n\nHere is the turn-by-turn feedback provided:\n${feedbackText}\n\nBased on all of this information, provide a comprehensive performance review as a JSON object. Analyze the candidate's performance and provide ratings for their skills. Include 'Communication' and 3 other skills relevant to the role: ${config.name}. Also include an 'overallScore' from 0-100 reflecting the candidate's performance.
    
    Additionally, analyze:
    1. "clarityRating" (0-100): How clear and articulate were the responses?
    2. "pacingRating" (0-100): Did the candidate speak at a good pace (not too fast/slow, good flow)?
    3. "detectedKeywords": Extract 5-10 key technical or professional terms used by the candidate.`;

    const schema = {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.INTEGER, description: "An overall score out of 100 based on the candidate's performance." },
          overallSummary: { type: Type.STRING, description: "A brief, high-level overview of the candidate's performance." },
          keyStrengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 2-3 specific strengths the candidate demonstrated." },
          areasForImprovement: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 2-3 specific areas where the candidate could improve." },
          actionableAdvice: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of concrete, actionable steps the candidate can take to improve." },
          clarityRating: { type: Type.INTEGER, description: "Score 0-100 for clarity." },
          pacingRating: { type: Type.INTEGER, description: "Score 0-100 for pacing/flow." },
          detectedKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of relevant keywords used." },
          skillRatings: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                skillName: { type: Type.STRING, description: "Name of the skill assessed." },
                rating: { type: Type.INTEGER, description: "A numerical rating from 1 to 10." },
                justification: { type: Type.STRING, description: "A brief sentence justifying the rating." },
              },
              required: ['skillName', 'rating', 'justification'],
            },
            description: "An array of skill assessments."
          }
        },
        required: ['overallScore', 'overallSummary', 'keyStrengths', 'areasForImprovement', 'actionableAdvice', 'skillRatings', 'clarityRating', 'pacingRating', 'detectedKeywords']
    };

    const summaryResult = await ai.models.generateContent({
      model,
      contents: summaryPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const reportData: InterviewReport = JSON.parse(summaryResult.text.trim());

    // 2. Generate suggested resources
    const resourcesPrompt = `Based on the following interview performance review, find 3 relevant and recent online articles or resources to help the candidate improve. Focus on their "Areas for Improvement".

    Areas for Improvement:
    - ${reportData.areasForImprovement.join('\n- ')}
    
    Actionable Advice:
    - ${reportData.actionableAdvice.join('\n- ')}`;

    const resourcesResult = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: resourcesPrompt,
      config: {
        tools: [{googleSearch: {}}],
      },
    });
    
    const groundingChunks = resourcesResult.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const fetchedResources: SuggestedResource[] = groundingChunks
      .map((chunk: any) => chunk.web)
      .filter((web: any) => web && web.uri && web.title)
      .slice(0, 3)
      .map((web: any) => ({ uri: web.uri, title: web.title }));
      
    // 3. Return the generated data to the client
    return new Response(JSON.stringify({ report: reportData, resources: fetchedResources }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})
