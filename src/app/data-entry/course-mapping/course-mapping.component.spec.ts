import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { TypeaheadModule, AlertModule, TooltipModule } from 'ngx-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { of as observableOf } from 'rxjs';
import XLSX from 'xlsx';

import { CourseMappingComponent, CourseRow } from './course-mapping.component';
import { CourseService, CourseResult, StudentCategory } from '../../services/course.service';

import { StubRequestProgressIndicatorComponent } from '../../testing/stubs';

/* tslint:disable:max-line-length */
// we can't really embed an xlsx to test import with
const testCSV = `Course Details,,,,,,,,,,,Digital Persona,,,,Potential Roles,,,,,,,,,,,
Course Id, Provider,Course,Key Skills (esp. Transferable),Student Category,Level,Duration,Capacity,Enrollment,Retention,Success,Beginner,Citizen ,Worker,Maker,Software Developer ,IT Support,IT Trainer,Web Developer,Tester,Data Analyst,Database Admin,Games Developer,Digital Marketer,Graphic Designer,Business Analyst,Network Engineer
1,South Tyneside College,Access to HE - Digital Skills Diploma,Javascript?  C++,Age19Plus,3,39,,,,,,,1,1,1,,,1,,,,1,1,1,,
2,South Tyneside College,"Certificate in Information Technology Users Skills, Level 1 & 2", ,Age19Plus,"1, 2",22,,,,,1,,1,,,,,,,,,,,,,
3,South Tyneside College,"Digital Learning for Educators, Level 4",,Age19Plus,4,17,,,,,,,,,,,1,,,,,,,,,
4,South Tyneside College,HNC Computer Games Design Level 4,,Age19Plus,4,39,,,,,,,,,1,,,,,,,1,,,,
5,South Tyneside College,HND Computer Games Design Level 5,,Age19Plus,5,39,,,,,,,,,1,,,,,,,1,,,,
6,South Tyneside College,BTEC Computer Science and Software Development Level 3 (year 1),,Age16To18,3,39,,,,,,,1,1,1,,,1,,,,,1,,,
7,South Tyneside College,BTEC Computer Science and Software Development Level 3 (year 2),,Age16To18,3,39,,,,,,,1,1,1,,,1,,,,,1,1,1,1
8,South Tyneside College,BTEC First Diploma in Information and Creative Digital Technology level 2,,Age16To18,2,39,,,,,,,1,,1,,,1,,,,1,,1,,
9,South Tyneside College,BTEC Creative Digital Media Level 2,,Age16To18,2,39,,,,,,,1,1,,,,,,,,,1,1,,
10,South Tyneside College,BTEC Creative Digital Media Production Level 3 (year 1),,Age16To18,3,39,,,,,,,1,1,,,,,,,,,1,1,,
11,South Tyneside College,BTEC Creative Digital Media Production Level 3 (year 2),,Age16To18,3,39,,,,,,,1,1,,,,,,,,,1,1,,
0,South Tyneside College,"BTEC in Creative Digital Game Development, Level 3",,Age16To18,3,39,,,,,,,1,1,1,,,,,,,1,1,1,,
`;

const testCSVNoPersonas = `Course Details,,,,,,,,,,,
Course Id, Provider,Course,Key Skills (esp. Transferable),Student Category,Level,Duration,Capacity,Enrollment,Retention,Success
1,South Tyneside College,Access to HE - Digital Skills Diploma,Javascript?  C++,Age19Plus,3,39,,,,`;
/* tslint:enable:max-line-length */

