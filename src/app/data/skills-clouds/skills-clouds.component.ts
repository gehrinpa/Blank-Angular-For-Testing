import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { ItemCloud, GraphMapItem, SearchParameters, TreeMapItem } from '../../shared';
import { ANIMATIONS } from '../../animations';
import { SharedService } from '../../services/shared.service';
import { ApiService } from '../../services/api.service';
import { SkillsService } from '../../services/skills.service';

@Component({
    selector: 'app-skills-clouds',
    templateUrl: './skills-clouds.component.html',
    styleUrls: ['./skills-clouds.component.scss'],
    animations: ANIMATIONS
})

export class SkillsCloudsComponent implements OnInit, OnDestroy {
    public clouds: ItemCloud[] = [];
    public skillNames: string[] = [];
    public jobListTitles: string[] = [];
    public newsListTitles: string[] = [];
    public jobLocation: string;
    public jobs: any[] = [];
    private fullNewsArticles: any[] = [];
    public newsArticles: any[] = [];
    public jobCounts: number[] = [];
    public newsCounts: number[] = [];
    public histograms: GraphMapItem[][] = [];
    private sub: Subscription;

    constructor(private _sharedService: SharedService,
        private _apiService: ApiService, private skillsService: SkillsService) { }
    ngOnInit() {
        this._sharedService.logNewComponent("skill-clouds");

        this.sub = this._sharedService.items$.subscribe(companies => {
            this.getData(companies);
            // we can't handle nuts > 1, so don't show the location
            this.jobLocation = this._sharedService.nutsLevel == 1 ? this._sharedService.nutsName : "";
        });
    }
    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    getCloudData(cloudId, params: SearchParameters) {
        this.skillsService.getSkillCloud(params)
            .subscribe((data: any) => {
                if (data.skill_names.length) {
                    data.skills = data.skill_names.map((s, i) => {
                        return {
                            name: s,
                            score: data.skill_tfidf[i]
                        };
                    });
                    this.skillsService.getSkillDescriptions(data.skill_names)
                        .subscribe((descriptions: any[]) => {
                            data.skills.forEach((skill) => {
                                descriptions.forEach((description) => {
                                    if (skill.name.toLowerCase() == description.name.toLowerCase()) {
                                        skill.description = description.text;
                                    }
                                });
                                this.clouds[cloudId] = {
                                    items: data.skills,
                                    title: params.company || params.sector,
                                    query: data.solrquery
                                };
                            });
                        },error => {
                            console.log(error)
                        });

                    this.getJobData(params.company || params.sector, cloudId + 1, this.skillNames[0]);
                } else {
                    this.clouds[cloudId] = null;
                }
            });
    }

    getData(query) {
        this.getCloudData(0, query.params[0]);
        this.getCloudData(1, query.params[1]);
    }

    getJobData(item, itemNo, title, page = 1) {
        const mapId = itemNo - 1;
        const s = this._sharedService;

        this._apiService.getJobPostings(item, s.mode, s.nutsRegion, mapId + 1, page, "", title)
        .subscribe(jobData => {
            this.skillNames[mapId] = title;
            const isSector = s.mode == "sector" || (s.mode == "company_sector" && itemNo == 2);
            if (!title) {
                title = 'All';
            }
            if (isSector) {
                this.jobListTitles[mapId] = `${title} jobs in ${item}`;
            } else {
                this.jobListTitles[mapId] = `${title} jobs at ${item}`;
            }
            this.jobs[mapId] = jobData['results'];
            this.jobCounts[mapId] = jobData['count'];
        }, error => {
            this.jobs[mapId] = [];
            this.jobCounts[mapId] = 0;
            this.jobListTitles[mapId] = "";
        });        

        this._apiService.getCompanyNews(item).subscribe(newsData => {
            this.fullNewsArticles[mapId] = newsData['results'].news.news;
            this.newsCounts[mapId] = this.fullNewsArticles[mapId].length;
            if(this.fullNewsArticles[mapId].length > 10)
                this.newsArticles[mapId] = this.fullNewsArticles[mapId].slice((page-1), (page)*10);
            else
                this.newsArticles[mapId] = this.fullNewsArticles[mapId];
            this.newsListTitles[mapId] = item;
        }, error => {
            console.error(error);
            this.newsArticles[mapId] = [];
            this.fullNewsArticles[mapId] = [];
            this.newsCounts[mapId] = 0;
            this.newsListTitles[mapId] = "";
        });

        this._apiService.getJobHistogram(item, s.mode, s.nutsRegion, mapId + 1, title, "skill")
        .subscribe(histogramData => {
            const items: GraphMapItem[] = [];

            for (const k in histogramData.histogram) {
                if (histogramData.histogram.hasOwnProperty(k)) {
                    const v = histogramData.histogram[k];
                    items.push({name: k, score1: v});
                }
            }

            this.histograms[mapId] = items;
        }, error => {
            this.histograms[mapId] = null;
        });
    }

    onTreemapSelect(mapId, data) {
        let itemId = data[0].row;
        const searchItem = this._sharedService.getItems()[mapId];

        if (itemId == 0) {
            // no selection
            this.getJobData(searchItem, mapId + 1, '');
        } else {
            // id 0 is root
            itemId--;
            const treeMapItems = this.clouds[mapId].items;

            this.getJobData(searchItem, mapId + 1, treeMapItems[itemId].name);
        }
    }

    jobPageChanged(mapId, e) {
        const item = this._sharedService.getItems()[mapId];
        this.getJobData(item, mapId + 1, this.skillNames[mapId], e.page);
    }

    newsPageChanged(mapId, e) {
        const pageNum = e.page;
        const items = e.itemsPerPage;
        const filters = e.filters;

        let filteredArticles: any[] = this.fullNewsArticles[mapId];
        if(filters.length > 0){
            filteredArticles = filteredArticles.filter((obj) => {
                if(!obj.sentiment){
                    return false;
                }
                if(filters.includes('positive')){
                    if(obj.sentiment && obj.sentiment.label && obj.sentiment.label  === 'positive')
                        return true;
                } if (filters.includes('neutral')){
                    if(obj.sentiment && obj.sentiment.label && obj.sentiment.label  === 'neutral')
                        return true;
                } if (filters.includes('negative')){
                    if(obj.sentiment && obj.sentiment.label && obj.sentiment.label  === 'negative')
                        return true;
                }
                return false;
            });
        }
        if(filteredArticles.length !== this.newsCounts[mapId]){
            this.newsCounts[mapId] = filteredArticles.length;
        }
        if(filteredArticles.length > pageNum*items)
            this.newsArticles[mapId] = filteredArticles.slice((pageNum-1)*items, (pageNum)*items);
        else
            this.newsArticles[mapId] = filteredArticles.slice((pageNum-1)*items);
    }
}
