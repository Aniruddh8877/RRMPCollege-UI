import { Component, ViewChild, } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import { LoadDataService } from '../../utils/load-data.service';
import { LocalService } from '../../utils/local.service';
import { Education, Gender, StaffType, Status } from '../../utils/enum';
import { ActionModel, RequestModel, StaffLoginModel } from '../../utils/interface';
import { Router } from '@angular/router';
declare var $: any
@Component({
  selector: 'app-student-registration',
  templateUrl: './student-registration.component.html',
  styleUrls: ['./student-registration.component.css']
})
export class StudentRegistrationComponent {
  dataLoading: boolean = true
  StaffList: any = []
  StudentList: any = []
  Staff: any = {}
  Student: any = {}
  isSubmitted = false
  DepartmentList: any = []
  DesignationList: any = []
  PageSize = ConstantData.PageSizes;
  p: number = 1;
  Search: string = '';
  reverse: boolean = false;
  sortKey: string = '';
  itemPerPage: number = this.PageSize[0];
  action: ActionModel = {} as ActionModel;
  staffLogin: StaffLoginModel = {} as StaffLoginModel;
  StatusList = this.loadDataService.GetEnumList(Status);
  EducationList = this.loadDataService.GetEnumList(Education);
  StaffTypeList = this.loadDataService.GetEnumList(StaffType);
  AllEducationList = Education;
  AllStatusList = Status;
  AllStaffTypeList = StaffType;
  Filter:any={};

  sort(key: any) {
    this.sortKey = key;
    this.reverse = !this.reverse;
  }

  onTableDataChange(p: any) {
    this.p = p
  }

  constructor(
    private service: AppService,
    private toastr: ToastrService,
    private loadDataService: LoadDataService,
    private localService: LocalService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.staffLogin = this.localService.getEmployeeDetail();
    this.validiateMenu();
    this.getStudentList();
    this.getStaffList();
    // this.getDepartmentList();
    // this.getDesignationList();

      this.Student.StaffId = this.staffLogin.StaffId;
      this.Filter.RoleId = this.staffLogin.RoleId;
  }

  validiateMenu() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({ Url: this.router.url, StaffLoginId: this.staffLogin.StaffLoginId })).toString()
    }
    this.dataLoading = true
    this.service.validiateMenu(obj).subscribe((response: any) => {
      this.action = this.loadDataService.validiateMenu(response, this.toastr, this.router)
      this.dataLoading = false;
    }, (err => {
      this.toastr.error("Error while fetching records")
      this.dataLoading = false;
    }))
  }

  @ViewChild('formStudent') formStudent: NgForm;
  resetForm() {
    this.Student = {};
    this.Student.RegistrationDate = new Date();
    this.Student.Status = 1
     this.Student.StaffId = this.staffLogin.StaffId; // Auto-select Institution again
    if (this.formStudent) {
      this.formStudent.control.markAsPristine();
      this.formStudent.control.markAsUntouched();
    }
    this.isSubmitted = false
  }

  getStaffList() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString()
    }
    this.dataLoading = true
    this.service.getStaffList(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        this.StaffList = response.StaffList;
      } else {
        this.toastr.error(response.Message)
      }
      this.dataLoading = false
    }, (err => {
      this.toastr.error("Error while fetching records")
      this.dataLoading = false;
    }))
  }

  getDesignationList() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString()
    }
    this.dataLoading = true
    this.service.getDesignationList(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        this.DesignationList = response.DesignationList;
      } else {
        this.toastr.error(response.Message)
      }
      this.dataLoading = false;
    }, (err => {
      this.toastr.error("Error while fetching records")
      this.dataLoading = false;
    }))
  }

  getDepartmentList() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString()
    }
    this.dataLoading = true
    this.service.getDepartmentList(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        this.DepartmentList = response.DepartmentList;
      } else {
        this.toastr.error(response.Message)
      }
      this.dataLoading = false
    }, (err => {
      this.toastr.error("Error while fetching records")
      this.dataLoading = false;
    }))
  }

  getStudentList() {

    var data = {
      CreatedBy: this.staffLogin.StaffLoginId,
      StaffId: this.Filter.StaffId
    }

    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(data)).toString()
    }
    this.dataLoading = true
    this.service.getStudentList(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        this.StudentList = response.StudentList;
        this.filterByInstitution(); 
      } else {
        this.toastr.error(response.Message)
      }
      this.dataLoading = false
    }, (err => {
      this.toastr.error("Error while fetching records")
      this.dataLoading = false;
    }))
  }

  saveStudent() {
    this.isSubmitted = true;
    this.formStudent.control.markAllAsTouched();
    if (this.formStudent.invalid) {
      this.toastr.error("Fill all the required fields !!")
      return
    }

    // this.Student.RegistrationDate = this.loadDataService.loadDateTime(this.Stu.RegistrationDate);
    // this.Student.DOB = this.loadDataService.loadDateTime(this.Staff.DOB);
    this.Student.UpdatedBy = this.staffLogin.StaffLoginId;
    this.Student.CreatedBy = this.staffLogin.StaffLoginId;
    //  this.Student.StaffId = this.staffLogin.StaffLoginId;
    console.log(this.Student);

    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(this.Student)).toString()
    }
    this.dataLoading = true;
    this.service.saveStudent(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        if (this.Staff.StaffId > 0) {
          this.toastr.success("Student detail updated successfully")

        } else {
          this.toastr.success("Student added successfully")
        }
        $('#staticBackdrop').modal('hide')
        this.resetForm()
        this.getStudentList()
      } else {
        this.toastr.error(response.Message)
        this.dataLoading = false;
        this.Staff.JoinDate = new Date(this.Staff.JoinDate);
        if (this.Staff.DOB)
          this.Staff.DOB = new Date(this.Staff.DOB);
      }
    }, (err => {
      this.toastr.error("Error occured while submitting data")
      this.dataLoading = false;
    }))
  }

  deleteStudent(obj: any) {
    if (confirm("Are your sure you want to delete this recored")) {
      var request: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(obj)).toString()
      }
      this.dataLoading = true;
      this.service.deleteStudent(request).subscribe(r1 => {
        let response = r1 as any
        if (response.Message == ConstantData.SuccessMessage) {
          this.toastr.success("Record Deleted successfully")
          this.getStudentList()
        } else {
          this.toastr.error(response.Message)
        }
        this.dataLoading = false;
      }, (err => {
        this.toastr.error("Error occured while deleteing the recored")
        this.dataLoading = false;
      }))
    }
  }

  editStudent(obj: any) {
    this.resetForm()
    this.Student = obj;
    this.Staff.JoinDate = new Date(obj.JoinDate);
    if (this.Staff.DOB)
      this.Staff.DOB = new Date(obj.DOB);
  }

selectedInstitutionId: number = 0;
FilteredStudentList: any[] = [];

filterByInstitution() {
  if (this.selectedInstitutionId && this.selectedInstitutionId != 0) {
    this.FilteredStudentList = this.StudentList.filter((x:any) => x.StaffId === this.selectedInstitutionId);
  } else {
    this.FilteredStudentList = [...this.StudentList];
  }
}

  
}
