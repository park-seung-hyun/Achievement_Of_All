// userPage.component
// 사용자 페이지
// 사용자 페이지의 큰틀을 구성하는 컴포넌트다.
// 좌측의 메뉴 버튼에 따라 여러 자식 컴포넌트를 불러온다. (app.routing.module 참고)

import {Component, OnDestroy, OnInit} from '@angular/core';
import {HttpService} from './http-service';
import {Router} from '@angular/router';
import {DataService} from './data.service';
import * as myGlobals from '../../../../../../4-1/CapD/Capstone_Design/Capstone_Team4/NodeServerProjects/src/app/global.service'; // 글로벌 변수를 주입하기 위한 서비스

@Component({
  selector: 'app-user-page',
  templateUrl: './userPage.component.html',
  styleUrls: ['./userPage.component.css']
})
export class UserPageComponent implements OnInit,OnDestroy {

  imagePath = myGlobals.imagePath; // 이미지 경로
  menuState: string = 'out';

  userInfo = { // 사용자 정보 변수
    userEmail: '',
    userName: '',
    userAuthority: '',
    groupName: '',
      deviceID:'',
    userGender: '',
    userPhoneNumber: '',
    userImage: ''
  }

  menu = [];

  // subscribe를 위한 옵저버 선언
  myObserver = null;
  myObserver_sess = null;
  myObserver_logOut = null;

  constructor(
    private httpService: HttpService,
    private router: Router,
    private dataService: DataService
  ) {}

  ngOnInit() {
    this.userInfo.userImage = '';
    // Session Check
    // 처음 로그인 페이지를 들어가면 세션 정보를 확인한다.
    // 만약 세션이 존재할 경우 로그인 진행 없이 사용자 페이지로 이동하고
    // 세션이 존재하지 않을 경우 로그인 페이지로 이동한다.

    this.myObserver_sess = this.httpService.sessionCheck().subscribe(result => {
      // 세션에 사용자 정보가 남아 있을 경우
      if(JSON.parse(JSON.stringify(result)).userSess !== undefined ){
        console.log("Session: " + JSON.stringify(result));
        // HTTP 통신을 통해 현재 세션에 남은 사용자의 모든 정보를 불러온다.
        this.myObserver=this.httpService.getUserInfo().subscribe(result => { // Session을 통해 정보 불러옴

          // 서버/데이터베이스에서 가져온 사용자 정보를 모두 변수에 담는다.
          var email = JSON.parse(JSON.stringify(result)).userEmail;
          var name = JSON.parse(JSON.stringify(result)).userName;
          var authority = JSON.parse(JSON.stringify(result)).userAuthority;
          var groupName = JSON.parse(JSON.stringify(result)).groupName;
            var deviceID = JSON.parse(JSON.stringify(result)).deviceID;
          var userGender = JSON.parse(JSON.stringify(result)).userGender;
          var userPhoneNumber= JSON.parse(JSON.stringify(result)).userPhoneNumber;
          var userImage = JSON.parse(JSON.stringify(result)).userImage;

          // 변수들에 불러온 값들을 대입
          this.setupUserInfo(email, name , authority, groupName,deviceID, userGender, userPhoneNumber,userImage);
          // 현재 사용자의 권한을 통해 좌측 메뉴를 생성한다.
          this.setupMenu(authority);
          // 다른 컴포넌트에 데이터를 넣기 위해 현재 사용자의 모든 정보를 넣는다. (자세한 내용은 Data.Service.ts 확인)
          this.updateUserInfo(this.userInfo);


        });
      }
      else {
        // 세션에 아무 정보도 없을 경우 로그인 페이지로 이동
        console.log("No Session");
        this.router.navigate(['/']);
      }
    });
  }

  // setupMenu
  // 파라미터로 현재 사용자의 권한이 들어온다.
  // 그 권한에 따라 맞는 좌측 메뉴를 생성한다.
  setupMenu(a: string) {
    if ( a === 'master' ) {
      this.menu = ['userInfo', 'deviceInfo', 'groupManage','userManage', 'deviceManage'];
    }else if(a === 'groupMaster') {
      this.menu = ['userInfo', 'deviceInfo'];
    }else if(a === 'user') {
      this.menu = ['userInfo', 'deviceInfo'];
    }
  }

  // setupUserInfo
  setupUserInfo(email: string, name: string, authority: string, groupName: string,deviceID: string, userGender: string, userPhoneNumber: string, userImage: string) {
    this.userInfo.userEmail = email;
    this.userInfo.userName = name;
    this.userInfo.userAuthority = authority;
    this.userInfo.groupName = groupName;
      this.userInfo.deviceID = deviceID;
    this.userInfo.userGender = userGender;
    this.userInfo.userPhoneNumber = userPhoneNumber;
    this.userInfo.userImage = userImage;
  }

  // updataUserInfo
  // Data.service를 통해 다른 자식 컴포넌트에 전달한 현재 사용자 정보를 넘긴다.  (자세한 내용은 Data.Service.ts 확인)
  updateUserInfo(value: Object){
    this.dataService.updateData(value);
  }
  // LogOut
  // 사용자가 로그아웃 버튼을 누르면 세션을 파괴한 후 로그인 페이지로 이동시킨다.
  logOut(){
      if (window.confirm('로그아웃 하시겠습니까?')) {
          this.myObserver_logOut = this.httpService.userLogout().subscribe(result => {
              //Logout session destroy
              console.log("Log Out");
              this.router.navigate(['/']);
          });
      }
      else{
          console.log("Log Out X");
      }
  }
  // NgOnDestroy
  // 컴포넌트가 파괴될 때 작동하는 부분
  ngOnDestroy(){
    // 위에서 HTTP 통신을 위한 Observer가 Subscribe 중이므로 Unsubscribe를 해준다.
    // 사실 unsubscribe는 필요에 따라해주면된다.
    // 사실 여기서는 필요 없다.
    if(this.myObserver != undefined){
      this.myObserver.unsubscribe();
    }
    if(this.myObserver_sess != undefined){
      this.myObserver_sess.unsubscribe();
    }
    if(this.myObserver_logOut != undefined){
      this.myObserver_logOut.unsubscribe();
    }
  }
}