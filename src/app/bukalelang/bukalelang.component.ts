import { Component, OnInit, ElementRef, Input, ViewChild } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Router } from '@angular/router';
import { ToastrService } from 'toastr-ng2';
import { DataService } from '../data/data.service';
import { DropzoneComponent } from '../dropzone/dropzone.component';


@Component({
  selector: 'app-bukalelang',
  templateUrl: './bukalelang.component.html',
  styleUrls: ['./bukalelang.component.css'],
  animations: [

   // Define animations here.

  ],
  providers:[DataService,DropzoneComponent]
})
export class BukalelangComponent implements OnInit {

	private namabarang;
	private kategori;
	private kondisi;
	private berat;
	private hargasementara;
	private hargalimit;
	private bataspenawaran;
	private spesifikasibarang;

	@Input() multiple: boolean = false;
	@ViewChild('file') listfile : DropzoneComponent;
	@ViewChild('fotosertifikat') inputElSertifikat: ElementRef;
	

	constructor(public http: Http,public toastr: ToastrService, public router: Router, public dataService: DataService) { }

	ngOnInit() {
		window.scrollTo(0,0);
  	}

  	submit(){
  		let inputEl: HTMLInputElement = this.inputElSertifikat.nativeElement;
	    let fileCount: number = inputEl.files.length;
	    let formData = new FormData();
	    let files = this.listfile.Allfiles();

	        if (files.length > 0) { // a file was selected
	            for (let i = 0; i < files.length; i++) {
	                formData.append('foto', files[i]);
	            }
	            if(fileCount > 0){
	            	formData.append('foto', inputEl.files.item(0));
	            	formData.append('sertifikat', "Ya");
	            } else {
	            	formData.append('sertifikat', "Tidak");
	            }
	            formData.append("namabarang", this.namabarang);
	            formData.append("kategori", this.kategori);
	            formData.append("kondisi", this.kondisi);
	            formData.append("berat", this.berat);
	            formData.append("hargasementara", this.hargasementara);
	            formData.append("hargalimit", this.hargalimit);
	            formData.append("bataspenawaran", this.bataspenawaran);
	            formData.append("spesifikasibarang", this.spesifikasibarang);
	            this.http.post(this.dataService.urlNewLapak, formData, {withCredentials: true})
	                .subscribe(res =>{
	                	if(res['status'] == 201){
	                    	this.showSuccess(res['_body']);
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

  	showSuccess(routes) {
    	this.toastr.success("Buat Lelang Berhasil", 'Success!');
    	this.router.navigate(['/bid', routes]);
	}	  

	showFailed(){
		this.toastr.error("Buat Lelang Gagal, Anda harus login terlebih dahulu", 'Error!');
	}

	showFailedUpload(){
		this.toastr.error("Upload Gagal", 'Error!');
	}

	showError(){
		this.toastr.error("Foto Harus dilengkapi, minimal berikan satu foto", 'Error!');
	}

}
