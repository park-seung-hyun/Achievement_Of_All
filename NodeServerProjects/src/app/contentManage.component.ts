// ContentManage.component
// 컨텐츠 관리 페이지
// (권한이 manager인 사용자만 접근 가능)

import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpService } from './http-service';
import { Router } from '@angular/router';
import { DataService} from './data.service';
import { LocalDataSource } from 'ng2-smart-table';
import { UserPageComponent } from './userPage.component';
import {CalendarComponent} from './calendar.component';
import {CalendarEndComponent} from './calendar.end.component';

@Component({
  selector: 'app-content-manage',
  templateUrl: './contentManage.component.html',
  styleUrls: ['./contentManage.component.css'],
})
export class ContentManageComponent implements OnInit, OnDestroy {

  subscription = null; // 옵저버
  subscription_s = null; // 옵저버
  subscription_e = null; // 옵저버
  contentsInfo = [];
  source: LocalDataSource;
  groupList = [];
  settings: any;

  constructor(
    private httpService: HttpService,
    private parent: UserPageComponent,
    private router: Router,
    private dataService: DataService
  ) {}

  setTable() {

    this.settings = {
      pager : {
        display : true,
        perPage:3
      },
      actions: {
        edit: false
      },
      add:{
        addButtonContent: '<i class="fa fa-plus"></i>',
        createButtonContent: '<i class="fa fa-check"></i>&nbsp&nbsp',
        cancelButtonContent: '<i class="fa fa-times"></i>',
        confirmCreate: true
      },
      edit: {
        editButtonContent: '<i class="fa fa-pencil"></i>&nbsp&nbsp',
        saveButtonContent: '<i class="fa fa-check"></i>&nbsp&nbsp',
        cancelButtonContent: '<i class="fa fa-times"></i>',
        confirmSave: true
      },
      delete: {
        deleteButtonContent: '<i class="fa fa-trash" aria-hidden="true"></i>',
        confirmDelete: true
      },
      columns: {
        id: {
          title: 'ID',
          width: '5%',
          editable: false
        },
        name: {
          title: 'Name'
        },

        startDate: {
          title: 'Start Date',
          width: '15%',
          show: false,
          editor: {
            type: 'custom',
            component: CalendarComponent,
            mode: 'external',
          },
        },

        endDate:{
          title: 'End Date',
          width: '15%',

          editor: {
            type: 'custom',
            component: CalendarEndComponent,
            mode: 'external',
          },

        },
        achievementRate:{
          title: 'Achievement Rate',
          width: '10%',
          editable: false
        },
        description: {
          title: 'Description',
          width: '20%',
        },
        balance: {
          title: 'balance',
          width: '20%',
        }
      },
      attr: {
        class: 'table table-responsive'
      },

    };
  }
  onEditClicked(event){
  }
  ngOnInit() {
    // Authority Check
    // 관리자 페이지는 권한이 마스터인 사용자만 가능
    // HTTP 통신을 통해 관리자 체크를 해야함.
    this.httpService.authorityCheck().subscribe(result=>{

      // 접근 권한이 없을 경우 에러페이지로 이동
      if(JSON.parse(JSON.stringify(result)).error == true){
        this.router.navigate(['/error']);
      }else {

        // Session Check
        // 세션 체크 후에 세션이 저장되어 있지 않으면 로그인 페이지로 이동
        this.httpService.sessionCheck().subscribe(result => {
          if(JSON.parse(JSON.stringify(result)).userSess !== undefined ){
            console.log("Session: " + JSON.stringify(result));

            this.setTable();
            this.updateTable();

          }
          else {
            console.log("No Session");
            this.router.navigate(['/']);
          }
        });
      }
    })
  }
  // NgOnDestroy
  // 컴포넌트가 파괴될 때 작동하는 부분
  ngOnDestroy(){
    // Observer unsubscribe
    if(this.subscription != null)
      this.subscription.unsubscribe();
  }
  // Table Update
  updateTable(){
    return new Promise ((resolve,reject) => {
      this.contentsInfo = [];
      this.httpService.getContentsInfo().subscribe(result => {

        for ( const u of JSON.parse(JSON.stringify(result))) {
          console.log(u);
          this.contentsInfo.push({
            id: u.id,
            name: u.name,
            startDate: u.startDate,
            endDate: u.endDate,
            achievementRate: u.achievementRate,
            description: u.description,
            balance: u.balance
          });
        }
        this.source = new LocalDataSource(this.contentsInfo);
        if(this.subscription != null)
          this.subscription.unsubscribe();
        // 사용자 관리 페이지에서 정보를 수정하면 부모 컴퍼넌트인 userPage.component를 다시 호출
        // 변경된 정보가 자기 자신 것일 경우 바로 메뉴바의 정보가 바뀔수 있도록
        this.parent.ngOnInit();
        resolve();
      });
    });
  }
  // Delete Info
  // 정보 삭제
  onDeleteConfirm(event) {
    if (window.confirm('정말로 삭제하시겠습니까?')) {
      event.confirm.resolve();

      this.httpService.deleteContentInfo(event.data.name, event.data.id).subscribe(result =>{
        // delete userInfo
        this.updateTable().then(response =>{
          alert("삭제되었습니다.");
        });
      });
    } else {
      event.confirm.reject();
    }
  }

  // Create Info
  // 새로운 정보 저장
  onCreateConfirm(event) {
    if(event.newData.id == "" || event.newData.name == ""){
      alert("Id 또는 이름을 입력해주세요");
    }else{
      if (window.confirm('생성하시겠습니까?')) {

        this.dataService.notifyOtherStd(event.newData);
        this.dataService.notifyOtherEd(event.newData);

        this.subscription_e = this.dataService.notifyObservableEd$_parent.subscribe((res1) => {

          this.subscription_s = this.dataService.notifyObservableStd$_parent.subscribe((res2) => {

            event.newData.startDate = JSON.parse(JSON.stringify(res2)).date;
            event.newData.endDate = JSON.parse(JSON.stringify(res1)).date;

            if(event.newData.startDate.year === undefined || event.newData.startDate.month === undefined || event.newData.startDate.day === undefined || event.newData.endDate.year === undefined || event.newData.endDate.month === undefined || event.newData.endDate.day === undefined){

              this.updateTable().then(response =>{
                alert("날짜를 기입해주세요.");
                event.confirm.resolve(event.newData);

                this.subscription_s.unsubscribe();
                this.subscription_e.unsubscribe();
              });

            }else{
              this.httpService.addContentInfo(event.newData).subscribe(result => {


                if(JSON.parse(JSON.stringify(result)).success == 0){
                  this.updateTable().then(response =>{
                    alert("생성되었습니다");
                    event.confirm.resolve(event.newData);
                  });
                }else if(JSON.parse(JSON.stringify(result)).success == 1){
                  // 이메일 중복
                  this.updateTable().then(response =>{
                    alert("id 중복입니다.");
                    event.confirm.resolve(event.newData);
                  });
                }else{
                  alert("error 입니다");
                  event.confirm.resolve(event.newData);
                }

                this.subscription_s.unsubscribe();
                this.subscription_e.unsubscribe();

              });
            }


          });

        });


      } else {
        event.confirm.reject();
      }
    }

  }

}
