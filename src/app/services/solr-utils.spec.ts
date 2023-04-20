import { SearchParameters } from '../shared';
import { buildSolrQuery } from './solr-utils';

describe('SolrUtils', () => {

  it('should build SOLR queries correctly', () => {

    const company = 'CompanyName.website';
    const sector = 'Test Sector';
    const skill = 'JavaScript';
    const jobTitle = 'Developer';

    const searchParams: SearchParameters[] = [
      {
        company
      }, {
        sector
      }, {
        skill
      }, {
        jobTitle
      }, {
        company,
        sector,
        skill,
        jobTitle
      },
      {
        company,
        skill: '',
        jobTitle: ''
      }
    ];

    const queries = [
      `+current_company_l:"${company}"`,
      `+merged_sector_l:"${sector}"`,
      `+skills_l:"${skill}"`,
      `+title_l:"${jobTitle}"`,
      `+current_company_l:"${company}" AND +merged_sector_l:"${sector}" AND +title_l:"${jobTitle}" AND +skills_l:"${skill}"`,
      `+current_company_l:"${company}"`
    ];

    searchParams.forEach((s, i) => {
      expect(buildSolrQuery(s)).toBe(queries[i]);
    });
  });
});
