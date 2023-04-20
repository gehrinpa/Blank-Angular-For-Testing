import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { JobPostService, JobPostGroupPeriod } from '../../services/job-post.service';
import { SalaryService, SalaryPeriod, SalaryGroupPeriod } from '../../services/salary.service';
import { WorkforcePlanService, WorkforcePlanResult, WorkforcePlanRoleResult } from '../../services/workforce-plan.service';

// TODO: duplicated from enquiry-dashboard
interface SingleSeriesChartItem {
    name: string;
    value: number;
}

interface MultiSeriesChartItem {
    name: string;
    series: {
        name: string;
        value: number;
    }[];
}

@Component({
    selector: 'app-workforce-plan-dashboard',
    templateUrl: './workforce-plan-dashboard.component.html',
    styleUrls: ['./workforce-plan-dashboard.component.scss']
})
export class WorkforcePlanDashboardComponent implements OnInit {

    plan: WorkforcePlanResult;
    roles: WorkforcePlanRoleResult[] = [];
    areas: string[] = [];
    jobFamilies: string[] = [];

    // filters
    jobFamilyFilter = '';
    functionalAreaFilter = '';

    dateGroup = 'month';

    // charts
    jobFamilyByYearPies: {label: string, count: number, data: SingleSeriesChartItem[]}[] = [];
    jobFamiliesByYearBar: MultiSeriesChartItem[] = [];
    jobFamilyRecruitmentByYearBar: MultiSeriesChartItem[] = [];
    jobAdsOverTimeChart: MultiSeriesChartItem[] = [];
    salaryOverTimeChart: MultiSeriesChartItem[] = [];

    constructor(private route: ActivatedRoute, private jobPostService: JobPostService,
        private salaryService: SalaryService, private workforcePlanService: WorkforcePlanService) { }

    ngOnInit() {
        this.route.paramMap.pipe(
            switchMap(params => this.workforcePlanService.get(+params.get('id')))
        ).subscribe(plan => {
            this.plan = plan;
            this.workforcePlanService.listRolesForPlan(plan.id).subscribe(roles => {
                this.roles = roles;

                // get areas/families
                this.areas = [];
                this.jobFamilies = [];
                for (const role of roles) {
                    if (!this.areas.includes(role.functionalArea)) {
                        this.areas.push(role.functionalArea);
                    }

                    if (!this.jobFamilies.includes(role.jobFamily)) {
                        this.jobFamilies.push(role.jobFamily);
                    }
                }

                this.updateData();
            });
        });
    }

    updateFilters() {
        this.updateData();
    }

    dateGroupingChanged() {
        this.updateJobAdData();
    }

    getPieTooltip(tip) {
        return `<span class="tooltip-label">${tip.data.name}</span><span class="tooltip-val">${tip.data.value.toFixed(1)}%</span>`;
    }

