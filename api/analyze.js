export default async function handler(req, res) {
  // Only allow POST requests
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

Respond ONLY with valid JSON (no markdown, no backticks):
{
  "theme": "Core lesson in 1-2 sentences",
  "symbols": [{"symbol": "symbol name", "meaning": "growth-focused interpretation"}],
  "reflectionPrompt": "Thought-provoking question",
  "affirmation": "Empowering affirmation statement",
  "culturalNote": "Brief note honoring selected traditions",
  "nightmareReframe": ${isNightmare ? '"Alternative empowering perspective"' : 'null'}
}`;

    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const textContent = data.content.find(c => c.type === 'text')?.text || '';
    const cleanJson = textContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    return res.status(200).json(parsed);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
