-- Modify inspection_records table to change building_id from int to varchar
ALTER TABLE inspection_records
MODIFY COLUMN building_id VARCHAR(100) NOT NULL;
