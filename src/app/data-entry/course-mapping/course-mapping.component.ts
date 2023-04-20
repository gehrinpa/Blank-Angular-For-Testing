import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { TypeaheadMatch } from 'ngx-bootstrap';
import { Observable, of as observableOf, Subject, concat } from 'rxjs';
import { switchMap, catchError, debounceTime, distinctUntilChanged, map, share, first } from 'rxjs/operators';
import XLSX from 'xlsx';

import { CourseService, ProviderSearchResult, CourseResult, CourseSkillResult, StudentCategory } from '../../services/course.service';

interface ColumnDef {
    key: string;
    label: string|string[];
    type: string;
    cssClass?: string;
    isArray?: boolean;
    multiCol?: boolean;
    subKeys?: any[]; // for multiCol

    // for numbers
    min?: number;
    max?: number;

    // for select
    items?: Observable<any[]>;
    typeahead?: Subject<string>;
    selectLabelKey?: string;
    selectValueKey?: string;
}

export interface CourseRow {
    id: number;
    title: string;
    providerId: number;
    providerName: string;
    skills: string[];
    studentCategory?: StudentCategory;
    level: number;
    duration: number; // weeks
    capacity: number;
    enrollment: number; // <= capacity
    retention: number; // <= enrollment
    success: number; // <= retention

    personas: {[key: string]: boolean};
    roles: {[key: string]: boolean};

    // validation
    modified: boolean;
    errors?: string[];

    // filtering
    isALevel: boolean;
    tPath?: string;
}

@Component({
    selector: 'app-course-mapping',
    templateUrl: './course-mapping.component.html',
    styleUrls: ['./course-mapping.component.scss']
})
export class CourseMappingComponent implements OnInit {
    titleLabels = [];
    personas = [];

    tPathways = [
        { label: 'Agriculture, Environmental and Animal Care', value: 't_path_agriculture' },
        { label: 'Business and Administrative', value: 't_path_business' },
        { label: 'Catering and Hospitality', value: 't_path_catering' },
        { label: 'Childcare and Education', value: 't_path_childcare' },
        { label: 'Construction', value: 't_path_construction' },
        { label: 'Creative and Design', value: 't_path_creative' },
        { label: 'Digital', value: 't_path_digital' },
        { label: 'Engineering and Manufacturing', value: 't_path_engineering' },
        { label: 'Hair and Beauty', value: 't_path_hair' },
        { label: 'Health and Science', value: 't_path_health' },
        { label: 'Legal, Finance and Accounting', value: 't_path_legal' },
        { label: 'Protective Services', value: 't_path_protective' },
        { label: 'Sales, Marketing and Procurement', value: 't_path_sales' },
        { label: 'Social Care', value: 't_path_social' },
        { label: 'Transport and Logistics', value: 't_path_transport' }
    ];

    // skill typeahead
    skillSubject = new Subject<string>();

    studentCategories = [
        {
            label: '16 to 18',
            value: StudentCategory.Age16To18
        },
        {
            label: '19+',
            value: StudentCategory.Age19Plus
        }
    ];

    columns: ColumnDef[] = [
        {
            key: 'providerName',
            type: 'static',
            cssClass: 'no-wrap',
            label: 'Provider'
        }, {
            key: 'title',
            type: 'text',
            cssClass: 'course',
            label: 'Course'
        }, {
            key: 'tPath',
            cssClass: 'course-type no-pad',
            items: observableOf(this.tPathways),
            type: 'select',
            label: 'Course Type',
            selectLabelKey: 'label',
            selectValueKey: 'value'
        }, {
            key: 'skills',
            type: 'select',
            cssClass: 'no-pad',
            typeahead: this.skillSubject,
            isArray: true,
            label: 'Key Skills (esp. Transferable)'
        }, {
            key: 'studentCategory',
            cssClass: 'no-pad',
            items: observableOf(this.studentCategories),
            type: 'select',
            label: 'Student Category',
            selectLabelKey: 'label',
            selectValueKey: 'value'
        }, {
            key: 'level',
            type: 'number', // list?
            label: 'Level',
            min: 0
        }, {
            key: 'duration',
            type: 'number', // weeks
            label: 'Duration',
            min: 0
        }, {
            key: 'capacity',
            type: 'number',
            label: 'Capacity',
            min: 0
        }, {
            key: 'enrollment',
            type: 'number',
            label: 'Enrollment',
            min: 0
        }, {
            key: 'retention',
            type: 'number',
            label: 'Retention',
            min: 0
        }, {
            key: 'success',
            type: 'number',
            label: 'Success',
            min: 0
        }, { // personas
            key: 'personas',
            type: 'checkbox',
            cssClass: 'bg-persona',
            isArray: true,
            multiCol: true,
            subKeys: this.personas,
            label: this.personas
        }, { // roles
            key: 'roles',
            type: 'checkbox',
            cssClass: 'bg-role',
            isArray: true,
            multiCol: true,
            subKeys: this.titleLabels,
            label: this.titleLabels
        }
    ];

