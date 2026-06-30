import pool from '../../../lib/db.js';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const busId = searchParams.get('busId');

  let connection;
  try {
    if (!busId) {
      throw new Error('Missing busId');
    }

    connection = await pool.getConnection();
    const [routeRows] = await connection.query(
      'SELECT route_id FROM routes WHERE bus_id = ? AND date >= CURDATE() LIMIT 1',
      [busId]
    );
    if (!routeRows.length) throw new Error('No valid route found');

    const routeId = routeRows[0].route_id;

    const [boardingRows] = await connection.query(
      'SELECT * FROM boarding_points WHERE route_id = ?',
      [routeId]
    );

    const [dropRows] = await connection.query(
      'SELECT * FROM drop_points WHERE route_id = ?',
      [routeId]
    );

    return Response.json({
      boardingPoints: boardingRows,
      dropPoints: dropRows,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  } finally {
    if (connection) connection.release();
  }
}