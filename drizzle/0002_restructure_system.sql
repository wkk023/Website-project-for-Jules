-- Create fire_stations table
CREATE TABLE `fire_stations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`station_code` varchar(50) NOT NULL UNIQUE,
	`station_name` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fire_stations_id` PRIMARY KEY(`id`)
);

-- Create buildings table
CREATE TABLE `buildings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lifips_number` varchar(100) NOT NULL UNIQUE,
	`address` text NOT NULL,
	`location` varchar(255) NOT NULL,
	`building_type` varchar(100),
	`risk_category` enum('A','A*','B','C','D','E'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `buildings_id` PRIMARY KEY(`id`)
);

-- Create referral_departments table
CREATE TABLE `referral_departments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`department_code` varchar(50) NOT NULL UNIQUE,
	`department_name` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `referral_departments_id` PRIMARY KEY(`id`)
);

-- Insert initial fire stations with hashed passwords
INSERT INTO `fire_stations` (`station_code`, `station_name`, `password_hash`) VALUES
('TSFStn', 'Tin Sum Fire Station', '$2b$10$8hzi/di34WAUTUIF.tGWruVLknlRYnVfexX.LQAPE724LuHGNszn2'),
('STFStn', 'Sham Tseng Fire Station', '$2b$10$MBv7GfSvQZ7XuGq0V49/nukw0zsCglzXOTmAE577sMX.2t2wGwgSy'),
('MOSFStn', 'Mong Kok Fire Station', '$2b$10$NwvfYRFKbrDx3IxgDzy7v.AOogvu0sqKHJonHEu49yeI4JTpn7Gbm'),
('SLYFStn', 'Sai Ying Pun Fire Station', '$2b$10$7GxNOn5FPTgug1DEwWCnae1VchAPYGVNdE9kwUh.AgpGDulPQd8Qy'),
('TPFStn', 'Tuen Mun Fire Station', '$2b$10$lt30qmTV6neNu9Q7f65aL.Z.5tWeI3EeVM.bUBHxxkm5rOI83XSxO'),
('TPEFStn', 'Tseung Kwan O Fire Station', '$2b$10$O0hX39Q3HCotbpO0cggB7uNx.s3Un.ra3A5jkTHT.3Gf7zJeB/AVu');

-- Insert initial referral departments
INSERT INTO `referral_departments` (`department_code`, `department_name`) VALUES
('BD', 'Buildings Department'),
('HD', 'Housing Department'),
('HAD', 'Housing Authority'),
('FEHD', 'Food and Environmental Hygiene Department'),
('HyD', 'Highways Department');
