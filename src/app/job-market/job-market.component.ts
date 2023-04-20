import { Observable, Subject, concat, of as observableOf } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, map, share } from 'rxjs/operators';
import { Component, OnInit, TemplateRef} from '@angular/core';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import moment from 'moment';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';

import { SearchParameters, RegionType } from '../shared';
import { GeodataService } from '../services/geodata.service';
import { SalaryService, TopAdvertiserResult } from '../services/salary.service';
import { SharedService } from '../services/shared.service';
import { SkillsService } from '../services/skills.service';
import { CourseService } from '../services/course.service';


@Component({
  selector: 'app-job-market',
  templateUrl: './job-market.component.html',
  styleUrls: ['./job-market.component.scss']
})
export class JobMarketComponent implements OnInit {

  constructor(
    private sharedService: SharedService,
    private courseService: CourseService,
    private geoData: GeodataService,
    private salaryService: SalaryService,
    private skillsService: SkillsService,
    private modalService: BsModalService) { }

  region: RegionType = 1;
  nutsRegionNames: {id: string, name: string}[] = [];
  regionList: string[] = [];
  selectedLocation: string;
  locationTypeahead: Observable<string []>;

  searchParams: SearchParameters = {};

  // skill typeahead
  skillSubject = new Subject<string>();
  skillItems: Observable<string[]>;
  selectedSkills: string[] = [];

  titleField: HTMLElement;
  title = '';
  locationField: HTMLElement;
  location = '';
  salaryChartTitle: string;
  skillsChartTitle: string;
  skillTrack = 0;
  keySkills: HTMLInputElement[];
  suggestedTitleList: {title: string, count: number}[] = [];

  public regionalAvailabilityList: {title: string, count: number}[] = [];
  public regionalAvailabilityLoading = false;  

  single: any[] = [];
  multi: any[] = [];
  multiHolder: any[] = [];
  multiPlaceHolder = 0;
  multiNextAllowed = false;
  multiPrevAllowed = false;

  checked = true;
  disabled = false;
  slideValue = "And";
  checkedTitleSkill = true;
  disabledTitleSkill = false;
  titleSkillValue = "Skills";
  checkedTopSkills = true;
  disabledTopSkills = false;
  topSkillsValue = "Skills";

  view: any[];

  // options
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = false;
  showXAxisLabel = false;
  xAxisLabel = 'Workers';
  showYAxisLabel = false;
  yAxisLabel = 'Salaries';

  colorScheme = {
    domain: [/*'#ffba59', */'#A10A28'/*, '#ffd940', '#AAAAAA'*/]
  };

  public sampleJobAdvertModalAdvertiser: TopAdvertiserResult;
  public sampleJobAdvertModal: BsModalRef;

  filterChanged(element: HTMLElement, field: string) {
    switch (field) {
      case 'title': {
        element.addEventListener("change", () => {
          this.title = this.toTitleCase((<HTMLInputElement>event.target).value);
          // this.title = (<HTMLInputElement>event.target).value;
          this.populateCharts();
          this.getRegionalAvailability();
        });
        break;
      }
      case 'location': {
        element.addEventListener("change", () => {
          if (this.regionList.includes((<HTMLInputElement>event.target).value) || (<HTMLInputElement>event.target).value == '') {
            element.style.color = 'black';
            this.location = (<HTMLInputElement>event.target).value;
            if (this.title != undefined) {
              this.populateCharts();
            }
          } else {
            element.style.color = 'red';
          }
        });
        break;
      }
    }
  }

