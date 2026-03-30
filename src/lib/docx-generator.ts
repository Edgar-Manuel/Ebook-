import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  PageBreak,
  TableOfContents,
  StyleLevel,
} from 'docx';
import type { BookData } from '@/types';

function parseMarkdownToParagraphs(text: string): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const lines = text.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      paragraphs.push(new Paragraph({ text: '' }));
      continue;
    }

    if (trimmed.startsWith('## ')) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.slice(3),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );
    } else if (trimmed.startsWith('### ')) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.slice(4),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 },
        })
      );
    } else if (trimmed.startsWith('#### ')) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.slice(5),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 },
        })
      );
    } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmed.slice(2, -2),
              bold: true,
            }),
          ],
          spacing: { before: 120, after: 120 },
        })
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.slice(2),
          bullet: { level: 0 },
          spacing: { before: 60, after: 60 },
        })
      );
    } else {
      // Process inline bold within paragraph
      const parts = trimmed.split(/(\*\*.*?\*\*)/g);
      const runs: TextRun[] = parts.map((part) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return new TextRun({ text: part.slice(2, -2), bold: true });
        }
        return new TextRun({ text: part });
      });
      paragraphs.push(
        new Paragraph({
          children: runs,
          spacing: { before: 120, after: 120 },
          alignment: AlignmentType.JUSTIFIED,
        })
      );
    }
  }

  return paragraphs;
}

export async function generateDocx(bookData: BookData): Promise<Buffer> {
  const children: (Paragraph | TableOfContents)[] = [];

  // Title Page
  children.push(
    new Paragraph({
      children: [new TextRun({ text: '', break: 1 }), new TextRun({ text: '', break: 1 })],
    }),
    new Paragraph({
      text: bookData.selectedIdea?.title ?? 'My Ebook',
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { before: 1200, after: 400 },
    }),
    new Paragraph({
      text: bookData.selectedIdea?.subtitle ?? '',
      alignment: AlignmentType.CENTER,
      spacing: { after: 800 },
      children: [
        new TextRun({
          text: bookData.selectedIdea?.subtitle ?? '',
          italics: true,
          size: 28,
          color: '555555',
        }),
      ],
    }),
    new Paragraph({
      text: `Target Audience: ${bookData.selectedIdea?.targetAudience ?? ''}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: `Target Audience: ${bookData.selectedIdea?.targetAudience ?? ''}`,
          size: 24,
          color: '777777',
        }),
      ],
    }),
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  // Table of Contents placeholder
  children.push(
    new Paragraph({
      text: 'Table of Contents',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 400 },
    })
  );

  if (bookData.chapters?.length > 0) {
    for (const chapter of bookData.chapters) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `Chapter ${chapter.number}: `, bold: true }),
            new TextRun({ text: chapter.title }),
          ],
          spacing: { before: 100, after: 100 },
        })
      );
      if (chapter.subheadings?.length > 0) {
        for (const sub of chapter.subheadings) {
          children.push(
            new Paragraph({
              text: `    ${sub}`,
              spacing: { before: 40, after: 40 },
              children: [new TextRun({ text: `    ${sub}`, color: '555555', size: 20 })],
            })
          );
        }
      }
    }
  }

  children.push(new Paragraph({ children: [new PageBreak()] }));

  // Introduction (from outline if available)
  if (bookData.outline) {
    children.push(
      new Paragraph({
        text: 'Introduction',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `This book, "${bookData.selectedIdea?.title}", is designed for ${bookData.selectedIdea?.targetAudience}. `,
          }),
          new TextRun({
            text: bookData.selectedIdea?.description ?? '',
          }),
        ],
        spacing: { before: 200, after: 200 },
        alignment: AlignmentType.JUSTIFIED,
      }),
      new Paragraph({ children: [new PageBreak()] })
    );
  }

  // Chapters with written content
  const writtenChapters = bookData.writtenChapters ?? {};

  if (bookData.chapters?.length > 0) {
    for (const chapter of bookData.chapters) {
      const content = writtenChapters[chapter.number];

      if (content) {
        // Add written content
        const paragraphs = parseMarkdownToParagraphs(content);
        children.push(...paragraphs);
      } else {
        // Add chapter structure from outline
        children.push(
          new Paragraph({
            text: `Chapter ${chapter.number}: ${chapter.title}`,
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          })
        );

        if (chapter.subheadings?.length > 0) {
          for (const subheading of chapter.subheadings) {
            children.push(
              new Paragraph({
                text: subheading,
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 300, after: 150 },
              }),
              new Paragraph({
                children: [new TextRun({ text: '[Content to be written]', italics: true, color: '999999' })],
                spacing: { before: 120, after: 120 },
              })
            );
          }
        }
      }

      children.push(new Paragraph({ children: [new PageBreak()] }));
    }
  }

  // Conclusion
  children.push(
    new Paragraph({
      text: 'Conclusion',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Thank you for reading "${bookData.selectedIdea?.title}". `,
        }),
        new TextRun({
          text:
            'We hope this book has provided you with valuable insights and actionable strategies that you can implement immediately. ',
        }),
        new TextRun({
          text:
            'Remember, success comes from consistent application of the knowledge you have gained. Take action today and start your journey!',
        }),
      ],
      spacing: { before: 200, after: 200 },
      alignment: AlignmentType.JUSTIFIED,
    }),
    new Paragraph({ children: [new PageBreak()] })
  );

  // About the Author
  children.push(
    new Paragraph({
      text: 'About the Author',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: '[Write your author bio here. Include your background, expertise, and why you wrote this book.]', italics: true, color: '777777' })],
      spacing: { before: 200, after: 200 },
    })
  );

  // Marketing Appendix (if available)
  if (bookData.marketingContent) {
    children.push(
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        text: 'Appendix: Marketing & Publishing Notes',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        children: [new TextRun({ text: bookData.marketingContent.slice(0, 1000) + '...', color: '555555', italics: true })],
        spacing: { before: 200, after: 200 },
      })
    );
  }

  const doc = new Document({
    title: bookData.selectedIdea?.title ?? 'My Ebook',
    description: bookData.selectedIdea?.description ?? '',
    styles: {
      default: {
        document: {
          run: {
            size: 24,
            font: 'Calibri',
          },
          paragraph: {
            spacing: { line: 360 },
          },
        },
      },
      paragraphStyles: [
        {
          id: 'Title',
          name: 'Title',
          run: {
            size: 72,
            bold: true,
            font: 'Calibri',
            color: '1a1a2e',
          },
        },
        {
          id: 'Heading1',
          name: 'Heading 1',
          run: {
            size: 40,
            bold: true,
            font: 'Calibri',
            color: '16213e',
          },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          run: {
            size: 32,
            bold: true,
            font: 'Calibri',
            color: '0f3460',
          },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1080,
              bottom: 1440,
              left: 1080,
            },
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}
