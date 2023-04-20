import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ANIMATIONS } from '../../animations';

@Component({
  selector: 'app-news-list',
  templateUrl: './news-list.component.html',
  styleUrls: ['./news-list.component.scss'],
  animations: ANIMATIONS
})
export class NewsListComponent implements OnInit {
    @Input() public title: string;
    // @Input() public subtitle: string;
    @Input() public articles: any[];
    @Input() public totalItems: number;

    public sentimentRanges: number[] = [-0.1, 0.1];
    public itemsPerPage:number = 10;
    public appliedFilters: string[] = [];


    @Output() pageChanged = new EventEmitter();

    public currentPage: number;

    constructor() { }

    ngOnInit() {
    }

    onPageChanged(e?: {}, filter?: string) {
      if(filter) {
        this.currentPage = 1;
        if(this.appliedFilters.includes(filter)){
          this.appliedFilters = this.appliedFilters.filter((obj) => {
            return obj !== filter;
          });
        } else {
          this.appliedFilters.push(filter);
        }
      }

      if(!e){
        if(!this.currentPage)
          this.currentPage = 1;
        e = {
          page: this.currentPage,
          itemsPerPage: this.itemsPerPage.toString()
        };
      }

      e['filters'] = this.appliedFilters;

      this.pageChanged.emit(e);
    }

}
