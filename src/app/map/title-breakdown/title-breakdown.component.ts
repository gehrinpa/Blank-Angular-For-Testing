import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import Chart from 'chart.js';
import 'chartjs-plugin-annotation';
import 'chartjs-plugin-colorschemes';
import 'chartjs-plugin-zoom';
import { GeodataService } from 'src/app/services/geodata.service';
import { ANIMATIONS } from '../../animations';
import { ADZUNA_JOB_CATEGORIES, sectortoLimitedCategory } from '../../services/adzuna-mapping';
import { JobSalaryResult, SalaryService } from '../../services/salary.service';
import { SharedService } from '../../services/shared.service';
import { SkillsService } from '../../services/skills.service';
import { GraphMapItem, SearchParameters } from '../../shared';
import { RegionProperties } from '../map';
import { LocalDemandComponent } from './../local-demand/local-demand.component';

@Component({
    selector: 'app-title-breakdown',
    templateUrl: './title-breakdown.component.html',
    styleUrls: ['./title-breakdown.component.scss'],
    animations: ANIMATIONS
})
export class TitleBreakdownComponent implements OnInit, OnChanges {
    @Input() regionData: RegionProperties = null;
    @Input() searchParams: SearchParameters = {};
    @Input() year: number;
    @Input() dateRangeQuarter: number;
    @Input() categories: string[] = [];
    @Input() sicCode: boolean = false;
    // @Input() category: string[]

    dataTypeDisplay = 'ListForm'; // For the 'list view'/'graph view' icons.

    jobTitles: string[];
    adzunaJobTitles: string[];
    adzunaJobCounts: number[];
    adzunaLQs: number[];

    titleSkillData: { [title: string]: GraphMapItem[] } = {};
    titleSalary: { [title: string]: { [period: string]: JobSalaryResult } } = {};
    titleSalaryChart: { [title: string]: any[] } = {};
    titleDataExpanded = {};


    titleDataSection = 'skills';

    loadTitleData: boolean = false;

    startDate: Date;
    endDate: Date;
    regionCode: string;
    regionType: number;

