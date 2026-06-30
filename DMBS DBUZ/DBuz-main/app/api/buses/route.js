import pool from '../../../lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const busId = searchParams.get('busId');

  let connection;
  try {
    connection = await pool.getConnection();

    if (busId) {
      const [rows] = await connection.execute('SELECT * FROM buses WHERE bus_id = ?', [busId]);
      if (rows.length === 0) throw new Error('Bus not found');
      return Response.json(rows[0]);
    }

    if (!from || !to || !date) {
      throw new Error('Missing required parameters: from, to, or date');
    }

    const [rows] = await connection.execute(
      `SELECT b.*, r.route_id, COUNT(CASE WHEN s.status = 'available' THEN 1 END) AS available_seats 
       FROM buses b 
       JOIN routes r ON b.bus_id = r.bus_id 
       JOIN seats s ON b.bus_id = s.bus_id AND r.route_id = s.route_id 
       WHERE r.from_location = ? AND r.to_location = ? AND r.date = ? 
       GROUP BY b.bus_id, r.route_id
       HAVING available_seats > 0`,
      [from, to, date]
    );

    const buses = rows.map((row) => ({
      id: row.bus_id,
      operator: row.operator,
      type: row.type,
      departureTime: row.departure_time.toTimeString().slice(0, 5),
      arrivalTime: row.arrival_time.toTimeString().slice(0, 5),
      duration: row.duration,
      fare: row.fare,
      availableSeats: row.available_seats,
      rating: row.rating,
      reviews: row.reviews,
      routeId: row.route_id,
    }));

    return Response.json(buses);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  } finally {
    if (connection) connection.release();
  }
}