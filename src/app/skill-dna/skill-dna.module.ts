import { BsDatepickerModule, TypeaheadModule, CollapseModule } from 'ngx-bootstrap';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkillDnaComponent } from './skill-dna/skill-dna.component';
import { SkillDnaRoutingModule } from './skill-dna-routing.module';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SkillDnaRoutingModule,
    FormsModule,
    BsDatepickerModule.forRoot(),
    TypeaheadModule.forRoot(),
    CollapseModule.forRoot(),
    SharedModule
  ],
  declarations: [
    SkillDnaComponent
  ]
})
export class SkillDnaModule { }
