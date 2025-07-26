import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

dotenv.config();
console.log("OpenAI Key:", process.env.OPENAI_API_KEY?.slice(0, 8) + '...');
const app = express();
app.use(cors());
app.use(express.json());

// OpenAI setup
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Supabase setup (server-side)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// POST /analyze-essay
// app.post('/analyze-essay', async (req, res) => {
//   const { essay, college, user_id } = req.body;

//   const prompt = `Analyze this college essay for how well it aligns with ${college.name}'s mission: "${college.mission}"\n\nEssay:\n${essay}`;

//   const result = await openai.chat.completions.create({
//     model: 'gpt-3.5-turbo',
//     messages: [{ role: 'user', content: prompt }],
//   });

//   const feedback = result.choices[0].message.content;

//   const { data, error } = await supabase.from('essays').insert({
//     user_id,
//     college_name: college.name,
//     content: essay,
//     feedback,
//     created_at: new Date(),
//   });

//   if (error) return res.status(500).json({ error: error.message });

//   res.json({ feedback, saved: true });
// });
app.post('/analyze-essay', async (req, res) => {
  try {
    const { essay, college, user_id } = req.body;

    const prompt = `Analyze this college essay for how well it aligns with ${college.name}'s mission: "${college.mission}"\n\nEssay:\n${essay}`;

    const result = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    const feedback = result.choices[0].message.content;

    const { data, error } = await supabase.from('essays').insert({
      user_id,
      college_name: college.name,
      content: essay,
      feedback,
      created_at: new Date(),
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ feedback, saved: true });
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