    data: CourseRow[] = [];
    filteredData: CourseRow[] = [];
    errorData: CourseRow[] = [];
    defaultGroupData: CourseRow[] = [];

    @ViewChild('table') table: ElementRef;

    providerFilterText = '';
    providerTypeahead: Observable<ProviderSearchResult[]>;
    selectedProvider?: ProviderSearchResult = null;

    courseFilterText = '';
    courseType = 'a-level';

    modifiedTypes: string[] = [];

    constructor(private courseService: CourseService) { }

    ngOnInit() {
        this.providerTypeahead = Observable.create(observer => {
            observer.next(this.providerFilterText);
        }).pipe(
            switchMap((token: string) => this.courseService.searchProviders(token)),
            catchError(e => observableOf([]))
        );

        // skill select typeahead
        this.columns[3].items = concat(
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
    }

    async providerSelected(event: TypeaheadMatch) {
        this.selectedProvider = event.item;
        await this.loadProviderCourses(this.selectedProvider.id);
        if (this.data.length < 1) {
          this.loadDefaultGroupData();
        }
    }

    async loadDefaultGroupData() {
        this.courseService.listDefaultGroupContentsAtProvider(this.selectedProvider.id).subscribe(defaultCourses => {
            this.defaultGroupData = defaultCourses.map(c => this.apiToRow(c));
            // Remove Course IDs in the default group data for when it is exported.
            for (let i = 0; i < this.defaultGroupData.length; i++) {
              this.defaultGroupData[i].id = undefined;
            }
        });
    }

    courseTypeChanged() {
        // update roles/personas for type
        this.personas.length = 0;
        this.titleLabels.length = 0;
        if (this.courseType != 't_all' && this.courseType != 'a-level') {
            this.courseService.listCoursePersonas(this.courseType).subscribe(personas => {
                // avoid creating a new array to preserve references in the column
                this.personas.push(...personas.map(p => p.name));

                this.filteredData.filter(r => r.modified).forEach(r => this.validateRow(r));
            });

            this.courseService.listCourseRoles(this.courseType).subscribe(roles => {
                this.titleLabels.push(...roles.map(r => r.name));

                this.filteredData.filter(r => r.modified).forEach(r => this.validateRow(r));
            });
        }

        this.filterCourses();
    }

    filterCourses() {
        const showALevels = this.courseType == 'a-level';

        this.filteredData = this.data.filter(row => {
            if (row.isALevel != showALevels) {
                return false;
            }
            if (!showALevels && this.courseType != 't_all' && row.tPath != this.courseType) {
                return false;
            }

            if (row.modified) {
                return true;
            }

            if (this.courseFilterText.length >= 3 && !row.title.toLowerCase().includes(this.courseFilterText.toLowerCase())) {
                return false;
            }

            return true;
        });
    }

    spreadsheetFileChanged(event) {
        this.defaultGroupData = [];

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

    exportFilteredDataSpreadsheet() {
        this.exportSpreadsheet(this.filteredData);
    }

    exportDefaultResultsSpreadsheet() {
        this.exportSpreadsheet(this.defaultGroupData);
    }

    exportSpreadsheet(data: CourseRow[]) {
        // get the headers
        const workbook = XLSX.utils.book_new();

        const sheetData = [];

        // headers
        const groupHeaders = [];
        const personaStartCol = 11;
        const roleStartCol = personaStartCol + this.personas.length;
        groupHeaders[0] = 'Course Details';
        groupHeaders[personaStartCol] = 'Digital Persona';
        groupHeaders[roleStartCol] = 'Potential Roles';
        sheetData.push(groupHeaders);

        // skip tPath for now
        let headers = this.columns.filter(col => !col.multiCol && col.key != 'tPath').map(col => col.label);

        // prepend course type
        headers.unshift('Course Type');

        // prepend course id
        headers.unshift('Course Id');

        // personas
        headers = headers.concat(this.personas);

        // roles
        headers = headers.concat(this.titleLabels);

        sheetData.push(headers);

        const sheet = XLSX.utils.aoa_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(workbook, sheet, 'Sheet1');

        // merge group headers
        sheet['!merges'] = [
            {s: {c: 0              , r: 0}, e: {c: personaStartCol - 1                       , r: 0}}
        ];
        if (this.personas.length > 0) {
            sheet['!merges'].push({s: {c: personaStartCol, r: 0}, e: {c: roleStartCol - 1                          , r: 0}});
        }
        if (this.titleLabels.length > 0) {
            sheet['!merges'].push({s: {c: roleStartCol   , r: 0}, e: {c: roleStartCol + this.titleLabels.length - 1, r: 0}});
        }

        // widen columns to fit headers
        sheet['!cols'] = headers.map(header => ({width: header.length + 1}));

        // fill in the data

        let row = 2;

        for (const item of data) {
            let column = 0;

            // id
            let addr = XLSX.utils.encode_cell({c: column++, r: row});
            sheet[addr] = { v: item.id, t: 'n' };

            // course type
            let courseTypeValue: string;
            if (item.isALevel) {
              courseTypeValue = "A Level";
            } else {
              courseTypeValue = item.tPath;
            }
            addr = XLSX.utils.encode_cell({c: column++, r: row});
            sheet[addr] = { v: courseTypeValue, t: 's' };

            // main columns
            for (const col of this.columns) {
                if (col.multiCol) {
                    continue;
                }
                // skip for now
                if (col.key == 'tPath') {
                    continue;
                }

                addr = XLSX.utils.encode_cell({c: column++, r: row});

                let t = 's', v = item[col.key];

                if (col.isArray) {
                    v = v.join(', ');
                } else if (col.type == 'number') {
                    t = 'n';
                } else if (col.type == 'checkbox') {
                    t = 'n';
                    v = v ? 1 : undefined;
                } else if (v == null) {
                    v = undefined;
                }

                sheet[addr] = { v, t };
            }

            // fill in personas
            for (const persona of this.personas) {
                const hasPersona = item.personas[persona];

                addr = XLSX.utils.encode_cell({c: column++, r: row});
                sheet[addr] = { v: hasPersona ? 1 : undefined, t: 'n' };
            }

            // fill in roles
            for (const title of this.titleLabels) {
                const hasRole = item.roles[title];

                addr = XLSX.utils.encode_cell({c: column++, r: row});
                sheet[addr] = { v: hasRole ? 1 : undefined, t: 'n' };
            }
            row++;
        }

        // set valid cell range
        sheet['!ref'] = 'A1:' + XLSX.utils.encode_cell({c: headers.length - 1, r: row - 1});

        const courseType = this.getCourseTypeLabel(this.courseType).replace(' ', '_').replace(',', '');
        XLSX.writeFile(workbook, `Course_Mapping_Export_${courseType}.xlsx`);
    }

    saveChanges() {
        const modifiedRows = this.filteredData.filter(row => row.modified);
        const isValid = modifiedRows.every(row => this.validateRow(row));

        // display errors
        if (!isValid) {
            this.errorData = this.filteredData.filter(row => row.errors != null);
            return;
        }

        // hide any courses that are changing type
        this.filterCourses();

        this.errorData = [];

        for (const row of modifiedRows) {
            const observable = row.id > 0 ?
                this.courseService.update(row.id, this.rowToApi(row)) :
                this.courseService.create(this.rowToApi(row));

            observable.subscribe(data => {
                Object.assign(row, this.apiToRow(data));
                this.updateModifiedTypes();
            });
        }
    }

    revertRow(row: CourseRow) {
        this.courseService.get(row.id).subscribe(origData => {
            Object.assign(row, this.apiToRow(origData));
            row.errors = null;
        });
    }

    rowChanged(row: CourseRow) {
        row.modified = true;
        this.validateRow(row);
        this.updateModifiedTypes();
    }

    getCourseTypeLabel(type: string) {
        if (type == 'a-level') {
            return 'All A Levels';
        }
        if (type == 't_all') {
            return 'All Vocational';
        }

        return this.tPathways.find(p => p.value == type).label;
    }

    private async parseSheet(data: any[][]) {
        // check first row to make sure this is the right file
        const metaHeader = data.shift();
        const personasStartCol = 11;
        const rolesStartCol = personasStartCol + this.personas.length;
        const expected: [number, string][] = [
            [0, "Course Details"]
        ];

        if (this.personas.length) {
            expected.push([personasStartCol, "Digital Persona"]); // TODO: change header depending on course type
        }

        if (this.titleLabels.length) {
            expected.push([rolesStartCol, "Potential Roles"]);
        }

        for (const [index, val] of expected) {
            if (metaHeader[index] != val) {
                console.log(`Unexpected value "${metaHeader[index]}" in column ${index + 1}, expected "${val}"`);
                return;
            }
        }

        const headers: string[] = data.shift();

        let lastItem: CourseRow = null;

        // parse rows
        for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
          const row = data[rowIndex];
            if (row.length == 0) {
                continue;
            }

            const newItem: CourseRow = {
                id: null,
                title: '',
                providerId: 0,
                providerName: '',

                skills: [],
                studentCategory: null,
                level: 0,
                duration: 0,
                capacity: 0,
                enrollment: 0,
                retention: 0,
                success: 0,
                personas: {},
                roles: {},

                modified: true,
                isALevel: false,
            };
            headers.forEach((header, i) => {
                header = header.trim();
                // check if the header matches a column label
                if (header == 'Course Id') {
                    let id = row[i];
                    if (id === undefined) {
                      id = -rowIndex - 1;
                    }
                    newItem.id = id;
                    return;
                }

                if (header == 'Course Type') {
                  newItem.isALevel = row[i].toLowerCase() === "a level";
                  if (!newItem.isALevel) {
                    newItem.tPath = row[i];
                  }
                }

                const col = this.columns.find(c => c.label == header);

                if (col) {
                    if (col.type == 'checkbox') {
                        newItem[col.key] = row[i] == '1';
                    } else if (col.type == 'number') {
                        newItem[col.key] = +(row[i] || '0');
                    } else if (row[i] !== undefined) {
                        newItem[col.key] = row[i];
                        if (col.isArray) {
                            newItem[col.key] = newItem[col.key].split(',').map(s => s.trim()).filter(s => s != '');
                        }
                    }

                    return;
                }
                // check if this is a title column
                if (i >= rolesStartCol) {
                    newItem.roles[header] = row[i] == '1';
                    return;
                }

                // check if this is a persona column
                if (i >= personasStartCol) {
                    newItem.personas[header] = row[i] == '1';
                    return;
                }

                console.log(`Unexpected column "${header}"`);
            });

            // new provider
            if (!this.selectedProvider || newItem.providerName != this.selectedProvider.name) {
                // load data for this provider
                // TODO: either add a "get by name" endpoint or export provider ids
                const providers = await this.courseService.searchProviders(newItem.providerName).pipe(
                    map(results => results.filter(r => r.name == newItem.providerName)),
                    first()
                ).toPromise();

                if (providers.length == 0) {
                    console.log(`Unknown provider "${newItem.providerName}"`);
                }

                this.selectedProvider = providers[0];
                this.providerFilterText = this.selectedProvider.name;
                await this.loadProviderCourses(providers[0].id);
            }

            newItem.providerId = this.selectedProvider.id;

            // check if course exists
            const existingCourse = this.data.findIndex(c => c.id == newItem.id);

            if (existingCourse != -1) {
                // merge with existing
                newItem.isALevel = this.data[existingCourse].isALevel;
                newItem.tPath = this.data[existingCourse].tPath;

                // check if modified
                newItem.modified = !this.compareRows(this.data[existingCourse], newItem);

                this.data[existingCourse] = newItem;
            } else {
                this.data.push(newItem);
            }

            lastItem = newItem;

            if (newItem.modified) {
                this.validateRow(newItem);
            }
        }

        this.filterCourses();
        this.updateModifiedTypes();
    }

    private loadProviderCourses(providerId: number): Promise<any> {
        return new Promise((resolve, reject) => {
            return this.courseService.listAtProvider(providerId).subscribe(courses => {
                // preserve modified data
                const modifiedData = this.data.filter(row => row.modified);
                const newCourses = courses.filter(c => modifiedData.find(m => m.id == c.id) === undefined);

                this.data = modifiedData.concat(newCourses.map(c => this.apiToRow(c)));
                this.filterCourses();
                resolve();
            });
        });
    }

    private apiToRow(course: CourseResult) {

        const ret: CourseRow = {
            id: course.id,
            title: course.title,
            providerId: course.providerId,
            providerName: this.selectedProvider.name, // we only load courses after selecting a provider

            skills: course.skills,
            studentCategory: course.studentCategory,
            level: course.level,
            duration: course.durationWeeks,
            capacity: course.capacity,
            enrollment: course.enrollment,
            retention: course.retention,
            success: course.success,

            personas: {},
            roles: {},

            modified: false,

            isALevel: course.aLevelKey != null,
            tPath: course.tLevelKey
        };

        for (const persona of course.personas) {
            ret.personas[persona] = true;
        }

        for (const title of course.roles) {
            ret.roles[title] = true;
        }

        return ret;
    }

    private rowToApi(row: CourseRow) {
        const ret: Partial<CourseResult> = {
            // id
            title: row.title,
            providerId: row.providerId,
            // providerName
            skills: row.skills,
            studentCategory: row.studentCategory,
            level: row.level,
            durationWeeks: row.duration,
            capacity: row.capacity,
            enrollment: row.enrollment,
            retention: row.retention,
            success: row.success,

            personas: [],
            roles: [],

            tLevelKey: row.isALevel ? null : row.tPath
        };

        // personas
        for (const persona of this.personas) {
            if (row.personas[persona]) {
                ret.personas.push(persona);
            }
        }

        // role titles
        for (const title of this.titleLabels) {
            if (row.roles[title]) {
                ret.roles.push(title);
            }
        }
        return ret;
    }

    private validateRow(row: CourseRow) {
        const errors = [];

        if (+row.enrollment > +row.capacity) {
            errors.push('Enrolment should be less than or equal to Capacity');
        }
        if (+row.retention > +row.enrollment) {
            errors.push('Retention should be less than or equal to Enrolment');
        }
        if (+row.success > +row.retention) {
            errors.push('Success should be less than or equal to Retention');
        }

        const typeChange = row.tPath && row.tPath != this.courseType;

        if (!typeChange && this.personas.length && Object.keys(row.personas).filter(k => row.personas[k]).length == 0) {
            errors.push('At least one persona should be selected');
        }

        if (!typeChange && this.titleLabels.length && Object.keys(row.roles).filter(k => row.roles[k]).length == 0) {
            errors.push('At least one role should be selected');
        }

        row.errors = errors.length ? errors : null;
        return errors.length == 0;
    }

    private updateModifiedTypes() {
        this.modifiedTypes = this.data.filter(r => r.modified).map(r => r.isALevel ? 'a-level' : r.tPath);

        // unique values
        this.modifiedTypes = Array.from(new Set(this.modifiedTypes));
    }

    private compareRows(rowA: CourseRow, rowB: CourseRow) {
        const keysA = Object.keys(rowA);
        const keysB = Object.keys(rowB);

        for (const key of keysA) {
            // ignore validation data
            if (key == 'modified' || key == 'errors') {
                continue;
            }

            // missing key
            if (!(key in rowB)) {
                return false;
            }

            if (key == 'skills') {
                // array comparison
                if (rowA[key].length != rowB[key].length || !rowA[key].every((v, i) => v == rowB[key][i])) {
                    return false;
                }
            } else if (key == 'personas' || key == 'roles') {
                const subKeysA = Object.keys(rowA[key]);
                const subKeysB = Object.keys(rowB[key]);
                for (const sub of subKeysA) {
                    // treat missing key as false
                    if (!!rowA[key][sub] != !!rowB[key][sub]) {
                        return false;
                    }
                }
                for (const sub of subKeysB) {
                    if (!!rowA[key][sub] != !!rowB[key][sub]) {
                        return false;
                    }
                }
            } else if (rowA[key] != rowB[key]) {
                return false;
            }
        }

        // check if B has any additional keys
        for (const key of keysB) {
            if (key == 'modified' || key == 'errors') {
                continue;
            }
            if (!(key in rowA)) {
                return false;
            }
        }

        return true;
    }
}