const parsedTestCSV: CourseRow[] = [
    {
        id: 1,
        title: "Access to HE - Digital Skills Diploma",
        providerId: 100,
        providerName: "South Tyneside College",
        skills: ["Javascript?  C++"],
        studentCategory: StudentCategory.Age19Plus,
        level: 3,
        duration: 39,
        capacity: 0,
        enrollment: 0,
        retention: 0,
        success: 0,
        personas: {
            'Beginner': false,
            'Citizen': false,
            'Worker': true,
            'Maker': true
        },
        roles: {
            'Software Developer': true,
            'IT Support': false,
            'IT Trainer': false,
            'Web Developer': true,
            'Tester': false,
            'Data Analyst': false,
            'Database Admin': false,
            'Games Developer': true,
            'Digital Marketer': true,
            'Graphic Designer': true,
            'Business Analyst': false,
            'Network Engineer': false
        },
        modified: true,
        isALevel: false
    }, {
        id: 2,
        title: "Certificate in Information Technology Users Skills, Level 1 & 2",
        providerId: 100,
        providerName: "South Tyneside College",
        skills: [],
        studentCategory: StudentCategory.Age19Plus,
        level: NaN,
        duration: 22,
        capacity: 0,
        enrollment: 0,
        retention: 0,
        success: 0,
        personas: {
            'Beginner': true,
            'Citizen': false,
            'Worker': true,
            'Maker': false
        },
        roles: {
            'Software Developer': false,
            'IT Support': false,
            'IT Trainer': false,
            'Web Developer': false,
            'Tester': false,
            'Data Analyst': false,
            'Database Admin': false,
            'Games Developer': false,
            'Digital Marketer': false,
            'Graphic Designer': false,
            'Business Analyst': false,
            'Network Engineer': false
        },
        modified: true,
        isALevel: false
    }, {
        id: 3,
        title: "Digital Learning for Educators, Level 4",
        providerId: 100,
        providerName: "South Tyneside College",
        skills: [],
        studentCategory: StudentCategory.Age19Plus,
        level: 4,
        duration: 17,
        capacity: 0,
        enrollment: 0,
        retention: 0,
        success: 0,
        personas: {
            'Beginner': false,
            'Citizen': false,
            'Worker': false,
            'Maker': false
        },
        roles: {
            'Software Developer': false,
            'IT Support': false,
            'IT Trainer': true,
            'Web Developer': false,
            'Tester': false,
            'Data Analyst': false,
            'Database Admin': false,
            'Games Developer': false,
            'Digital Marketer': false,
            'Graphic Designer': false,
            'Business Analyst': false,
            'Network Engineer': false
        },
        modified: false,
        isALevel: false
    }, {
        id: 4,
        title: "HNC Computer Games Design Level 4",
        providerId: 100,
        providerName: "South Tyneside College",
        skills: [],
        studentCategory: StudentCategory.Age19Plus,
        level: 4,
        duration: 39,
        capacity: 0,
        enrollment: 0,
        retention: 0,
        success: 0,
        personas: {
            'Beginner': false,
            'Citizen': false,
            'Worker': false,
            'Maker': false
        },
        roles: {
            'Software Developer': true,
            'IT Support': false,
            'IT Trainer': false,
            'Web Developer': false,
            'Tester': false,
            'Data Analyst': false,
            'Database Admin': false,
            'Games Developer': true,
            'Digital Marketer': false,
            'Graphic Designer': false,
            'Business Analyst': false,
            'Network Engineer': false
        },
        modified: true,
        isALevel: false
    }, {
        id: 5,
        title: "HND Computer Games Design Level 5",
        providerId: 100,
        providerName: "South Tyneside College",
        skills: [],
        studentCategory: StudentCategory.Age19Plus,
        level: 5,
        duration: 39,
        capacity: 0,
        enrollment: 0,
        retention: 0,
        success: 0,
        personas: {
            'Beginner': false,
            'Citizen': false,
            'Worker': false,
            'Maker': false
        },
        roles: {
            'Software Developer': true,
            'IT Support': false,
            'IT Trainer': false,
            'Web Developer': false,
            'Tester': false,
            'Data Analyst': false,
            'Database Admin': false,
            'Games Developer': true,
            'Digital Marketer': false,
            'Graphic Designer': false,
            'Business Analyst': false,
            'Network Engineer': false
        },
        modified: true,
        isALevel: false
    }, {
        id: 6,
        title: "BTEC Computer Science and Software Development Level 3 (year 1)",
        providerId: 100,
        providerName: "South Tyneside College",
        skills: [],
        studentCategory: StudentCategory.Age16To18,
        level: 3,
        duration: 39,
        capacity: 0,
        enrollment: 0,
        retention: 0,
        success: 0,
        personas: {
            'Beginner': false,
            'Citizen': false,
            'Worker': true,
            'Maker': true
        },
        roles: {
            'Software Developer': true,
            'IT Support': false,
            'IT Trainer': false,
            'Web Developer': true,
            'Tester': false,
            'Data Analyst': false,
            'Database Admin': false,
            'Games Developer': false,
            'Digital Marketer': true,
            'Graphic Designer': false,
            'Business Analyst': false,
            'Network Engineer': false
        },
        modified: true,
        isALevel: false
    }, {
        id: 7,
        title: "BTEC Computer Science and Software Development Level 3 (year 2)",
        providerId: 100,
        providerName: "South Tyneside College",
        skills: [],
        studentCategory: StudentCategory.Age16To18,
        level: 3,
        duration: 39,
        capacity: 0,
        enrollment: 0,
        retention: 0,
        success: 0,
        personas: {
            'Beginner': false,
            'Citizen': false,
            'Worker': true,
            'Maker': true
        },
        roles: {
            'Software Developer': true,
            'IT Support': false,
            'IT Trainer': false,
            'Web Developer': true,
            'Tester': false,
            'Data Analyst': false,
            'Database Admin': false,
            'Games Developer': false,
            'Digital Marketer': true,
            'Graphic Designer': true,
            'Business Analyst': true,
            'Network Engineer': true
        },
        modified: true,
        isALevel: false
    }, {
        id: 8,
        title: "BTEC First Diploma in Information and Creative Digital Technology level 2",
        providerId: 100,
        providerName: "South Tyneside College",
        skills: [],
        studentCategory: StudentCategory.Age16To18,
        level: 2,
        duration: 39,
        capacity: 0,
        enrollment: 0,
        retention: 0,
        success: 0,
        personas: {
            'Beginner': false,
            'Citizen': false,
            'Worker': true,
            'Maker': false
        },
        roles: {
            'Software Developer': true,
            'IT Support': false,
            'IT Trainer': false,
            'Web Developer': true,
            'Tester': false,
            'Data Analyst': false,
            'Database Admin': false,
            'Games Developer': true,
            'Digital Marketer': false,
            'Graphic Designer': true,
            'Business Analyst': false,
            'Network Engineer': false
        },
        modified: true,
        isALevel: false
    }, {
        id: 9,
        title: "BTEC Creative Digital Media Level 2",
        providerId: 100,
        providerName: "South Tyneside College",
        skills: [],
        studentCategory: StudentCategory.Age16To18,
        level: 2,
        duration: 39,
        capacity: 0,
        enrollment: 0,
        retention: 0,
        success: 0,
        personas: {
            'Beginner': false,
            'Citizen': false,
            'Worker': true,
            'Maker': true
        },
        roles: {
            'Software Developer': false,
            'IT Support': false,
            'IT Trainer': false,
            'Web Developer': false,
            'Tester': false,
            'Data Analyst': false,
            'Database Admin': false,
            'Games Developer': false,
            'Digital Marketer': true,
            'Graphic Designer': true,
            'Business Analyst': false,
            'Network Engineer': false
        },
        modified: true,
        isALevel: false
    }, {
        id: 10,
        title: "BTEC Creative Digital Media Production Level 3 (year 1)",
        providerId: 100,
        providerName: "South Tyneside College",
        skills: [],
        studentCategory: StudentCategory.Age16To18,
        level: 3,
        duration: 39,
        capacity: 0,
        enrollment: 0,
        retention: 0,
        success: 0,
        personas: {
            'Beginner': false,
            'Citizen': false,
            'Worker': true,
            'Maker': true
        },
        roles: {
            'Software Developer': false,
            'IT Support': false,
            'IT Trainer': false,
            'Web Developer': false,
            'Tester': false,
            'Data Analyst': false,
            'Database Admin': false,
            'Games Developer': false,
            'Digital Marketer': true,
            'Graphic Designer': true,
            'Business Analyst': false,
            'Network Engineer': false
        },
        modified: true,
        isALevel: false
    }, {
        id: 11,
        title: "BTEC Creative Digital Media Production Level 3 (year 2)",
        providerId: 100,
        providerName: "South Tyneside College",
        skills: [],
        studentCategory: StudentCategory.Age16To18,
        level: 3,
        duration: 39,
        capacity: 0,
        enrollment: 0,
        retention: 0,
        success: 0,
        personas: {
            'Beginner': false,
            'Citizen': false,
            'Worker': true,
            'Maker': true
        },
        roles: {
            'Software Developer': false,
            'IT Support': false,
            'IT Trainer': false,
            'Web Developer': false,
            'Tester': false,
            'Data Analyst': false,
            'Database Admin': false,
            'Games Developer': false,
            'Digital Marketer': true,
            'Graphic Designer': true,
            'Business Analyst': false,
            'Network Engineer': false
        },
        modified: true,
        isALevel: false
    }, {
        id: 0,
        title: "BTEC in Creative Digital Game Development, Level 3",
        providerId: 100,
        providerName: "South Tyneside College",
        skills: [],
        studentCategory: StudentCategory.Age16To18,
        level: 3,
        duration: 39,
        capacity: 0,
        enrollment: 0,
        retention: 0,
        success: 0,
        personas: {
            'Beginner': false,
            'Citizen': false,
            'Worker': true,
            'Maker': true
        },
        roles: {
            'Software Developer': true,
            'IT Support': false,
            'IT Trainer': false,
            'Web Developer': false,
            'Tester': false,
            'Data Analyst': false,
            'Database Admin': false,
            'Games Developer': true,
            'Digital Marketer': true,
            'Graphic Designer': true,
            'Business Analyst': false,
            'Network Engineer': false
        },
        modified: true,
        isALevel: false
    }
];

