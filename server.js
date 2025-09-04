const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const OpenAI = require('openai');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Serve front-end static files
app.use(express.static(path.join(__dirname, 'public')));

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// API route for generating roadmap
app.post('/generate-roadmap', async (req, res) => {
  const { skill, level, duration, durationUnit, hours } = req.body;
  console.log('Received /generate-roadmap request:', req.body);
  try {
    let prompt = `Create a week-by-week learning roadmap for someone who wants to learn ${skill}.\nTheir current experience level is ${level}.`;
    if (duration && durationUnit) {
      prompt += `\nThe total duration for this course should be about ${duration} ${durationUnit}.`;
    }
    if (hours) {
      prompt += `\nThe learner can dedicate about ${hours} hours per week.`;
    }
    prompt += '\nThe roadmap should be clear, structured, and actionable.';
    console.log('Prompt for OpenAI:', prompt);
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert learning coach.' },
        { role: 'user', content: prompt }
      ]
    });
    const roadmap = completion.choices[0].message.content;
    console.log('Sending roadmap response to frontend...');
    res.json({ roadmap });
  } catch (error) {
    console.error('Error generating roadmap:', error);
    res.status(500).json({ error: 'Failed to generate roadmap' });
  }
});

// API route for chat
app.post('/chat', async (req, res) => {
  const { message, roadmap, history, progress } = req.body;
  try {
    let progressText = '';
    if (Array.isArray(progress) && progress.length > 0) {
      progressText = `\n\nThe user has marked the following steps as completed (by index): ${progress.join(', ')}.`;
    } else {
      progressText = '\n\nThe user has not marked any steps as completed yet.';
    }
    const messages = [
      { role: 'system', content: `You are an expert AI assistant. The user will ask questions about their personalized learning roadmap. Use the roadmap below as context to answer questions clearly and helpfully. Do not repeat the roadmap unless specifically asked.\n\nUser's Roadmap:\n${roadmap}${progressText}` }
    ];
    if (Array.isArray(history)) {
      history.forEach(entry => {
        if (entry.sender === 'user') {
          messages.push({ role: 'user', content: entry.text });
        } else {
          messages.push({ role: 'assistant', content: entry.text });
        }
      });
    }
    messages.push({ role: 'user', content: message });

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages
    });
    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ reply: "Sorry, I couldn't process your question right now." });
  }
});

// Fallback to index.html for client-side routing
app.get('/:path(*)', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
