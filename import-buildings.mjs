import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import { parse } from 'csv-parse/sync';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read CSV file
const csvPath = '/home/ubuntu/TinSum_InspectionList.csv';
const fileContent = fs.readFileSync(csvPath, 'utf-8');

// Parse CSV
const records = parse(fileContent, {
  columns: true,
  skip_empty_lines: true,
});

console.log(`Found ${records.length} buildings to import`);

// Parse DATABASE_URL
const dbUrl = new URL(process.env.DATABASE_URL || 'mysql://root@localhost/fire_inspection');
const connection = await mysql.createConnection({
  host: dbUrl.hostname,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.slice(1),
  ssl: {
    rejectUnauthorized: false,
  },
});

try {
  // Clear existing buildings
  await connection.execute('DELETE FROM buildings');
  console.log('Cleared existing buildings');

  // Insert buildings
  let count = 0;
  for (const record of records) {
    const lifipsNumber = `TS-${record['S/N'] || count}`;
    const address = `${record['Street\n街名'] || ''} ${record['Street No.\n街號'] || ''}`.trim();
    const location = record['Building Name\n大廈名稱'] || 'Unknown';
    const buildingType = record['Building Type\n樓宇類別'] || 'Residential';
    const riskCategory = record['Final/Adjusted Risk Category\n最終風險級數\n'] || 'E';

    try {
      await connection.execute(
        'INSERT INTO buildings (lifips_number, address, location, building_type, risk_category) VALUES (?, ?, ?, ?, ?)',
        [lifipsNumber, address, location, buildingType, riskCategory]
      );
      count++;
    } catch (e) {
      // Skip duplicates
      if (e.code !== 'ER_DUP_ENTRY') {
        console.error(`Error inserting building: ${lifipsNumber}`, e.message);
      }
    }
  }

  console.log(`Successfully imported ${count} buildings`);
} catch (error) {
  console.error('Error importing buildings:', error);
} finally {
  await connection.end();
}