  ngOnInit() {
    // skill select typeahead
    this.skillItems = concat(
      observableOf([]),
      this.skillSubject.pipe(
          debounceTime(200),
          distinctUntilChanged(),
          switchMap(text => this.courseService.searchCourseSkills(text, 20).pipe(
              catchError(() => observableOf([])), // empty list on error
              map(skills => skills.map(s => s.name))
          ))
      )
    ).pipe(share());

    // this.skillItems = new Observable((skill) => {
    //   var tmp:string[] = [];
    //   var i: number = 0;
    //   for(i = 0; i < this.multi.length; i++){
    //     tmp.push(this.multi[i]['name']);
    //   }
    //   skill.next(tmp);
    //   skill.complete();
    // })


    this.titleField = document.getElementById('titleField');
    this.filterChanged(this.titleField, 'title');
    this.locationField = document.getElementById('locationField');
    this.filterChanged(this.locationField, 'location');
    this.getNutsList();

    this.searchParams.regionType = this.region;

    this.searchParams.startDate = moment(new Date()).startOf('quarter').subtract(1, 'ms').startOf('quarter').toDate();
    this.searchParams.endDate = moment(new Date()).startOf('quarter').subtract(1, 'ms').toDate();

    this.locationTypeahead = Observable.create(observer => {
      this.nutsRegionNames.forEach(element => {
        observer.next(element);
      });
    });
  }

  getNutsList() {
    this.geoData.getRegionNames(this.region).subscribe(s => {
      this.nutsRegionNames = s;
      s.forEach(e => {
        this.regionList.push(e['name']);
      });
    });
  }

  andOrBoxChecked() {
    // console.log(this.selectedSkills);
    if (this.slideValue == 'And') {
      this.slideValue = 'Or';
    } else {
      this.slideValue = 'And';
    }
    if (this.selectedSkills.length > 0) {
      this.populateTitleList();
    }
    if (this.titleSkillValue == 'Skills') {
      this.populateCharts();
    }
  }

  titleSkillBoxChecked() {
    if (this.titleSkillValue == 'Title') {
      this.titleSkillValue = 'Skills';
      if (this.selectedSkills.length > 0) {
        this.populateCharts();
      } else {
        this.single = [];
      }
    } else  {
      this.titleSkillValue = 'Title';
      if (this.title != '') {
        this.populateCharts();
      } else {
        this.single = [];
      }
    }
  }

  topSkillsBoxChecked() {
    if (this.topSkillsValue == 'Title') {
      this.topSkillsValue = 'Skills';
      if (this.selectedSkills.length > 0) {
        this.populateCharts();
      } else {
        this.single = [];
      }
    } else  {
      this.topSkillsValue = 'Title';
      if (this.title != '') {
        this.populateCharts();
      } else {
        this.single = [];
      }
    }
  }

