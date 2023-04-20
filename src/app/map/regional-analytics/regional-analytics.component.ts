import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';

import { SharedService, SearchOptions } from '../../services/shared.service';
import { GraphMapItem, SearchParameters } from '../../shared';
import { ApiService } from "../../services/api.service";
import { GeodataService, GeoDataResult } from '../../services/geodata.service';
import { ANIMATIONS } from '../../animations';

@Component({
    selector: 'app-regional-analytics',
    templateUrl: './regional-analytics.component.html',
    styleUrls: ['./regional-analytics.component.scss'],
    animations: ANIMATIONS
})
export class RegionalAnalyticsComponent implements OnInit {
    public mode = "people";
    public nutsLevel = 1;
    public regionsGraphItems: GraphMapItem[] = [];
  
    public jobTitle = "";
    public jobListTitle = "";
    public jobs = [];
    public jobCount = 0;
    public jobLocation = "";
    titleHolder = "";

    public skill = "";
    skillHolder = "";
    public keywords = "";
    keywordHolder = "";

    public mapSearchParams: SearchParameters = {};
    jobTitleChanged = new Subject<string>();
    skillChanged = new Subject<string>();
    private nutsId = "";

    public searchOptions: SearchOptions = {
        singleSearch: true,
        forceMode: 'sector',
        reqMapping: true
    };

    constructor(private sharedService: SharedService,
                private apiService: ApiService,
                private geodataService: GeodataService) {
        // debounce job input
        this.jobTitleChanged.pipe(
            debounceTime(1000),
            distinctUntilChanged()
        ).subscribe(model => {
            this.mapSearchParams.jobTitle = model;
            if (this.mode == "jobs" && this.nutsId != "") {
                this.getJobData(this.sharedService.getItems()[0], this.jobTitle, this.keywords);
            }
        });
        // ...and skill input
        this.skillChanged.pipe(
            debounceTime(1000),
            distinctUntilChanged()
        ).subscribe(model => {
            this.mapSearchParams.skill = model;
            if (this.mode == "jobs" && this.nutsId != "") {
                this.getJobData(this.sharedService.getItems()[0], this.jobTitle, this.keywords);
            }
        });
    }

    ngOnInit() {
    }

    onChoroplethChanged(data: GeoDataResult) {
        this.geodataService.getRegionNames(this.nutsLevel).subscribe(names => {
            const nameMap = {};
            names.forEach(o => nameMap[o.id] = o.name);
            this.regionsGraphItems = [];

            Object.keys(data.regionCounts).forEach(regionCode => {
                let name = nameMap[regionCode];

                if (name === undefined) {
                    if (data.regionCounts[regionCode] == 0) {
                        return 0;
                    }
                    name = regionCode;
                }

                if (name.endsWith(", England")) {
                    name = name.substr(0, name.length - 9);
                }

                this.regionsGraphItems.push({name, score1: data.regionCounts[regionCode]});
            });

            this.regionsGraphItems.sort((a, b) => b.score1 - a.score1);
        });
    }

    onJobTitleChanged(model) {
        this.jobTitleChanged.next(model);
    }

    onSkillChanged(model) {
        this.skillChanged.next(model);
    }


    onMapRegionChanged(region) {
        if (region) {
            const nuts = region.properties.dataKey;
            const s = this.sharedService;
            this.nutsId = region.properties.dataKey;

            if (this.mode == "jobs") {
                this.jobLocation = region.properties.name;
                this.getJobData(s.getItems()[0], this.jobTitle, this.keywords);
            }
        } else {
            this.jobs = [];
        }
    }

    onJobPageChanged(e) {
        this.getJobData(this.sharedService.getItems()[0], this.jobTitle, this.keywords, e.page);
    }

    jobsClicked() {
        this.titleHolder = this.jobTitle;
        this.jobTitle = "";
        this.jobListTitle = "";
        this.skillHolder = this.skill;
        this.skill = "";
        this.onJobTitleChanged('');
        this.onSkillChanged(this.keywords);
    }

    peopleClicked(){
        this.jobTitle = this.titleHolder;
        this.skill=this.skillHolder;
        this.keywordHolder = this.keywords;
        this.keywords = '';

        this.onJobTitleChanged(this.jobTitle);
        this.onSkillChanged(this.skill);
    }

    getJobData(item, title, skill, page = 1) {
        const s = this.sharedService;

        this.apiService.getJobPostings(item, s.mode, this.nutsId, 1, page, title, skill)
        .subscribe(jobData => {
            const isSector = s.mode == "sector";
            if (isSector) {
                this.jobListTitle = `${title} jobs in ${item}`;
            } else {
                this.jobListTitle = `${title} jobs at ${item}`;
            }
            this.jobs = jobData['results'];
            this.jobCount = jobData['count'];
        }, error => {
            this.jobs = [];
            this.jobCount = 0;
            this.jobListTitle = "";
        });
    }
}
