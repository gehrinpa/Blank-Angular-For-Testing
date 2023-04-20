import { ADZUNA_TYPEAHEAD_SIC_UK } from './../../services/adzuna-mapping';
import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { debounceTime } from 'rxjs/operators';
import { ADZUNA_TYPEAHEAD_CATEGORIES, ADZUNA_TYPEAHEAD_SIC_JERSEY } from 'src/app/services/adzuna-mapping';
import { ANIMATIONS } from '../../animations';
import { AuthService } from '../../services/auth.service';
import { SearchOptions, SharedService } from '../../services/shared.service';
import { RegionType, SearchParameters } from '../../shared';
import { MapComponent, RegionProperties } from '../map';
import { TitleBreakdownComponent } from '../title-breakdown/title-breakdown.component';
// import { TimeSeriesBreakdownComponent } from '../time-series-breakdown/time-series-breakdown.component';
import { LocationChooserMapComponent } from './../location-chooser-map/location-chooser-map.component';

@Component({
    selector: 'app-local-demand',
    templateUrl: './local-demand.component.html',
    styleUrls: ['./local-demand.component.scss'],
    animations: ANIMATIONS
})
export class LocalDemandComponent {

    public categories = ADZUNA_TYPEAHEAD_CATEGORIES;
    public selectedCategories: string[];
    public loading = false;
    public navbar = false;
    public useSicCode = false;
    public canUseSicCode = false;
    public JerseyCodes = ['chi', 'jey', 'ggy'];

    constructor(authService: AuthService,
        private sharedService: SharedService,
        private dialog: MatDialog,
        private route: ActivatedRoute,
        private router: Router) {
        this.canViewLEP = authService.canViewAnyRegionData(RegionType.LEP);
        this.canViewNUTS = authService.canViewAnyRegionData(RegionType.NUTS1);

        if (!this.canViewLEP) {
            this.searchParams.regionType = RegionType.NUTS1;
        }

        // valid years
        const thisYear = new Date().getUTCFullYear();
        const startYear = 2017;
        for (let year = startYear; year <= thisYear; year++) {
            this.dateRangeValidYears.push(year);
        }

        // default date range
        const curDate = new Date();
        curDate.setMonth(curDate.getMonth() - 3); // previous quarter
        this.dateRangeYear = curDate.getUTCFullYear();

        this.route.queryParamMap.subscribe(params => {
            this.selectedCategories = params.getAll('category');
        });

        this.sharedService.getRequestsInProgress().pipe(debounceTime(100)).subscribe(count => this.loading = count > 0);
    }

    static canViewMap = true;
    regionTypes = RegionType;
    regionData: RegionProperties = null;

    canViewLEP = true;
    canViewNUTS = true;

    // date range
    dateRangeYear: number;
    dateRangeValidYears: number[] = [];
    dateRangePickerConfig = {
        containerClass: 'theme-orange force-picker-right'
    };

    dateRangeQuarter: number;

    @ViewChild("map") map: MapComponent;
    @ViewChild("titles") titles: TitleBreakdownComponent;
    searchParams: SearchParameters = {
        regionType: RegionType.LAU
    };

    searchOptions: SearchOptions = {
        singleSearch: true,
        forceMode: 'sector',
        reqMapping: true
    };

    canViewMap() {
        return LocalDemandComponent.canViewMap;
    }

    inFullScreen() {
        if (!this.map) { return false; }
        return this.map.isFullscreen();
    }

    dateRangeChanged() {
        const startMonth = ((this.dateRangeQuarter - 1) * 3);
        const endMonth = ((this.dateRangeQuarter - 1) * 3) + 3; // month after

        this.searchParams.startDate = new Date(Date.UTC(this.dateRangeYear, startMonth, 1));
        // 0th day of month == last day of previous month
        this.searchParams.endDate = new Date(Date.UTC(this.dateRangeYear, endMonth, 0));
    }

    dateRangeYearChanged() {
        delete this.searchParams.startDate;
        delete this.searchParams.endDate;
        this.dateRangeQuarter = null;
        this.map.clearCloroplethData();
    }

    canDisplayQuarter(quarter: number) {
        if (this.dateRangeYear) {
            const now = moment();
            const endMonthNo = ((quarter - 1) * 3) + 2;

            const month = now.clone()
                .set('month', endMonthNo)
                .set('year', this.dateRangeYear)
                .endOf('month');
            return now.isAfter(month);
        } else {
            return false;
        }
    }

    async chooseLocation() {
        const ref = this.dialog.open(LocationChooserMapComponent);

        const { regionType, ...regionData } = await ref.afterClosed().toPromise();

        this.searchParams.regionType = regionType;

        this.regionData = regionData;

        if(this.JerseyCodes.includes(this.regionData.dataKey.toLowerCase()) && this.useSicCode){
            // this.useSicCode = false;
            // this.canUseSicCode = true;
            this.categories = ADZUNA_TYPEAHEAD_SIC_JERSEY;
            this.selectedCategories = [];
        } else if (this.useSicCode) {
            // this.useSicCode = false;
            // this.canUseSicCode = false;
            this.categories = ADZUNA_TYPEAHEAD_SIC_UK;
            this.selectedCategories = [];
        }
    }

    SicCodeChecked(){

        this.useSicCode = !this.useSicCode;
        if(this.useSicCode) {
            if(this.regionData && this.regionData.dataKey && this.JerseyCodes.includes(this.regionData.dataKey.toLowerCase()))
                this.categories = ADZUNA_TYPEAHEAD_SIC_JERSEY;
            else
                this.categories = ADZUNA_TYPEAHEAD_SIC_UK;
        }
        else
            this.categories = ADZUNA_TYPEAHEAD_CATEGORIES;

        this.selectedCategories = [];

    }

    redrawMap() {
        setTimeout(() => {
            if (this.map && this.map.map) {
                this.map.map.invalidateSize();
            }
        }, 0);
    }

    comparator(a: any, b: any): boolean {
        return a.key ? a.key === b : a.group === b;
    }

    async search() {
        this.router.navigate([], {
            queryParams: {
                category: this.selectedCategories
            }
        });
    }
}
