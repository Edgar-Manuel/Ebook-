import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageBreak,
  Header,
  Footer,
  PageNumber,
  PageNumberSeparator,
  ImageRun,
  SectionType,
} from 'docx';
import type { BookData } from '@/types';
import { postProcessBookText } from './postprocess';

// ── Types ────────────────────────────────────────────────────────────────────

export type DocxMode = 'ebook' | 'paperback';

export interface DocxOptions {
  mode: DocxMode;
  bookTitle: string;
  authorName: string;
}

// ── Shared base styles (Times New Roman 12pt, 1.25 interlineado) ────────────

const BASE_STYLES = {
  default: {
    document: {
      run: { font: 'Times New Roman', size: 24 }, // 12pt
      paragraph: { spacing: { line: 300 } },       // 1.25 interlineado
    },
  },
  paragraphStyles: [
    {
      id: 'Normal',
      name: 'Normal',
      run: { font: 'Times New Roman', size: 24 },
      paragraph: {
        spacing: { after: 160, line: 300 },
        indent: { firstLine: 0 },
        alignment: AlignmentType.JUSTIFIED,
      },
    },
    {
      id: 'Heading1',
      name: 'Heading 1',
      basedOn: 'Normal',
      next: 'Normal',
      quickFormat: true,
      run: { font: 'Times New Roman', size: 32, bold: true }, // 16pt
      paragraph: {
        spacing: { before: 360, after: 240 },
        alignment: AlignmentType.LEFT,
        indent: { firstLine: 0 },
      },
    },
    {
      id: 'Heading2',
      name: 'Heading 2',
      basedOn: 'Normal',
      next: 'Normal',
      quickFormat: true,
      run: { font: 'Times New Roman', size: 28, bold: true }, // 14pt
      paragraph: {
        spacing: { before: 240, after: 120 },
        alignment: AlignmentType.LEFT,
        indent: { firstLine: 0 },
      },
    },
  ],
};

// ── Page configs ─────────────────────────────────────────────────────────────

const EBOOK_PAGE = {
  size: { width: 8640, height: 12960 },   // 6" × 9"
  margin: { top: 1020, bottom: 1020, left: 1020, right: 1020, gutter: 0 },
};

const PAPERBACK_PAGE = {
  size: { width: 8640, height: 12960 },   // 6" × 9"
  margin: { top: 1020, bottom: 1020, left: 1417, right: 1417, gutter: 227 },
};

// ── Inline markdown parser ───────────────────────────────────────────────────

function parseInlineMarkdown(text: string): TextRun[] {
  const result: TextRun[] = [];
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);

  for (const part of parts) {
    if (part.startsWith('**') && part.endsWith('**')) {
      result.push(new TextRun({ text: part.slice(2, -2), bold: true, font: 'Times New Roman', size: 24 }));
    } else if (part.startsWith('*') && part.endsWith('*')) {
      result.push(new TextRun({ text: part.slice(1, -1), italics: true, font: 'Times New Roman', size: 24 }));
    } else if (part) {
      result.push(new TextRun({ text: part, font: 'Times New Roman', size: 24 }));
    }
  }

  return result;
}

// ── Markdown → Paragraphs ────────────────────────────────────────────────────

function parseMarkdownToParagraphs(text: string): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const sanitizedText = postProcessBookText(text);
  const lines = sanitizedText.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      paragraphs.push(new Paragraph({ text: '', spacing: { after: 160 } }));
      continue;
    }

    if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: trimmed.replace(/^#+\s/, ''), font: 'Times New Roman', size: 32, bold: true })],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 360, after: 240 },
          pageBreakBefore: true,
        })
      );
    } else if (trimmed.startsWith('### ')) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: trimmed.slice(4), font: 'Times New Roman', size: 28, bold: true })],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
        })
      );
    } else if (trimmed.startsWith('#### ')) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: trimmed.slice(5), font: 'Times New Roman', size: 26, bold: true })],
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 },
        })
      );
    } else if (trimmed === '---') {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: '———', font: 'Times New Roman', size: 24, color: '999999' })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 240, after: 240 },
        })
      );
    } else {
      const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ');
      const cleanText = isBullet ? trimmed.slice(2) : trimmed;

      paragraphs.push(
        new Paragraph({
          children: parseInlineMarkdown(cleanText),
          bullet: isBullet ? { level: 0 } : undefined,
          spacing: { after: 160, line: 300 },
          alignment: AlignmentType.JUSTIFIED,
          indent: { firstLine: 0 },
        })
      );
    }
  }

  return paragraphs;
}

// ── Build front matter ───────────────────────────────────────────────────────

