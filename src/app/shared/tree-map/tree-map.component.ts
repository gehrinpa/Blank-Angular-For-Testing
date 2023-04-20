import { Component, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { TreeMapItem } from '../tree-map-item';

@Component({
    selector: 'app-tree-map',
    templateUrl: './tree-map.component.html',
    styleUrls: ['./tree-map.component.scss']
})
export class TreeMapComponent implements OnChanges {
    @Input() items: TreeMapItem[];
    @Input() title: string;
    @Output() select = new EventEmitter();

    height = 500;
    results = [];
    maxValue = 0;

    ngOnChanges() {
        this.drawChart();
    }

    drawChart() {
        if (this.items) {
            this.results = this.items.map(item => ({name: item.name, value: item.score}));
            this.maxValue = Math.max(...this.items.map(item => item.score));
        } else {
            this.results = [];
            this.maxValue = 0;
        }
    }

    getColour = (name) => {
        const value = this.results.find(result => result.name == name).value;
        const fract = value / this.maxValue;

        const colours = [
            {r: 0xff, g: 0xff, b: 0xb2},
            {r: 0xfe, g: 0xd9, b: 0x76},
            {r: 0xfe, g: 0xb2, b: 0x4c},
            {r: 0xfd, g: 0x8d, b: 0x3c},
            {r: 0xf0, g: 0x3b, b: 0x20},
            {r: 0xbd, g: 0x00, b: 0x26}];

        // get two colours to blend
        const scaled = fract * (colours.length - 1);
        const col0 = colours[Math.floor(scaled)];
        const col1 = colours[Math.ceil(scaled)];

        // blend colours
        const blend = scaled - Math.floor(scaled);

        const r = col0.r * (1.0 - blend) + col1.r * blend;
        const g = col0.g * (1.0 - blend) + col1.g * blend;
        const b = col0.b * (1.0 - blend) + col1.b * blend;

        const toHex = n => {
            const ret = Math.round(n).toString(16);
            return ret.length == 1 ? '0' + ret : ret;
        };

        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    getDescription(name) {
        return this.items.find(i => i.name == name).description || '';
    }

    itemSelected(e) {
        const index = this.items.findIndex(i => i.name == e.name) + 1;
        this.select.emit([{row: index}]);
    }
}

