import type { BookData } from '@/types';

export function getPrompt(step: number, data: Partial<BookData>): string {
  switch (step) {
    case 1:
      return `You are an expert ebook strategist. Generate 5 profitable ebook ideas for someone interested in: "${data.niche}" with these interests/skills: "${data.interests}".

For each idea, provide:
- A compelling title
- A subtitle
- A 2-sentence description of the book's value
- Target audience

Focus on high-demand, low-competition niches. Format your response as a numbered list with clear sections for each idea.

Structure each idea like:
**Idea [N]: [TITLE]**
Subtitle: [SUBTITLE]
Description: [DESCRIPTION]
Target Audience: [AUDIENCE]

Make the ideas specific, actionable, and commercially viable on Amazon Kindle.`;

    case 2:
      return `You are a professional book outline creator. Create a detailed, comprehensive outline for this ebook:

Title: "${data.selectedIdea?.title}"
Subtitle: "${data.selectedIdea?.subtitle}"
Description: "${data.selectedIdea?.description}"
Target Audience: "${data.selectedIdea?.targetAudience}"

Create a complete book outline with:
- Introduction
- 7-10 chapters
- 3-5 subheadings per chapter
- A conclusion

Format each chapter like:
**Chapter [N]: [CHAPTER TITLE]**
- [Subheading 1]
- [Subheading 2]
- [Subheading 3]

Ensure logical flow from introduction to advanced concepts, and problem-to-solution progression. The outline should cover the topic comprehensively.`;

    case 3: {
      const chapterNum = data.currentWritingChapter ?? 1;
      const chapterInfo = data.chapters?.[chapterNum - 1];
      const chapterTitle = chapterInfo?.title ?? `Chapter ${chapterNum}`;
      const subheadings = chapterInfo?.subheadings?.join(', ') ?? '';

      return `You are a professional ebook writer. Write a complete, detailed chapter for this ebook:

Book Title: "${data.selectedIdea?.title}"
Target Audience: "${data.selectedIdea?.targetAudience}"

Chapter ${chapterNum}: ${chapterTitle}
Subheadings to cover: ${subheadings}

Write approximately 600-800 words for this chapter. Requirements:
- Use H2 headings (##) for the chapter title
- Use H3 headings (###) for each subheading
- Write in a clear, engaging, and informative tone
- Include practical examples and actionable tips
- Maintain consistency with the book's theme
- Add personal insights and real-world applications
- End with a brief summary or key takeaways

Write the full chapter now:`;
    }

    case 4:
      return `You are a professional ebook formatter. Review and format this ebook content for Amazon Kindle publishing.

Book: "${data.selectedIdea?.title}"

Current content summary: The book has ${data.chapters?.length ?? 0} chapters covering ${data.selectedIdea?.description}

Provide:
1. **Formatting Guidelines** - Specific formatting rules applied
2. **Style Consistency Check** - Any tone/style issues to fix
3. **Kindle Formatting Tips** - H1 for chapters, H2 for subheadings, proper line spacing
4. **Front Matter** - Draft a title page, copyright page, and table of contents format
5. **Back Matter** - About the author template and call-to-action suggestions

Make the formatting recommendations specific and actionable for Google Docs before converting to .docx for Kindle Create.`;

    case 5:
      return `You are a professional book cover designer and marketing expert. Create a comprehensive cover design brief for:

Book Title: "${data.selectedIdea?.title}"
Subtitle: "${data.selectedIdea?.subtitle}"
Target Audience: "${data.selectedIdea?.targetAudience}"
Genre/Niche: "${data.niche}"

Provide:
1. **Cover Concept** - Detailed visual description (mood, style, imagery)
2. **Color Palette** - Specific hex colors that work for this niche
3. **Typography** - Font style recommendations (bold, serif, sans-serif, etc.)
4. **Canva Template Search Terms** - 5 specific search terms to find ideal templates
5. **Canva Step-by-Step** - How to create this cover in Canva
6. **Kindle Dimensions** - Exact specs (1600 x 2560 pixels, 300 DPI)
7. **Design Do's and Don'ts** - Specific to this book's niche
8. **Competitor Analysis Prompt** - How to research similar books on Amazon

Make the design advice specific, actionable, and focused on standing out in the "${data.niche}" niche.`;

    case 6:
      return `You are an Amazon KDP publishing expert. Provide a complete step-by-step guide to publishing this book on Amazon Kindle Direct Publishing:

Book Title: "${data.selectedIdea?.title}"
Subtitle: "${data.selectedIdea?.subtitle}"
Target Audience: "${data.selectedIdea?.targetAudience}"
Niche: "${data.niche}"

Provide:
1. **KDP Account Setup** - Step-by-step account creation at kdp.amazon.com
2. **Book Details** - How to fill in title, subtitle, author name
3. **Book Description** - Write a compelling 150-word book description using keywords
4. **Keywords Strategy** - 7 high-traffic, low-competition keywords for this book
5. **Category Selection** - 2 best Amazon categories for this book
6. **ISBN** - Free ISBN vs. custom ISBN explanation
7. **Manuscript Upload** - File format requirements and Kindle Create steps
8. **Preview** - How to use Kindle Previewer
9. **Pricing Tab** - Royalty options explained (35% vs 70%)
10. **Publishing Checklist** - Final review before hitting publish

Make everything specific to "${data.selectedIdea?.title}".`;

    case 7:
      return `You are a book pricing strategist. Develop a comprehensive pricing strategy for:

Book Title: "${data.selectedIdea?.title}"
Niche: "${data.niche}"
Target Audience: "${data.selectedIdea?.targetAudience}"

Provide:
1. **Market Research** - How to find competitor prices for "${data.niche}" ebooks
2. **Recommended Price Point** - Specific price with justification
3. **Royalty Calculation** - Break down earnings at different price points ($0.99, $2.99, $4.99, $9.99)
4. **Launch Strategy** - Introductory pricing plan (first 30 days)
5. **KDP Select vs. Wide** - Recommendation for this book
6. **Countdown Deals** - How and when to use them
7. **Price Testing** - A/B testing approach over 90 days
8. **Bundling Strategy** - Ideas for creating a series or bundle
9. **Permafree Strategy** - If/when to use a free book as lead magnet
10. **Revenue Projections** - Realistic monthly earnings at different price points

Include specific numbers and actionable recommendations.`;

    case 8:
      return `You are a book marketing expert. Create a comprehensive marketing plan for:

Book Title: "${data.selectedIdea?.title}"
Subtitle: "${data.selectedIdea?.subtitle}"
Target Audience: "${data.selectedIdea?.targetAudience}"
Niche: "${data.niche}"

Create:
1. **Amazon A+ Content Description** - 600-word compelling book description with keywords
2. **Social Media Posts** (ready to copy-paste):
   - 3 Twitter/X posts
   - 2 Facebook posts
   - 2 Instagram captions with hashtags
   - 1 LinkedIn post
3. **Amazon Advertising** - Keyword targets for Sponsored Products ads
4. **Email Sequence** (3 emails):
   - Launch announcement email
   - Social proof email (day 7)
   - Last chance email (day 14)
5. **Review Request Template** - Email to get early reviews
6. **Content Marketing** - 5 blog post / YouTube video ideas related to the book
7. **Reddit/Facebook Groups** - Where to promote this book authentically
8. **Launch Week Checklist** - Day-by-day launch plan
9. **BookBub & Promotions** - Sites to submit for free/discounted promotions
10. **Long-term Marketing** - 90-day ongoing marketing strategy

Make all content ready to use immediately, personalized for "${data.selectedIdea?.title}".`;

    default:
      return 'Please provide a valid step number.';
  }
}