  populateCharts() {
    let salaryTitle = "";
    this.single = [];
    this.multi = [];
    this.multiHolder = [];
    if (this.titleSkillValue == 'Title') {
      salaryTitle = this.title;
    } else {
      salaryTitle = "Key Skills";
    }
    if (this.location != '') {
      this.skillsChartTitle = ", " + this.location;
      this.salaryChartTitle = this.location + ", " + salaryTitle;
      this.nutsRegionNames.forEach(element => {
        if (element['name'] === this.location) {
          this.searchParams.regionCode = element['id'];
        }
      });
    } else {
      this.skillsChartTitle = '';
      this.salaryChartTitle = salaryTitle;
      this.searchParams.regionCode = '*';
    }

    this.searchParams.jobTitle = this.title;
    this.searchParams = this.sharedService.getSearchParams(1, this.searchParams);

    if (this.titleSkillValue === 'Title' && salaryTitle !== "") {
      this.salaryService.getSalaryChartList(this.searchParams).subscribe(data => {
        this.single.push(
          {"name": "<10k", "value": data[0]['<10k']},
          {"name": "20k", "value": data[0]['20k']},
          {"name": "30k", "value": data[0]['30k']},
          {"name": "40k", "value": data[0]['40k']},
          {"name": "50k", "value": data[0]['50k']},
          {"name": "60k", "value": data[0]['60k']},
          {"name": ">60k", "value": data[0]['>70k']}
        );
      });
    } else if (this.selectedSkills.length > 0 && this.titleSkillValue == "Skills") {
      this.searchParams.keySkills = this.selectedSkills;
      this.salaryService.getSalaryChartListBySkills(
        this.searchParams,
        this.selectedSkills,
        this.slideValue.toLowerCase()
        ).subscribe(data => {

        this.single.push(
          {"name": "<10k", "value": data[0]['<10k']},
          {"name": "20k", "value": data[0]['20k']},
          {"name": "30k", "value": data[0]['30k']},
          {"name": "40k", "value": data[0]['40k']},
          {"name": "50k", "value": data[0]['50k']},
          {"name": "60k", "value": data[0]['60k']},
          {"name": ">60k", "value": data[0]['>70k']}
        );
      });
    }

    if (this.topSkillsValue == 'Title' && this.title != '') {
      this.skillsChartTitle = this.title + this.skillsChartTitle;
      this.skillsService.getSkillCloud(this.searchParams).subscribe(data => {
        let i = 0;
        for (i = 0; i <= Math.min(9, data.skill_names.length); i++) {
          this.multi.push({
            "name": data.skill_names[i],
            "value": data.skill_counts[i]
          });
        }
        for (i = 0; i < data.skill_names.length; i++) {
          this.multiHolder.push({
            "name": data.skill_names[i],
            "value": data.skill_counts[i]
          });
        }
        this.sortMulti();
        if (data.skill_names.length > 10) {
          this.multiNextAllowed = true;
        }
      });
    } else if (this.topSkillsValue == 'Skills' && this.selectedSkills.length != 0) {
      this.skillsChartTitle = "Key Skills" + this.skillsChartTitle;
      this.searchParams.jobTitle = '';
      this.searchParams.skill = this.selectedSkills.toString();
      this.skillsService.getSkillCloud(this.searchParams).subscribe(data => {
        if (data.status === 200) {
          let i = 0;
          for (i = 0; i <= Math.min(9, data.skill_names.length); i++) {
            this.multi.push({
              "name": data.skill_names[i],
              "value": data.skill_counts[i]
            });
          }
          for (i = 0; i < data.skill_names.length; i++) {
            this.multiHolder.push({
              "name": data.skill_names[i],
              "value": data.skill_counts[i]
            });
          }
          this.sortMulti();
          if (data.skill_names.length > 10) {
            this.multiNextAllowed = true;
          }
        }
      });
      this.searchParams.jobTitle = this.title;
      this.searchParams.skill = '';
    }

    // this.fetchTopAdvertisers();
  } 

  private sortMulti() {
    this.multi = this.multi.sort((a: any, b: any) => {
      return b.value - a.value;
    });
    this.multiHolder = this.multiHolder.sort((a: any, b: any) => {
      return b.value - a.value;
    });
  }

  onNextButtonClick() {
    let i = 0;
    this.multi = [];
    this.multiPlaceHolder += 10;
    for (i = 0; i < Math.min(10, this.multiHolder.length - this.multiPlaceHolder); i++) {
       this.multi.push({
        "name": this.multiHolder[i + this.multiPlaceHolder]['name'],
        "value": this.multiHolder[i + this.multiPlaceHolder]['value']
       });
    }
    if (this.multiPlaceHolder >= 15) {
      this.multiNextAllowed = false;
    }
    this.multiPrevAllowed = true;
  }

  onPrevButtonClick() {
    let i = 0;
    this.multi = [];
    this.multiPlaceHolder -= 10;
    for (i = 0; i < Math.min(10, this.multiHolder.length - this.multiPlaceHolder); i++) {
      this.multi.push({
       "name": this.multiHolder[i + this.multiPlaceHolder]['name'],
       "value": this.multiHolder[i + this.multiPlaceHolder]['value']
      });
   }
    if (this.multiPlaceHolder < 10) {
      this.multiPrevAllowed = false;
    }
    this.multiNextAllowed = true;
  }

  getRegionalAvailability() {
    this.regionalAvailabilityLoading = true;

    this.searchParams.jobTitle = this.title;
    this.searchParams = this.sharedService.getSearchParams(1, this.searchParams);

    if (this.title != '') {
      const nutsKeys: string[] = [];
      const nutsNames: string[] = [];
      let i = 0;

      for (i = 0; i < this.nutsRegionNames.length; i++) {
        nutsKeys.push(this.nutsRegionNames[i]['id']);
        nutsNames.push(this.nutsRegionNames[i]['name']);
      }
      this.skillsService.getRegionalAvailability(this.searchParams).subscribe(data => {
        let dataIterator = 0;
        this.regionalAvailabilityList = [];
        for (dataIterator = 0; dataIterator < data['region_ids'].length; dataIterator++) {
          const x: number = nutsKeys.indexOf(data['region_ids'][dataIterator].toUpperCase());
          if (x > -1) {
            this.regionalAvailabilityList.push({title: nutsNames[x], count: data['region_counts'][dataIterator]});
          }
        }

        this.regionalAvailabilityLoading = false;
      });
    } else {
      this.regionalAvailabilityList = [];
      this.regionalAvailabilityLoading = false;
    }
  }

