import { nutsToAdzunaLocation, sectorToAdzunaCategory } from "./adzuna-mapping";



describe('AdzunaMapping', () => {

  it('should map NUTS levels correctly', () => {
    expect(nutsToAdzunaLocation('UK')).toEqual(['UK']);
    expect(nutsToAdzunaLocation('UKC')).toEqual(['UK', 'North East England']);
    expect(nutsToAdzunaLocation(undefined)).toEqual(['UK']);
    expect(nutsToAdzunaLocation('NOTNUTS')).toEqual(['UK']);
  });

  it('should map sectors to categories correctly', () => {
    expect(sectorToAdzunaCategory('digital tech')).toEqual('it-jobs');
    expect(sectorToAdzunaCategory('Digital Tech')).toEqual('it-jobs');
    expect(sectorToAdzunaCategory('Imaginary Sector')).toBeNull();
  });
});
