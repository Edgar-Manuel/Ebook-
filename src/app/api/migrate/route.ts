import { insforge } from '@/lib/insforge';

/**
 * One-time migration: adds missing columns to the 'books' table.
 * Safe to call multiple times — InsForge/Postgres ignores IF NOT EXISTS.
 *
 * GET /api/migrate → runs migration and returns status
 */
export async function GET() {
  const columns = [
    { name: 'cover_design', type: 'text' },
    { name: 'cover_image', type: 'text' },
    { name: 'kdp_setup', type: 'text' },
    { name: 'pricing_strategy', type: 'text' },
    { name: 'marketing_content', type: 'text' },
    { name: 'marketing_assets', type: 'jsonb', default: "'{}'" },
  ];

  const results: Record<string, string> = {};

  for (const col of columns) {
    try {
      const defaultClause = col.default ? ` DEFAULT ${col.default}` : '';
      const { error } = await insforge.database.rpc('exec_sql', {
        query: `ALTER TABLE books ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}${defaultClause};`,
      });

      if (error) {
        // Fallback: try inserting a test row to see if column already exists
        results[col.name] = `rpc error: ${JSON.stringify(error)}`;
      } else {
        results[col.name] = 'OK';
      }
    } catch (err) {
      results[col.name] = `exception: ${err instanceof Error ? err.message : String(err)}`;
    }
  }

  return new Response(JSON.stringify({ migration: results }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
