import { Component, OnInit } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Router } from '@angular/router';
import { ToastrService } from 'toastr-ng2';
import { DataService } from '../data/data.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  animations: [

   // Define animations here.

  ],
  providers:[DataService]
})
export class RegisterComponent implements OnInit {

	private username;
	private password;
	private email;
	private nama;
	private alamat;
	private notelp;
	private jeniskelamin;

	constructor(public http: Http,public toastr: ToastrService, public router: Router, public dataService: DataService) { 
	}

	ngOnInit() {
		window.scrollTo(0,0);
	}


	submit(){
		let creds = JSON.stringify({username: this.username, password: this.password, email: this.email, nama: this.nama, alamat: this.alamat, notelp: this.notelp, jeniskelamin: this.jeniskelamin, class: "Customer", tiketlelang: 0});
		
		var headers = new Headers();
		headers.append("Content-Type", "application/json");
		this.http.post(this.dataService.urlRegister, creds, {headers: headers})
		.subscribe(res => {
			if(res['status'] == 201){
				this.showSuccess();
			} else if(res['_body'] == "duplicate"){
				this.showDupUsername();
			} 
		});
	}

		showSuccess() {
	    	this.toastr.success("Pendaftaran Akun Berhasil", 'Success!');
	    	this.router.navigate(['/login']);
		}	  

		showDupUsername(){
			this.toastr.error("Username Sudah Digunakan", 'Error!');
		}

}
