import { Component, OnInit } from '@angular/core';
import { AppService } from '../../utils/app.service';
import { ToastrService } from 'ngx-toastr';
import { RequestModel, StaffLoginModel } from '../../utils/interface';
import { LocalService } from '../../utils/local.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
    staffLogin: StaffLoginModel = {} as StaffLoginModel;
  
  dataLoading: boolean = false;
  totalRegistrations: number = 0;
  todayRegistrations: number = 0;

  constructor(
    private service: AppService,
    private toastr: ToastrService,
    private localService: LocalService
  ) {}

  ngOnInit(): void {
    this.staffLogin = this.localService.getEmployeeDetail();
    this.getDashboardCount();
  }

  getDashboardCount() {
    var data = {
      CreatedBy : this.staffLogin.StaffLoginId
    }
    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(data)).toString()
    };
    this.dataLoading = true;
    this.service.DashboardCount(obj).subscribe((response: any) => {
      if (response.Message === "Success") {
        this.totalRegistrations = response.TotalRegistrations;
        this.todayRegistrations = response.TodayRegistrations;
      } else {
        this.toastr.error(response.Message);
      }
      this.dataLoading = false;
    }, err => {
      this.toastr.error("Error fetching dashboard data");
      this.dataLoading = false;
    });
  }
}
