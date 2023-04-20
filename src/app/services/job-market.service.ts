import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface JobAdvertResult {
  company: string;
  description: string;
  url: string;
}

export interface TopEmployerResult {
  count: number;
  employer: string;
}

@Injectable({
  providedIn: 'root'
})
export class JobMarketService {

  constructor(private authService: AuthService, private http: HttpClient) { }

  public async fetchSampleJobAdvertsForTitle(title: string, company: string): Promise<JobAdvertResult[]> {
    const url = `${environment.localJobsApiUrl}/jobs-at-company/?title=${title}&company=${company}`;
    const jobAdvertsResponse = await this.http.get(url).toPromise<any>();
    if (jobAdvertsResponse.status === "OK") {
      return jobAdvertsResponse.results;
    } else {
      throw new Error("Invalid response " + jobAdvertsResponse.status);
    }
  }

  public async fetchTopEmployersForTitle(title: string): Promise<TopEmployerResult[]> {
    const query = "query=+title:\"" + title + "\"&nuts=UK";
    const employersResponse = await this.http.get(`${environment.analyticsUrl}/companycloud?${query}`).toPromise<any>();
    if (employersResponse.status === 200) {
      const result: TopEmployerResult[] = [];
      const names = employersResponse.company_names;
      const counts = employersResponse.company_counts;
      if (names && counts) {
        for (let i = 0; i < names.length; i++) {
          const name = names[i];
          const count = counts[i];
          result.push({
            employer: name,
            count: count
          });
        }
      }
      return result;
    } else {
      throw new Error("Invalid response " + employersResponse.status);
    }
  }

}
