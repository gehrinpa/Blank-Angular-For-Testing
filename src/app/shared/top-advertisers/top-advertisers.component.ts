import { SalaryService } from './../../services/salary.service';
import { Component, Input } from '@angular/core';
import { JobMarketService } from 'src/app/services/job-market.service';
import { SearchParameters } from '../search-parameters';
import moment from 'moment';

@Component({
  selector: 'app-top-advertisers',
  templateUrl: './top-advertisers.component.html',
  styleUrls: ['./top-advertisers.component.scss']
})
export class TopAdvertisersComponent {


  @Input() startDate: Date;
  @Input() endDate: Date;
  @Input() regionCode: string;
  @Input() category: string;
  @Input() regionType: number = 1;
  @Input() titleField: string;

  private _allowedTitles = [];
  @Input() public set allowedTitles(value) {
    if (value.toString() !== this._allowedTitles.toString()) {
      this._allowedTitles = value;
      if(this.title && this.allTopAdvertisers.length === 0){
        this.titleChange();
      }
    }
  }
  public get allowedTitles() {
    return this._allowedTitles;
  }
  
  public title: string;
  @Input() public set jobTitle(value: string) {
    if (value !== this.title) {
      this.title = value;
      this.titleChange();
    }
  }
  public get jobTitle(): string {
    return this.title;
  }


  public topAdvertisers: {company: string, count: number}[] = [];
  public allTopAdvertisers: {company: string, count: number}[] = [];
  public topAdvertisersError: string;

  public pageSize:number = 10;
  public page: number = 0;
  public loading = false;
  public error: any;

  public nextAllowed:boolean = false;
  public prevAllowed:boolean = false;

  searchParams: SearchParameters = {};

  constructor(
    private jobMarketService: JobMarketService,
    private salaryService: SalaryService,
  ) {}

  

  private async titleChange() {
    if(this.title != ''){
      this.searchParams.jobTitle = this.title;
    } else {
      this.searchParams.jobTitle = null;
    }

    if(this.allowedTitles.length === 0 || this.allowedTitles.includes(this.title)){

      this.searchParams.startDate = moment(new Date()).startOf('quarter').subtract(1, 'ms').startOf('quarter').toDate();
  
      this.searchParams.endDate = moment(new Date()).startOf('quarter').subtract(1, 'ms').toDate();
  
      if(this.regionCode){
        this.searchParams.regionCode = this.regionCode;
      } else {
        this.searchParams.regionCode = null;
      }
  
      if(this.regionType){
        this.searchParams.regionType = this.regionType;
      } else {
        this.searchParams.regionType = 1;
      }
  
  
      if(this.category){
        this.searchParams.categories = [this.category];
      } else {
        this.searchParams.categories = null;
      }
  
      this.fetchTopAdvertisers();
    }
  }

  private async fetchTopAdvertisers() {
    if (this.title !== '') {
      this.topAdvertisersError = undefined;
      this.loading = true;
      try {

        if(this.titleField){
          this.allTopAdvertisers = await this.salaryService.getTopAdvertisers(this.searchParams, null, null, null, this.titleField);
        } else {
          this.allTopAdvertisers = await this.salaryService.getTopAdvertisers(this.searchParams);
        }
        var tmpNum = 0;
        if(this.allTopAdvertisers.length > this.pageSize){
          tmpNum = this.pageSize;
          this.nextAllowed = true;
        }else{
          tmpNum = this.allTopAdvertisers.length;
        }
        this.topAdvertisers = this.allTopAdvertisers.slice(0, tmpNum);

      } catch (exception) {
        this.topAdvertisersError = exception;
      } finally {
        this.loading = false;
      }
    } else {
      this.loading = false;
    }
  }

  public async adNextButtonClick(){

    this.page++;
    this.prevAllowed = true;
    var tmpNum = (this.pageSize * (this.page+1))
    if(this.allTopAdvertisers.length <= tmpNum){
      this.nextAllowed = false;
      tmpNum = this.allTopAdvertisers.length;
    }
    this.topAdvertisers = this.allTopAdvertisers.slice((this.pageSize*this.page), tmpNum);

  }

  public async adPrevButtonClick() {

    this.page--;
    this.nextAllowed = true;
    var tmpNum = (this.pageSize * this.page);
    if(tmpNum === 0){
      this.prevAllowed = false;
    }
    this.topAdvertisers = this.allTopAdvertisers.slice(tmpNum, tmpNum + this.pageSize);

  }

}
