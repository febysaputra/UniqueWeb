import { Component, OnInit} from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Router, ActivatedRoute} from '@angular/router';
import { ToastrService } from 'toastr-ng2';
import { DataService } from '../data/data.service';

@Component({
  selector: 'app-editemail',
  templateUrl: './editemail.component.html',
  styleUrls: ['./editemail.component.css'],
  animations: [

   // Define animations here.

  ],
  providers:[DataService]
})
export class EditemailComponent implements OnInit {

	paramsRoutes;
  	public sub: any;

  	private username;
  	private email;
  	private notelp;

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
	    	this.email = data['user'].email;
	    	this.notelp = data['user'].notelp; 
	    });
	}

	submit(value){
		let formData = new FormData();

	    formData.append("username", this.username);
	    formData.append("email", this.email);
	    formData.append("notelp", this.notelp);

		this.http.put(this.dataService.urlEditProfile + "/mail", formData, {withCredentials: true})
		.subscribe(res => {
			if(res['status'] == 204){
				this.showSuccess(value);
			} else if(res['_body'] == "Gagal mengupdate mail user"){
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