  populateTitleList() {
    this.searchParams.keySkills = this.selectedSkills;

    this.suggestedTitleList = [];

    this.skillsService.getJobCloud(this.searchParams, (this.slideValue == 'And')).subscribe(data => {
      let i = 0;
      for (i = 0; i < 5; i++) {
        if (data['job_names'][i] != undefined) {
          this.suggestedTitleList.push({
            title: data['job_names'][i],
            count: data['job_counts'][i]
          });
        }
      }
    });
    this.populateCharts();
  }

  onSuggestedTitleSelect(title: string) {
    (<HTMLInputElement>this.titleField).value = this.toTitleCase(title);
    this.title = this.toTitleCase(title);
    this.populateCharts();
    this.getRegionalAvailability();
  }

  onRegionalAvailabilitySelect(region: string) {
    (<HTMLInputElement>this.locationField).value = region;
    if (this.regionList.includes(region) || region == '') {
      this.locationField.style.color = 'black';
      this.location = region;
      if (this.title != undefined) {
        this.populateCharts();
      }
    } else {
      this.locationField.style.color = 'red';
    }
  }

  onSalaryBarSelect(event) {
    const salary1 = <HTMLInputElement>document.getElementById('salary_1');
    const salary2 = <HTMLInputElement>document.getElementById('salary_2');
    switch (event['name'].charAt(0)) {
      case '<':
        salary1.value = '0';
        salary2.value = event['name'].substr(1, 2) + ",000";
        break;
      case '>':
        salary1.value = event['name'].substr(1, 2) + ",000";
        salary2.value = (+event['name'].substr(1, 2) + 10).toString() + ",000";
        break;
      default:
        salary1.value = event['name'].substr(0, 2) + ",000";
        salary2.value = (+event['name'].substr(0, 2) + 10).toString() + ",000";
        break;
    }
    const salaryPeriod = <HTMLInputElement>document.getElementById('salary_period');
    salaryPeriod.value = "Annum";
  }

  onSkillBarSelect(event) {
    // if(!this.selectedSkills.includes(event['name'])){
    //   this.selectedSkills.push(event['name']);
    // }
    // this.skillItems.subscribe(data => console.log(data));
    // console.log("hi");
    // this.courseService.searchCourseSkills(event['name'], 20).subscribe(val => {
    //   var i:number = 0;
    //   for(i = 0;i < val.length; i++){
    //     var currSkillName:string = val[i]['name'];
    //     if(event['name'].toUpperCase() == currSkillName.toUpperCase()){
    //       if(!this.selectedSkills.includes(currSkillName)) {
    //         var tmpSkillItems: Observable<string[]>;

    //         tmpSkillItems = new Observable((skill) => {
    //           var tmp:string[] = [];
    //           tmp.push(currSkillName);
    //           skill.next(tmp);
    //           skill.complete();
    //         })

    //         this.skillItems.subscribe(data => {
    //           this.selectedSkills.push(data[0]);
    //           this.populateTitleList();
    //         });
    //       }
    //     }
    //   }
    // });
  }

  locationSelect(e: TypeaheadMatch) {
    this.location = e.item['name'];
    this.locationField.style.color = 'black';
    if (this.title != undefined) {
      this.populateCharts();
    }
  }

  toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  public openSampleJobAdvertModal(template: TemplateRef<any>, advertiser: TopAdvertiserResult) {
    this.sampleJobAdvertModalAdvertiser = advertiser;
    this.sampleJobAdvertModal = this.modalService.show(template, { class: 'modal-lg' });
  }

}
