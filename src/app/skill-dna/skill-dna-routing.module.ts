import { Routes, RouterModule } from "@angular/router";
import { SkillDnaComponent } from "./skill-dna/skill-dna.component";
import { RequireFeaturePermission } from "../services/auth-route.service";
import { NgModule } from "@angular/core";

export const routes: Routes = [
    {
        path: '',
        component: SkillDnaComponent,
        canActivate: [RequireFeaturePermission],
        data: {
            features: ['skill-dna']
        }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SkillDnaRoutingModule { }
