import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import Plotly from 'plotly.js-dist';
import { Observable, Observer, of } from 'rxjs';
import { distinctUntilChanged, map, catchError } from 'rxjs/operators';
import { CourseService } from 'src/app/services/course.service';
import { SkillsService } from 'src/app/services/skills.service';
import { SkillDnaResult } from './../../services/skills.service';

interface Role {
  title: string;
  skills: { name: string, score: number }[];
}

@Component({
  selector: 'app-skill-dna',
  templateUrl: './skill-dna.component.html',
  styleUrls: ['./skill-dna.component.scss']
})
export class SkillDnaComponent implements OnInit {

  @ViewChild('chart') private chart: ElementRef;

  public categories: string[];
  public selectedCategory: string;
  public searchedSkill: string;
  public minCount: number = null;
  public maxCount: number = null;
  public dateRange: Date[];
  public loading = false;

  public skillsHeatmap: SkillDnaResult;
  public chartData: any[] = [];
  public chartLayout: any;

  public showSkillsBreakdown = false;

  public market: Role[];
  public nonMarket: Role[];

  public titleFields = [
    'merged_title',
    'title_field_one',
    'title_field_two',
    'title_field_three'
  ];
  public selectedTitleField: string = this.titleFields[0];

  public skillItems: Observable<string[]>;

  constructor(private skills: SkillsService, private courses: CourseService) { }

  async ngOnInit() {
    this.categories = await this.skills.getAnalysisCategories().toPromise();

    this.skillItems = Observable
      .create((observer: Observer<string>) => {
        observer.next(this.searchedSkill);
      })
      .pipe(
        distinctUntilChanged(),
        map((query: string) => this.skillsHeatmap.x.filter(s => s.startsWith(query))),
        catchError(e => of([]))
      );
  }

  async search() {
    if (this.skillsHeatmap && this.skillsHeatmap.x) {
      const skill = this.searchedSkill;

      const xIndex = this.skillsHeatmap.x.indexOf(skill);

      this.chartLayout = {
        ...this.chartLayout,
        shapes: [
          {
            type: 'rect',
            xref: 'x',
            yref: 'paper',
            x0: xIndex - .5,
            x1: xIndex + .5,
            y0: 0,
            y1: 1,
            fillcolor: '#d3d3d3',
            opacity: 1,
            layer: 'below'
          },
          {
            type: 'rect',
            xref: 'x',
            yref: 'paper',
            x0: xIndex - .5,
            x1: xIndex + .5,
            y0: 0,
            y1: 1,
            line: {
              color: '#000000',
              width: 1
            }
          }
        ]
      };
      Plotly.relayout(this.chart.nativeElement, this.chartLayout);
    }
  }

  async onChange() {
    if (this.selectedCategory && this.selectedTitleField) {
      this.loading = true;

      this.skillsHeatmap = await this.skills.getSkillDna(
        this.selectedCategory,
        this.selectedTitleField,
        this.minCount,
        this.maxCount,
        this.dateRange)
        .toPromise();

      this.chartData = [
        {
          type: 'heatmap',
          hoverongaps: false,
          colorscale: [
            ['0', 'rgb(254, 225, 131)'],
            ['1', 'rgb(189, 0, 38)'],
          ],
          name: 'Analysis skills',
          ...this.skillsHeatmap
        }
      ];

      const { market, x, y, z, market_skills, unique_skills } = this.skillsHeatmap;

      this.market = [];
      this.nonMarket = [];

      this.market = Object.keys(market_skills).map(title => {
        return {
          title,
          skills: Object.keys(market_skills[title])
            .map(skill => ({ name: skill, score: market_skills[title][skill] }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
        } as Role;
      });

      this.nonMarket = Object.keys(unique_skills).map(title => {
        return {
          title,
          skills: Object.keys(unique_skills[title])
            .map(skill => ({ name: skill, score: unique_skills[title][skill] }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
        } as Role;
      });

      const annotations = [];

      if (market && Array.isArray(market)) {
        for (let iy = 0; iy < market.length; iy++) {
          const marketSkills = market[iy];
          if (marketSkills && Array.isArray(market)) {
            for (let ix = 0; ix < marketSkills.length; ix++) {
              if (z[iy][ix] > 0 && marketSkills[ix]) {
                annotations.push({
                  x: ix, y: iy, text: '*', showarrow: false
                });
              }
            }
          }
        }
      }

      this.chartLayout = {
        annotations,
        autoexpand: true,
        autosize: true,
        responsive: true,
        height: 700,
        yaxis: {
          title: 'Title',
          automargin: true,
          tickvals: y,
          ticktext: y,
          tickangle: 'auto'
        },
        xaxis: {
          title: 'Skill',
          automargin: true,
          tickvals: x,
          ticktext: x,
          tickangle: 'auto',
          autotick: true
        }
      };

      Plotly.newPlot(this.chart.nativeElement, this.chartData, this.chartLayout);

      this.loading = false;
    }
  }

  onTitleSearch(event: Event) {
    const { value } = event.target as any;
    const { market_skills, unique_skills } = this.skillsHeatmap;

    if (value) {
      this.market = Object.keys(market_skills).map(title => {
        return {
          title,
          skills: Object.keys(market_skills[title])
            .map(skill => ({ name: skill, score: market_skills[title][skill] }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
        } as Role;
      })
      .filter(role => role.title.toLowerCase().startsWith(value));

      this.nonMarket = Object.keys(unique_skills).map(title => {
        return {
          title,
          skills: Object.keys(unique_skills[title])
            .map(skill => ({ name: skill, score: unique_skills[title][skill] }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
        } as Role;
      })
      .filter(role => role.title.toLowerCase().startsWith(value));
    } else {
      this.market = Object.keys(market_skills).map(title => {
        return {
          title,
          skills: Object.keys(market_skills[title])
            .map(skill => ({ name: skill, score: market_skills[title][skill] }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
        } as Role;
      });

      this.nonMarket = Object.keys(unique_skills).map(title => {
        return {
          title,
          skills: Object.keys(unique_skills[title])
            .map(skill => ({ name: skill, score: unique_skills[title][skill] }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
        } as Role;
      });
    }
  }
}
