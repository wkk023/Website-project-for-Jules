import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

// Parse DATABASE_URL
const url = new URL(DATABASE_URL);
const config = {
  host: url.hostname,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  port: url.port || 3306,
  ssl: {},
};

console.log('Connecting to database:', config.host, config.database);

let connection;
try {
  connection = await mysql.createConnection(config);
  console.log('✅ Connected to database');
} catch (err) {
  console.error('Connection error:', err.message);
  throw err;
}

const sql = `
-- Create fire_stations table
CREATE TABLE IF NOT EXISTS \`fire_stations\` (
	\`id\` int AUTO_INCREMENT NOT NULL,
	\`station_code\` varchar(50) NOT NULL UNIQUE,
	\`station_name\` varchar(255) NOT NULL,
	\`password_hash\` varchar(255) NOT NULL,
	\`createdAt\` timestamp NOT NULL DEFAULT (now()),
	\`updatedAt\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT \`fire_stations_id\` PRIMARY KEY(\`id\`)
);

-- Create buildings table
CREATE TABLE IF NOT EXISTS \`buildings\` (
	\`id\` int AUTO_INCREMENT NOT NULL,
	\`lifips_number\` varchar(100) NOT NULL UNIQUE,
	\`address\` text NOT NULL,
	\`location\` varchar(255) NOT NULL,
	\`building_type\` varchar(100),
	\`risk_category\` enum('A','A*','B','C','D','E'),
	\`createdAt\` timestamp NOT NULL DEFAULT (now()),
	\`updatedAt\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT \`buildings_id\` PRIMARY KEY(\`id\`)
);

-- Create referral_departments table
CREATE TABLE IF NOT EXISTS \`referral_departments\` (
	\`id\` int AUTO_INCREMENT NOT NULL,
	\`department_code\` varchar(50) NOT NULL UNIQUE,
	\`department_name\` varchar(255) NOT NULL,
	\`createdAt\` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT \`referral_departments_id\` PRIMARY KEY(\`id\`)
);

-- Create inspection_records table
CREATE TABLE IF NOT EXISTS \`inspection_records\` (
	\`id\` int AUTO_INCREMENT NOT NULL,
	\`station_id\` int NOT NULL,
	\`building_id\` int NOT NULL,
	\`floor\` varchar(50),
	\`watch_number\` varchar(10),
	\`inspection_date_time\` datetime NOT NULL,
	\`irregularities\` text,
	\`referral_department_id\` int,
	\`createdAt\` timestamp NOT NULL DEFAULT (now()),
	\`updatedAt\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT \`inspection_records_id\` PRIMARY KEY(\`id\`),
	CONSTRAINT \`inspection_records_station_fk\` FOREIGN KEY(\`station_id\`) REFERENCES \`fire_stations\`(\`id\`),
	CONSTRAINT \`inspection_records_building_fk\` FOREIGN KEY(\`building_id\`) REFERENCES \`buildings\`(\`id\`),
	CONSTRAINT \`inspection_records_dept_fk\` FOREIGN KEY(\`referral_department_id\`) REFERENCES \`referral_departments\`(\`id\`)
);

-- Create verification_records table
CREATE TABLE IF NOT EXISTS \`verification_records\` (
	\`id\` int AUTO_INCREMENT NOT NULL,
	\`inspection_record_id\` int NOT NULL,
	\`verifying_station_id\` int NOT NULL,
	\`verified_at\` datetime,
	\`status\` enum('pending','verified','rejected') DEFAULT 'pending',
	\`notes\` text,
	\`createdAt\` timestamp NOT NULL DEFAULT (now()),
	\`updatedAt\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT \`verification_records_id\` PRIMARY KEY(\`id\`),
	CONSTRAINT \`verification_records_inspection_fk\` FOREIGN KEY(\`inspection_record_id\`) REFERENCES \`inspection_records\`(\`id\`),
	CONSTRAINT \`verification_records_station_fk\` FOREIGN KEY(\`verifying_station_id\`) REFERENCES \`fire_stations\`(\`id\`)
);

-- Insert initial fire stations with hashed passwords
INSERT INTO \`fire_stations\` (\`station_code\`, \`station_name\`, \`password_hash\`) VALUES
('TSFStn', 'Tin Sum Fire Station', '$2b$10$8hzi/di34WAUTUIF.tGWruVLknlRYnVfexX.LQAPE724LuHGNszn2'),
('STFStn', 'Sham Tseng Fire Station', '$2b$10$MBv7GfSvQZ7XuGq0V49/nukw0zsCglzXOTmAE577sMX.2t2wGwgSy'),
('MOSFStn', 'Mong Kok Fire Station', '$2b$10$NwvfYRFKbrDx3IxgDzy7v.AOogvu0sqKHJonHEu49yeI4JTpn7Gbm'),
('SLYFStn', 'Sai Ying Pun Fire Station', '$2b$10$7GxNOn5FPTgug1DEwWCnae1VchAPYGVNdE9kwUh.AgpGDulPQd8Qy'),
('TPFStn', 'Tuen Mun Fire Station', '$2b$10$lt30qmTV6neNu9Q7f65aL.Z.5tWeI3EeVM.bUBHxxkm5rOI83XSxO'),
('TPEFStn', 'Tseung Kwan O Fire Station', '$2b$10$O0hX39Q3HCotbpO0cggB7uNx.s3Un.ra3A5jkTHT.3Gf7zJeB/AVu')
ON DUPLICATE KEY UPDATE \`station_name\`=VALUES(\`station_name\`);

-- Insert initial referral departments
INSERT INTO \`referral_departments\` (\`department_code\`, \`department_name\`) VALUES
('BD', 'Buildings Department'),
('HD', 'Housing Department'),
('HAD', 'Housing Authority'),
('FEHD', 'Food and Environmental Hygiene Department'),
('HyD', 'Highways Department')
ON DUPLICATE KEY UPDATE \`department_name\`=VALUES(\`department_name\`);
`;

try {
  const statements = sql.split(';').filter(s => s.trim());

  for (const statement of statements) {
    if (statement.trim()) {
      const preview = statement.substring(0, 60).replace(/\n/g, ' ') + '...';
      try {
        await connection.execute(statement);
        console.log('✓', preview);
      } catch (err) {
        if (err.code === 'ER_TABLE_EXISTS_ERROR' || err.message.includes('already exists')) {
          console.log('⊘', preview, '(already exists)');
        } else {
          throw err;
        }
      }
    }
  }

  console.log('✅ All tables created and data inserted successfully!');
} catch (error) {
  console.error('❌ Database initialization failed:', error.message);
  process.exit(1);
} finally {
  await connection.end();
}
