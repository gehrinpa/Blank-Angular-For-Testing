import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FeatureCollection, Polygon } from 'geojson';
import { Observable, of as observableOf, throwError as observableThrowError } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment as env } from '../../environments/environment';
import { RegionType, SearchParameters } from '../shared';
import { ADZUNA_JOB_CATEGORIES, ADZUNA_JOB_SIC_JERSEY, sectorToAdzunaCategory, sectortoLimitedCategory, ADZUNA_JOB_SIC_UK } from './adzuna-mapping';
import { AuthService } from './auth.service';
import { getHttpParams } from './job-post-params';
import { buildSolrQuery } from './solr-utils';




export interface RegionBoundsResult {
    [id: string]: [[number, number], [number, number]];
}

interface RegionProperties {
    count: number;
    fraction: number;
    name: string;
    dataKey: string; // Key to use for GeoDataResult.regionCounts/Data
}

export interface ChartDataSeriesItem {
    name: string;
    value: number;
}

export interface ChartDataItem {
    name: string;
    series: ChartDataSeriesItem[];
}

export type ChartData = ChartDataItem[];

export type RegionPolygonCollection = FeatureCollection<Polygon, RegionProperties>;

interface NutsChoroplethResult {
    numFound: number;
    NUTS_code: string;
    solrquery: string;
    service: string;
    status: number;

    NUTS_counts: number[];
    NUTS_level: number;
    NUTS_names: string[];
    mergedsector: string;
    num_NUTS: number;
    sector: string;
}

export interface GeoDataResult {
    max: number;
    regionCounts: { [id: string]: number };
    regionData?: { [id: string]: any }; // Optional additional data
}

@Injectable()
export class GeodataService {

    private regionDataCache: { [id: string]: RegionPolygonCollection } = {};

    constructor(private http: HttpClient, private authService: AuthService) { }

    getRegionBounds() {
        return this.http.get<RegionBoundsResult>('/assets/geo/country_bounds.json');
    }

    getRegionGeometry(type: RegionType, country: string = 'gb'): Observable<RegionPolygonCollection> {

        const key = `${country}_${RegionType[type]}`.toLowerCase();
        if (key in this.regionDataCache) {
            return observableOf(this.regionDataCache[key]);
        }

        // Work out region id/name field
        let regionIdField, regionNameField;
        switch (type) {
            case RegionType.NUTS1:
            case RegionType.NUTS2:
            case RegionType.NUTS3:
                regionIdField = 'nutsId';
                regionNameField = 'name';
                break;
            case RegionType.LAU:
                regionIdField = 'lau118cd';
                regionNameField = 'lau118nm';
                break;
            case RegionType.LEP:
                regionIdField = 'lepName';
                regionNameField = 'lepName';
                break;

            default:
                return observableThrowError('Invalid region type');
        }

        // console.log('Network', key);
        return this.http.get<RegionPolygonCollection>(`/assets/geo/${key}.json`).pipe(
            map(data => {
                // Add additional properties
                data.features = data.features.map(feature => {
                    feature.properties = Object.assign(feature.properties, {
                        count: 0,
                        fraction: 0,
                        dataKey: feature.properties[regionIdField],
                        name: feature.properties[regionNameField]
                    });

                    return feature;
                });
                return data;
            }),
            tap(data => {
                // Store in cache
                this.regionDataCache[key] = data;
            })
        );
    }

    getRegionNames(type: RegionType, country: string = 'gb') {
        return this.getRegionGeometry(type, country).pipe(
            map(geom => geom.features.map(f => ({ id: f.properties.dataKey, name: f.properties.name }))
                .sort((a, b) => a.name.localeCompare(b.name))
            ));
    }

    getPeopleGeoData(searchParams: SearchParameters): Observable<GeoDataResult> {
        let regionType = searchParams.regionType;

        if (regionType === undefined) {
            regionType = RegionType.NUTS1;
        }

        if (regionType > RegionType.NUTS3) {
            return observableThrowError("People data only supprts NUTS");
        }

        // Not allowed
        if (searchParams.sector && !this.authService.canViewSector(searchParams.sector)) {
            return observableOf({ max: 0, regionCounts: {} });
        }

        let params = new HttpParams();
        params = params.set('query', buildSolrQuery(searchParams))
            .set('nutslevel', regionType.toString()); // Region types 1-3 = NUTS1-3

        return this.http.get<NutsChoroplethResult>(`${env.analyticsUrl}/nutschoropleth`, { params }).pipe(
            map(data => {
                let max = 0;
                const regionCounts = {};

                // combine keys and values
                data.NUTS_names.forEach((k, i) => {
                    regionCounts[k] = data.NUTS_counts[i];
                    max = Math.max(max, regionCounts[k]);
                });

                return { max, regionCounts };
            })
        );
    }

