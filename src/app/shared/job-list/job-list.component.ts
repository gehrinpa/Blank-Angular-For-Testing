import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ANIMATIONS } from '../../animations';

@Component({
    selector: 'app-job-list',
    templateUrl: './job-list.component.html',
    styleUrls: ['./job-list.component.scss'],
    animations: ANIMATIONS
})
export class JobListComponent implements OnInit {
    @Input() public title: string;
    @Input() public subtitle: string;
    @Input() public jobs: any[];
    @Input() public totalItems: number;

    @Output() pageChanged = new EventEmitter();

    public currentPage: number;

    constructor() { }

    ngOnInit() {
    }

    onPageChanged(e) {
        this.pageChanged.emit(e);
    }
}
