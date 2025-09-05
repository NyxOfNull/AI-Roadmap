const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
// Load dotenv only locally
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
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
    let prompt = `Create a detailed, structured learning roadmap for someone who wants to learn ${skill}.
Their current experience level is ${level}.`;

    if (duration && durationUnit) {
      prompt += `\nThe total learning duration should be about ${duration} ${durationUnit}.`;
    }
    if (hours) {
      prompt += `\nThe learner can dedicate around ${hours} hours per week.`;
    }

    prompt += `
The roadmap should:
- Be broken down week by week, with each week divided into daily tasks or study goals.
- Clearly state what to do each day (e.g., watch tutorials, read docs, practice coding, do a mini-project).
- Highlight important concepts or skills that must not be skipped.
- Recommend reliable resources (official documentation, YouTube channels, courses, free platforms, etc.) for each week/day.
- Be actionable and progressive, starting with basics and gradually advancing. 
- End with suggested projects or milestones to measure progress.`;

    console.log('Prompt for OpenAI:', prompt);

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert learning coach and curriculum designer.' },
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
      {
        role: 'system',
        content: `You are an expert AI assistant. The user will ask questions about their personalized learning roadmap. Use the roadmap below as context to answer questions clearly and helpfully. Do not repeat the roadmap unless specifically asked.\n\nUser's Roadmap:\n${roadmap}${progressText}`
      }
    ];

    if (Array.isArray(history)) {
      history.forEach(entry => {
        messages.push({
          role: entry.sender === 'user' ? 'user' : 'assistant',
          content: entry.text
        });
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

// Catch-all fallback for client-side routing (Render-safe)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
