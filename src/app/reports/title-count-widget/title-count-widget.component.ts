import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Observable, of as observableOf, forkJoin } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { JobPostService } from '../../services/job-post.service';
import { WorkforcePlanService } from '../../services/workforce-plan.service';

@Component({
    selector: 'app-title-count-widget',
    templateUrl: './title-count-widget.component.html',
    styleUrls: ['./title-count-widget.component.scss']
})
export class TitleCountWidgetComponent implements OnInit, OnChanges {

    @Input() sectorId?: number = null;
    @Input() companyId?: number = null;
    @Input() jobFamilies?: string[] = null;

    titleToFamily: {[title: string]: string} = {};

    familyCounts: {title: string, count: number}[] = [];
    titleCounts: {title: string, count: number}[] = [];

    familyExpanded: {[family: string]: boolean} = {};

    constructor(private jobPostService: JobPostService, private workforcePlanService: WorkforcePlanService) { }

    ngOnInit() {
    }

    ngOnChanges() {
        this.loadData();
    }

    private loadData() {
        this.familyExpanded = {};

        let jobFamilyRes: Observable<string[]>;

        if  (this.jobFamilies != null) {
            jobFamilyRes = observableOf(this.jobFamilies);
        } else {
            jobFamilyRes = this.workforcePlanService.listDistinctJobFamilies(this.sectorId, this.companyId);
        }

        jobFamilyRes.pipe(
            // map to job titles
            switchMap(jobFamilies =>
                forkJoin(
                    this.workforcePlanService.listJobFamilyMappings(this.sectorId, this.companyId, jobFamilies),
                    // and get valid date range
                    this.jobPostService.getValidQuarterRange()
                )),
            // store reverse mappings
            tap(([titleMappings]) => {
                this.titleToFamily = {};
                for (const mapping of titleMappings) {
                    this.titleToFamily[mapping.careerTitle] = mapping.jobFamily;
                }
            }),
            // get counts
            switchMap(([titleMappings, validRange]) => {
                // for the most recent quarter with valid data
                const startMonth = (validRange.max[1] - 1) * 3;
                const startDate = new Date(Date.UTC(validRange.max[0], startMonth));
                const endDate = new Date(Date.UTC(validRange.max[0], startMonth + 3, 0));

                return this.jobPostService.getCountHistory({startDate, endDate}, titleMappings.map(t => t.careerTitle));
            })
        ).subscribe(counts => {
            // merge all titles
            this.titleCounts = [];
            this.familyCounts = [];

            for (const count of counts) {
                const title = count.merged_title;
                let titleData = this.titleCounts.find(d => d.title == title);
                let familyData = this.familyCounts.find(d => d.title == this.titleToFamily[title]);

                if (titleData == null) {
                    titleData = { title, count: 0 };
                    this.titleCounts.push(titleData);
                }

                if (familyData == null) {
                    familyData = { title: this.titleToFamily[title], count: 0} ;
                    this.familyCounts.push(familyData);
                }

                titleData.count += count.count;
                familyData.count += count.count;
            }
        });
    }
}
