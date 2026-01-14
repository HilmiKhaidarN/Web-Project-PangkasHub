CREATE DATABASE IF NOT EXISTS pangkashub;
USE pangkashub;

-- Tabel layanan
CREATE TABLE IF NOT EXISTS services (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  duration INT NOT NULL COMMENT 'Durasi dalam menit',
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel barber
CREATE TABLE IF NOT EXISTS barbers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel booking
CREATE TABLE IF NOT EXISTS bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customer_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  service_id INT NOT NULL,
  barber_id INT,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(id),
  FOREIGN KEY (barber_id) REFERENCES barbers(id),
  UNIQUE KEY unique_booking (barber_id, booking_date, booking_time)
);

-- Data awal layanan
INSERT INTO services (name, description, duration, price) VALUES
('Potong Rambut Reguler', 'Potong rambut standar dengan styling sederhana', 30, 35000),
('Potong Rambut Premium', 'Potong rambut dengan konsultasi styling dan treatment', 45, 50000),
('Cukur Jenggot', 'Cukur dan rapikan jenggot', 20, 25000),
('Paket Lengkap', 'Potong rambut + cukur jenggot + facial', 60, 75000);

-- Data awal barber
INSERT INTO barbers (name, phone, is_active) VALUES
('Andi', '081234567890', TRUE),
('Budi', '081234567891', TRUE),
('Candra', '081234567892', TRUE);


-- Tabel admin
CREATE TABLE IF NOT EXISTS admins (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data admin default (username: admin, password: admin123)
INSERT INTO admins (username, password, name) VALUES
('admin', '$2b$10$rBV2KXZpN8qhYxH5Y5YqXeJKGZJxGZJxGZJxGZJxGZJxGZJxGZJxG', 'Administrator');


-- Tabel customers
CREATE TABLE IF NOT EXISTS customers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update tabel bookings untuk relasi dengan customers
ALTER TABLE bookings 
ADD COLUMN customer_id INT AFTER id,
ADD FOREIGN KEY (customer_id) REFERENCES customers(id);

-- Tabel reviews untuk rating dan review
CREATE TABLE IF NOT EXISTS reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  booking_id INT NOT NULL UNIQUE,
  customer_id INT NOT NULL,
  barber_id INT,
  service_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (barber_id) REFERENCES barbers(id) ON DELETE SET NULL,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);
