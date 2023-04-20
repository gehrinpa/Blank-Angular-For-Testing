import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
    selector: 'app-request-progress-indicator',
    templateUrl: './request-progress-indicator.component.html',
    styleUrls: ['./request-progress-indicator.component.scss']
})
export class RequestProgressIndicatorComponent implements OnInit, OnDestroy {
    loading = false;
    private loadSub: Subscription;

    @Input()
    public theme: string;

    constructor(private sharedService : SharedService) { }

    ngOnInit() {
        // loading indicator
        this.loadSub = this.sharedService.getRequestsInProgress().pipe(debounceTime(100)).subscribe(count => this.loading = count > 0);
    }

    ngOnDestroy() {
        this.loadSub.unsubscribe();
    }
}
