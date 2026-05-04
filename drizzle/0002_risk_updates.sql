CREATE TABLE `risk_category_updates` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `building_id` varchar(100) NOT NULL,
  `old_risk_category` enum('A', 'A*', 'B', 'C', 'D', 'E'),
  `new_risk_category` enum('A', 'A*', 'B', 'C', 'D', 'E') NOT NULL,
  `updated_by_station_id` int NOT NULL,
  `officer_rank` varchar(50) NOT NULL,
  `officer_name` varchar(255) NOT NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