    private updateData() {
        const years = this.workforcePlanService.getPlanYears(this.plan);

        const currentFamilies = {
            label: `${years[0]}`,
            count: 0,
            data: []
        };

        const ye1Families = {
            label: `${years[1]}`,
            count: 0,
            data: []
        };

        const ye2Families = {
            label: `${years[2]}`,
            count: 0,
            data: []
        };

        const ye3Families = {
            label: `${years[3]}`,
            count: 0,
            data: []
        };

        this.jobFamiliesByYearBar = [];
        this.jobFamilyRecruitmentByYearBar = [];

        for (const role of this.roles) {
            // filters
            if (this.jobFamilyFilter != '' && role.jobFamily != this.jobFamilyFilter) {
                continue;
            }

            if (this.functionalAreaFilter != '' && role.functionalArea != this.functionalAreaFilter) {
                continue;
            }

            // pies
            const jobFamily = role.jobFamily || 'Other';

            // job family breakdown / year
            let currentFamilyData = currentFamilies.data.find(f => f.name == jobFamily);
            if (currentFamilyData == null) {
                currentFamilyData = {name: jobFamily, value: 0};

                currentFamilies.data.push(currentFamilyData);

                // copy to the other charts
                ye1Families.data.push(Object.assign({}, currentFamilyData));
                ye2Families.data.push(Object.assign({}, currentFamilyData));
                ye3Families.data.push(Object.assign({}, currentFamilyData));
            }

            const ye1FamilyData = ye1Families.data.find(f => f.name == jobFamily);
            const ye2FamilyData = ye2Families.data.find(f => f.name == jobFamily);
            const ye3FamilyData = ye3Families.data.find(f => f.name == jobFamily);

            currentFamilyData.value += role.currentHeadcount;
            currentFamilies.count += role.currentHeadcount;

            ye1FamilyData.value += role.year1Headcount;
            ye1Families.count += role.year1Headcount;

            ye2FamilyData.value += role.year2Headcount;
            ye2Families.count += role.year2Headcount;

            ye3FamilyData.value += role.year3Headcount;
            ye3Families.count += role.year3Headcount;

            // bar
            const getInitialBarData = () => ({
                name: jobFamily,
                series: [
                    {
                        name: `${years[0]}`,
                        value: 0
                    },
                    {
                        name: `${years[1]}`,
                        value: 0
                    },
                    {
                        name: `${years[2]}`,
                        value: 0
                    },
                    {
                        name: `${years[3]}`,
                        value: 0
                    }
                ]
            });

            let barFamilyData = this.jobFamiliesByYearBar.find(f => f.name == jobFamily);
            let barRecruitData = this.jobFamilyRecruitmentByYearBar.find(f => f.name == jobFamily);

            // total workforce
            if (barFamilyData == null) {
                barFamilyData = getInitialBarData();

                this.jobFamiliesByYearBar.push(barFamilyData);
            }

            barFamilyData.series[0].value += role.currentHeadcount;
            barFamilyData.series[1].value += role.year1Headcount;
            barFamilyData.series[2].value += role.year2Headcount;
            barFamilyData.series[3].value += role.year3Headcount;

            // recruitment
            if (barRecruitData == null) {
                barRecruitData = getInitialBarData();

                // replace current with attrition
                barRecruitData.series[0].name = "Attrition";
                barRecruitData.series.push(barRecruitData.series.shift());

                this.jobFamilyRecruitmentByYearBar.push(barRecruitData);
            }

            barRecruitData.series[0].value += role.year1Headcount - role.currentHeadcount;
            barRecruitData.series[1].value += role.year2Headcount - role.year1Headcount;
            barRecruitData.series[2].value += role.year3Headcount - role.year2Headcount;
            barRecruitData.series[3].value += role.forecastAttrition;
        }

        // convert to percentages
        currentFamilies.data = currentFamilies.data.map(d => ({name: d.name, value: d.value / currentFamilies.count * 100}));
        ye1Families.data = ye1Families.data.map(d => ({name: d.name, value: d.value / ye1Families.count * 100}));
        ye2Families.data = ye2Families.data.map(d => ({name: d.name, value: d.value / ye2Families.count * 100}));
        ye3Families.data = ye3Families.data.map(d => ({name: d.name, value: d.value / ye3Families.count * 100}));

        this.jobFamilyByYearPies = [currentFamilies, ye1Families, ye2Families, ye3Families];

        this.updateJobAdData();
    }

