create database cleaning_service;

use cleaning_service;

CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email varchar(255) unique,
        password_hash VARCHAR(255) NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
	CREATE TABLE IF NOT EXISTS services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2),
        duration_hours INT DEFAULT 2,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      INSERT INTO services (name, description, price, duration_hours) VALUES
        ('Deep Cleaning', 'Comprehensive deep clean of all rooms', 150.00, 4),
        ('Carpet Cleaning', 'Professional carpet and upholstery cleaning', 80.00, 2),
        ('Window Cleaning', 'Interior and exterior window cleaning', 60.00, 1),
        ('Move-in/Move-out Cleaning', 'Complete cleaning for moving', 200.00, 6),
        ('Regular House Cleaning', 'Standard weekly/monthly house cleaning', 100.00, 3),
        ('Office Cleaning', 'Commercial office space cleaning', 120.00, 3);
      
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        date_time DATETIME NOT NULL,
        service_id INT NOT NULL,
        user_id INT NOT NULL,
        status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (service_id) REFERENCES services(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );