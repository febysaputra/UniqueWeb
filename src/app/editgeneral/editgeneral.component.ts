import { Component, OnInit , ElementRef, Input, ViewChild} from '@angular/core';
import {Location} from '@angular/common';
import { Http, Headers } from '@angular/http';
import { Router, ActivatedRoute} from '@angular/router';
import { ToastrService } from 'toastr-ng2';
import { DataService } from '../data/data.service';

@Component({
  selector: 'app-editgeneral',
  templateUrl: './editgeneral.component.html',
  styleUrls: ['./editgeneral.component.css'],
  animations: [

   // Define animations here.

  ],
  providers:[DataService]
})
export class EditgeneralComponent implements OnInit {

	paramsRoutes;
  	public sub: any;

	private username;
	private nama;
	private jeniskelamin;
	private urlImage = '../assets/profileuser/';

	@Input() multiple: boolean = false;
    @ViewChild('fotoprofile') inputEl: ElementRef;

	constructor(private http: Http, private route: ActivatedRoute, private toastr: ToastrService, private router: Router,private dataService: DataService) { }

	ngOnInit() {
		window.scrollTo(0,0);
		this.sub = this.route.params.subscribe(params => {
       		this.paramsRoutes = params['username'];
	  	});

	  	this.http.get(this.dataService.urlGetUser + "/" + this.paramsRoutes, {withCredentials: true})
	    .subscribe(res =>{
	    	let data = JSON.parse(res['_body']);
	    	this.username = data['user'].username;
	    	this.nama = data['user'].nama; 
	    	this.jeniskelamin = data['user'].jeniskelamin;
	    	this.urlImage = this.urlImage + this.username + "/" + data['user'].fotoprofile;
	    });
	
	}

	submit(){
        let inputEl: HTMLInputElement = this.inputEl.nativeElement;
	    let fileCount: number = inputEl.files.length;
	    let formData = new FormData();
	   
	        if (fileCount > 0) { // a file was selected
	            for (let i = 0; i < fileCount; i++) {
	                formData.append('foto', inputEl.files.item(i));
	            }
	        }
            formData.append("username", this.username);
            formData.append("nama", this.nama);
            formData.append("jeniskelamin", this.jeniskelamin);
            this.http.put(this.dataService.urlEditProfile + "/umum" , formData, {withCredentials: true})
                .subscribe(res =>{
                	if(res['status'] == 204){
                    	this.showSuccess(this.username);
                	} else if(res['_body'] == "Gagal mengupdate info user") {
                		this.showFailed();
                	} 
                });
         
	}

	showSuccess(routes) {
    	this.toastr.success("Edit Akun Berhasil", 'Success!');
    	this.router.navigate(['/profil', routes]);
	}	  

	showFailed(){
		this.toastr.error("Edit Akun Gagal", 'Error!');
	}

	back(routes){
		this.router.navigate(['/profil', routes]);
	}

}