function buildFrontMatter(
  bookData: BookData,
  opts: DocxOptions
): Paragraph[] {
  const children: Paragraph[] = [];

  // Cover image (full page) — both formats
  if (bookData.coverImage) {
    try {
      const coverBuffer = Buffer.from(bookData.coverImage, 'base64');
      children.push(
        new Paragraph({
          children: [
            new ImageRun({
              type: 'jpg',
              data: coverBuffer,
              transformation: { width: 595, height: 952 },
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 0 },
        }),
        new Paragraph({ children: [new PageBreak()] })
      );
    } catch (e) {
      console.error('Failed to embed cover in docx', e);
    }
  }

  // Paperback: 2 blank pages at the start
  if (opts.mode === 'paperback') {
    children.push(
      new Paragraph({ children: [new TextRun({ text: '' })], spacing: { before: 0 } }),
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({ children: [new TextRun({ text: '' })], spacing: { before: 0 } }),
      new Paragraph({ children: [new PageBreak()] })
    );
  }

  // Title page (centered)
  children.push(
    new Paragraph({ children: [new TextRun({ text: '', break: 1 }), new TextRun({ text: '', break: 1 })] }),
    new Paragraph({
      children: [new TextRun({
        text: bookData.selectedIdea?.title ?? 'Mi Ebook',
        bold: true, size: 56, font: 'Times New Roman', color: '1a1a2e',
      })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 800, after: 400 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 800 },
      children: [new TextRun({
        text: bookData.selectedIdea?.subtitle ?? '',
        italics: true, size: 28, font: 'Times New Roman', color: '555555',
      })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 800, after: 800 },
      children: [new TextRun({
        text: opts.authorName || 'Autor',
        bold: true, size: 32, font: 'Times New Roman', color: '333333',
      })],
    }),
    new Paragraph({ children: [new PageBreak()] })
  );

  // Copyright page
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 800, after: 400 },
      children: [new TextRun({
        text: bookData.selectedIdea?.title ?? 'Mi Ebook',
        bold: true, size: 28, font: 'Times New Roman',
      })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: 360, before: 400, after: 800 },
      children: [
        new TextRun({ text: `Copyright © ${new Date().getFullYear()} ${opts.authorName || 'Autor'}`, size: 24, font: 'Times New Roman', break: 1 }),
        new TextRun({ text: 'Todos los derechos reservados.', size: 24, font: 'Times New Roman', break: 1 }),
        new TextRun({ text: '', size: 24, break: 1 }),
        new TextRun({ text: 'Esta obra ha sido publicada bajo licencia de contenido exclusivo para Amazon Kindle Direct Publishing.', size: 24, font: 'Times New Roman', break: 1 }),
        new TextRun({ text: 'Se prohíbe la reproducción total o parcial de este libro sin permiso escrito del autor, salvo para citas breves en artículos, reseñas y otros usos permitidos por la ley de derechos de autor.', size: 24, font: 'Times New Roman', break: 1 }),
        new TextRun({ text: '', size: 24, break: 1 }),
        new TextRun({ text: 'Versión 1.0 - Edición Kindle', size: 24, font: 'Times New Roman', italics: true, break: 1 }),
      ],
    }),
    new Paragraph({ children: [new PageBreak()] })
  );

  // Disclaimer page ("Nota importante")
  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'Nota Importante', font: 'Times New Roman', size: 32, bold: true })],
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 300 },
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 160, line: 300 },
      children: [new TextRun({
        text: 'Este libro ha sido escrito con el propósito de informar, educar y acompañar al lector en su proceso de crecimiento personal. Sin embargo, no pretende sustituir el consejo, diagnóstico o tratamiento de un profesional de la salud mental.',
        size: 24, font: 'Times New Roman',
      })],
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 160, line: 300 },
      children: [new TextRun({
        text: 'Si estás atravesando una situación de abuso emocional, psicológico o de cualquier tipo, te animo encarecidamente a buscar ayuda profesional. Las herramientas y estrategias aquí presentadas son complementarias y no reemplazan la intervención terapéutica personalizada.',
        size: 24, font: 'Times New Roman',
      })],
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 160, line: 300 },
      children: [new TextRun({
        text: 'Los ejemplos y situaciones descritos en estas páginas son representativos y tienen fines ilustrativos. Cualquier semejanza con personas reales es puramente coincidental.',
        size: 24, font: 'Times New Roman',
      })],
    }),
    new Paragraph({ children: [new PageBreak()] })
  );

  return children;
}

// ── Build Table of Contents ──────────────────────────────────────────────────

function buildTOC(bookData: BookData, opts: DocxOptions): Paragraph[] {
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'Índice', font: 'Times New Roman', size: 32, bold: true })],
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
            new TextRun({ text: `Capítulo ${chapter.number}: `, bold: true, font: 'Times New Roman', size: 24 }),
            new TextRun({ text: chapter.title, font: 'Times New Roman', size: 24 }),
          ],
          spacing: { before: 100, after: 100 },
        })
      );
      if (chapter.subheadings?.length > 0) {
        for (const sub of chapter.subheadings) {
          children.push(
            new Paragraph({
              spacing: { before: 40, after: 40 },
              children: [new TextRun({ text: `    ${sub}`, color: '555555', size: 20, font: 'Times New Roman' })],
            })
          );
        }
      }
    }
  }

  children.push(new Paragraph({ children: [new PageBreak()] }));
  return children;
}

