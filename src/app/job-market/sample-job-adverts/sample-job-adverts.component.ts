import { Component, Input } from '@angular/core';
import { JobMarketService, JobAdvertResult } from 'src/app/services/job-market.service';
import { TopAdvertiserResult } from 'src/app/services/salary.service';

@Component({
  selector: 'app-sample-job-adverts',
  templateUrl: './sample-job-adverts.component.html',
  styleUrls: ['./sample-job-adverts.component.scss']
})
export class SampleJobAdvertsComponent {

  private title: string;
  @Input() public set jobTitle(value: string) {
    if (value !== this.title) {
      this.title = value;
      this.titleChange();
    }
  }
  public get jobTitle(): string {
    return this.title;
  }

  private advertiser: TopAdvertiserResult;
  @Input() public set topAdvertiser(value: TopAdvertiserResult) {
    if (value !== this.advertiser) {
      this.advertiser = value;
      this.advertiserChange();
    }
  }
  public get topAdvertiser(): TopAdvertiserResult {
    return this.advertiser;
  }

  public sampleJobAds: JobAdvertResult[] = [];
  public loading = false;
  public currentIndex = 0;
  public error: any;

  constructor(private jobMarketService: JobMarketService) { }

  private async titleChange() {
    this.fetch();
  }

  private async advertiserChange() {
    this.fetch();
  }

  private async fetch() {
    this.loading = true;
    this.sampleJobAds = [];
    this.currentIndex = 0;
    this.error = undefined;

    if (this.title && this.advertiser && this.advertiser.company) {
      try {
        this.sampleJobAds = await this.jobMarketService.fetchSampleJobAdvertsForTitle(this.title, this.advertiser.company);
      } catch (exception) {
        this.error = exception;
      } finally {
        this.loading = false;
      }
    }
  }

  public shouldShowPrevious() {
    return this.currentIndex > 0;
  }

  public shouldShowNext() {
    return this.currentIndex < this.sampleJobAds.length - 1;
  }

  public previousClicked() {
    this.currentIndex = this.currentIndex - 1;
  }

  public nextClicked() {
    this.currentIndex = this.currentIndex + 1;
  }

}
