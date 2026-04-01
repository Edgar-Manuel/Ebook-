export interface BookIdea {
  title: string;
  subtitle: string;
  description: string;
  targetAudience: string;
  amazonKeywords?: string[];
  suggestedCategories?: string[];
  tone?: string;
}

export interface Chapter {
  number: number;
  title: string;
  subheadings: string[];
  content?: string;
}

export interface BookData {
  // Step 1
  niche: string;
  interests: string;
  authorName: string;
  ideas: BookIdea[];
  selectedIdea: BookIdea | null;
  savedIdeas: BookIdea[];

  // Step 2
  outline: string;
  chapters: Chapter[];

  // Step 3
  writtenChapters: Record<number, string>;
  currentWritingChapter: number;

  // Step 4
  formattedContent: string;

  // Step 5
  coverDesign: string;
  coverImage: string | null;   // base64 JPEG from Nano Banana Pro
  coverPrompt: string;         // image prompt used for generation

  // Step 6
  kdpSetup: string;

  // Step 7
  pricingStrategy: string;

  // Step 8
  marketingContent: string;
  
  // Marketing Assets (A+ Content)
  marketingAssets: Record<string, string>; // base64 JPEG from Nano Banana Pro: 'comparison', 'authority', 'method'
  
  // Library of finished books
  library: BookData[];
}

export type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface StepInfo {
  number: Step;
  title: string;
  description: string;
  icon: string;
}
