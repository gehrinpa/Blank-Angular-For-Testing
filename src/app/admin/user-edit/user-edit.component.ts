import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, concat, of as observableOf } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, map, share } from 'rxjs/operators';
import XLSX from 'xlsx';

import { CourseService } from '../../services/course.service';
import { WorkforcePlanService, WorkforcePlanResult, WorkforcePlanRoleResult } from '../../services/workforce-plan.service';

export interface JobRow {
    id: number;
    functionalArea: string;
    title: string;
    jobSpec: string;
    jobFamily: string;
    skills: string[];

    currentHeadcount: number;
    year1Headcount: number;
    year2Headcount: number;
    year3Headcount: number;

    internal: number;
    apprentice: number;
    graduate: number;
    experienced: number;
    contract: number;

    forecastAttrition: number;

    // tracking
    modified?: boolean;
    deleted?: boolean;
    errors?: string[];
}

interface FunctionalArea {
    name: string;
    roles: JobRow[];
}

@Component({
    selector: 'app-user-edit',
    templateUrl: './user-edit.component.html',
    styleUrls: ['./user-edit.component.scss']
})
export class UserEditComponent implements OnInit {

    areas: FunctionalArea[] = [];
    errorData: JobRow[] = [];

    years = [2018, 2019, 2020];

    selectedPlan?: WorkforcePlanResult = null;
    targetDate = '';

    functionalAreaFilter = '';

    // skill typeahead
    skillSubject = new Subject<string>();
    skillItems: Observable<string[]>;

    constructor(private route: ActivatedRoute, private courseService: CourseService, private workforcePlanService: WorkforcePlanService) { }

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

