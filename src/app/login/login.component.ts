import { Component, OnInit } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Router } from '@angular/router';
import { ToastrService } from 'toastr-ng2';
import { DataService } from '../data/data.service';
import 'rxjs/Rx';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations: [

   // Define animations here.

  ],
  providers: [DataService]
})
export class LoginComponent implements OnInit {
	private username;
	private password;	

  constructor(public http: Http,public toastr: ToastrService, public router: Router, public dataService: DataService) { }

  ngOnInit() {
    window.scrollTo(0,0);
  }

  submit(){
    let creds = JSON.stringify({username: this.username, password: this.password});
      
      var headers = new Headers();
      headers.append("Content-Type", "application/json");
      this.http.post(this.dataService.urlLogin, creds, {headers: headers})
      .subscribe(res => {
        let data = JSON.parse(res['_body']) 
        console.log(data);
        if(res['status'] == 201){
          this.showSuccess();
          localStorage.setItem('token', data['value']);
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
        window.location.reload();
        this.router.navigate(['/home']);
    }    

    showFailed(){
      this.toastr.error("Username atau Password Salah", 'Error!');
      this.username = "";
      this.password = "";
    }

}
