// 라우팅을 지정해주는 모듈

// Module
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Component
import { UserServiceComponent } from './userService.component';
import { UserPageComponent } from './userPage.component';

import { UserInfoComponent } from './userInfo.component';
import { UserManageComponent } from './userManage.component';
import { ContentManageComponent } from './contentManage.component';
import { AboutComponent } from './about.component'; // User Page (About)

const routes: Routes = [ // Route 지정

  { path: '', redirectTo: 'login', pathMatch: 'full'}, // '/' 처음에 들어오면 로그인 페이지 이동
  { path: 'login', component: UserServiceComponent}, // 로그인 페이지
  { path: 'main', component: UserPageComponent, // 로그인을 마치면 main 페이지
    children: [
      { path: '', redirectTo: 'userInfo', pathMatch: 'full'},
      { path: 'userInfo', component: UserInfoComponent}, // 사용자 정보
      { path: 'userManage', component: UserManageComponent}, // 사용자 관리
      { path: 'contentManage', component: ContentManageComponent},// 컨텐츠 관리
      { path: 'about', component: AboutComponent} ]
      // { path: 'contentManange', component: ContentManageComponent}] // 컨텐츠 관리
  },
  {path: '**', redirectTo: 'login'}
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
