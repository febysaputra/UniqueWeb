import { Component, OnInit, ElementRef, Input, ViewChild } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Router } from '@angular/router';
import { ToastrService } from 'toastr-ng2';
import { DataService } from '../data/data.service';

@Component({
  selector: 'app-verifikasiuser',
  templateUrl: './verifikasiuser.component.html',
  styleUrls: ['./verifikasiuser.component.css'],
  animations: [

   // Define animations here.

  ],
  providers:[DataService]
})
export class VerifikasiuserComponent implements OnInit {

	private namabank;
	private norekening;
	private atasnamabank;
	private noktp;
	private namaktp;

	@Input() multiple: boolean = false;
    @ViewChild('fotorekening') inputElRek: ElementRef;
    @ViewChild('fotoktp') inputElKtp: ElementRef;

	constructor(public http: Http,public toastr: ToastrService, public router: Router, public dataService: DataService) { }

	ngOnInit() {
		window.scrollTo(0,0);
		this.http.get(this.dataService.urlCheckStatusUser, {withCredentials: true})
        .subscribe(res => {
			let data = JSON.parse(res['_body']);
			if(data['statususer'] != "" && data['statususer'] != "edited" ){
				this.router.navigate(['/bukalelang']);
			}
		});
	}

	submit(){
        let inputElRek: HTMLInputElement = this.inputElRek.nativeElement;
        let inputElKtp: HTMLInputElement = this.inputElKtp.nativeElement;
	    let fileCountRek: number = inputElRek.files.length;
	    let fileCountKtp: number = inputElKtp.files.length;
	    let formData = new FormData();
	   
	        if (fileCountRek + fileCountKtp > 1) { // a file was selected
	            for (let i = 0; i < fileCountRek; i++) {
	                formData.append('foto', inputElRek.files.item(i));
	            }
	            for (let j = 0; j < fileCountKtp; j++) {
	            	formData.append('foto', inputElKtp.files.item(j));
	            }
	            formData.append("namabank", this.namabank);
	            formData.append("norekening", this.norekening);
	            formData.append("atasnamabank", this.atasnamabank);
	            formData.append("noktp", this.noktp);
	            formData.append("namaktp", this.namaktp);
	            this.http.post(this.dataService.urlVerifikasiUser, formData, {withCredentials: true})
	                .subscribe(res =>{
	                	if(res['_body'] == "verifikasi berhasil"){
	                    	this.showSuccess();
	                	} else if(res['_body'] == "belum login") {
	                		this.showFailed();
	                	} else {
	                		this.showFailedUpload();
	                	}
	                });
	        } else {
	        	this.showError();
	        }
	}

	showSuccess() {
    	this.toastr.success("Verifikasi Akun Berhasil", 'Success!');
    	this.router.navigate(['/bukalelang']);
	}	  

	showFailed(){
		this.toastr.error("Verifikasi Akun Gagal, Anda harus login terlebih dahulu", 'Error!');
	}

	showFailedUpload(){
		this.toastr.error("Upload Gagal", 'Error!');
	}

	showError(){
		this.toastr.error("Foto Harus dilengkapi", 'Error!');
	}

}
