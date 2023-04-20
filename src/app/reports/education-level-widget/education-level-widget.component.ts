import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Observable, of as observableOf, forkJoin } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { CourseService } from '../../services/course.service';

@Component({
    selector: 'app-education-level-widget',
    templateUrl: './education-level-widget.component.html',
    styleUrls: ['./education-level-widget.component.scss']
})
export class EducationLevelWidgetComponent implements OnInit, OnChanges {

    levels: {level: number, count: number}[] = [];

    constructor(private courseService: CourseService) { }

    ngOnInit() {
        this.loadData();
    }

    ngOnChanges() {
        this.loadData();
    }

    private loadData() {
        this.courseService.getEnrollmentByLevel().subscribe(data => {
            this.levels = [];
            for (const level of Object.keys(data)) {
                if (+level == 0) {
                    continue;
                }

                this.levels.push({level: +level, count: data[level]});
            }

            this.levels.sort((a, b) => a.level - b.level);

            console.log(this.levels);
        });
    }
}
