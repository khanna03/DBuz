import pool from '../../../lib/db';

export async function GET() {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM routes r JOIN buses b ON r.bus_id = b.bus_id WHERE r.date >= CURDATE() LIMIT 2'
    );

    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Database error:', error.message);
    return new Response(JSON.stringify({ error: 'Failed to fetch journeys' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}