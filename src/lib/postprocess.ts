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

  // 2. Restore section separators (lone hyphen on its own line → ---)
  text = text.replace(/^\-$/gm, '---');

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

  // 5. Collapse multiple spaces into one
  text = text.replace(/  +/g, ' ');

  // 6. Collapse excessive blank lines (4+ → max 3)
  text = text.replace(/\n{4,}/g, '\n\n\n');

  return text.trim();
}
