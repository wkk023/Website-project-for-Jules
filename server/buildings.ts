import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

let buildingsCache: any[] | null = null;

export interface Building {
  id: string;
  lifipsNumber: string;
  address: string;
  location: string;
  buildingType: string;
  riskCategory: string;
  streetName?: string;
  streetNo?: string;
  buildingName?: string;
}

function loadBuildingsFromCSV(): Building[] {
  if (buildingsCache) {
    return buildingsCache;
  }

  const csvPath = path.join(process.cwd(), 'server', 'buildings_new.csv');

  if (!fs.existsSync(csvPath)) {
    console.warn('Buildings CSV file not found at:', csvPath);
    return [];
  }

  try {
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    buildingsCache = records.map((record: any, index: number) => {
      const station = record['Station'] || 'TS';
      const sn = record['S/N'] || index;
      const streetName = record['Street\n街名'] || '';
      const streetNo = record['Street No.\n街號'] || '';
      const buildingName = record['Building Name\n大廈名稱'] || 'Unknown';
      const buildingType = record['Building Type\n樓宇類別'] || 'Residential';
      const riskCategory = record['Final/Adjusted Risk Category\n最終風險級數\n'] || record['Preliminary Risk Category\n初步風險級數'] || 'E';

      return {
        id: `${station}-${sn}`,
        lifipsNumber: `${station}-${sn}`,
        address: `${streetName} ${streetNo}`.trim(),
        location: buildingName,
        buildingType: buildingType,
        riskCategory: riskCategory,
        streetName: streetName,
        streetNo: streetNo,
        buildingName: buildingName,
      };
    });

    console.log(`Loaded ${buildingsCache.length} buildings from CSV`);
    return buildingsCache;
  } catch (error) {
    console.error('Error loading buildings from CSV:', error);
    return [];
  }
}

export function searchBuildings(query: string): Building[] {
  const buildings = loadBuildingsFromCSV();
  const lowerQuery = query.toLowerCase();

  return buildings.filter(
    (building) =>
      building.lifipsNumber.toLowerCase().includes(lowerQuery) ||
      building.address.toLowerCase().includes(lowerQuery) ||
      building.location.toLowerCase().includes(lowerQuery) ||
      (building.streetName && building.streetName.toLowerCase().includes(lowerQuery)) ||
      (building.buildingName && building.buildingName.toLowerCase().includes(lowerQuery))
  );
}

export function getBuildingById(id: string): Building | undefined {
  const buildings = loadBuildingsFromCSV();
  return buildings.find((b) => b.id === id);
}

export function getAllBuildings(): Building[] {
  return loadBuildingsFromCSV();
}
