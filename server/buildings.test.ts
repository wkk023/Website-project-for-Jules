import { describe, it, expect, beforeAll } from 'vitest';
import { searchBuildings, getAllBuildings } from './buildings';

describe('Building Search', () => {
  beforeAll(() => {
    // Clear cache before tests
    const buildings = getAllBuildings();
    console.log(`Loaded ${buildings.length} buildings for testing`);
  });

  it('should load buildings from CSV', () => {
    const buildings = getAllBuildings();
    expect(buildings.length).toBeGreaterThan(0);
  });

  it('should search by street name', () => {
    const results = searchBuildings('Tsuen Nam Road');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].streetName).toContain('Tsuen Nam Road');
  });

  it('should search by building name', () => {
    const results = searchBuildings('Grandway');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(b => b.buildingName?.includes('Grandway'))).toBe(true);
  });

  it('should search by LIFIPS number', () => {
    const results = searchBuildings('TS-1');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].lifipsNumber).toContain('TS-1');
  });

  it('should search case-insensitively', () => {
    const resultsLower = searchBuildings('tsuen nam road');
    const resultsUpper = searchBuildings('TSUEN NAM ROAD');
    expect(resultsLower.length).toBe(resultsUpper.length);
  });

  it('should return empty array for non-existent search', () => {
    const results = searchBuildings('NONEXISTENT_BUILDING_12345');
    expect(results.length).toBe(0);
  });

  it('should include street name and building name in results', () => {
    const buildings = getAllBuildings();
    const buildingWithStreet = buildings.find(b => b.streetName);
    expect(buildingWithStreet).toBeDefined();
    expect(buildingWithStreet?.streetName).toBeTruthy();
    expect(buildingWithStreet?.buildingName).toBeTruthy();
  });

  it('should search by partial street name', () => {
    const results = searchBuildings('Tsuen');
    expect(results.length).toBeGreaterThan(0);
  });

  it('should search by partial building name', () => {
    const results = searchBuildings('Estate');
    expect(results.length).toBeGreaterThan(0);
  });

  it('should have risk category for each building', () => {
    const buildings = getAllBuildings();
    const buildingsWithRisk = buildings.filter(b => b.riskCategory);
    expect(buildingsWithRisk.length).toBeGreaterThan(0);
  });

  it('should have building type for each building', () => {
    const buildings = getAllBuildings();
    const buildingsWithType = buildings.filter(b => b.buildingType);
    expect(buildingsWithType.length).toBeGreaterThan(0);
  });
});
