import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Observable, of as observableOf, forkJoin } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { JobPostService } from '../../services/job-post.service';
import { SalaryService, SalaryPeriod, JobSalaryResult } from '../../services/salary.service';
import { WorkforcePlanService } from '../../services/workforce-plan.service';

@Component({
    selector: 'app-salary-widget',
    templateUrl: './salary-widget.component.html',
    styleUrls: ['./salary-widget.component.scss']
})
export class SalaryWidgetComponent implements OnInit, OnChanges {

    @Input() sectorId?: number = null;
    @Input() companyId?: number = null;
    @Input() jobFamilies?: string[] = null;

    titleToFamily: {[title: string]: string} = {};

    salaries: JobSalaryResult[] = [];
    familySalaries: JobSalaryResult[] = [];

    familyExpanded: {[family: string]: boolean} = {};

    constructor(private jobPostService: JobPostService, private salaryService: SalaryService,
        private workforcePlanService: WorkforcePlanService) { }

    ngOnInit() {
        // this.loadData();
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
                )
            ),
            // store reverse mappings
            tap(([titleMappings]) => {
                this.titleToFamily = {};
                for (const mapping of titleMappings) {
                    this.titleToFamily[mapping.careerTitle] = mapping.jobFamily;
                }
            }),
            // get salaries
            switchMap(([titleMappings, validRange]) => {
                // for the most recent quarter with valid data
                const startMonth = (validRange.max[1] - 1) * 3;
                const startDate = new Date(Date.UTC(validRange.max[0], startMonth));
                const endDate = new Date(Date.UTC(validRange.max[0], startMonth + 3, 0));

                return this.salaryService.getJobSalaries({startDate, endDate}, SalaryPeriod.Year, titleMappings.map(t => t.careerTitle));
            })
        ).subscribe(salaries => {
            this.salaries = salaries;

            // merge/average families
            this.familySalaries = [];
            const familySalaryCounts = {};
            for (const salary of salaries) {
                const jobFamily = this.titleToFamily[salary.merged_title];
                let familySalary = this.familySalaries.find(s => s.merged_title == jobFamily);

                if (familySalary == null) {
                    familySalary = {
                        count: 0,
                        min: Infinity,
                        max: -Infinity,

                        min_avg: 0,
                        max_avg: 0,

                        merged_title: jobFamily,
                        period: salary.period
                    };
                    this.familySalaries.push(familySalary);
                    familySalaryCounts[jobFamily] = 0;
                }

                familySalary.count += salary.count;
                familySalary.min = Math.min(familySalary.min, salary.min);
                familySalary.max = Math.max(familySalary.max, salary.max);

                familySalary.min_avg += salary.min_avg;
                familySalary.max_avg += salary.max_avg;

                familySalaryCounts[jobFamily]++;
            }

            for (const salary of this.familySalaries) {
                salary.min_avg /= familySalaryCounts[salary.merged_title];
                salary.max_avg /= familySalaryCounts[salary.merged_title];
            }
        });
    }
}