        // load selected plan
        this.route.paramMap.pipe(
            switchMap(params => this.workforcePlanService.get(+params.get('id')))
        ).subscribe(plan => {
            this.selectedPlan = plan;
            this.targetDate = plan.targetDate && plan.targetDate.split('T')[0];
            this.loadSelectedPlan();
        });
    }

    calcNetChange(row: JobRow) {
        return row.year3Headcount - row.currentHeadcount;
    }

    calcTotalHiringDemand(row: JobRow) {
        return this.calcNetChange(row) + row.forecastAttrition;
    }

    calcTotal(area: FunctionalArea, field: string) {
        if (area.roles.length == 0) {
            return 0;
        }

        if (field == 'netChange') {
            return area.roles.map(role => this.calcNetChange(role)).reduce((a, b) => a + b);
        }

        if (field == 'totalHiringDemand') {
            return area.roles.map(role => this.calcTotalHiringDemand(role)).reduce((a, b) => a + b);
        }

        return area.roles.map(role => role[field]).reduce((a, b) => a + b);
    }

    saveChanges() {
        const flattenedRows = this.areas.map(a => a.roles).reduce((a, b) => a.concat(b));
        const modifiedRows = flattenedRows.filter(row => row.modified && !row.deleted);
        const isValid = modifiedRows.every(row => this.validateRow(row));

        // display errors
        if (!isValid) {
            this.errorData = modifiedRows.filter(row => row.errors != null);
            return;
        }

        this.workforcePlanService.update(this.selectedPlan.id, {
            name: this.selectedPlan.name,
            description: this.selectedPlan.description,
            type: this.selectedPlan.type,
            status: this.selectedPlan.status,
            targetDate: this.targetDate
        }).subscribe(plan => {
            this.selectedPlan = plan;
            this.targetDate = plan.targetDate && plan.targetDate.split('T')[0];
        });

        this.errorData = [];

        for (const row of modifiedRows) {
            const observable = row.id != 0 ?
                this.workforcePlanService.updateRole(row.id, this.rowToApi(row)) :
                this.workforcePlanService.createRole(this.rowToApi(row));

            observable.subscribe(data => {
                Object.assign(row, this.apiToRow(data));
            });
        }

        // remove deleted rows
        const deletedRows = flattenedRows.filter(row => row.deleted);

        for (const row of deletedRows) {
            if (row.id != 0) {
                this.workforcePlanService.deleteRole(row.id).subscribe(() => {
                    // remove from roles
                    for (const area of this.areas) {
                        const i = area.roles.indexOf(row);
                        if (i != -1) {
                            area.roles.splice(i, 1);

                            // delete the area if empty
                            if (area.roles.length == 0) {
                                this.areas.splice(this.areas.indexOf(area), 1);
                            }
                            break;
                        }
                    }
                });
            }
        }
    }

    revertRow(row: JobRow) {
        if (row.deleted) {
            row.deleted = false;
            return;
        }

        this.workforcePlanService.getRole(row.id).subscribe(origData => {
            Object.assign(row, this.apiToRow(origData));
            row.errors = null;
        });
    }

    rowChanged(row: JobRow) {
        row.modified = true;
        this.validateRow(row);
    }

    spreadsheetFileChanged(event) {
        const reader = new FileReader();
        reader.onload = e => {
            const workbook = XLSX.read((e.target as FileReader).result, { type: 'binary' });

            // get the first sheet
            const sheet = workbook.Sheets[workbook.SheetNames[0]];

            const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
            this.parseSheet(data);
        };
        reader.readAsBinaryString(event.target.files[0]);
    }

    exportSpreadsheet() {
        const data = [];

        data.push([
            'Id',
            'Functional Area\nJob Title',
            'Job Spec',
            'Job Family',
            'Key Skills',
            'Current\nHeadcount',
            ...this.years.map(year => `YE ${year}`),
            `Net Change\n(${this.years[0]}-${this.years[this.years.length - 1]})`,
            'Forecast\nAttrition',
            'Total Hiring Demand\n(Change + Attrition)',
            'Internal',
            'Apprentice',
            'Graduate',
            'Experienced',
            'Contract'
        ]);

        const roleRanges: [number, number][] = [];
        for (const area of this.areas) {
            // area header
            data.push([
                '',
                area.name,
                '',
                '',
                '',
                'Step 1',
                'Step 2',
                'Step 3',
                'Step 4',
                '',
                'Step 5',
                '',
                'Step 6',
                'Step 7',
                'Step 8',
                'Step 9',
                'Step 10'
            ]);

            const firstRole = data.length;
            for (const role of area.roles) {
                data.push([
                    role.id,
                    role.title,
                    role.jobSpec,
                    role.jobFamily,
                    role.skills.join(', '),
                    role.currentHeadcount,
                    role.year1Headcount,
                    role.year2Headcount,
                    role.year3Headcount,
                    undefined,
                    role.forecastAttrition,
                    undefined,
                    role.internal,
                    role.apprentice,
                    role.graduate,
                    role.experienced,
                    role.contract
                ]);
            }
            const lastRole = data.length - 1;
            roleRanges.push([firstRole, lastRole]);

            // footer
            data.push([
                '',
                `Sub Total ${area.name}`
            ]);

            data.push([]);
        }

        // create sheet
        const workbook = XLSX.utils.book_new();
        const sheet = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, sheet, 'Sheet1');

        // fill in formulas
        for (const range of roleRanges) {
            for (let i = range[0]; i <= range[1]; i++ ) {
                // net change
                const currentHCRef = XLSX.utils.encode_cell({c: 5, r: i});
                const year3Ref = XLSX.utils.encode_cell({c: 8, r: i});
                const netChangeRef = XLSX.utils.encode_cell({c: 9, r: i});

                sheet[netChangeRef] = {f: `${year3Ref}-${currentHCRef}`};

                // total hiring demand
                const forecastAttritionRef = XLSX.utils.encode_cell({c: 10, r: i});
                const totalHiringDemandRef = XLSX.utils.encode_cell({c: 11, r: i});
                sheet[totalHiringDemandRef] = {f: `${netChangeRef}+${forecastAttritionRef}`};
            }

            // totals
            for (let i = 5; i < data[0].length; i++) {
                const firstRef = XLSX.utils.encode_cell({c: i, r: range[0]});
                const lastRef = XLSX.utils.encode_cell({c: i, r: range[1]});
                const resultRef = XLSX.utils.encode_cell({c: i, r: range[1] + 1});
                sheet[resultRef] = {f: `SUM(${firstRef}:${lastRef})`};
            }
        }

        XLSX.writeFile(workbook, `${this.selectedPlan.name} - Workforce Plan Export.xlsx`);
    }

    private parseSheet(data: any[][]) {
        let currentArea: FunctionalArea = null;

        const headers: string[] = data.shift();

        const colMap = {
            'Job Title': {key: 'title', type: 's'},
            'Job Spec': {key: 'jobSpec', type: 's'},
            'Job Family': {key: 'jobFamily', type: 's'},
            'Key Skills': {key: 'skills'},

            'Current Headcount': {key: 'currentHeadcount', type: 'i'},
            // TODO: years
            'YE 2018': {key: 'year1Headcount', type: 'i'},
            'YE 2019': {key: 'year2Headcount', type: 'i'},
            'YE 2020': {key: 'year3Headcount', type: 'i'},
            'Net Change (2018-2020)': null,
            'Forecast Attrition': {key: 'forecastAttrition', type: 'i'},
            'Total Hiring Demand (Change + Attrition)': null,

            'Internal': {key: 'internal', type: 'i'},
            'Apprentice': {key: 'apprentice', type: 'i'},
            'Graduate': {key: 'graduate', type: 'i'},
            'Experienced': {key: 'experienced', type: 'i'},
            'Contract': {key: 'contract', type: 'i'},
        };

        // assume first two columns are id and area/title
        if (headers[0] != 'Id' || !headers[1].startsWith('Functional Area')) {
            console.log(headers[0], headers[1]);
            return;
        }

        for (const row of data) {
            if (currentArea == null) {
                // find area
                currentArea = this.areas.find(a => a.name == row[1]);

                // new area
                if (!currentArea) {
                    currentArea = {name: row[1], roles: []};
                    this.areas.push(currentArea);
                }
                continue;
            } else if (!row[1]) {
                // reset at end of role
                currentArea = null;
                continue;
            } else if (!row[0] && row[1].startsWith('Sub Total ')) {
                // ignore subtotals
                continue;
            }

            // find existing role
            let role: JobRow = null;
            let roleArea: FunctionalArea = null;
            for (const area of this.areas) {
                role = area.roles.find(r => r.id == row[0]);
                if (role != null) {
                    roleArea = area;
                    break;
                }
            }

            // new role
            if (!role && !row[0]) {
                role = {
                    id: 0,
                    functionalArea: currentArea.name,
                    title: row[1],
                    jobSpec: '',
                    jobFamily: '',
                    skills: [],

                    currentHeadcount: 0,
                    year1Headcount: 0,
                    year2Headcount: 0,
                    year3Headcount: 0,
                    forecastAttrition: 0,

                    internal: 0,
                    apprentice: 0,
                    graduate: 0,
                    experienced: 0,
                    contract: 0,

                    modified: true
                };
                currentArea.roles.push(role);
            } else if (!role) {
                console.log('invalid id', row[0]);
                continue;
            }

            // import column values
            for (let i = 2; i < row.length; i++) {
                const header = headers[i].trim().replace(/\s+/g, ' ');
                if (header in colMap) {
                    const m = colMap[header];

                    // ignore
                    if (!m) {
                        continue;
                    }

                    if (m.type == 's') {
                        role.modified = role.modified || (role[m.key] || "") != (row[i] || "");
                        role[m.key] = row[i];
                    } else if (m.type == 'i') {
                        const val = +(row[i] || '0');
                        role.modified = role.modified || role[m.key] != val;
                        role[m.key] = val;
                    } else if (m.key == 'skills') {
                        // split skill list and compare
                        const skills = ((row[i] || "") as string).split(',').map(s => s.trim()).filter(s => s.length > 0);
                        if (role.skills.length != skills.length || !role.skills.every((v, si) => v == skills[si])) {
                            role.modified = true;
                            role.skills = skills;
                        }
                    }

                } else {
                    console.log(headers[i], row[i]);
                }
            }

            if (role.modified) {
                this.validateRow(role);
            }

            // check if role changed functional area
            if (roleArea && currentArea != roleArea) {
                role.functionalArea = currentArea.name;
                currentArea.roles.push(role);
                // remove from old area
                roleArea.roles.splice(roleArea.roles.indexOf(role), 1);
            }
        }
    }

    private apiToRow(plan: WorkforcePlanRoleResult) {
        const ret: JobRow = {
            id: plan.id,
            functionalArea: plan.functionalArea,
            title: plan.title,
            jobSpec: plan.jobSpec,
            jobFamily: plan.jobFamily,
            skills: plan.skills,

            currentHeadcount: plan.currentHeadcount,
            year1Headcount: plan.year1Headcount,
            year2Headcount: plan.year2Headcount,
            year3Headcount: plan.year3Headcount,
            forecastAttrition: plan.forecastAttrition,

            internal: plan.internal,
            apprentice: plan.apprentice,
            graduate: plan.graduate,
            experienced: plan.experienced,
            contract: plan.contract,

            modified: false
        };

        return ret;
    }

    private rowToApi(row: JobRow) {
        const ret: Partial<WorkforcePlanRoleResult> = {
            planId: this.selectedPlan.id,
            functionalArea: row.functionalArea,
            title: row.title,
            jobSpec: row.jobSpec,
            jobFamily: row.jobFamily,
            skills: row.skills,

            currentHeadcount: row.currentHeadcount,
            year1Headcount: row.year1Headcount,
            year2Headcount: row.year2Headcount,
            year3Headcount: row.year3Headcount,
            forecastAttrition: row.forecastAttrition,

            internal: row.internal,
            apprentice: row.apprentice,
            graduate: row.graduate,
            experienced: row.experienced,
            contract: row.contract
        };

        return ret;
    }

    private validateRow(row: JobRow) {
        const errors = [];

        if (this.calcTotalHiringDemand(row) != row.internal + row.apprentice + row.graduate + row.experienced + row.contract) {
            errors.push('Hiring Demand');
        }

        row.errors = errors.length ? errors : null;
        return errors.length == 0;
    }

    private loadSelectedPlan() {
        this.workforcePlanService.listRolesForPlan(this.selectedPlan.id).subscribe(roles => {
            this.areas = [];
            for (const role of roles) {
                let area = this.areas.find(a => a.name == role.functionalArea);
                // new area
                if (area == null) {
                    area = {
                        name: role.functionalArea,
                        roles: []
                    };
                    this.areas.push(area);
                }

                area.roles.push(this.apiToRow(role));
            }
        });
    }
}
