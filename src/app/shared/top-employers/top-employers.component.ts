import { Component, Input } from '@angular/core';
import { JobMarketService, TopEmployerResult } from 'src/app/services/job-market.service';

@Component({
  selector: 'app-top-employers',
  templateUrl: './top-employers.component.html',
  styleUrls: ['./top-employers.component.scss']
})
export class TopEmployersComponent {

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

  public pageSize:number = 10;

  public topEmployers: TopEmployerResult[] = [];
  public allTopEmployers: TopEmployerResult[] = [];
  public page: number = 0;
  public loading = false;
  public error: any;

  public nextAllowed:boolean = false;
  public prevAllowed:boolean = false;

  constructor(private jobMarketService: JobMarketService) { }

  private async titleChange() {
    if (this.title === undefined || this.title.length === 0) {
      this.topEmployers = [];
      this.allTopEmployers = [];
      return;
    }

    this.loading = true;

    try {
      this.allTopEmployers = await this.jobMarketService.fetchTopEmployersForTitle(this.title);
      var tmpNum = 0;
      if(this.allTopEmployers.length > this.pageSize){
        tmpNum = this.pageSize;
        this.nextAllowed = true;
      }else{
        tmpNum = this.allTopEmployers.length;
      }
      this.topEmployers = this.allTopEmployers.slice(0, tmpNum);
    } catch (exception) {
      this.error = exception;
    } finally {
      this.loading = false;
    }
  }

  public async onNextButtonClick(){

    this.page++;
    this.prevAllowed = true;
    var tmpNum = (this.pageSize * (this.page+1))
    if(this.allTopEmployers.length <= tmpNum){
      this.nextAllowed = false;
      tmpNum = this.allTopEmployers.length;
    }
    this.topEmployers = this.allTopEmployers.slice((this.pageSize*this.page), tmpNum);

  }

  public async onPrevButtonClick() {

    this.page--;
    this.nextAllowed = true;
    var tmpNum = (this.pageSize * this.page);
    if(tmpNum === 0){
      this.prevAllowed = false;
    }
    this.topEmployers = this.allTopEmployers.slice(tmpNum, tmpNum + this.pageSize);

  }

}
