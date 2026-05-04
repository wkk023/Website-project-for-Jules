CREATE TABLE `inspection_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lifips_number` varchar(100) NOT NULL,
	`address` text NOT NULL,
	`location` varchar(255) NOT NULL,
	`fsi_inspected` text NOT NULL,
	`irregularities` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inspection_records_id` PRIMARY KEY(`id`)
);