// ── Build chapters ───────────────────────────────────────────────────────────

function buildChapters(bookData: BookData): Paragraph[] {
  const children: Paragraph[] = [];
  const writtenChapters = bookData.writtenChapters ?? {};

  if (bookData.chapters?.length > 0) {
    for (const chapter of bookData.chapters) {
      const content = writtenChapters[chapter.number];

      if (content) {
        const paragraphs = parseMarkdownToParagraphs(content);
        children.push(...paragraphs);
      } else {
        children.push(
          new Paragraph({
            children: [new TextRun({
              text: `Capítulo ${chapter.number}: ${chapter.title}`,
              font: 'Times New Roman', size: 32, bold: true,
            })],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 360, after: 240 },
            pageBreakBefore: true,
          })
        );

        if (chapter.subheadings?.length > 0) {
          for (const subheading of chapter.subheadings) {
            children.push(
              new Paragraph({
                children: [new TextRun({ text: subheading, font: 'Times New Roman', size: 28, bold: true })],
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 240, after: 120 },
              }),
              new Paragraph({
                children: [new TextRun({ text: '[Contenido por escribir]', italics: true, color: '999999', font: 'Times New Roman', size: 24 })],
                spacing: { before: 120, after: 120 },
              })
            );
          }
        }
      }

      children.push(new Paragraph({ children: [new PageBreak()] }));
    }
  }

  return children;
}

// ── Build CTA section ("Tu Opinión Importa") ────────────────────────────────

function buildCTA(): Paragraph[] {
  return [
    new Paragraph({
      children: [new TextRun({ text: 'Tu Opinión Importa', font: 'Times New Roman', size: 32, bold: true })],
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { before: 800, after: 400 },
      pageBreakBefore: true,
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: 360, before: 400 },
      children: [new TextRun({
        text: 'Si este libro te ha sido de utilidad y te ha aportado el valor o las herramientas que buscabas, te pido un pequeño favor.',
        size: 24, font: 'Times New Roman',
      })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: 360, before: 200 },
      children: [new TextRun({
        text: 'Por favor, tómate menos de un minuto para dejar una reseña honesta en Amazon. Tus palabras ayudan enormemente a que este conocimiento llegue a otras personas que, como tú, necesitan este sistema para recuperar su paz mental y su foco.',
        size: 24, font: 'Times New Roman',
      })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: 360, before: 300 },
      children: [new TextRun({
        text: '¡Muchas gracias por acompañarme en este proyecto!',
        bold: true, size: 24, font: 'Times New Roman',
      })],
    }),
  ];
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate a .docx buffer for either ebook or paperback format.
 * Content is the same; only page setup, headers/footers, and margins differ.
 */
export async function generateDocx(
  bookData: BookData,
  mode: DocxMode = 'ebook'
): Promise<Buffer> {
  const opts: DocxOptions = {
    mode,
    bookTitle: bookData.selectedIdea?.title ?? 'Mi Ebook',
    authorName: bookData.authorName || 'Autor',
  };

  const pageConfig = mode === 'paperback' ? PAPERBACK_PAGE : EBOOK_PAGE;

  // Assemble all content
  const children = [
    ...buildFrontMatter(bookData, opts),
    ...buildTOC(bookData, opts),
    ...buildChapters(bookData),
    ...buildCTA(),
  ];

  // Paperback: headers (author on even pages, title on odd) + page numbers
  const sectionProps: Record<string, unknown> = {
    page: pageConfig,
  };

  if (mode === 'paperback') {
    sectionProps.headers = {
      even: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: opts.authorName, font: 'Times New Roman', size: 20 })],
        })],
      }),
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: opts.bookTitle, font: 'Times New Roman', size: 20 })],
        })],
      }),
      first: new Header({ children: [new Paragraph({ text: '' })] }),
    };
    sectionProps.footers = {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({
            children: [PageNumber.CURRENT],
            font: 'Times New Roman',
            size: 20,
          })],
        })],
      }),
    };
    sectionProps.titlePage = true; // first page different (no header)
  }

  const doc = new Document({
    title: opts.bookTitle,
    description: bookData.selectedIdea?.description ?? '',
    evenAndOddHeaderAndFooters: mode === 'paperback',
    styles: BASE_STYLES as Document['styles'],
    sections: [{ properties: sectionProps as never, children }],
  });

  return await Packer.toBuffer(doc);
}