    getJobGeoData(searchParams: SearchParameters, categories?: string[], sicCode?: boolean): Observable<GeoDataResult> {

        const defSearchParams = Object.assign({}, searchParams);

        if (defSearchParams.regionType === undefined) {
            defSearchParams.regionType = RegionType.NUTS1;
        }

        let params = getHttpParams(this.authService, defSearchParams);

        if (!params) {
            return observableOf({ max: 0, regionCounts: {} });
        } else if (categories && categories.length) {
            categories.forEach(c => params = params.append('category', c));
        }
        if(sicCode){
            params = params.append('sicCode', sicCode.toString());
        }

        return this.http.get(`${env.localJobsApiUrl}/regional-breakdown/`, { params }).pipe(
            map(data => {
                const regionCounts = {};
                let max = 0;
                const regions = Object.keys(data['results']);

                // use LA data
                const regionData = data['results'];

                for (const k of regions) {
                    regionCounts[k] = regionData[k]['count'];
                    delete regionData[k]['count'];

                    if (!this.authService.canViewRegionData(defSearchParams.regionType, k)) {
                        regionData[k] = {};
                    } else if (defSearchParams.regionType == RegionType.LAU) {
                        // Check containing leps
                        const hasVisibleLep = regionData[k].leps.find(lep =>
                            this.authService.canViewRegionData(RegionType.LEP, lep.name)) !== undefined;

                        if (!hasVisibleLep) {
                            regionData[k] = {};
                        }
                    }
                }

                max = Math.max(...regions.map(lau => regionCounts[lau]));

                return { max, regionCounts, regionData };
            })
        );
    }

    getJobChart(type: 'weekly' | 'monthly', year: number, groupBy: string, regionType?: string, regionCode?: string, category?: string[], sicCode?: boolean) {
        let params = new HttpParams()
            .set('year', String(year))
            .set('region_type', regionType)
            .set('region_code', regionCode)
            .set('group_by', groupBy);

        if (category) {
            category.forEach(c => params = params.append('category', c));
        }
        if(sicCode){
            params = params.append('sicCode', sicCode.toString());
        }

        const jersey_regions = ['chi', 'jey', 'ggy', 'imn'];

        return this.http.get<ChartData>(`${env.localJobsApiUrl}/${type}-breakdown`, { params })
            .pipe(
                map(data => data.map(({ name, series }) => ({ 
                    name: groupBy === 'merged_title' ? 
                        name : 
                        sicCode ? 
                            jersey_regions.includes(regionCode.toLowerCase()) ?
                                ADZUNA_JOB_SIC_JERSEY[name] : 
                                ADZUNA_JOB_SIC_UK[name] :
                            ADZUNA_JOB_CATEGORIES[name], 
                    series 
                })
                ))
            );
    }

    getJobChartTotal(type: 'weekly' | 'monthly', year: number, regionType?: string, regionCode?: string, category?: string[], sicCode?: boolean) {
        let params = new HttpParams()
            .set('year', String(year))
            .set('region_type', regionType)
            .set('region_code', regionCode);

        if (category) {
            category.forEach(c => params = params.append('category', c));
        }
        if(sicCode){
            params = params.append('sicCode', sicCode.toString());
        }

        return this.http.get<ChartDataSeriesItem[]>(`${env.localJobsApiUrl}/${type}-breakdown-total`, { params });
    }

    getLiveJobGeoData(searchParams: SearchParameters): Observable<GeoDataResult> {
        let regionType = searchParams.regionType;

        if (regionType === undefined) {
            regionType = RegionType.NUTS1;
        }

        if (regionType != RegionType.NUTS1) {
            return observableThrowError("Live job data only supprts NUTS1");
        }

        const adzunaToNUTS1Map = {
            "north east england": "UKC",
            "north west england": "UKD",
            "yorkshire and the humber": "UKE",
            "east midlands": "UKF",
            "west midlands": "UKG",
            "eastern england": "UKH",
            "london": "UKI",
            "south east england": "UKJ",
            "south west england": "UKK",
            "wales": "UKL",
            "scotland": "UKM",
            "northern ireland": "UKN",
            "channel isles": "CHI"
        };

        let params = new HttpParams();

        // Adzuna api
        if (searchParams.jobTitle || searchParams.skill) {
            params = params.set("what", [searchParams.jobTitle, searchParams.skill].join(" "));
        }

        if (searchParams.sector) {
            // Not allowed
            if (searchParams.sector && !this.authService.canViewSector(searchParams.sector)) {
                return observableOf({ max: 0, regionCounts: {} });
            }

            const cat = sectorToAdzunaCategory(searchParams.sector);
            if (cat) {
                params = params.set("category", cat);
            } else {
                params = params.set("what", [searchParams.sector, searchParams.jobTitle, searchParams.skill].join(" ")); // not great...
            }
        }

        return this.http.get(`${env.apiUrl}/api/jobs/gb/geodata/`, { params }).pipe(
            map(data => {
                let max = 0;
                const regionCounts = {};

                // combine keys and values
                data['locations'].forEach(loc => {
                    const nutsId = adzunaToNUTS1Map[loc.location.area[1].toLowerCase()] || "UKZ";
                    regionCounts[nutsId] = regionCounts[nutsId] || 0;
                    regionCounts[nutsId] += loc.count;
                    max = Math.max(max, regionCounts[nutsId]);
                });

                return { max, regionCounts };
            })
        );
    }
}
