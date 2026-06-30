import pool from '../../../lib/db';

export async function GET() {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.execute(
      `SELECT route_id, from_location AS \`from\`, to_location AS \`to\`, date 
       FROM routes 
       WHERE date >= CURDATE() 
       ORDER BY date ASC 
       LIMIT 5`
    );
    return Response.json(rows);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
}