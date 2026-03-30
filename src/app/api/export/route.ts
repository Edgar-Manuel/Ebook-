import { generateDocx } from '@/lib/docx-generator';
import type { BookData } from '@/types';

export async function POST(req: Request) {
  try {
    const bookData: BookData = await req.json();

    if (!bookData.selectedIdea) {
      return new Response(JSON.stringify({ error: 'No book idea selected' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const buffer = await generateDocx(bookData);
    const title = bookData.selectedIdea.title
      .replace(/[^a-z0-9]/gi, '-')
      .toLowerCase();
    const filename = `${title}-ebook.docx`;

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
