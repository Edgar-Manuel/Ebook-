import { generateDocx } from '@/lib/docx-generator';
import type { BookData } from '@/types';
import type { DocxMode } from '@/lib/docx-generator';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mode, ...bookData }: { mode?: DocxMode } & BookData = body;

    if (!bookData.selectedIdea) {
      return new Response(JSON.stringify({ error: 'No book idea selected' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const docxMode: DocxMode = mode === 'paperback' ? 'paperback' : 'ebook';
    const buffer = await generateDocx(bookData, docxMode);

    const title = bookData.selectedIdea.title
      .replace(/[^a-z0-9]/gi, '-')
      .toLowerCase();
    const suffix = docxMode === 'paperback' ? '_TB' : '_EB';
    const filename = `${title}${suffix}.docx`;

    return new Response(buffer as unknown as BodyInit, {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Export failed';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