const parsedTestCSVNoPersonas: CourseRow[] = [
    {
        id: 1,
        title: "Access to HE - Digital Skills Diploma",
        providerId: 100,
        providerName: "South Tyneside College",
        skills: ["Javascript?  C++"],
        studentCategory: StudentCategory.Age19Plus,
        level: 3,
        duration: 39,
        capacity: 0,
        enrollment: 0,
        retention: 0,
        success: 0,
        personas: {},
        roles: {},
        modified: false,
        isALevel: false
    }
];

// mck data returned by api during spreadsheet import
const importApiData = [
    // only differences are personas/roles for this one
    {
        id: 1,
        title: parsedTestCSV[0].title,
        providerId: 100,
        skills: parsedTestCSV[0].skills,
        studentCategory: parsedTestCSV[0].studentCategory,
        level: parsedTestCSV[0].level,
        durationWeeks: parsedTestCSV[0].duration,
        capacity: parsedTestCSV[0].capacity,
        enrollment: parsedTestCSV[0].enrollment,
        retention: parsedTestCSV[0].retention,
        success: parsedTestCSV[0].success,
        personas: [], roles: []
    },
    {id: 2, personas: [], roles: []},
    // this one is identical and will not be marked as modified
    {
        id: 3,
        title: parsedTestCSV[2].title,
        providerId: 100,
        skills: parsedTestCSV[2].skills,
        studentCategory: parsedTestCSV[2].studentCategory,
        level: parsedTestCSV[2].level,
        durationWeeks: parsedTestCSV[2].duration,
        capacity: parsedTestCSV[2].capacity,
        enrollment: parsedTestCSV[2].enrollment,
        retention: parsedTestCSV[2].retention,
        success: parsedTestCSV[2].success,
        personas: [],
        roles: ['IT Trainer']
    },
    {id: 4, personas: [], roles: []},
    {id: 5, personas: [], roles: []},
    {id: 6, personas: [], roles: []},
    {id: 7, personas: [], roles: []},
    {id: 8, personas: [], roles: []},
    {id: 9, personas: [], roles: []},
    {id: 10, personas: [], roles: []},
    {id: 11, personas: [], roles: []}
];

