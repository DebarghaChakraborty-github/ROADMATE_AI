const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

exports.getVehicleSpecs = async (req, res) => {
  const { make, model, year } = req.body;
  if (!make || !model || !year) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  const prompt = `Provide specs for the bike ${make} ${model} ${year} including ground clearance (in mm), weight (in kg), and engine displacement (cc). Respond in JSON with keys groundClearance, weight, engineCC.`;

  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 100,
      temperature: 0,
      n: 1,
    });
    const content = response.data.choices[0].message.content;

    // Parse JSON safely
    let specs = {};
    try {
      specs = JSON.parse(content);
    } catch {
      // fallback: try to extract numbers via regex
      const gc = content.match(/ground clearance.*?(\d+)/i)?.[1];
      const wt = content.match(/weight.*?(\d+)/i)?.[1];
      const eng = content.match(/engine.*?(\d+)/i)?.[1];
      specs = {
        groundClearance: gc ? parseInt(gc) : null,
        weight: wt ? parseInt(wt) : null,
        engineCC: eng ? parseInt(eng) : null,
      };
    }

    res.json(specs);
  } catch (err) {
    console.error('GPT fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch vehicle specs' });
  }
};
