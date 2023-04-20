import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { Observable } from 'rxjs';

import { ManageUsersService } from 'src/app/services/manage-users.service';
import { CompanyResult, CompanySearchResult } from 'src/app/services/company.service';
import { GroupsService } from 'src/app/services/groups.service';

@Component({
    selector: 'app-user-list',
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
    // sector typeahead
    // sectorFilterText = '';
    // sectorTypeahead: Observable<SectorSearchResult[]>;
    // selectedSector?: SectorSearchResult = null;

    // // company typeahead
    companyFilterText = '';
    companyTypeahead: Observable<CompanySearchResult[]>;
    // selectedCompany?: CompanySearchResult = null;

    // planType?: WorkforcePlanType = null;
    // planStatus?: WorkforcePlanStatus = null;

    // plans: WorkforcePlanResult[] = [];
    // filteredPlans: WorkforcePlanResult[] = [];

    // icons = {
    //     [WorkforcePlanType.Plan]: 'description',
    //     [WorkforcePlanType.Scenario]: 'gps_fixed',
    //     [WorkforcePlanType.Enquiry]: 'phone'
    // };

    badgeModifier = {
        false: 'badge-success',
        true: 'badge-danger',
        null: 'badge-secondary'
    };

    allCompanies: CompanyResult[] = [];

    rolesList: any = [];
    userRole: any;

    groupsList: any = [];
    userGroup: any;

    usersFormModel: any = {};
    updateUser = false;

    createCompanyModalRef: BsModalRef;
    createUserRoleModalRef: BsModalRef;

    @ViewChild('deleteModalTemplate') deleteModalTemplate: TemplateRef<any>;
    deleteModalRef: BsModalRef;
    usersList: any = [];

    constructor(private manageUsersService: ManageUsersService,
      private groupsService: GroupsService,
      private modalService: BsModalService) { }

    ngOnInit() {
        this.getUsersList();
        this.getRolesList();
        this.getGroupsList();
    }

    companyChange() {
        if (this.companyFilterText != '') {
            this.updateUserList();
        } else {
            this.getUsersList();
        }
    }

    openCreateCompanyModal(template: TemplateRef<any>, userId) {
        this.usersFormModel = {};
        this.updateUser = false;
        if (userId != "") {
            this.usersFormModel = this.usersList.filter(x => x.userId == userId)[0];
            this.usersFormModel.password = "Empty@1";
            this.usersFormModel.confirmPassword = "Empty@1";
            this.updateUser = true;
        }

        this.createCompanyModalRef = this.modalService.show(template);
    }

    createUserSubmit(usersFormModel) {
        this.manageUsersService.create(usersFormModel).subscribe(data => {
            this.createCompanyModalRef.hide();
            this.getUsersList();
        });
    }

    openDeleteModal(userId) {
        if (userId != "") {
            this.usersFormModel = this.usersList.filter(x => x.userId == userId)[0];
        }
        this.deleteModalRef = this.modalService.show(this.deleteModalTemplate);
    }

    public updateUserList() {
        this.usersList = this.usersList.filter(user => user["companyName"] == this.companyFilterText);
    }

    private getRolesList() {
        this.manageUsersService.rolesList().subscribe(roles => {
            this.rolesList = roles;
        });
    }

    getRoleById(userRoleId) {
        this.userRole = "";
        const role = this.rolesList.filter(x => x.id == userRoleId)[0];
        if (role != undefined) {
            this.userRole = role.name;
        }
        return true;
    }

    private getGroupsList() {
        this.groupsService.list().subscribe(groups => {
            this.groupsList = groups;
        });
    }

    getGroupById(groupId: string) {
        this.userGroup = "";
        const group = this.groupsList.filter(x => x.id == groupId)[0];
        if (group != undefined) {
            this.userGroup = group.name;
        }
        return true;
    }

    private getUsersList() {
        this.manageUsersService.usersList().subscribe(users => {
            this.usersList = users;
        });
    }

    // Role Modal
    openUserRoleModal(template: TemplateRef<any>) {
        this.createUserRoleModalRef = this.modalService.show(template);
    }

    createRoleSubmit(form: NgForm) {
        const role = form.value.userRoleName;
        this.manageUsersService.createUserRole(role).subscribe(data => {
            this.createUserRoleModalRef.hide();
            this.getRolesList();
        });
    }

    // Delete User
    deleteSubmit() {
        this.manageUsersService.delete(this.usersFormModel.userId).subscribe(data => {
            this.deleteModalRef.hide();
            this.getUsersList();
        });
    }

}
