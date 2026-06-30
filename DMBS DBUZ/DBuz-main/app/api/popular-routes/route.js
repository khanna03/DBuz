import pool from '../../../lib/db';

export async function GET() {
  try {
    // Query to fetch the top 5 routes ordered by date
    const [rows] = await pool.execute(`
      SELECT from_location AS \`from\`, to_location AS \`to\`, date
      FROM routes
      ORDER BY date ASC
      LIMIT 5
    `);

    // Return the results as JSON
    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Database error:', error.message);
    // Return an error response
    return new Response(JSON.stringify({ error: 'Failed to fetch routes' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}