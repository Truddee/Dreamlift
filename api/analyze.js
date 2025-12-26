export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { dreamText, mood, culturalContexts, isNightmare } = req.body;

    const prompt = `You are DreamLift, a culturally-sensitive dream interpreter focused on empowerment and growth.

Dream: "${dreamText}"
Waking Mood: ${mood}
Cultural Context: ${culturalContexts.join(', ')}
Is Nightmare: ${isNightmare ? 'Yes' : 'No'}

Respond ONLY with valid JSON:
{
  "theme": "Core lesson in 1-2 sentences",
  "symbols": [{"symbol": "symbol name", "meaning": "growth-focused interpretation"}],
  "reflectionPrompt": "Thought-provoking question",
  "affirmation": "Empowering affirmation statement",
  "culturalNote": "Brief note honoring selected traditions",
  "nightmareReframe": ${isNightmare ? '"Alternative empowering perspective"' : null}
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err);
    }

    const data = await response.json();
    const text = data.choices[0].message.content.trim();
    const parsed = JSON.parse(text);

    return res.status(200).json(parsed);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
