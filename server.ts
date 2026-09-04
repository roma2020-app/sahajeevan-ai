import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { getGoogleMapsApiKey } from "./server/secrets";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let genAI: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set in the environment.");
    return null;
  }
  if (!genAI) {
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

// Fallback curated moments if Gemini is unavailable
const fallbackMoments = [
  {
    title: "🌳 Tree Detective",
    tagline: "15 minutes • Parent + Child",
    duration: "15 min",
    locationType: "outdoor",
    steps: [
      "Find a tree or green plant near your home or balcony.",
      "Look closely at three different leaves and gently touch their textures.",
      "Look for one bird, insect, or sign of life resting on or near the bark.",
      "Ask your child: 'If this tree could talk, what story would it tell today?'"
    ],
    natureLesson: "Trees breathe with us by absorbing carbon dioxide and providing fresh oxygen, food, and shelter for birds and insects.",
    parentPrompt: "What do you think is the tree's favorite season?",
    ecoBenefit: "Cultivates sensory awareness and deep gratitude for urban greenery.",
    quickTip: "No walking far required—even a single potted plant or tree by the sidewalk works wonderfully!"
  },
  {
    title: "☁️ Cloud Storytellers",
    tagline: "10 minutes • Parent + Child",
    duration: "10 min",
    locationType: "outdoor",
    steps: [
      "Sit or lie down comfortably together on a bench, balcony, or patch of grass.",
      "Look up at the sky and spot three different cloud shapes.",
      "Take turns naming an animal or fantastical creature hiding in the clouds.",
      "Take three slow, deep breaths together, imagining you're floating like a cloud."
    ],
    natureLesson: "Clouds are made of billions of tiny floating water droplets that travel around the world before returning as nourishing rain.",
    parentPrompt: "Where do you think that cloud just traveled from?",
    ecoBenefit: "Calms nervous systems after a busy day while observing weather cycles.",
    quickTip: "Can be done looking out of any window or right outside your front door."
  },
  {
    title: "🍃 Secret Leaf Texture Map",
    tagline: "15 minutes • Parent + Child",
    duration: "15 min",
    locationType: "indoor",
    steps: [
      "Gather 2-3 fallen leaves or herb leaves from your kitchen/balcony.",
      "Place a leaf under a piece of recycled paper with the vein side facing up.",
      "Gently rub the side of a pencil or crayon over the paper until the leaf veins emerge.",
      "Notice how leaf veins look like the veins in our hands that carry water and life."
    ],
    natureLesson: "Veins in leaves act like tiny natural pipes that deliver water from roots to the sunlight-catching leaves.",
    parentPrompt: "Why do you think plants have different patterns on their leaves?",
    ecoBenefit: "Bridges art and botany with everyday household materials.",
    quickTip: "Use scrap paper or mail envelopes—no special art supplies needed."
  },
  {
    title: "💧 Water Wonders & Droplet Race",
    tagline: "10 minutes • Parent + Child",
    duration: "10 min",
    locationType: "indoor",
    steps: [
      "Take two drops of water on a reusable plate or tray.",
      "Gently tilt the plate and watch how the water droplets merge into one big drop.",
      "Talk about how rivers start as tiny drops on mountains and join together.",
      "Together, use a cup of water to quench the thirst of a houseplant or garden plant."
    ],
    natureLesson: "Water molecules have a special bond called cohesion that makes them stick together like a family.",
    parentPrompt: "How does water help every living thing in our home and neighborhood?",
    ecoBenefit: "Teaches mindful respect for every single drop of water on Earth.",
    quickTip: "Requires only a plate, a few drops of tap water, and zero cleanup."
  }
];

// POST /api/generate-moment
app.post("/api/generate-moment", async (req, res) => {
  try {
    const { duration = "15 min", childAge = "6", locationType = "outdoor", interest = "", timeOfDay = "evening" } = req.body;

    const ai = getGeminiClient();

    if (!ai) {
      // Return a smart fallback tailored to inputs
      const matched = fallbackMoments.find(m => m.locationType === locationType) || fallbackMoments[0];
      return res.json({
        success: true,
        data: {
          ...matched,
          duration: `${duration}`,
          isFallback: true
        }
      });
    }

    const prompt = `You are the AI companion for "Sahajeevan" (living together in harmony with family and nature).
Design a single, heartwarming, realistic micro-activity for a busy working parent and their child.

User Context:
- Time available: ${duration}
- Child's age / grade: ${childAge}
- Environment: ${locationType} (${locationType === 'indoor' ? 'at home, near window, kitchen, or balcony' : 'outside, garden, backyard, park, or sidewalk'})
- Optional interest/curiosity: ${interest ? interest : 'General nature & family bonding'}
- Current time of day: ${timeOfDay}

Core Principles:
1. STRICTLY realistic within ${duration} (no long setup or special shopping).
2. Appropriate for age ${childAge}.
3. Connects the child and parent to each other AND to nature, environment, or sustainability.
4. Safe, practical, gentle, and relaxing for a tired working parent.
5. Zero or minimal preparation with standard household items or natural surroundings.

Respond with strict JSON adhering to this schema:
{
  "title": "Short catchy title with 1 relevant emoji (e.g. 🌳 Tree Detective)",
  "tagline": "${duration} • Parent + Child",
  "steps": ["Step 1 concise action", "Step 2 concise action", "Step 3 concise action", "Step 4 interactive question or closing action"],
  "natureLesson": "1-2 sentence simple, scientifically true nature lesson suitable for age ${childAge}",
  "parentPrompt": "A thoughtful, gentle question for the parent to ask the child to spark wonder",
  "ecoBenefit": "1 short sentence about the environmental/bonding value",
  "quickTip": "1 practical parent tip for making this effortless after work"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            tagline: { type: Type.STRING },
            steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            natureLesson: { type: Type.STRING },
            parentPrompt: { type: Type.STRING },
            ecoBenefit: { type: Type.STRING },
            quickTip: { type: Type.STRING }
          },
          required: ["title", "tagline", "steps", "natureLesson", "parentPrompt"]
        },
        temperature: 0.7,
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from Gemini");
    }

    const parsedData = JSON.parse(responseText);

    return res.json({
      success: true,
      data: {
        ...parsedData,
        duration,
        childAge,
        locationType,
        interest,
        rawAiResponse: responseText
      }
    });
  } catch (error: any) {
    console.error("Error generating Sahajeevan moment with Gemini:", error);
    
    // Provide safe, high-quality fallback on error
    const matched = fallbackMoments[Math.floor(Math.random() * fallbackMoments.length)];
    return res.json({
      success: true,
      data: {
        ...matched,
        duration: req.body.duration || "15 min",
        childAge: req.body.childAge || "5-8",
        locationType: req.body.locationType || "outdoor",
        isFallback: true,
        errorMessage: error?.message || "Using curated moment"
      }
    });
  }
});

// POST /api/refine-moment (Multi-turn conversational refinement with Gemini)
app.post("/api/refine-moment", async (req, res) => {
  try {
    const { moment, userConfig, history = [], message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ success: false, error: "Message is required" });
    }

    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        reply: "Here is a mindful adaptation: You can simplify the activity by focusing directly on one sensory observation (e.g. noticing the sounds or colors together for 3-5 quiet minutes).",
        isFallback: true
      });
    }

    // Format conversation history for @google/genai Chat session
    // Must alternate between user and model roles
    const formattedHistory = Array.isArray(history)
      ? history.map((item: any) => ({
          role: item.role === "model" ? "model" : "user",
          parts: [{ text: String(item.text || item.content || "") }]
        }))
      : [];

    const systemInstruction = `You are the friendly, mindful AI parenting & nature-mentoring assistant for "Sahajeevan" (living harmoniously together with family and nature).
A parent and their child have generated a nature micro-activity and are having a multi-turn conversation with you to refine, customize, or adapt it.

Current Activity:
- Title: ${moment?.title || "Nature Connection"}
- Duration: ${userConfig?.duration || "15 min"}
- Child Age: ${userConfig?.childAge || "6"}
- Setting: ${userConfig?.locationType || "outdoor"}
- Steps:
${(moment?.steps || []).map((s: string, i: number) => `  ${i + 1}. ${s}`).join("\n")}
- Nature Lesson: ${moment?.natureLesson || ""}
- Conversation Prompt: ${moment?.parentPrompt || ""}
- Quick Tip: ${moment?.quickTip || ""}

Your multi-turn responsibilities:
1. Answer the parent warmly, gently, and concisely (1-3 short paragraphs). Keep suggestions low-effort and low-stress for a busy parent.
2. If the user asks for adaptations (e.g. rain, indoor alternatives, toddlers, energetic kids, no supplies, shorter time, bedtime calm):
   - Explain your recommendation clearly.
   - ALSO provide an updated activity object formatted inside a single \`\`\`json ... \`\`\` code fence at the end:
     \`\`\`json
     {
       "title": "Refined title if changed",
       "steps": ["Step 1", "Step 2", "Step 3", "Step 4"],
       "natureLesson": "Relevant nature lesson",
       "parentPrompt": "Refined conversation question",
       "quickTip": "Refined practical tip"
     }
     \`\`\`
3. If the user asks general nature or parenting questions, answer thoughtfully without needing to change the activity steps.`;

    let fullText = "";
    const candidateModels = ["gemini-2.5-flash", "gemini-3.1-flash-lite", "gemini-3.8-flash"];
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        const chat = ai.chats.create({
          model,
          config: {
            systemInstruction,
            temperature: 0.7
          },
          history: formattedHistory
        });

        const chatResponse = await chat.sendMessage({ message });
        fullText = chatResponse.text || "";
        if (fullText) break;
      } catch (err: any) {
        console.warn(`Model ${model} error in refine-moment, trying next candidate:`, err?.message || err);
        lastError = err;
      }
    }

    if (!fullText) {
      // If temporary upstream 503 spikes affect all models, provide an intelligent graceful response
      return res.json({
        success: true,
        reply: `Here is a gentle tip to adapt "${moment?.title || "this moment"}": For ${message.toLowerCase().includes("rain") ? "rainy or wet days" : "this situation"}, bring a small element indoors—like gathering fallen leaves or looking out a cozy window together while observing the weather patterns.`,
        isFallback: true
      });
    }

    // Extract any structured json adaptation if present
    let updatedActivity: any = null;
    let replyText = fullText;

    const jsonFenceMatch = fullText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonFenceMatch) {
      try {
        const parsed = JSON.parse(jsonFenceMatch[1]);
        if (parsed && (Array.isArray(parsed.steps) || parsed.title)) {
          updatedActivity = parsed;
          // Strip the JSON block from user conversational reply
          replyText = fullText.replace(/```(?:json)?\s*[\s\S]*?\s*```/, "").trim();
        }
      } catch (e) {
        console.warn("Could not parse JSON block from chat response:", e);
      }
    }

    return res.json({
      success: true,
      reply: replyText || fullText,
      updatedActivity,
      fullText
    });
  } catch (error: any) {
    console.error("Error in multi-turn moment refinement:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to refine moment with Gemini"
    });
  }
});

// Maps API Key config endpoint (safely provides Maps JS API key for client-side map rendering)
app.get("/api/config/maps-key", async (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.setHeader("Pragma", "no-cache");
  try {
    const key = await getGoogleMapsApiKey();
    res.json({ apiKey: key || "" });
  } catch {
    // Never expose stack trace or secret metadata
    res.status(500).json({ apiKey: "", error: "Configuration unavailable" });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "Sahajeevan", time: new Date().toISOString() });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Sahajeevan server is running on http://localhost:${PORT}`);
  });
}

startServer();
