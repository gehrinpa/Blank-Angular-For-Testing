import { Component } from '@angular/core';
import { GroupsService } from '../../../services/groups.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-group-create',
  templateUrl: './group-create.component.html',
  styleUrls: ['./group-create.component.scss']
})
export class GroupCreateComponent {

    public groupName = "";
    public creatingGroup = false;
    public error = "";

    constructor(
        private groupService: GroupsService,
        private router: Router,
        private activatedRoute: ActivatedRoute) { }

    public async createGroup() {
        this.creatingGroup = true;
        try {
            this.groupService.create({ name: this.groupName }).subscribe(data => {
              this.router.navigate([".."], { relativeTo: this.activatedRoute });
            });
        } catch (e) {
            this.error = e;
        }
        this.creatingGroup = false;
    }

}