    private updateJobAdData() {

        // get visible job families
        const visibleJobFamilies = new Set();

        for (const role of this.roles) {
            // filters
            if (this.jobFamilyFilter != '' && role.jobFamily != this.jobFamilyFilter) {
                continue;
            }

            if (this.functionalAreaFilter != '' && role.functionalArea != this.functionalAreaFilter) {
                continue;
            }

            visibleJobFamilies.add(role.jobFamily);
        }

        // job ads / salary graphs
        const titleToFamily = {};
        forkJoin(
            this.workforcePlanService.listJobFamilyMappings(this.plan.sectorId, this.plan.companyId, Array.from(visibleJobFamilies)),
            this.jobPostService.getValidDateRange()
        ).pipe(
            // store reverse mappings
            tap(([titleMappings]) => {
                for (const mapping of titleMappings) {
                    titleToFamily[mapping.careerTitle] = mapping.jobFamily;
                }
            }),
            switchMap(([titleMappings, dateRange]) => {
                // get date to display at most a year of data
                let startDate = new Date(dateRange.max.getTime());
                startDate.setFullYear(startDate.getFullYear() - 1);
                // clamp to min valid date
                if (startDate < dateRange.min) {
                    startDate = dateRange.min;
                }

                const params = {startDate};
                const titles = titleMappings.map(t => t.careerTitle);

                const salaryGroup = this.dateGroup == 'month' ? SalaryGroupPeriod.Month : SalaryGroupPeriod.Quarter;
                const countGroup = this.dateGroup == 'month' ? JobPostGroupPeriod.Month : JobPostGroupPeriod.Quarter;

                return forkJoin(
                    this.salaryService.getJobSalaries(params, SalaryPeriod.Year, titles, salaryGroup),
                    this.jobPostService.getCountHistory(params, titles, countGroup)
                );
            })
        ).subscribe(([salaries, countHistory]) => {

            const mergeResults = (results, chart: MultiSeriesChartItem[], getVal, hook = null) => {
                const dates = new Set();

                for (const result of results) {
                    // label
                    let label;

                    if (this.dateGroup == 'month') {
                        // (YYYY-MM)
                        label = `${result.year}-`;
                        if (result.month_quarter < 10) {
                            label += '0';
                        }
                        label += result.month_quarter;
                    } else {
                        label = `${result.year} Q${result.month_quarter}`;
                    }

                    dates.add(label);

                    const family = titleToFamily[result.merged_title];

                    // get family item
                    let familyItem = chart.find(i => i.name == family);

                    if (familyItem == null) {
                        familyItem = {name: family, series: []};
                        chart.push(familyItem);
                    }

                    // get date item (x-axis)
                    let dateItem = familyItem.series.find(s => s.name == label);

                    if (dateItem == null) {
                        dateItem = {name: label, value: 0};
                        familyItem.series.push(dateItem);
                    }

                    dateItem.value += getVal(result);
                    if (hook) {
                        hook(family, label);
                    }
                }

                // add missing values to start of data
                const sortedDates = Array.from(dates).sort((a, b) => a.localeCompare(b));
                for (const date of sortedDates) {
                    let hasAllFamilies = true;
                    for (const family of chart) {
                        if (family.series.find(s => s.name == date) == null) {
                            family.series.push({name: date, value: 0});
                            hasAllFamilies = false;
                        }
                    }

                    if (hasAllFamilies) {
                        break;
                    }
                }

                // sort
                for (const family of chart) {
                    // sort dates
                    family.series.sort((a, b) => a.name.localeCompare(b.name));
                }
                chart.sort((a, b) => a.name.localeCompare(b.name));
            };

            // salary/time
            this.salaryOverTimeChart = [];
            const counts = {};
            mergeResults(salaries, this.salaryOverTimeChart, salary => salary.min_avg + salary.max_avg, (family, label) => {
                if (!(family in counts)) {
                    counts[family] = {};
                }
                if (!(label in counts[family])) {
                    counts[family][label] = 0;
                }
                counts[family][label] += 2;
            });

            for (const family of this.salaryOverTimeChart) {
                // average
                for (const timePeriod of family.series) {
                    if (timePeriod.value > 0) {
                        timePeriod.value = timePeriod.value / counts[family.name][timePeriod.name];
                    }
                }
            }

            // job ads/time
            this.jobAdsOverTimeChart = [];
            mergeResults(countHistory, this.jobAdsOverTimeChart, count => count.count);
        });
    }
}
