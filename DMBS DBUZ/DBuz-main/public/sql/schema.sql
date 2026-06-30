-- Create and select database
CREATE DATABASE IF NOT EXISTS bus;
USE bus;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME
);

-- Buses table
CREATE TABLE IF NOT EXISTS buses (
    bus_id INT AUTO_INCREMENT PRIMARY KEY,
    operator VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    departure_time DATETIME NOT NULL,
    arrival_time DATETIME NOT NULL,
    duration VARCHAR(10) NOT NULL,
    fare DECIMAL(10, 2) NOT NULL CHECK (fare >= 0),
    rating DECIMAL(3, 1) CHECK (rating BETWEEN 0 AND 5),
    reviews INT DEFAULT 0 CHECK (reviews >= 0),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Routes table
CREATE TABLE IF NOT EXISTS routes (
    route_id INT AUTO_INCREMENT PRIMARY KEY,
    from_location VARCHAR(100) NOT NULL,
    to_location VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    bus_id INT,
    FOREIGN KEY (bus_id) REFERENCES buses(bus_id) ON DELETE CASCADE,
    UNIQUE (from_location, to_location, date, bus_id)
);

-- Boarding Points table
CREATE TABLE IF NOT EXISTS boarding_points (
    boarding_point_id INT AUTO_INCREMENT PRIMARY KEY,
    route_id INT,
    name VARCHAR(100) NOT NULL,
    FOREIGN KEY (route_id) REFERENCES routes(route_id) ON DELETE CASCADE
);

-- Drop Points table
CREATE TABLE IF NOT EXISTS drop_points (
    drop_point_id INT AUTO_INCREMENT PRIMARY KEY,
    route_id INT,
    name VARCHAR(100) NOT NULL,
    FOREIGN KEY (route_id) REFERENCES routes(route_id) ON DELETE CASCADE
);

-- Seats table
CREATE TABLE IF NOT EXISTS seats (
    seat_id INT AUTO_INCREMENT PRIMARY KEY,
    bus_id INT,
    route_id INT,
    seat_number VARCHAR(10) NOT NULL,
    status ENUM('available', 'booked') DEFAULT 'available',
    FOREIGN KEY (bus_id) REFERENCES buses(bus_id) ON DELETE CASCADE,
    FOREIGN KEY (route_id) REFERENCES routes(route_id) ON DELETE CASCADE,
    UNIQUE (bus_id, route_id, seat_number)
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36),
    bus_id INT,
    seat_id INT,
    boarding_point_id INT,
    drop_point_id INT,
    booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('confirmed', 'pending', 'cancelled') DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (bus_id) REFERENCES buses(bus_id) ON DELETE CASCADE,
    FOREIGN KEY (seat_id) REFERENCES seats(seat_id) ON DELETE CASCADE,
    FOREIGN KEY (boarding_point_id) REFERENCES boarding_points(boarding_point_id) ON DELETE RESTRICT,
    FOREIGN KEY (drop_point_id) REFERENCES drop_points(drop_point_id) ON DELETE RESTRICT
);

-- Indexes
CREATE INDEX idx_routes_locations_date ON routes (from_location, to_location, date);
CREATE INDEX idx_seats_bus_route_status ON seats (bus_id, route_id, status);
CREATE INDEX idx_bookings_user_status ON bookings (user_id, status);

-- Trigger: Update seat status when booking is confirmed
DELIMITER //
CREATE TRIGGER update_seat_status
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
    IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
        UPDATE seats 
        SET status = 'booked'
        WHERE seat_id = NEW.seat_id;
    END IF;
    
    IF NEW.status = 'cancelled' AND OLD.status = 'confirmed' THEN
        UPDATE seats 
        SET status = 'available'
        WHERE seat_id = NEW.seat_id;
    END IF;
END//
DELIMITER ;

-- Trigger: Prevent booking of already booked seats
DELIMITER //
CREATE TRIGGER prevent_double_booking
BEFORE INSERT ON bookings
FOR EACH ROW
BEGIN
    DECLARE seat_status ENUM('available', 'booked');
    
    SELECT status INTO seat_status
    FROM seats
    WHERE seat_id = NEW.seat_id;
    
    IF seat_status = 'booked' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot book an already booked seat';
    END IF;
END//
DELIMITER ;

