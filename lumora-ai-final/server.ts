import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.post("/api/gemini/analyze-career", async (req, res) => {
    try {
      const { profile } = req.body;
      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });
      
      const prompt = `Analyze this user profile and suggest 3 top career paths with match percentage. Profile: ${JSON.stringify(profile)}. Return JSON with format: {"recommendations": [{"career": "Data Scientist", "match": 92, "reasoning": "..."}]}`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      
      res.json({ success: true, text: response.text });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/gemini/scholarships", async (req, res) => {
    try {
      const { profile } = req.body;
      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });
      
      const prompt = `Find 3 top scholarship matches for this profile: ${JSON.stringify(profile)}. Return JSON with format: {"scholarships": [{"name": "Scholarship Name", "coverage": "Full Tuition", "match": 90, "eligibility": "..."}]}`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      
      res.json({ success: true, text: response.text });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/gemini/analyze-cv", async (req, res) => {
    try {
      const { cvText, base64Pdf } = req.body;
      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });
      
      const prompt = `Act as an Expert HR and ATS Scanner. Analyze this CV. Evaluate ATS compatibility out of 100. Return JSON with format: {"score": 85, "strengths": ["..."], "weaknesses": ["..."], "missingKeywords": ["..."], "formattingTips": ["..."], "suggestions": ["..."]}`;
      
      const contents: any[] = [];
      if (base64Pdf) {
        contents.push({
          inlineData: {
            data: base64Pdf,
            mimeType: "application/pdf"
          }
        });
      }
      contents.push(prompt);
      if (cvText) {
        contents.push(`\n\nText content: """${cvText}"""`);
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          responseMimeType: "application/json",
        }
      });
      
      res.json({ success: true, text: response.text });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/gemini/career-roadmap", async (req, res) => {
    try {
      const { profile, targetCareer } = req.body;
      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });
      
      const prompt = `Act as an Expert Career Coach. Create a step-by-step career roadmap for a user whose goal is "${targetCareer}". User Profile: ${JSON.stringify(profile)}. Return JSON with format: {"roadmap": [{"step": 1, "title": "Learn X", "description": "...", "milestones": ["...", "..."]}]}`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      
      res.json({ success: true, text: response.text });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/gemini/skill-gap", async (req, res) => {
    try {
      const { profile, targetCareer } = req.body;
      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });
      
      const prompt = `Perform a skill gap analysis for a user aiming to become a "${targetCareer}". Current skills: ${profile.skills.join(', ')}. Education: ${profile.educationLevel}. Return JSON with format: {"existingSkills": ["..."], "missingSkills": ["...", "..."], "priorities": ["High Priority: ...", "..."], "suggestions": ["..."]}`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      
      res.json({ success: true, text: response.text });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/gemini/portfolio-eval", async (req, res) => {
    try {
      const { profile, portfolioItems } = req.body;
      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });
      
      const prompt = `Evaluate this portfolio. Portfolio Items: ${JSON.stringify(portfolioItems)}. Return JSON with format: {"score": 80, "assessment": "Good but needs...", "missingSections": ["About Me", "Live Links..."], "suggestions": ["..."]}`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      
      res.json({ success: true, text: response.text });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/gemini/weekly-missions", async (req, res) => {
    try {
      const { profile } = req.body;
      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });
      
      const prompt = `Generate 4 weekly missions to boost this user's career and opportunity score. Profile: ${JSON.stringify(profile)}. Return JSON with format: {"missions": [{"id": "m1", "title": "Complete 1 portfolio project", "description": "...", "scoreReward": 5}]}`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      
      res.json({ success: true, text: response.text });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/gemini/opportunity-simulator", async (req, res) => {
    try {
      const { profile, scenarios, currentScore } = req.body;
      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });
      
      const prompt = `Given a base Opportunity Score of ${currentScore}, simulate how the score changes if the user completes these scenarios: ${scenarios.join(', ')}. Profile details: ${JSON.stringify(profile)}. Return JSON with format: {"predictedScore": 85, "explanation": "Detailed explanation of the increase...", "recommendedActions": ["..."], "riskAnalysis": "..."}`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      
      res.json({ success: true, text: response.text });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/gemini/study-plan", async (req, res) => {
    try {
      const { topic, timeline } = req.body;
      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });
      
      const prompt = `Generate a structured study curriculum for learning "${topic}" over ${timeline}. Return JSON with format: {"roadmap": [{"week": 1, "topic": "Introduction", "tasks": ["Read this", "Do that"]}]}`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      
      res.json({ success: true, text: response.text });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/gemini/portfolio-desc", async (req, res) => {
    try {
      const { title, role, technologies } = req.body;
      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });
      
      const prompt = `Act as an expert UX Designer/Developer. Write a professional, engaging project description (2-3 short paragraphs) for a portfolio item. 
Project Title: ${title}
Role: ${role}
Technologies: ${technologies.join(', ')}

Return ONLY the raw description text, without markdown formatting or code blocks.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });
      
      res.json({ success: true, text: response.text });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/gemini/mock-interview", async (req, res) => {
    try {
      const { profile, mode, history, answer } = req.body;
      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });
      
      let prompt = `You are an expert interviewer conducting a "${mode}" for a candidate. 
Candidate Profile: ${JSON.stringify(profile)}.
`;
      if (!history || history.length === 0) {
        prompt += `Start the interview by introducing yourself briefly and asking the first question. Return JSON only: {"score": null, "feedback": null, "nextQuestion": "Your first question here"}
Do not include markdown blocks like \`\`\`json.`;
      } else {
        const historyText = history.map((h: any) => `${h.role}: ${h.content}`).join('\n');
        prompt += `
Here is the previous interview context:
${historyText}

The candidate just answered: "${answer}".
Evaluate their answer. Provide a score out of 100, constructive feedback, then ask the NEXT question based on their profile or previous answers. 
Return JSON only: {"score": 85, "feedback": "Your feedback here", "nextQuestion": "Your next question here"}
Do not include markdown blocks like \`\`\`json.`;
      }
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      
      res.json({ success: true, text: response.text });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
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
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
