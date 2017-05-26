import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { PopoverModule } from 'ng2-popover';
import { ToastrModule } from 'toastr-ng2';
import { CommonModule } from '@angular/common';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';


import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { BidComponent } from './bid/bid.component';
import { BarangComponent } from './barang/barang.component';
import { VerifikasiuserComponent } from './verifikasiuser/verifikasiuser.component';
import { BukalelangComponent } from './bukalelang/bukalelang.component';
import { LoginComponent } from './login/login.component';
import { ProfilComponent } from './profil/profil.component';
import { EditgeneralComponent } from './editgeneral/editgeneral.component';
import { EditemailComponent } from './editemail/editemail.component';
import { EditpasswordComponent } from './editpassword/editpassword.component';
import { EditlapakComponent } from './editlapak/editlapak.component';
import { EditalamatComponent } from './editalamat/editalamat.component';

import { DataService } from './data/data.service';
import { DropzoneComponent } from './dropzone/dropzone.component';


@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    RegisterComponent,
    HomeComponent,
    BidComponent,
    BarangComponent,
    VerifikasiuserComponent,
    BukalelangComponent,
    LoginComponent,
    ProfilComponent,
    EditgeneralComponent,
    EditemailComponent,
    EditpasswordComponent,
    EditlapakComponent,
    EditalamatComponent,
    DropzoneComponent




  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    PopoverModule,
    CommonModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(), // ToastrModule added
    RouterModule.forRoot([
      {
        path: 'home',
        component: HomeComponent
      },
      {
        path :'',
        component:HomeComponent
      },
      {
        path: 'register',
        component: RegisterComponent
      },
      {
        path: 'bid/:id',
        component: BidComponent
      },
      {
        path:'verifikasiuser',
        component : VerifikasiuserComponent
      },
      {
        path:'bukalelang',
        component : BukalelangComponent
      },
      {
        path:'profil/:username',
        component : ProfilComponent
      },
      {
        path:'login',
        component : LoginComponent
      },
      {
        path:'editgeneral/:username',
        component : EditgeneralComponent
      },
      {
        path:'editemail/:username',
        component : EditemailComponent
      },
      {
        path:'editpass/:username',
        component : EditpasswordComponent
      },
      {
        path:'editalamat/:username',
        component : EditalamatComponent
      },
      {
        path:'editlapak/:idlapak',
        component : EditlapakComponent
      },


    ], { useHash: true })
  ],
  providers: [DataService],
  bootstrap: [AppComponent],
})
export class AppModule { }