const emptyRow: CourseRow = {
    id: 0,
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
    personas : {},
    roles: {},
    modified: false,
    isALevel: false
};

describe('CourseMappingComponent', () => {
    let component: CourseMappingComponent;
    let fixture: ComponentFixture<CourseMappingComponent>;

    let courseCreateSpy: jasmine.Spy;
    let courseUpdateSpy: jasmine.Spy;
    let courseListPersonasSpy: jasmine.Spy;
    let courseListRolesSpy: jasmine.Spy;

    beforeEach(async(() => {
        const courseServiceStub = {
            listAtProvider: id => {
                // for import test
                if (id == 100) {
                    return observableOf(importApiData);
                }

                return observableOf([{
                    id: 0,
                    title: '',
                    personas: [],
                    skills: [],
                    roles: [],
                    aLevelKey: 'A'
                }]);
            },

            searchProviders(name) {
                return observableOf([
                    // for import test
                    {id: 100, name: 'South Tyneside College'}
                ].filter(p => name != '' && p.name.toLowerCase().includes(name.toLowerCase())));
            },

            searchCourseSkills(text) {
                return observableOf([{name: 'A Skill'}]);
            },

            listCoursePersonas: t => observableOf([{id: 1, name: 'Beginner'}]),
            listCourseRoles: t => observableOf([{id: 1, name: 'A Role'}]),

            create: d => observableOf({personas: [], roles: []}),
            update: d => observableOf({personas: [], roles: []})
        };

        courseCreateSpy = spyOn(courseServiceStub, 'create').and.callThrough();
        courseUpdateSpy = spyOn(courseServiceStub, 'update').and.callThrough();
        courseListPersonasSpy = spyOn(courseServiceStub, 'listCoursePersonas').and.callThrough();
        courseListRolesSpy = spyOn(courseServiceStub, 'listCourseRoles').and.callThrough();

        TestBed.configureTestingModule({
            declarations: [
                CourseMappingComponent,
                StubRequestProgressIndicatorComponent
            ],
            imports: [
                FormsModule,
                AlertModule.forRoot(),
                TooltipModule.forRoot(),
                TypeaheadModule.forRoot(),
                NgSelectModule
            ],
            providers: [
                {provide: CourseService, useValue: courseServiceStub}
            ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
    fixture = TestBed.createComponent(CourseMappingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should setup provider typeahead correctly', () => {
        component.providerTypeahead.subscribe(results => {
            expect(results).toEqual([]);
        });

        component.providerFilterText = 'tyne';
        component.providerTypeahead.subscribe(results => {
            expect(results).toEqual([{id: 100, name: 'South Tyneside College'}]);
        });
    });

    it('should setup skill typeahead correctly', fakeAsync(() => {
        let skills = null;
        component.columns[3].items.subscribe(s => skills = s);

        // initial value
        expect(skills).toEqual([]);

        component.skillSubject.next('skill');

        // debounce
        tick(200);
        expect(skills).toEqual(['A Skill']);
    }));


    it('should import a spreadsheet with personas', fakeAsync(() => {
        const file = new File([testCSV], 'Test_Courses.csv', {type: 'text/csv'});
        const mockFileReader = {
            readAsBinaryString : () => {},
            onload: null
        };
        spyOn(window as any, 'FileReader').and.returnValue(mockFileReader);

        component.personas = ['Beginner', 'Citizen', 'Worker', 'Maker'];

        component.spreadsheetFileChanged({target: {files: [file]}});

        // fake the load
        mockFileReader.onload({target: {result: testCSV}});

        tick();

        // ignore these
        for (const row of component.data) {
            delete row.tPath;
            delete row.errors;
        }

        expect(component.data).toEqual(parsedTestCSV);
    }));

    it('should import a spreadsheet without personas', fakeAsync(() => {
        const file = new File([testCSVNoPersonas], 'Test_Courses.csv', {type: 'text/csv'});
        const mockFileReader = {
            readAsBinaryString : () => {},
            onload: null
        };
        spyOn(window as any, 'FileReader').and.returnValue(mockFileReader);

        component.spreadsheetFileChanged({target: {files: [file]}});

        // fake the load
        mockFileReader.onload({target: {result: testCSVNoPersonas}});

        tick();

        // ignore these
        for (const row of component.data) {
            delete row.tPath;
            delete row.errors;
        }

        expect(component.data[0]).toEqual(parsedTestCSVNoPersonas[0]);
    }));

    it('should export a spreadsheet', () => {
        component.data = [
            {
                id: 1,
                title: 'Course A',
                providerId: 2,
                providerName: 'Provider A',

                skills: ['SkillA', 'SkillB'],
                studentCategory: StudentCategory.Age16To18,
                level: 3,
                duration: 4,
                capacity: 8,
                enrollment: 7,
                retention: 6,
                success: 5,
                personas: {
                    'Beginner': false,
                    'Citizen': true,
                    'Worker': true,
                    'Maker': false,
                },
                roles: {},
                modified: false,
                isALevel: false
            }
        ];

        component.filteredData = component.data;

        component.personas = ['Beginner', 'Citizen', 'Worker', 'Maker'];
        component.titleLabels = [
            'Software Developer',
            'IT Support',
            'IT Trainer',
            'Web Developer',
            'Tester',
            'Data Analyst',
            'Database Admin',
            'Games Developer',
            'Digital Marketer',
            'Graphic Designer',
            'Business Analyst',
            'Network Engineer'
        ];

        const exportedRow = [
            1, // id
            'Provider A',
            'Course A',
            'SkillA, SkillB',
            'Age16To18',
            3, // level
            4, // duration
            8, // capacity
            7, // enrollment
            6, // retention
            5, // success
            undefined, 1, 1, undefined, // personas

            // roles
        ];
        let exportedHeaders = component.columns.filter(c => !c.multiCol && c.key != 'tPath').map(c => c.label);
        exportedHeaders.unshift('Course Id'); // prepend
        exportedHeaders = exportedHeaders.concat(component.personas);
        exportedHeaders = exportedHeaders.concat(component.titleLabels);

        for (const title of component.titleLabels) {
            component.data[0].roles[title] = Math.random() > 0.5;
            exportedRow.push(component.data[0].roles[title] ? 1 : undefined);
        }

        const spy = spyOn(XLSX, 'writeFile').and.callFake((workbook, filename) => {
            expect(workbook.SheetNames.length).toBe(1);

            const sheet = workbook.Sheets[workbook.SheetNames[0]];

            // valid range
            expect(sheet['!ref']).toBe('A1:AA3');

            // first header
            expect(sheet['A1'].v).toBe('Course Details');
            expect(sheet['L1'] && sheet['L1'].v).toBe('Digital Persona');
            expect(sheet['P1'] && sheet['P1'].v).toBe('Potential Roles');

            // data
            let colNum = 0;
            for (const header of exportedHeaders) {

                // second header
                let addr = XLSX.utils.encode_cell({c: colNum, r: 1});
                expect(sheet[addr]).toBeDefined(`Label for ${header} missing`);
                expect(sheet[addr].v).toBe(exportedHeaders[colNum]);

                // data
                addr = XLSX.utils.encode_cell({c: colNum, r: 2});
                expect(sheet[addr]).toBeDefined(`Value for ${header} missing`);
                expect(sheet[addr].v).toBe(exportedRow[colNum]);
                colNum++;
            }
        });

        //component.exportSpreadsheet();
        expect(spy.calls.count()).toBe(1, 'writeFile should be called once');
    });

    it('should update personas and roles when changing course type', () => {
        component.courseType = 't_path_digital';
        const origPersonas = component.personas = [];
        const origRoles = component.titleLabels = [];

        component.courseTypeChanged();

        expect(courseListPersonasSpy.calls.count()).toBe(1);
        expect(courseListRolesSpy.calls.count()).toBe(1);

        expect(component.personas.length).toBeGreaterThan(0);
        expect(component.titleLabels.length).toBeGreaterThan(0);

        // preserve references
        expect(component.personas).toBe(origPersonas);
        expect(component.titleLabels).toBe(origRoles);
    });

    it('should revalidate rows when changing course type', () => {
        const invalidRow: CourseRow = Object.assign({}, emptyRow);
        invalidRow.roles = {1: false};
        invalidRow.title = 'Bad Course';
        invalidRow.modified = true;
        invalidRow.tPath = 't_path_digital';

        component.courseType = 't_path_digital';
        component.data = component.filteredData = [invalidRow];

        component.courseTypeChanged();

        expect(invalidRow.errors).not.toBeNull();
    });

    it('should preserve modified course data when changing provider', () => {
        const modifiedRow: CourseRow = Object.assign({}, emptyRow);
        modifiedRow.id = 2;
        modifiedRow.title = 'Updated Course';
        modifiedRow.modified = true;
        modifiedRow.isALevel = true;
        component.data = [modifiedRow];

        component.providerSelected({item: {id: 1, name: 'Provider A'}} as any);

        expect(component.filteredData.length).toBe(2);
        expect(component.filteredData[0]).toBe(modifiedRow);
    });

    it('should preserve modified course data when course filter changes', () => {
        const filteredRow: CourseRow = Object.assign({}, emptyRow);
        filteredRow.id = 2;
        filteredRow.title = 'A Course';
        filteredRow.isALevel = true;

        const modifiedRow: CourseRow = Object.assign({}, emptyRow);
        modifiedRow.id = 2;
        modifiedRow.title = 'Updated Course';
        modifiedRow.modified = true;
        modifiedRow.isALevel = true;

        const nonModifiedRow: CourseRow = Object.assign({}, emptyRow);
        nonModifiedRow.title = 'Other Course';
        nonModifiedRow.isALevel = true;
        component.data = [filteredRow, nonModifiedRow, modifiedRow, nonModifiedRow, filteredRow];

        component.courseFilterText = 'other';
        component.filterCourses();

        expect(component.filteredData.length).toBe(3);
        expect(component.filteredData.find(row => row.title == modifiedRow.title)).toBeDefined();
    });

    it('should validate row on change', () => {
        // invalid: no roles
        const rowA: CourseRow = Object.assign({}, emptyRow);
        rowA.personas = {'Beginner': true};
        rowA.roles = {'Title A': false};
        rowA.title = 'A Course';

        // invalid: no personas
        const rowB: CourseRow = Object.assign({}, emptyRow);
        rowB.roles = {'Title A': true};
        rowB.title = 'Course B';

        // valid
        const rowC: CourseRow = Object.assign({}, emptyRow);
        rowC.personas = {'Beginner': true};
        rowC.roles = {'Title A': true};
        rowC.title = 'Course C';

        // invalid: enrolled > capacity
        const rowD: CourseRow = Object.assign({}, emptyRow);
        rowD.personas = {'Beginner': true};
        rowD.roles = {'Title A': true};
        rowD.title = 'Course D';
        rowD.capacity = 1;
        rowD.enrollment = 2;

        // invalid: success > retention > enrolled > capacity
        const rowE: CourseRow = Object.assign({}, emptyRow);
        rowE.personas = {'Beginner': true};
        rowE.roles = {'Title A': true};
        rowE.title = 'Course E';
        rowE.capacity = 1;
        rowE.enrollment = 2;
        rowE.retention = 3;
        rowE.success = 4;

        component.personas = ['Beginner'];
        component.titleLabels = ['Title A'];

        component.rowChanged(rowA);
        expect(rowA.modified).toBeTruthy('row should be marked as modified');
        expect(rowA.errors).not.toBeNull('first row should have one error');
        expect(rowA.errors.length).toBe(1, 'first row should have one error');

        component.rowChanged(rowB);
        expect(rowB.modified).toBeTruthy('row should be marked as modified');
        expect(rowB.errors).not.toBeNull('second row should have one error');
        expect(rowB.errors.length).toBe(1, 'second row should have one error');

        component.rowChanged(rowC);
        expect(rowC.modified).toBeTruthy('row should be marked as modified');
        expect(rowC.errors).toBeNull('third row should have no errors');

        component.rowChanged(rowD);
        expect(rowD.modified).toBeTruthy('row should be marked as modified');
        expect(rowD.errors).not.toBeNull('fourth row should have one error');
        expect(rowD.errors.length).toBe(1, 'fourth row should have one error');

        component.rowChanged(rowE);
        expect(rowE.modified).toBeTruthy('row should be marked as modified');
        expect(rowE.errors).not.toBeNull('fifth row should have three errors');
        expect(rowE.errors.length).toBe(3, 'fifth row should have three errors');
    });

    it('should not save if there are invalid rows', () => {
        // invalid
        const invalidRow: CourseRow = Object.assign({}, emptyRow);
        invalidRow.roles = {1: false};
        invalidRow.title = 'Bad Course';
        invalidRow.modified = true;

        // valid
        const validRow: CourseRow = Object.assign({}, emptyRow);
        validRow.personas = {'Beginner': true};
        validRow.roles = {1: true};
        validRow.title = 'Good Course';
        validRow.modified = true;

        component.data = [validRow, invalidRow];
        component.filteredData = component.data;

        component.personas = ['Beginner'];
        component.titleLabels = ['Title A'];

        component.saveChanges();

        expect(courseUpdateSpy.calls.count()).toBe(0);
    });

    it('should only save modified rows', () => {
        // invalid
        const invalidRow: CourseRow = Object.assign({}, emptyRow);
        invalidRow.id = 1;
        invalidRow.roles = {'Role': false};
        invalidRow.personas = {'Citizen': true};
        invalidRow.title = 'Bad Course';
        invalidRow.modified = false;

        // valid
        const validRow: CourseRow = Object.assign({}, emptyRow);
        validRow.id = 2;
        validRow.personas = {'Beginner': true};
        validRow.roles = {'Role': true, 'Other Role': false};
        validRow.title = 'Good Course';
        validRow.modified = true;

        component.data = [validRow, invalidRow];
        component.filteredData = component.data;
        component.selectedProvider = {name: '', id: 0};
        component.personas = ['Beginner', 'Citizen'];
        component.titleLabels = ['Role', 'Other Role'];

        component.saveChanges();

        expect(courseUpdateSpy.calls.count()).toBe(1);

        const apiCourse = courseUpdateSpy.calls.first().args[1];
        expect(apiCourse.personas).toEqual(['Beginner']);
        expect(apiCourse.roles).toEqual(['Role']);
    });

    it('should create rows without an id', () => {
        const validRow: CourseRow = Object.assign({}, emptyRow);
        validRow.id = 0;
        validRow.personas = {'Beginner': true};
        validRow.roles = {1: true};
        validRow.title = 'Good Course';
        validRow.modified = true;

        component.data = [validRow];
        component.filteredData = component.data;
        component.selectedProvider = {name: '', id: 0};

        component.saveChanges();

        expect(courseCreateSpy.calls.count()).toBe(1);
        expect(courseUpdateSpy.calls.count()).toBe(0);
    });
});
