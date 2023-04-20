import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { SkillsService } from './skills.service';
import { SearchParameters, RegionType } from '../shared';
import { environment } from '../../environments/environment';

const skills = [ 'JavaScript', 'HTML', 'CSS' ];

const mockDescriptionResult = {
  results: [
    {
      name: 'JavaScript',
      approved: 'Dave',
      text: 'blah'
    }, {
      name: 'HTML',
      text: 'blah'
    }, {
      name: 'CSS',
      approved: 'John',
      text: 'blah'
    }
  ]
};

describe('SkillsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SkillsService],
      imports: [HttpClientTestingModule]
    });
  });

  it('should be created', inject([SkillsService], (service: SkillsService) => {
    expect(service).toBeTruthy();
  }));

  it('should send correct params for skill cloud', inject([SkillsService, HttpTestingController],
    (service: SkillsService, httpMock: HttpTestingController) => {

    const company = 'CompanyName.website';
    const searchParams: SearchParameters = { company };

    service.getSkillCloud(searchParams).subscribe(data => {}, err => console.log(err));

    // const req = httpMock.expectOne(`${environment.analyticsUrl}/skillcloud`);
    const req = httpMock.expectOne(r => r.url == `${environment.analyticsUrl}/skillcloud`);

    expect(req.request.params.get('query')).toBe(`+current_company_l:"${company}"`);
    expect(req.request.params.get('nuts')).toBe('UK');
    req.flush({});

    httpMock.verify();
  }));

  it('should send correct params for skill descriptions', inject([SkillsService, HttpTestingController],
    (service: SkillsService, httpMock: HttpTestingController) => {

    service.getSkillDescriptions(skills).subscribe(data => {});

    // const req = httpMock.expectOne(environment.descriptionsUrl);
    const req = httpMock.expectOne(r => r.url == environment.descriptionsUrl);

    req.request.params.getAll('q').forEach((q, i) => expect(q).toBe(skills[i]));
    expect(req.request.params.get('type')).toBe('skill');
    req.flush(mockDescriptionResult);

    httpMock.verify();
  }));

  it('should not send a request for an empty skill list', inject([SkillsService, HttpTestingController],
    (service: SkillsService, httpMock: HttpTestingController) => {

    service.getSkillDescriptions([]).subscribe(data => {
      expect(data.length).toBe(0);
    });
    httpMock.verify();
  }));

  it('should only return approved skill descriptions', inject([SkillsService, HttpTestingController],
    (service: SkillsService, httpMock: HttpTestingController) => {

    service.getSkillDescriptions(skills).subscribe(results => {
      expect(results.length).toBe(2);
      expect(results[0].name).toBe('JavaScript');
      expect(results[1].name).toBe('CSS');
    });

    // const req = httpMock.expectOne(environment.descriptionsUrl);
    const req = httpMock.expectOne(r => r.url == environment.descriptionsUrl);
    req.flush(mockDescriptionResult);

    httpMock.verify();
  }));

  it('should send correct params for skill chart', inject([SkillsService, HttpTestingController],
    (service: SkillsService, httpMock: HttpTestingController) => {

    const company = 'CompanyName.website';
    const searchParams: SearchParameters = { company, regionCode: 'UKC' };

    service.getSkillsBarChartData(searchParams).subscribe(data => {});

    // const req = httpMock.expectOne(`${environment.analyticsUrl}/skillcloud`);
    const req = httpMock.expectOne(r => r.url == `${environment.analyticsUrl}/skillcloud`);

    expect(req.request.params.get('query')).toBe(`+current_company_l:"${company}"`);
    expect(req.request.params.get('nuts')).toBe('UKC');
    // expect(req.request.params.get('rank')).toBe('rawfreq');
    req.flush({});

    httpMock.verify();
  }));

  it('should send correct params for job skills', inject([SkillsService, HttpTestingController],
    (service: SkillsService, httpMock: HttpTestingController) => {

    const sector = 'digital tech';
    const searchParams: SearchParameters = {
        sector,
        regionCode: 'UKC',
        regionType: RegionType.NUTS1
    };

    service.getJobSkills(searchParams).subscribe(data => {});

    // const req = httpMock.expectOne(`${environment.localJobsApiUrl}/merged-title-skills/`);
    const req = httpMock.expectOne(r => {
        console.log(r.url, `${environment.localJobsApiUrl}/merged-title-skills/`);
        return r.url == `${environment.localJobsApiUrl}/merged-title-skills/`;
    });

    expect(req.request.params.get('category')).toBe('it-jobs');
    expect(req.request.params.get('region')).toBe('UKC');
    expect(req.request.params.get('region_type')).toBe('nuts1');
    req.flush({});

    httpMock.verify();
  }));

  it('should correctly format dates for job skills', inject([SkillsService, HttpTestingController],
    (service: SkillsService, httpMock: HttpTestingController) => {

    const sector = 'digital tech';
    const searchParams: SearchParameters = {
        regionType: RegionType.NUTS1,
        startDate: new Date(Date.UTC(1993, 5, 26)),
        endDate: new Date(1995, 2, 8),
    };

    service.getJobSkills(searchParams).subscribe(data => {});

    // const req = httpMock.expectOne(`${environment.localJobsApiUrl}/merged-title-skills/`);
    const req = httpMock.expectOne(r => {
        return r.url == `${environment.localJobsApiUrl}/merged-title-skills/`;
    });

    expect(req.request.params.get('start_date')).toBe('1993-06-26');
    expect(req.request.params.get('end_date')).toBe('1995-03-08');
    req.flush({});

    httpMock.verify();
  }));
});
