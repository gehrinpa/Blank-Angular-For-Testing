import { MdcListItemMeta } from '@angular-mdc/web';
import { Component, OnChanges, Input } from '@angular/core';
import { GraphMapItem } from '../graph-map-item';

@Component({
    selector: 'app-graph-map',
    templateUrl: './graph-map.component.html',
    styleUrls: ['./graph-map.component.scss']
})
export class GraphMapComponent implements OnChanges {
    public _relativeScaleOn: boolean;
    public set relativeScaleOn(value) {
        this._relativeScaleOn = value;
        this.drawChart();
    }
    public get relativeScaleOn(): boolean {
        return this._relativeScaleOn;
    }
    @Input() title1 = "";
    @Input() title2: string = null;
    @Input() bars: string;
    @Input() height: number;
    @Input() items: GraphMapItem[];
    @Input() relativeScaleButton = true;

    showLegend = false;
    // customColors = {};
    // customFunction = (name) => {
    //     console.log(name);
    //     const series = this.results.find(series => series.name == name);

    //     console.log(series);

    //     return series.color;
    // };
    customColors = [];
    colorScheme = {
        name: 'Variation',
        selectable: true,
        group: 'ordinal',
        domain: [
            "#A10A28",
            "#A10A28",
            "#E3963E",
            "#A10A28",
            "#A10A28",
            "#A10A28",
            "#A10A28",
            "#A10A28",
            "#A10A28",
            "#E3963E",
            "#E3963E",
            "#A10A28",
            "#E3963E",
            "#A10A28",
            "#E3963E",
            "#A10A28",
            "#A10A28",
            "#A10A28",
            "#A10A28",
            "#A10A28"
        ]
    };
    results = [];
    urls = {};

    constructor() {
        // this.customColors = {domain: this.barCustomColors()};
    }

    ngOnChanges() {
        this.drawChart();
    }

    drawChart() {
        if (!this.items) {
            return;
        }

        this.results = [];
        const isCompare = !!this.title2;

        // max values
        const maxCount1 = Math.max(...this.items.map(s => s.score1 || 0)) + 1;
        const maxCount2 = Math.max(...this.items.map(s => s.score2 || 0)) + 1;

        for (const item of this.items) {
            const result = {name: '', series: []};
            // let newColour = '#A10A28';
            if(item.url){
                result.name = '>'+item.name+'<';
                this.customColors.push('#E3963E');
            } else {
                result.name = item.name;
                this.customColors.push('#A10A28');
            }
            // const result = {name: item.name, series: []};
            let value1 = item.score1 || 0, value2 = item.score2 || 0;

            // relative scaling
            if (this.relativeScaleOn) {
                value1 = Math.log(value1 + 1) / Math.log(maxCount1 + 1);
                value2 = Math.log(value2 + 1) / Math.log(maxCount2 + 1);
            }

            result.series.push({name: this.title1, value: value1});

            if (isCompare) {
                result.series.push({name: this.title2, value: value2});
            }

            if(item.url){
                this.urls[item.name] = item.url;
            }

            this.results.push(result);
        }

        
        // this.colorScheme.domain = this.customColors;
        // this.results = [...this.results];

        // hide legend if no titles
        if (!this.title1 && !this.title2) {
            this.showLegend = false;
        } else {
            this.showLegend = true;
        }
    }

    onClick(data): void {
        const jobstring = data.series.substring(1, data.series.length - 1);
        if(this.urls[jobstring]){
            window.open(this.urls[jobstring], '_blank').focus();
        }
    }

    barCustomColors(){
        let returnVal: any[] = [];
        for(let i = 0; i < this.results.length; i++){
            if(Object.keys(this.urls).includes(this.results[i].name)){
                // returnVal.push({"name": this.results[i].name, "value": "#E3963E"});
                returnVal.push('#E3963E');
            } else {
                returnVal.push('#A10A28');
                // returnVal.push({"name": this.results[i].name, "value": "#000480"});
            }
        }
        return returnVal;
    }
}
