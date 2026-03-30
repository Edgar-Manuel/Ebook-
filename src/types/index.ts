export interface BookIdea {
  title: string;
  subtitle: string;
  description: string;
  targetAudience: string;
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
  ideas: BookIdea[];
  selectedIdea: BookIdea | null;

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

  // Step 6
  kdpSetup: string;

  // Step 7
  pricingStrategy: string;

  // Step 8
  marketingContent: string;
}

export type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface StepInfo {
  number: Step;
  title: string;
  description: string;
  icon: string;
}
