require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { Octokit } = require("@octokit/rest");

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(express.static('public')); // Serve frontend files from public folder

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

async function generateWebPage(prompt) {
  const response = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: 'gpt-4',
    messages: [{ role: 'user', content: `Generate HTML and CSS for the following webpage: ${prompt}` }],
    max_tokens: 1500,
  }, { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } });
  
  return response.data.choices[0].message.content;
}

app.post('/api/generate', async (req, res) => {
  const { prompt, repoName } = req.body;

  try {
    const code = await generateWebPage(prompt);

    await octokit.repos.createOrUpdateFileContents({
      owner: process.env.GITHUB_USERNAME,
      repo: repoName,
      path: 'index.html',
      message: 'Add generated webpage',
      content: Buffer.from(code).toString('base64'),
      committer: {
        name: process.env.GITHUB_USERNAME,
        email: process.env.GITHUB_EMAIL,
      },
      author: {
        name: process.env.GITHUB_USERNAME,
        email: process.env.GITHUB_EMAIL,
      },
    });

    res.json({ message: 'Deployment triggered. Check the deployment URL.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate or deploy webpage' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