    constructor(private sharedService: SharedService, private salaryService: SalaryService,
        private skillsService: SkillsService, private geodata: GeodataService) {
        this.sharedService.items$.subscribe(() => this.updateTitleData());
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.dateRangeQuarter || changes.regionData || changes.categories) {
            this.updateTitleData();
            // console.log(this.categories.toString());
        }
    }

    // Scatter plot variables.
    logLine = true;
    myCanvas: HTMLCanvasElement = null;
    ctx: any = null;
    LQChart: Chart = null;

    // expandTitleData(title){
    //     if(this.titleDataExpanded[title])
    //         this.titleDataExpanded[title] = !this.titleDataExpanded[title];
    //     else 
    //         this.titleDataExpanded[title] = true;
    // }

    mapViewChange(bool: boolean) {
        LocalDemandComponent.canViewMap = bool;
    }

    getTitleField(){
        if(this.sicCode){
            if(this.categories && this.categories.includes('All SIC codes')){
                return 'all-sic-codes';
            } else {
                return 'soc_code';
            }
        }
        else{
            if(this.categories && this.categories.includes('all-sectors')){
                return 'all-categories';
            } else {
                return 'merged_title';
            }
        }
    }
    getAllowedTitles(){
        return Object.keys(this.titleDataExpanded);
    }

    logLin() { // Switches the chart from linear y scaling to logarithmic y scaling
        if (this.LQChart) {
            if (this.logLine) {
                this.logLine = !this.logLine;
                // change the scaling, make all tooltips visible, and set them to be black text on a transparent background.
                this.LQChart['options']['scales']['yAxes'][0]['type'] = 'logarithmic';
                this.LQChart['options']['showAllTooltips'] = true;
                this.LQChart['options']['tooltips']['backgroundColor'] = 'rgba(0,0,0,0)';
                this.LQChart['options']['tooltips']['bodyFontColor'] = '#000';
                this.LQChart['options']['scales']['yAxes'][0]['gridLines']['display'] = this.logLine;
                this.LQChart.update();
            } else {
                this.logLine = !this.logLine;
                // change scaling, set tooltips to only appear on mouse hover, and change the styling back to white on black.
                this.LQChart['options']['scales']['yAxes'][0]['type'] = 'linear';
                this.LQChart['options']['showAllTooltips'] = false;
                this.LQChart['options']['tooltips']['enabled'] = true;
                this.LQChart['options']['tooltips']['backgroundColor'] = 'rgba(0,0,0,1)';
                this.LQChart['options']['tooltips']['bodyFontColor'] = '#FFF';
                this.LQChart['options']['scales']['yAxes'][0]['gridLines']['display'] = this.logLine;
                this.LQChart.update();
            }
        }
    }

    ngOnInit() {
        // Creating our own plugin to render the tooltips visible by default for log scaling.
        Chart.pluginService.register({
            beforeRender: function (chart) {
                if (chart.config.options['showAllTooltips']) {
                    // create an array of tooltips
                    // we can't use the chart tooltip because there is only one tooltip per chart
                    chart['pluginTooltips'] = [];
                    chart.config.data.datasets.forEach(function (dataset, i) {
                        chart.getDatasetMeta(i).data.forEach(function (sector, j) {
                            chart['pluginTooltips'].push(new (Chart as any).Tooltip({
                                _chart: chart['chart'],
                                _chartInstance: chart,
                                _data: chart.data,
                                _options: chart['options']['tooltips'],
                                _active: [sector]
                            }, chart));
                        });
                    });

                    // turn off normal tooltips
                    chart['options']['tooltips']['enabled'] = false;
                }
            },
            afterDraw: function (chart, easing: any) {
                if (chart.config.options['showAllTooltips']) {
                    // we don't want the permanent tooltips to animate, so don't do anything till the animation runs atleast once
                    if (!chart['allTooltipsOnce']) {
                        if (easing !== 1) {
                            return;
                        }
                        chart['allTooltipsOnce'] = true;
                    }

                    // turn on tooltips
                    chart['options']['tooltips']['enabled'] = true;
                    Chart.helpers.each(chart['pluginTooltips'], function (tooltip) {
                        tooltip.initialize();
                        tooltip.update();
                        // we don't actually need this since we are not animating tooltips
                        tooltip.pivot();
                        tooltip.transition(easing).draw();
                    });
                    // chart['options']['tooltips']['enabled'] = false;
                }
            }
        });

        this.mapViewChange(true);
        this.updateTitleData();
    }

    getTitleData(title: string) {
        let params: SearchParameters = Object.assign({}, this.searchParams, {
            regionCode: this.regionData.dataKey,
            jobTitle: title,
            sicCode: this.sicCode
        });

        // console.log("\ntitle: "+title+"\nregionCode: "+this.regionData.dataKey+"\nsearchparams: "+this.searchParams+"\nparams: "+params);
        // console.log(this.searchParams);
        // console.log(params);
        params = this.sharedService.getSearchParams(1, params);
        // console.log(params);

        this.startDate = params.startDate;
        this.endDate = params.endDate;
        this.regionCode = params.regionCode;

        if(this.categories.length > 0){
            params.categories = this.categories;
        }

        if (!this.titleSkillData[title] || !this.titleSkillData[title].length) {
            this.skillsService.getJobSkills(params).subscribe(data => {
                this.titleSkillData[title] = data.skill_names.map((name, i) => ({ name, score1: data.skill_tfidf[i], url: data.Esco_Skill_URLs[name] }));
            }, error => { console.log('Log Error from Get Skills'); });
        }

        // get salaries
        if (!this.titleSalary[title]) {
            this.salaryService.getJobSalaries(params).subscribe(data => {
                this.titleSalary[title] = {};
                this.titleSalaryChart[title] = [];

                const periodLabels = {
                    'hour': 'Hourly', 
                    'day': 'Daily',
                    'month': 'Monthly',
                    'year': 'Yearly'
                };

                for (const salary of data) {
                    this.titleSalary[title][salary.period] = salary;
                    this.titleSalaryChart[title].push({ name: periodLabels[salary.period] || 'Unspecified', value: salary.count });
                }
            }, error => { console.log('Log Error from Get Salaries'); } // failed

            );
        }
    }

    public resetZoom() {
        if (this.LQChart) {
            (this.LQChart as any).resetZoom();
        } // resets the zoom level of the chart, even if it claims to be an error.
    }

    public async updateTitleData() {

        if (this.dateRangeQuarter) {
            const searchParams = this.sharedService.getSearchParams(1, { ...this.searchParams });
            const result = await this.geodata.getJobGeoData(searchParams, this.categories, this.sicCode).toPromise();

            if(!result || Object.keys(result.regionCounts).length === 0){
                return;
            }

            if(result.regionData[this.regionData.dataKey]){

                const { merged_titles, location_quotient } = result.regionData[this.regionData.dataKey];
                const count = result.regionCounts[this.regionData.dataKey];

                this.regionData.merged_titles = merged_titles;
                this.regionData.location_quotient = location_quotient;
                this.regionData.count = count;
                // Remove these values on new region select so that title charts are created anew:
                this.titleSkillData = {};
                this.titleSalary = {};
                this.titleDataExpanded = {};
                // Chart item only exists when region data is selected, so check before creating the canvas element.
                if (document.getElementById('myChart') && !this.ctx) {
                    this.myCanvas = <HTMLCanvasElement>document.getElementsByName('myChart')
                    [document.getElementsByName('myChart').length - 1];
                    this.ctx = this.myCanvas.getContext('2d');
                }
                if (this.regionData && this.regionData.merged_titles) {
                    if (this.categories && this.categories.includes('all-sectors')) {
                        this.adzunaJobCounts = [];
                        this.adzunaJobTitles = [];
                        this.adzunaLQs = [];

                        for (const key in this.regionData.merged_titles) {
                            if (this.regionData.merged_titles.hasOwnProperty(key)) {
                                this.adzunaJobTitles.push(
                                    ADZUNA_JOB_CATEGORIES[key]
                                );
                                this.adzunaJobCounts.push(this.regionData.merged_titles[key]);
                                this.adzunaLQs.push(this.regionData.location_quotient[key]);
                            }
                        }

                        let i = 0;
                        this.regionData.merged_titles = {};
                        this.regionData.location_quotient = {};
                        for (i = 0; i < this.adzunaJobTitles.length; i++) {
                            this.regionData.merged_titles[this.adzunaJobTitles[i]] = this.adzunaJobCounts[i];
                            this.regionData.location_quotient[this.adzunaJobTitles[i]] = this.adzunaLQs[i];
                        }
                    }
                    const compare = (a, b) => this.regionData.merged_titles[b] - this.regionData.merged_titles[a];
                    this.jobTitles = Object.keys(this.regionData.merged_titles).sort(compare);
                } else {
                    this.jobTitles = [];
                }
            }            

            // Kill the old chart
            if (this.LQChart) { this.LQChart.destroy(); }

            const chartOptions: any = {
                plugins: {
                    colorschemes: {
                        scheme: 'brewer.YlOrBr9'
                    }, zoom: {
                        pan: {
                            enabled: true,
                            mode: 'xy',
                            rangeMin: {
                                x: null,
                                y: null
                            },
                            rangeMax: {
                                x: null,
                                y: null
                            }
                        },
                        zoom: {
                            enabled: true,
                            drag: false,
                            mode: 'xy',
                            rangeMin: {
                                x: null,
                                y: null
                            },
                            rangeMax: {
                                x: null,
                                y: null
                            },
                            speed: 0.1
                        }
                    },
                }, tooltips: {
                    callbacks: {
                        label: function (tooltipItem, data) {
                            const label = data.datasets[tooltipItem.datasetIndex].label || '';
                            return label;
                        }
                    }, displayColors: false
                }, legend: {
                    display: false
                }, title: {
                    display: true,
                    text: 'Location Quotient of Jobs in Region'
                }, scales: {
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: "# of Jobs"
                        },
                        id: 'y-axis-0',
                        type: 'linear',
                        gridLines: {
                            display: true
                        },
                        ticks: {
                            callback: function (value, index, values) {
                                return Number(Math.floor(value).toString());
                            }
                        },
                        position: 'left'
                    }],
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: "Location Quotient"
                        },
                        id: 'x-axis-0',
                        type: 'linear',
                        position: 'bottom',
                    }]
                }, annotation: {
                    annotations: [{
                        borderColor: 'black',
                        borderWidth: 2,
                        mode: 'vertical',
                        type: 'line',
                        value: 1.0,
                        scaleID: 'x-axis-0'
                    }]
                }
            };

            // Draw the chart
            if (this.regionData && this.regionData.location_quotient && this.ctx) {
                this.LQChart = new Chart(this.ctx, {
                    type: 'bubble',
                    data: {
                        labels: ['Jobs']
                    },
                    options: chartOptions
                });

                // Populate the chart
                this.jobTitles.forEach((value) => {
                    let r = parseInt(this.regionData.merged_titles[value]) / 100;
                    if (r < 5) { r = 5; } else if (r > 15) { r = 15; }
                    this.LQChart.data.datasets.push({
                        label: value,
                        data: [{
                            x: parseFloat(this.regionData.location_quotient[value]),
                            y: parseInt(this.regionData.merged_titles[value]),
                            r: r
                        }]
                    });
                    // Update after data points populated
                    this.LQChart.update();
                });
            }
            // this.ctx = null;
            // this.myCanvas = null;
            // this.LQChart = null;
        } else {
            this.ctx = null;
            this.myCanvas = null;
            if (this.LQChart) { this.LQChart.destroy(); }
            this.LQChart = null;
        }
    }
}
