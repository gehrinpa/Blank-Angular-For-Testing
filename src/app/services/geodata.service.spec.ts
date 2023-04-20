import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { AuthService } from './auth.service';
import { GeodataService } from './geodata.service';
import { SearchParameters, RegionType } from '../shared';
import { environment } from '../../environments/environment';


const mockNUTS = {
  features: [
    {
        properties: {
          nutsId: 'ZZ000',
          name: 'Test Region B'
        }
    },
    {
      properties: {
        nutsId: 'ZZ001',
        name: 'Test Region A'
      }
    }
  ]
};

const mockLAU = {
  features: [
    {
      properties: {
        lau118cd: 'Z00000000',
        lau118nm: 'Test Region C'
      }
    },
    {
      properties: {
        lau118cd: 'Z00000001',
        lau118nm: 'Test Region D'
      }
    }
  ]
};

const mockLEP = {
  features: [
    {
      properties: {
        lepName: 'Test Region E'
      }
    },
    {
      properties: {
        lepName: 'Test Region F'
      }
    }
  ]
};

const mockPeopleData = {
  NUTS_names: ['ZZ000', 'ZZ001', 'ZZ002'],
  NUTS_counts: [2, 3, 5]
};

const mockJobData = {
  results: {
    'ZZ000': {
      count: 13,
      mergedTitles: {
        'Developer': 2
      }
    },
    'ZZ001': {
      count: 11,
      mergedTitles: {
        'Developer': 3
      }
    },
    'ZZ002': {
      count: 7,
      mergedTitles: {
        'Developer': 5
      }
    }
  }
};

const mockLiveJobData = {
  locations: [
    {
      location: {
        area: [ "UK", "North East England" ]
      },
      count: 13
    },
    {
      location: {
        area: [ "UK", "North West England" ]
      },
      count: 11
    },
    {
      location: {
        area: [ "UK", "Other" ]
      },
      count: 7
    }
  ]
};

