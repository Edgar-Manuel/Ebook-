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
  ImageRun,
} from 'docx';
import type { BookData } from '@/types';

function parseInlineMarkdown(text: string): TextRun[] {
  const result: TextRun[] = [];
  // Match bold (**bold**) or italic (*italic*)
  // This is a simplified regex-based parser
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);

  for (const part of parts) {
    if (part.startsWith('**') && part.endsWith('**')) {
      result.push(new TextRun({ text: part.slice(2, -2), bold: true }));
    } else if (part.startsWith('*') && part.endsWith('*')) {
      result.push(new TextRun({ text: part.slice(1, -1), italics: true }));
    } else {
      result.push(new TextRun({ text: part }));
    }
  }

  return result;
}

function parseMarkdownToParagraphs(text: string): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const sanitizedText = text.replace(/—/g, '-').replace(/--/g, '-');
  const lines = sanitizedText.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      paragraphs.push(new Paragraph({ text: '' }));
      continue;
    }

    if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.replace(/^#+\s/, ''),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
          pageBreakBefore: true,
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
    } else {
      // Check for bullet points
      const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ');
      const cleanText = isBullet ? trimmed.slice(2) : trimmed;
      
      paragraphs.push(
        new Paragraph({
          children: parseInlineMarkdown(cleanText),
          bullet: isBullet ? { level: 0 } : undefined,
          spacing: { before: 60, after: 120 },
          alignment: AlignmentType.JUSTIFIED,
          indent: isBullet ? undefined : { firstLine: 720 },
        })
      );
    }
  }

  return paragraphs;
}

export async function generateDocx(bookData: BookData): Promise<Buffer> {
  const children: (Paragraph | TableOfContents)[] = [];

  // Title Page
  
  // ── Cover Image (Full Page) ───────────────────────────────────────────
  if (bookData.coverImage) {
    try {
      const coverBuffer = Buffer.from(bookData.coverImage, 'base64');
      children.push(
        new Paragraph({
          children: [
            new ImageRun({
              type: 'jpg',
              data: coverBuffer,
              transformation: {
                width: 595,  // Full width of A4 in points approx
                height: 952, // Maintaining KDP 9:16 aspect ratio
              },
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

  children.push(
    new Paragraph({
      children: [new TextRun({ text: '', break: 1 }), new TextRun({ text: '', break: 1 })],
    }),
    new Paragraph({
      text: bookData.selectedIdea?.title ?? 'My Ebook',
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { before: 800, after: 400 },
    }),
    new Paragraph({
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
      alignment: AlignmentType.CENTER,
      spacing: { before: 800, after: 800 },
      children: [
        new TextRun({
          text: `Escrito por: ${bookData.authorName || 'Autor'}`,
          bold: true,
          size: 32,
          color: '333333',
        }),
      ],
    }),
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  // --- COPYRIGHT PAGE ---
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 800, after: 400 },
      children: [
        new TextRun({
          text: bookData.selectedIdea?.title ?? 'My Ebook',
          bold: true,
          size: 28,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: 360, before: 400, after: 800 },
      children: [
        new TextRun({ text: `Copyright © ${new Date().getFullYear()} ${bookData.authorName || 'Autor'}`, size: 24, break: 1 }),
        new TextRun({ text: 'Todos los derechos reservados.', size: 24, break: 1 }),
        new TextRun({ text: '', size: 24, break: 1 }),
        new TextRun({ text: 'Esta obra ha sido publicada bajo licencia de contenido exclusivo para Amazon Kindle Direct Publishing.', size: 24, break: 1 }),
        new TextRun({ text: 'Se prohíbe la reproducción total o parcial de este libro sin permiso escrito del autor, salvo para citas breves en artículos, reseñas y otros usos permitidos por la ley de derechos de autor.', size: 24, break: 1 }),
        new TextRun({ text: '', size: 24, break: 1 }),
        new TextRun({ text: 'Versión 1.0 - Edición Kindle', size: 24, italics: true, break: 1 })
      ],
    }),
    new Paragraph({ children: [new PageBreak()] })
  );



  // Table of Contents placeholder
  children.push(
    new Paragraph({
      text: 'Índice',
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
            new TextRun({ text: `Capítulo ${chapter.number}: `, bold: true }),
            new TextRun({ text: chapter.title }),
          ],
          spacing: { before: 100, after: 100 },
        })
      );
      if (chapter.subheadings?.length > 0) {
        for (const sub of chapter.subheadings) {
          children.push(
            new Paragraph({
              spacing: { before: 40, after: 40 },
              children: [new TextRun({ text: `    ${sub}`, color: '555555', size: 20 })],
            })
          );
        }
      }
    }
  }

  children.push(new Paragraph({ children: [new PageBreak()] }));


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
            text: `Capítulo ${chapter.number}: ${chapter.title}`,
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
                children: [new TextRun({ text: '[Contenido por escribir]', italics: true, color: '999999' })],
                spacing: { before: 120, after: 120 },
              })
            );
          }
        }
      }

      children.push(new Paragraph({ children: [new PageBreak()] }));
    }
  }

  // --- CTA FINAL DE RESEÑA (KDP OPTIMIZATION) ---
  children.push(
    new Paragraph({
      text: 'Tu Opinión Importa',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { before: 800, after: 400 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: 360, before: 400 },
      children: [
        new TextRun({
          text: 'Si este libro te ha sido de utilidad y te ha aportado el valor o las herramientas que buscabas, te pido un pequeño favor.',
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: 360, before: 200 },
      children: [
        new TextRun({
          text: 'Por favor, tómate menos de un minuto para dejar una reseña honesta en Amazon. Tus palabras ayudan enormemente a que este conocimiento llegue a otras personas que, como tú, necesitan este sistema para recuperar su paz mental y su foco.',
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: 360, before: 300 },
      children: [
        new TextRun({
          text: '¡Muchas gracias por acompañarme en este proyecto!',
          bold: true,
          size: 24,
        }),
      ],
    })
  );



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
