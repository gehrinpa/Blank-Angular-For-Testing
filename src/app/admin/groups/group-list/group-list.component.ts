import { Component } from '@angular/core';
import { ManageUsersService } from 'src/app/services/manage-users.service';
import { GroupsService } from 'src/app/services/groups.service';

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.scss']
})
export class GroupListComponent {

  public groupsList: any = [];

  constructor(private manageUsersService: ManageUsersService, private groupService: GroupsService) {
    this.groupService.list().subscribe(groups => {
      this.groupsList = groups;
    });
  }

}
