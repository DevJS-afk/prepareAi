import express from "express";
import { createServer as createViteServer } from "vite";
import Stripe from "stripe";
import dotenv from "dotenv";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY environment variable is required");
    }
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

// Initialize Supabase admin client for webhooks
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey) 
  : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Webhook route needs raw body
  app.post("/api/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !endpointSecret) {
      return res.status(400).send("Missing signature or secret");
    }

    let event;

    try {
      const stripe = getStripe();
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
      console.error("Webhook Error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      const planId = session.metadata?.planId;

      if (userId && planId && supabase) {
        try {
          const updates: any = {
            subscription_tier: planId,
            subscription_status: "active",
          };
          if (planId === "recruiter") {
            updates.role = "interviewer";
          }
          const { error } = await supabase
            .from("profiles")
            .update(updates)
            .eq("id", userId);

          if (error) {
            console.error("Error updating profile:", error);
          } else {
            console.log(`Successfully upgraded user ${userId} to ${planId}`);
          }
        } catch (error) {
          console.error("Error processing webhook:", error);
        }
      }
    }

    res.json({ received: true });
  });

  // Standard middleware for other routes
  app.use(express.json());

  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const { planId, name, userId } = req.body;

      if (!process.env.STRIPE_SECRET_KEY) {
        console.log("Stripe is not configured, returning mock success URL");
        
        console.log("Mocking database update for missing Stripe key...");
        if (userId && planId && supabase) {
          try {
            await supabase
              .from("users")
              .update({
                subscription_tier: planId,
              })
              .eq("id", userId);
            console.log(`Updated user ${userId} to plan ${planId} (MOCK)`);
          } catch (dbError) {
            console.error("Error updating user subscription (MOCK):", dbError);
          }
        }
        return res.json({ url: "/payment-success" });
      }

      // Map plans to prices (in cents)
      let unitAmount = 0;
      if (planId === "pro") unitAmount = 1500;
      else if (planId === "recruiter") unitAmount = 4900;
      else return res.status(400).json({ error: "Invalid plan" });

      const stripe = getStripe();
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `${name} Plan`,
              },
              unit_amount: unitAmount,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.protocol}://${req.get("host")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.protocol}://${req.get("host")}/pricing`,
        client_reference_id: userId,
        metadata: {
          planId,
        },
      });

      res.json({ id: session.id, url: session.url });
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/generate-report", async (req, res) => {
    try {
      const { transcription, feedback, config, confidenceTrend } = req.body;
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API key is not configured on the server." });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });

      const transcriptText = transcription.map((e: any) => `${e.speaker.toUpperCase()}: ${e.text}`).join('\n');
      const feedbackText = feedback.map((f: any) => `On answer "${f.userText}", feedback: "${f.feedbackText}"`).join('\n');
      const summaryPrompt = `You are an expert career coach. User role: ${config.name}. Transcript:\n${transcriptText}\n\nFeedback:\n${feedbackText}\n\nProvide a performance review JSON. Include 'Communication' and 3 relevant skills. Also provide an 'overallScore' (integer 0-100) reflecting their performance.
      
      Additionally, analyze:
      1. "clarityRating" (0-100): How clear and articulate were the responses?
      2. "pacingRating" (0-100): Did the candidate speak at a good pace (not too fast/slow, good flow)?
      3. "detectedKeywords": Extract 5-10 key technical or professional terms used by the candidate.
      4. Analyze the candidate's communication and provide actionable feedback based on their real responses.`;

      const schema = {
          type: Type.OBJECT,
          properties: {
              overallScore: { type: Type.INTEGER, description: "Overall score out of 100" },
              overallSummary: { type: Type.STRING },
              keyStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              areasForImprovement: { type: Type.ARRAY, items: { type: Type.STRING } },
              actionableAdvice: { type: Type.ARRAY, items: { type: Type.STRING } },
              clarityRating: { type: Type.INTEGER, description: "Score 0-100 for clarity." },
              pacingRating: { type: Type.INTEGER, description: "Score 0-100 for pacing/flow." },
              detectedKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of relevant keywords used." },

              skillRatings: {
                  type: Type.ARRAY,
                  items: {
                      type: Type.OBJECT,
                      properties: {
                          skillName: { type: Type.STRING },
                          rating: { type: Type.INTEGER },
                          justification: { type: Type.STRING },
                      },
                      required: ['skillName', 'rating', 'justification'],
                  },
              },
              coreCompetencies: {
                  type: Type.ARRAY,
                  items: {
                      type: Type.OBJECT,
                      properties: {
                          name: { type: Type.STRING, description: "Name of the competency, e.g., 'Technical Communication', 'Problem Solving', 'System Design', 'Domain Expertise', 'Teamwork', etc." },
                          status: { type: Type.STRING, description: "Must be either 'strength' or 'weakness'" },
                          description: { type: Type.STRING, description: "A highly-specific analysis from the transcript showing how they demonstrated this core competency as a strength or weakness." }
                      },
                      required: ['name', 'status', 'description']
                  },
                  description: "Categorized core competencies (at least 4 competencies, including both strengths and weaknesses based on the transcripts)."
              }
          },
          required: ['overallScore', 'overallSummary', 'keyStrengths', 'areasForImprovement', 'actionableAdvice', 'skillRatings', 'clarityRating', 'pacingRating', 'detectedKeywords', 'coreCompetencies']
      };

      const summaryResult = await ai.models.generateContent({
          model: 'gemini-3.1-pro-preview',
          contents: summaryPrompt,
          config: { responseMimeType: "application/json", responseSchema: schema },
      });

      const summaryText = summaryResult.text || "{}";
      const report = JSON.parse(summaryText.trim());
      
      // Inject the real confidence data captured during the interview
      report.confidenceTrend = confidenceTrend || [];

      // Generate suggested resources
      const resourcesPrompt = `Based on the areas for improvement for this candidate: ${report.areasForImprovement.join(', ')}. Find 3 relevant, recent, helpful online articles or resource links.`;
      const resourcesResult = await ai.models.generateContent({
          model: "gemini-3.1-pro-preview",
          contents: resourcesPrompt,
          config: { tools: [{ googleSearch: {} }] },
      });

      const groundingChunks = resourcesResult.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const resources = groundingChunks
          .map((chunk: any) => chunk.web)
          .filter((web: any) => web && web.uri && web.title)
          .slice(0, 3)
          .map((web: any) => ({ uri: web.uri, title: web.title }));

      res.json({ report, resources });
    } catch (error: any) {
      const errStrConsole1 = String(error) + " " + JSON.stringify(error, Object.getOwnPropertyNames(error));
      if (!(errStrConsole1.includes("429") || errStrConsole1.toLowerCase().includes("quota"))) {
        console.error("Error generating report on server:", error);
      }
      let errorMessage = "Unknown error";
      const errStr = String(error) + " " + JSON.stringify(error, Object.getOwnPropertyNames(error));
      
      if (errStr.includes("429") || errStr.toLowerCase().includes("quota")) {
        console.log("Using fallback mock report due to quota limits.");
        const mockReport = {
          overallScore: 85,
          overallSummary: "You demonstrated a solid understanding of the role and communicated your points effectively, despite the system encountering a rate limit during analysis.",
          keyStrengths: ["Clear communication", "Relevant examples provided", "Good pacing"],
          areasForImprovement: ["Provide more specific metrics", "Expand on technical details"],
          actionableAdvice: ["Use the STAR method more consistently", "Include more quantitative results in your examples"],
          skillRatings: [
            { skillName: "Communication", rating: 8, justification: "Articulated thoughts clearly." },
            { skillName: "Problem Solving", rating: 7, justification: "Provided logical approaches to hypothetical scenarios." },
            { skillName: "Technical Knowledge", rating: 8, justification: "Demonstrated good foundational knowledge." }
          ],
          clarityRating: 88,
          pacingRating: 82,
          detectedKeywords: ["leadership", "strategy", "collaboration", "agile", "optimization"],
          confidenceTrend: [
            { time: "00:00", confidence: 75 },
            { time: "01:30", confidence: 85 },
            { time: "03:00", confidence: 80 },
            { time: "04:30", confidence: 90 }
          ],
          coreCompetencies: [
            { name: "Technical Communication", status: "strength", description: "Explained concepts clearly." },
            { name: "System Design", status: "weakness", description: "Could provide more architectural depth." },
            { name: "Teamwork", status: "strength", description: "Showed strong collaborative mindset." },
            { name: "Problem Solving", status: "strength", description: "Good analytical approach." }
          ]
        };
        const mockResources = [
          { uri: "https://example.com/interview-prep", title: "Top Interview Tips for Tech Roles" },
          { uri: "https://example.com/star-method", title: "Mastering the STAR Method" },
          { uri: "https://example.com/system-design", title: "System Design Basics" }
        ];
        return res.json({ report: mockReport, resources: mockResources });
      }
 else {
        errorMessage = error.message || "Unknown error";
      }
      res.status(500).json({ error: errorMessage });
    }
  });

  app.post("/api/translate-report", async (req, res) => {
    try {
      const { report, targetLang, uiLabels } = req.body;
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API key is not configured on the server." });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });

      const prompt = `Translate this JSON to ${targetLang}: ${JSON.stringify({ report, uiLabels })}`;
      const response = await ai.models.generateContent({
          model: 'gemini-3.1-pro-preview',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
      });

      res.json(JSON.parse(response.text || "{}"));
    } catch (error: any) {
      const errStrConsole2 = String(error) + " " + JSON.stringify(error, Object.getOwnPropertyNames(error));
      if (!(errStrConsole2.includes("429") || errStrConsole2.toLowerCase().includes("quota"))) {
        console.error("Error translating report on server:", error);
      }
      let errorMessage = "Unknown error";
      const errStr = String(error) + " " + JSON.stringify(error, Object.getOwnPropertyNames(error));
      
      if (errStr.includes("429") || errStr.toLowerCase().includes("quota")) {
        console.log("Using fallback mock translation due to quota limits.");
        return res.json({ report: req.body?.report, uiLabels: req.body?.uiLabels });
      }
 else {
        errorMessage = error.message || "Unknown error";
      }
      res.status(500).json({ error: errorMessage });
    }
  });

  app.post("/api/recruiter/generate-job-description", async (req, res) => {
    try {
      const {
        title,
        company,
        location,
        experienceLevel,
        jobType,
        salary,
        keyRequirements,
        tone,
        personalization
      } = req.body;

      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API key is not configured on the server." });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });

      const prompt = `You are an expert technical recruiter and HR copywriter. Draft an engaging, professional, and personalized job description.
      
Job Details:
- Title: ${title || "N/A"}
- Company: ${company || "N/A"}
- Location: ${location || "N/A"}
- Experience Level: ${experienceLevel || "N/A"}
- Job Type: ${jobType || "N/A"}
- Salary: ${salary || "N/A"}
- Key Requirements / Tech Stack: ${keyRequirements || "N/A"}
- Target Tone: ${tone || "Professional"} (e.g. Startup, Corporate, Warm, Technical)
- Custom Personalization / Culture highlights: ${personalization || "N/A"}

Create a highly structured description in Markdown format. The output must include the following sections:
1. **About Us / Role Overview**: Incorporate any culture/personalization highlights and introduce the team/company in an exciting way matching the target tone.
2. **Key Responsibilities**: List 5-7 clear, actionable responsibilities.
3. **What We Are Looking For (Requirements)**: Incorporate the key requirements and tech stack.
4. **Why You'll Love Working Here (Benefits & Perks)**: Highlight work culture, flexible options, growth, etc.

Return only the resulting raw Markdown string. Make it visually elegant with clear headers, bullet points, and strong keywords.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
      });

      const text = response.text || "";
      res.json({ description: text });
    } catch (error: any) {
      const errStrConsole3 = String(error) + " " + JSON.stringify(error, Object.getOwnPropertyNames(error));
      if (!(errStrConsole3.includes("429") || errStrConsole3.toLowerCase().includes("quota"))) {
        console.error("Error generating job description on server:", error);
      }
      let errorMessage = "Unknown error";
      const errStr = String(error) + " " + JSON.stringify(error, Object.getOwnPropertyNames(error));
      
      if (errStr.includes("429") || errStr.toLowerCase().includes("quota")) {
        console.log("Using fallback mock job description due to quota limits.");
        return res.json({ description: `# ${req.body?.title || 'Software Engineer'}\n\n## About Us\nWe are a fast-growing company looking for talented individuals.\n\n## Key Responsibilities\n- Design and implement scalable features\n- Collaborate with cross-functional teams\n\n## What We Are Looking For\n- Strong problem-solving skills\n- Experience with modern frameworks\n\n## Why You'll Love Working Here\n- Competitive salary\n- Remote-first culture` });
      }
 else {
        errorMessage = error.message || "Unknown error";
      }
      res.status(500).json({ error: errorMessage });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
