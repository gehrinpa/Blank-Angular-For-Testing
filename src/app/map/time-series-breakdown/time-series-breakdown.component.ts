import { Component, Input, OnChanges } from '@angular/core';
import colorInterpolate from 'color-interpolate';
import { RegionType, SearchParameters } from 'src/app/shared';
import { RegionProperties } from '../map/map.component';
import { ANIMATIONS } from './../../animations';
import { ChartData, GeodataService } from './../../services/geodata.service';

enum AreaChartMode {
  RAW_COUNT = 0,
  RELATIVE = 1
}

type DatePeriodMode = 'monthly' | 'weekly';

interface ColorScheme {
  domain: string[];
}

@Component({
  selector: 'app-time-series-breakdown',
  templateUrl: './time-series-breakdown.component.html',
  styleUrls: ['./time-series-breakdown.component.scss'],
  animations: ANIMATIONS
})
export class TimeSeriesBreakdownComponent implements OnChanges {

  @Input() public searchParams: SearchParameters = {};
  @Input() public regionData: RegionProperties = null;
  @Input() public year: number;
  @Input() public categories: string[] = [];
  @Input() public sicCode: boolean = false;

  public groupBy = 'category';
  public groupByEnabled = true;

  private colors = [
    '#e31314',
    '#7f7f7f',
    '#000000'
  ];

  private interpolate = colorInterpolate(this.colors);

  public chartData: ChartData;
  public sectorChartData: ChartData;

  public chartScheme: ColorScheme = {
    domain: [this.colors[0]]
  };

  public sectorChartScheme: ColorScheme = {
    domain: []
  };

  public sectorChartMode: AreaChartMode = AreaChartMode.RAW_COUNT;
  public datePeriodMode: DatePeriodMode = 'monthly';

  public chartOptions = {
    legend: true,
    showLabels: true,
    animations: true,
    xAxis: true,
    yAxis: true,
    showYAxisLabel: true,
    showXAxisLabel: true,
    yAxisLabel: 'Jobs',
    xAxisLabel: this.datePeriodMode === 'monthly' ? 'Month' : 'Week ending',
    timeline: true
  };

  constructor(private geodata: GeodataService) {}

  async ngOnChanges(): Promise<void> {

    if (this.categories.length > 1 || this.categories.includes('all-sectors') || this.categories.includes('All SIC codes')) {
      this.groupBy = 'category';
      this.groupByEnabled = true;
    } else {
      this.groupBy = 'merged_title';
      this.groupByEnabled = false;
    }

    return this.update();
  }

  async update() {
    if (this.regionData && this.categories) {

      const regionType = RegionType[this.searchParams.regionType];

      this.chartData = [
        {
          name: this.regionData.name,
          series: await this.geodata
            .getJobChartTotal(this.datePeriodMode, this.year, regionType, this.regionData.dataKey, this.categories, this.sicCode)
            .toPromise()
        }
      ];

      const sectorChartData = await this.geodata
        .getJobChart(this.datePeriodMode, this.year, this.groupBy, regionType, this.regionData.dataKey, this.categories, this.sicCode)
        .toPromise();

      const colorValues = [...new Array(sectorChartData.length).keys()]
        .map(n => (1 / (sectorChartData.length - 1)) * n);

      const domain = colorValues.map(n => this.interpolate(n));

      this.sectorChartScheme = { domain }; 

      this.sectorChartData = sectorChartData;

    } else {
      this.sectorChartData = null;
      this.chartData = null;
    }
  }

  async setDatePeriodMode(datePeriodMode: DatePeriodMode) {
    this.datePeriodMode = datePeriodMode;
    this.chartOptions.xAxisLabel = this.datePeriodMode === 'monthly' ? 'Month' : 'Week ending';
    await this.update();
  }

  async setGroupBy(groupBy: string) {
    this.groupBy = groupBy;
    await this.update();
  }
}
