export const MODEL_IDS = {
  simple: 'us.anthropic.claude-haiku-4-5-20251001-v1:0',
  complex: 'us.anthropic.claude-sonnet-4-5-20250929-v1:0',
} as const;

const COMPLEX_KEYWORDS = [
  'write code',
  'function',
  'algorithm',
  'implement',
  'debug',
  'refactor',
  'analyze',
  'compare',
  'json',
  'table',
  'step by step',
  'explain in detail',
];

const MATH_SYMBOLS = ['=', '+', '*', '/', '^', '∑', '∫'];

export function classifyComplexity(prompt: string): 'simple' | 'complex' {
  const wordCount = prompt.trim().split(/\s+/).length;
  if (wordCount >= 100) return 'complex';

  if (/```/.test(prompt) || /`[^`]+`/.test(prompt)) return 'complex';

  const lower = prompt.toLowerCase();
  for (const keyword of COMPLEX_KEYWORDS) {
    if (lower.includes(keyword)) return 'complex';
  }

  for (const sym of MATH_SYMBOLS) {
    if (prompt.includes(sym)) return 'complex';
  }

  return 'simple';
}
