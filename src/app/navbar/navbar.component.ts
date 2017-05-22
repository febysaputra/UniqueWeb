import { Component, OnInit } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Router } from '@angular/router';
import { ToastrService } from 'toastr-ng2';
import { DataService } from '../data/data.service';
import 'rxjs/Rx';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  animations: [

   // Define animations here.

  ],
  providers: [DataService]
})
export class NavbarComponent implements OnInit {

  private username;
  private password;

  constructor(public http: Http,public toastr: ToastrService, public router: Router, public dataService: DataService) { }

  ngOnInit() {
    this.http.get(this.dataService.urlCheckExpiredToken, {withCredentials: true})
        .subscribe(res => {
          if(res['_body'] == "belum login"){
            localStorage.removeItem('token');
            this.dataService.loginState(false);
            console.log("Expired login habis");
          }
        });

    if(localStorage.getItem('token')){
      this.dataService.loginState(true);
    } else {
      this.dataService.loginState(false);
    }
  }

  openNav() {
    document.getElementById("mySidenav").style.width = "70%";
    // document.getElementById("flipkart-navbar").style.width = "50%";
    document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
  }
  closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.body.style.backgroundColor = "rgba(0,0,0,0)";
  }

  submit(){
    let creds = JSON.stringify({username: this.username, password: this.password});
      
      var headers = new Headers();
      headers.append("Content-Type", "application/json");
      this.http.post(this.dataService.urlLogin, creds, {headers: headers})
      .subscribe(res => {
        let data = JSON.parse(res['_body']) 
        if(res['status'] == 201){
          this.showSuccess();
          localStorage.setItem('token', data['value']);
          this.dataService.loginToken(data['value']);
          this.dataService.loginState(true);
          document.cookie = "Auth" + "=" + data['value'] + "; " + "Expires" + data['expires'] + "; ";
        } else if(data['message'] == "user not found"){
          this.showFailed();
        } 
      });
      
    }

    showSuccess() {
        this.toastr.success("Login Berhasil", 'Success!');
        this.username = "";
        this.password = "";
    }    

    showFailed(){
      this.toastr.error("Username atau Password Salah", 'Error!');
      this.username = "";
      this.password = "";
    }

    showMessagge(){
      this.toastr.info("Anda harus login terlebih dahulu untuk membuka lelang", 'Info!');
    }

  logout(){
        let creds = JSON.stringify({value : localStorage.getItem('token')});
      
        var headers = new Headers();
        headers.append("Content-Type", "application/json");

        this.http.post(this.dataService.urlLogout, creds, {withCredentials: true,headers: headers})
        .subscribe(res => {
          if(res['_body'] == "logout"){
            localStorage.removeItem('token');
            this.dataService.loginToken("");
            this.dataService.loginState(false);
          }
        });

  }

  bukalelang(){
    if(this.dataService.loggedIn){
      this.router.navigate(['/verifikasiuser']);
    } else {
      this.showMessagge();
    }
  }

}
