/**
 * Post-processing pipeline for AI-generated ebook text.
 * Cleans formatting issues so text is ready for Amazon KDP publishing.
 */

export function postProcessBookText(text: string): string {
  // 1. Clean dashes: em-dash and double-dash → simple hyphen
  text = text.replace(/ — /g, ' -');
  text = text.replace(/ —/g, ' -');
  text = text.replace(/— /g, '- ');
  text = text.replace(/—/g, '-');
  text = text.replace(/ -- /g, ' -');
  text = text.replace(/--/g, '-');

  // 2. Normalize separators: any line with 3+ dashes → exactly "---"
  text = text.replace(/^-{3,}$/gm, '---');
  // Also restore lone hyphen on its own line → ---
  text = text.replace(/^-$/gm, '---');

  // 3. Remove English artifacts and placeholders
  text = text.replace(/This book.*?is designed for.*?\./gi, '');
  text = text.replace(/Thank you for reading.*?\./gi, '');
  text = text.replace(/Target Audience:?\s*/gi, '');
  text = text.replace(/\[Write your.*?\]/gi, '');
  text = text.replace(/\[Your.*?here\]/gi, '');
  text = text.replace(/About the Author\s*\n\s*\[.*?\]/gi, '');

  // 4. Remove consecutive duplicate lines
  const lines = text.split('\n');
  const cleaned = lines.filter((line, i) => {
    if (i === 0) return true;
    const current = line.trim();
    const previous = lines[i - 1].trim();
    if (current === '' && previous === '') return false;
    return current !== previous;
  });
  text = cleaned.join('\n');

  // 5. Fix gender inclusivity (feminine-only → inclusive)
  text = fixGenderInclusivity(text);

  // 6. Detect excess childhood references (warn only, does not modify text)
  reduceChildhoodReferences(text);

  // 7. Collapse multiple spaces into one
  text = text.replace(/  +/g, ' ');

  // 8. Collapse excessive blank lines (4+ → max 3)
  text = text.replace(/\n{4,}/g, '\n\n\n');

  return text.trim();
}

/**
 * Replaces feminine-exclusive forms with inclusive "o/a" forms
 * when addressing the reader directly.
 */
function fixGenderInclusivity(text: string): string {
  const replacements: [RegExp, string][] = [
    // Feminine-exclusive → inclusive
    [/\btú misma\b/g, 'tú mismo/a'],
    [/\bti misma\b/g, 'ti mismo/a'],
    [/\bcontigo misma\b/g, 'contigo mismo/a'],
    [/\bhacia ti misma\b/g, 'hacia ti mismo/a'],
    [/\bser tú misma\b/g, 'ser tú mismo/a'],
    [/\bsegura de\b/g, 'seguro/a de'],
    [/\bpreparada para\b/g, 'preparado/a para'],
    [/\bconvencida de\b/g, 'convencido/a de'],
    [/\batrapada en\b/g, 'atrapado/a en'],
    [/\bestás sola\b/g, 'estás solo/a'],
    [/\bsentirte sola\b/g, 'sentirte solo/a'],
    [/\bquedarte sola\b/g, 'quedarte solo/a'],
    [/\bquedar sola\b/g, 'quedar solo/a'],
    // Masculine-exclusive without /a → inclusive
    [/\btú mismo\b(?!\/)/g, 'tú mismo/a'],
    [/\bti mismo\b(?!\/)/g, 'ti mismo/a'],
    [/\bcontigo mismo\b(?!\/)/g, 'contigo mismo/a'],
    [/\bhacia ti mismo\b(?!\/)/g, 'hacia ti mismo/a'],
    [/\bser tú mismo\b(?!\/)/g, 'ser tú mismo/a'],
    [/\bseguro de\b(?!\/)/g, 'seguro/a de'],
    [/\bpreparado para\b(?!\/)/g, 'preparado/a para'],
    [/\bconvencido de\b(?!\/)/g, 'convencido/a de'],
    [/\batrapado en\b(?!\/)/g, 'atrapado/a en'],
    [/\bestás solo\b(?!\/)/g, 'estás solo/a'],
    [/\bsentirte solo\b(?!\/)/g, 'sentirte solo/a'],
    [/\bquedarte solo\b(?!\/)/g, 'quedarte solo/a'],
    [/\bquedar solo\b(?!\/)/g, 'quedar solo/a'],
  ];

  for (const [pattern, replacement] of replacements) {
    text = text.replace(pattern, replacement);
  }

  return text;
}

/**
 * Safety net: detects and warns about excess childhood references.
 * The system prompt is the primary guard; this is a secondary check.
 * Does NOT modify the text — only logs warnings.
 */
function reduceChildhoodReferences(text: string): void {
  const childhoodPatterns = [
    /cuando eras pequeñ[oa]/gi,
    /cuando eras niñ[oa]/gi,
    /en tu infancia/gi,
    /de niñ[oa]/gi,
    /tu cerebro infantil/gi,
    /a los \d+ años/gi,
    /creciste en/gi,
    /antes que el alfabeto/gi,
    /\bprogenitor\b/gi,
  ];

  let count = 0;
  const matches: string[] = [];
  for (const pattern of childhoodPatterns) {
    const found = text.match(pattern);
    if (found) {
      count += found.length;
      matches.push(...found);
    }
  }

  if (count > 1) {
    console.warn(
      `⚠️ ADVERTENCIA: ${count} referencias a infancia detectadas. ` +
      `MÁXIMO permitido: 1 en todo el libro. ` +
      `Referencias: ${matches.slice(0, 5).join(', ')}...`
    );
  } else if (count === 1) {
    console.info('✅ 1 referencia a infancia detectada (dentro del límite).');
  }
}