describe('GeodataService', () => {
  beforeEach(() => {
    const authServiceStub = {
      canViewRegionData() { return true; },
      canViewSector() { return true; }
    };
    TestBed.configureTestingModule({
      providers: [
        GeodataService,
        { provide: AuthService, useValue: authServiceStub }
      ],
      imports: [HttpClientTestingModule]
    });
  });

  it('should be created', inject([GeodataService], (service: GeodataService) => {
    expect(service).toBeTruthy();
  }));

  it('should GET country_bounds.json', inject([GeodataService, HttpTestingController],
    (service: GeodataService, httpMock: HttpTestingController) => {

    service.getRegionBounds().subscribe(bounds => {
      expect(bounds['TEST']).toBeDefined();
    });

    const req = httpMock.expectOne('/assets/geo/country_bounds.json');
    expect(req.request.method).toEqual('GET');

    req.flush({'TEST': [[0, 0], [1, 1]]});

    httpMock.verify();
  }));

  it('should GET geometry on first request', inject([GeodataService, HttpTestingController],
    (service: GeodataService, httpMock: HttpTestingController) => {

    service.getRegionGeometry(RegionType.NUTS1).subscribe(data => {
      expect(data).toBeDefined();
    });

    const req = httpMock.expectOne('/assets/geo/gb_nuts1.json');
    expect(req.request.method).toEqual('GET');

    req.flush({
      features: []
    });

    httpMock.verify();
  }));

  it('should return geometry from cache on later requests', inject([GeodataService, HttpTestingController],
    (service: GeodataService, httpMock: HttpTestingController) => {

    service.getRegionGeometry(RegionType.NUTS1).subscribe(data => {
      service.getRegionGeometry(RegionType.NUTS1).subscribe(data2 => {
        expect(data2).toBe(data);
      });
    });

    const req = httpMock.expectOne('/assets/geo/gb_nuts1.json');
    expect(req.request.method).toEqual('GET');

    req.flush({
      features: []
    });

    httpMock.verify();
  }));

  it('should map NUTS fields correctly', inject([GeodataService, HttpTestingController],
    (service: GeodataService, httpMock: HttpTestingController) => {

    service.getRegionGeometry(RegionType.NUTS1).subscribe(data => {
      expect(data.features.length).toBe(mockNUTS.features.length);

      data.features.forEach((feature, i) => {
        expect(feature.properties.name).toBe(mockNUTS.features[i].properties.name);
        expect(feature.properties.dataKey).toBe(mockNUTS.features[i].properties.nutsId);
      });
    });

    const req = httpMock.expectOne('/assets/geo/gb_nuts1.json');
    expect(req.request.method).toEqual('GET');

    req.flush(mockNUTS);

    httpMock.verify();
  }));

  it('should map LAU fields correctly', inject([GeodataService, HttpTestingController],
    (service: GeodataService, httpMock: HttpTestingController) => {

    service.getRegionGeometry(RegionType.LAU).subscribe(data => {
      expect(data.features.length).toBe(mockLAU.features.length);

      data.features.forEach((feature, i) => {
        expect(feature.properties.name).toBe(mockLAU.features[i].properties.lau118nm);
        expect(feature.properties.dataKey).toBe(mockLAU.features[i].properties.lau118cd);
      });
    });

    const req = httpMock.expectOne('/assets/geo/gb_lau.json');
    expect(req.request.method).toEqual('GET');

    req.flush(mockLAU);

    httpMock.verify();
  }));

  it('should map LEP fields correctly', inject([GeodataService, HttpTestingController],
    (service: GeodataService, httpMock: HttpTestingController) => {

    service.getRegionGeometry(RegionType.LEP).subscribe(data => {
      expect(data.features.length).toBe(mockLEP.features.length);

      data.features.forEach((feature, i) => {
        expect(feature.properties.name).toBe(mockLEP.features[i].properties.lepName);
        expect(feature.properties.dataKey).toBe(mockLEP.features[i].properties.lepName);
      });
    });

    const req = httpMock.expectOne('/assets/geo/gb_lep.json');
    expect(req.request.method).toEqual('GET');

    req.flush(mockLEP);

    httpMock.verify();
  }));

  it('should sort region names', inject([GeodataService, HttpTestingController],
    (service: GeodataService, httpMock: HttpTestingController) => {

    service.getRegionNames(RegionType.NUTS2).subscribe(data => {
      expect(data[0].name).toBe('Test Region A');
      expect(data[1].name).toBe('Test Region B');

      expect(data[0].id).toBe('ZZ001');
      expect(data[1].id).toBe('ZZ000');
    });

    const req = httpMock.expectOne('/assets/geo/gb_nuts2.json');
    expect(req.request.method).toEqual('GET');

    req.flush(mockNUTS);

    httpMock.verify();
  }));

  // people
  it('should merge people data correctly', inject([GeodataService, HttpTestingController],
    (service: GeodataService, httpMock: HttpTestingController) => {

    const company = 'CompanyName.website';

    const searchParams: SearchParameters = { company, regionType: RegionType.NUTS1};

    service.getPeopleGeoData(searchParams).subscribe(data => {
      expect(data.max).toBe(5);

      mockPeopleData.NUTS_names.forEach((name, i) =>
        expect(data.regionCounts[name]).toBe(mockPeopleData.NUTS_counts[i]));
    });

    // const req = httpMock.expectOne(`${environment.analyticsUrl}/nutschoropleth`);
    const req = httpMock.expectOne(r => r.url == `${environment.analyticsUrl}/nutschoropleth`);
    req.flush(mockPeopleData);

    httpMock.verify();
  }));

  // jobs
  it('should map job data correctly', inject([GeodataService, HttpTestingController],
    (service: GeodataService, httpMock: HttpTestingController) => {

    const searchParams: SearchParameters = { regionType: RegionType.NUTS1 };

    service.getJobGeoData(searchParams).subscribe(data => {
      expect(data.max).toBe(13);

      Object.keys(mockJobData.results).forEach(name => {
        const mockData = mockJobData.results[name];
        expect(data.regionCounts[name]).toBe(mockData.count);
      });
    });

    // const req = httpMock.expectOne(`${environment.localJobsApiUrl}/regional-breakdown/`);
    const req = httpMock.expectOne(r => r.url == `${environment.localJobsApiUrl}/regional-breakdown/`);
    // clone it
    const data = JSON.parse(JSON.stringify(mockJobData));

    req.flush(data);

    httpMock.verify();
  }));

  it('should format dates for job data correctly', inject([GeodataService, HttpTestingController],
    (service: GeodataService, httpMock: HttpTestingController) => {

    const searchParams: SearchParameters = {
        regionType: RegionType.NUTS1,
        startDate: new Date(Date.UTC(1993, 5, 26)),
        endDate: new Date(1995, 2, 8),
    };

    service.getJobGeoData(searchParams).subscribe(data => {
    });

    // const req = httpMock.expectOne(`${environment.localJobsApiUrl}/regional-breakdown/`);
    const req = httpMock.expectOne(r => r.url == `${environment.localJobsApiUrl}/regional-breakdown/`);

    expect(req.request.params.get('start_date')).toBe('1993-06-26');
    expect(req.request.params.get('end_date')).toBe('1995-03-08');

    // clone it
    const data = JSON.parse(JSON.stringify(mockJobData));

    req.flush(data);

    httpMock.verify();
  }));

  // live jobs
  it('should map live job data correctly', inject([GeodataService, HttpTestingController],
    (service: GeodataService, httpMock: HttpTestingController) => {

    const searchParams: SearchParameters = { regionType: RegionType.NUTS1 };

    service.getLiveJobGeoData(searchParams).subscribe(data => {
      expect(data.max).toBe(13);

      expect(data.regionCounts['UKC']).toBe(mockLiveJobData.locations[0].count);
      expect(data.regionCounts['UKD']).toBe(mockLiveJobData.locations[1].count);
      expect(data.regionCounts['UKZ']).toBe(mockLiveJobData.locations[2].count);
    });

    // const req = httpMock.expectOne(`${environment.apiUrl}/api/jobs/gb/geodata/`);
    const req = httpMock.expectOne(r => r.url == `${environment.apiUrl}/api/jobs/gb/geodata/`);

    // clone it
    const data = JSON.parse(JSON.stringify(mockLiveJobData));
    req.flush(data);

    httpMock.verify();
  }));

  it('should send correct params for live jobs', inject([GeodataService, HttpTestingController],
    (service: GeodataService, httpMock: HttpTestingController) => {

    // no params
    let searchParams: SearchParameters = {};

    service.getLiveJobGeoData(searchParams).subscribe(data => {});

    let req = httpMock.expectOne(r => r.url == `${environment.apiUrl}/api/jobs/gb/geodata/`);

    expect(req.request.params.get('category')).toBeNull();
    expect(req.request.params.get('what')).toBeNull();

    // clone it
    let data = JSON.parse(JSON.stringify(mockLiveJobData));
    req.flush(data);

    // params
    searchParams = {
        sector: 'digital tech',
        skill: 'javascript',
        jobTitle: 'software developer'
    };

    service.getLiveJobGeoData(searchParams).subscribe(data => {});

    req = httpMock.expectOne(r => r.url == `${environment.apiUrl}/api/jobs/gb/geodata/`);

    expect(req.request.params.get('category')).toBe('it-jobs');
    expect(req.request.params.get('what')).toBe([searchParams.jobTitle, searchParams.skill].join(' '));

    // clone it
    data = JSON.parse(JSON.stringify(mockLiveJobData));
    req.flush(data);

    httpMock.verify();
  }));
  // TODO: test category mapping
});
