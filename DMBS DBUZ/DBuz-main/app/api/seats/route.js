import pool from '../../../lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const busId = searchParams.get('busId');
  const routeId = searchParams.get('routeId');

  let connection;
  try {
    if (!busId || !routeId) {
      throw new Error('Missing busId or routeId');
    }

    connection = await pool.getConnection();
    const [rows] = await connection.execute(
      'SELECT seat_id, bus_id, route_id, seat_number, status FROM seats WHERE bus_id = ? AND route_id = ?',
      [busId, routeId]
    );

    return Response.json(rows);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  } finally {
    if (connection) connection.release();
  }
}