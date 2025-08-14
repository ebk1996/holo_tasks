import { mapPriorityTextToNumber, PRIORITY } from '../utils/priority';

function heuristicPriority(task) {
  const t = task.toLowerCase();
  if (/(urgent|asap|today|deadline|fix)/.test(t)) return PRIORITY.HIGH;
  if (/(read|nice-to-have|someday)/.test(t)) return PRIORITY.LOW;
  return PRIORITY.MEDIUM;
}

export async function suggestPriority(task) {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) return heuristicPriority(task);

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
  const prompt = `Given the following task description, suggest its priority as either "Low", "Medium", or "High". Only return the single word. Task: "${task}"`;

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] })
    });
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return mapPriorityTextToNumber(text);
  } catch (e) {
    console.warn('LLM suggest failed, using heuristic.', e);
    return heuristicPriority(task);
  }
}
