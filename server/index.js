import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

dotenv.config();
// console.log("OpenAI Key:", process.env.OPENAI_API_KEY?.slice(0, 8) + '...');
const app = express();
app.use(cors());
app.use(express.json());

// OpenAI setup
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1'
});
// Supabase setup (server-side)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.post('/analyze-essay', async (req, res) => {
  try {
    const { essay, college, user_id } = req.body;

    // const prompt = `Analyze this college essay for how well it aligns with ${college.name}'s mission: "${college.mission}"\n\nEssay:\n${essay}`;
    const prompt = `You are an admissions expert. Analyze the following college essay for its alignment with ${college.name}'s mission: "${college.mission}". Be a tough grader. Make sure to give the most accurate and realistic feedback possible.
    Be very descriptive for how the essay could improve and where the weak points lie.

    Return a JSON object with the following structure:
    {
      "alignmentScore": number (0-100),
      "valuesScore": number (0-100),
      "toneScore": number (0-100),
      "improvementScore": number (0-100),
      "summary": string (concise summary of strengths and weaknesses)
    }

    Essay:
    ${essay}`;

    // use the API response
    const result = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    let parsed;
    try {
      parsed = JSON.parse(result.choices[0].message.content);
    } catch (err) {
      return res.status(500).json({ error: "Failed to parse AI response." });
    }

    const { alignmentScore, valuesScore, toneScore, improvementScore, summary } = parsed;

    const { data, error } = await supabase.from('essays').insert({
      user_id,
      college_name: college.name,
      content: essay,
      feedback: summary,
      score: (alignmentScore + valuesScore + toneScore + improvementScore) / 4,
      created_at: new Date(),
    });

    if (error) {
      console.error("Supabase insert error:", error.message);
      return res.status(500).json({ error: error.message });
    }

    res.json({
      feedback: summary,
      scores: {
        alignment: alignmentScore,
        values: valuesScore,
        tone: toneScore,
        improvement: improvementScore
      }
    });
  } catch (err) {
    console.error("Error during essay analysis:", err);

    // Send a readable message to the frontend
    res.status(500).json({
      error: err?.message || "Unknown server error",
    });
  }
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