-- View for available buses
CREATE VIEW available_buses AS
SELECT 
    b.bus_id, 
    b.operator, 
    b.type, 
    r.from_location, 
    r.to_location, 
    r.date, 
    b.fare,
    b.departure_time,
    b.arrival_time,
    b.duration,
    r.route_id,
    COUNT(CASE WHEN s.status = 'available' THEN 1 END) AS available_seats
FROM buses b
JOIN routes r ON b.bus_id = r.bus_id
JOIN seats s ON b.bus_id = s.bus_id AND r.route_id = s.route_id
GROUP BY b.bus_id, b.operator, b.type, r.from_location, r.to_location, r.date, b.fare, b.departure_time, b.arrival_time, b.duration, r.route_id
HAVING COUNT(CASE WHEN s.status = 'available' THEN 1 END) > 0;

-- Procedure: Update expired pending bookings
DELIMITER //
CREATE PROCEDURE cleanup_pending_bookings()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE booking_to_update INT;
    DECLARE booking_cursor CURSOR FOR 
        SELECT booking_id 
        FROM bookings 
        WHERE status = 'pending' 
        AND booking_date < DATE_SUB(NOW(), INTERVAL 1 HOUR);
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN booking_cursor;
    
    read_loop: LOOP
        FETCH booking_cursor INTO booking_to_update;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        UPDATE bookings 
        SET status = 'cancelled'
        WHERE booking_id = booking_to_update;
    END LOOP;
    
    CLOSE booking_cursor;
END//
DELIMITER ;

-- Event: Schedule cleanup
CREATE EVENT IF NOT EXISTS cleanup_bookings_event
ON SCHEDULE EVERY 1 HOUR
DO
   CALL cleanup_pending_bookings();

-- Sample Data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE bookings;
TRUNCATE TABLE seats;
TRUNCATE TABLE drop_points;
TRUNCATE TABLE boarding_points;
TRUNCATE TABLE routes;
TRUNCATE TABLE buses;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- Users
INSERT INTO users (user_id, email, name) VALUES
(UUID(), 'user1@example.com', 'John Doe'),
(UUID(), 'user2@example.com', 'Jane Smith');

-- Buses
INSERT INTO buses (operator, type, departure_time, arrival_time, duration, fare, rating, reviews) VALUES
('RedBus Express', 'AC Sleeper', '2025-04-08 18:00:00', '2025-04-09 06:00:00', '12h', 1200.00, 4.7, 195),
('GreenLine', 'Non-AC Seater', '2025-04-09 19:00:00', '2025-04-10 07:00:00', '12h', 800.00, 4.2, 122);

-- Routes
INSERT INTO routes (from_location, to_location, date, bus_id) VALUES
('Chennai', 'Coimbatore', '2025-04-08', 1),
('Chennai', 'Madurai', '2025-04-09', 2);

-- Boarding Points
INSERT INTO boarding_points (route_id, name) VALUES
(1, 'Koyambedu Bus Terminus'),
(2, 'Tambaram Stop');

-- Drop Points
INSERT INTO drop_points (route_id, name) VALUES
(1, 'Gandhipuram Bus Stand'),
(2, 'Madurai Periyar Bus Stand');

-- Seats
INSERT INTO seats (bus_id, route_id, seat_number, status) VALUES
(1, 1, 'A1', 'available'), (1, 1, 'A2', 'available'), (1, 1, 'A3', 'available'), 
(1, 1, 'A4', 'available'), (1, 1, 'A5', 'available'),
(2, 2, 'A1', 'available'), (2, 2, 'A2', 'available'), (2, 2, 'A3', 'available'),
(2, 2, 'A4', 'available'), (2, 2, 'A5', 'available');

-- Sample Bookings
INSERT INTO bookings (user_id, bus_id, seat_id, boarding_point_id, drop_point_id, status) VALUES
((SELECT user_id FROM users WHERE email = 'user1@example.com'), 
 1, 
 (SELECT seat_id FROM seats WHERE bus_id = 1 AND route_id = 1 AND seat_number = 'A1'), 
 1, 
 1, 
 'pending');

-- Final checks
SELECT 'Database created successfully' AS message;
SELECT COUNT(*) AS user_count FROM users;
SELECT COUNT(*) AS bus_count FROM buses;
SELECT COUNT(*) AS booking_count FROM bookings;