import Joi from 'joi';
import pool from '../../../lib/db';

const schema = Joi.object({
  userId: Joi.string().required(),
  busId: Joi.number().integer().positive().required(),
  seatNumber: Joi.string().pattern(/^[A-Z]\d+$/).required(),
  boardingPointId: Joi.number().integer().positive().required(),
  dropPointId: Joi.number().integer().positive().required(),
});

export async function POST(request) {
  const body = await request.json();
  const { error } = schema.validate(body);
  if (error) {
    return Response.json({ error: error.details[0].message }, { status: 400 });
  }

  const { userId, busId, seatNumber, boardingPointId, dropPointId } = body;

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Check if seat is available
    const [seatRows] = await connection.execute(
      `SELECT s.seat_id 
       FROM seats s
       JOIN routes r ON s.route_id = r.route_id
       WHERE s.seat_number = ? 
         AND s.bus_id = ? 
         AND s.status = 'available'
         AND r.bus_id = ?`,
      [seatNumber, busId, busId]
    );
    
    if (!seatRows.length) {
      throw new Error('Selected seat is not available');
    }
    const seatId = seatRows[0].seat_id;

    // 2. Create booking
    const [result] = await connection.execute(
      `INSERT INTO bookings 
       (user_id, bus_id, seat_id, boarding_point_id, drop_point_id, status) 
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [userId, busId, seatId, boardingPointId, dropPointId]
    );

    // 3. Mark seat as booked
    await connection.execute(
      `UPDATE seats SET status = 'booked' WHERE seat_id = ?`,
      [seatId]
    );

    await connection.commit();
    return Response.json({ 
      success: true, 
      bookingId: result.insertId,
      message: 'Booking created successfully'
    });
  } catch (error) {
    if (connection) await connection.rollback();
    const status = error.message.includes('not available') ? 400 : 500;
    return Response.json({ 
      error: error.message,
      details: error.stack 
    }, { status });
  } finally {
    if (connection) connection.release();
  }
}