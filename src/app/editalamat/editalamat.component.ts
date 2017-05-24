import { Component, OnInit } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Router, ActivatedRoute} from '@angular/router';
import { ToastrService } from 'toastr-ng2';
import { DataService } from '../data/data.service';

@Component({
  selector: 'app-editalamat',
  templateUrl: './editalamat.component.html',
  styleUrls: ['./editalamat.component.css'],
  animations: [

   // Define animations here.

  ],
  providers:[DataService]
})
export class EditalamatComponent implements OnInit {

	paramsRoutes;
  	public sub: any;

  	private alamat;

	constructor(private http: Http, private route: ActivatedRoute, private toastr: ToastrService, private router: Router,private dataService: DataService) { }

	ngOnInit() {
		window.scrollTo(0,0);
		this.sub = this.route.params.subscribe(params => {
       		this.paramsRoutes = params['username'];
	  	});

	  	this.http.get(this.dataService.urlGetUser + "/" + this.paramsRoutes, {withCredentials: true})
	    .subscribe(res =>{
	    	let data = JSON.parse(res['_body']);
	    	this.alamat = data['user'].alamat;
	    });
	}

	submit(value){
		let formData = new FormData();

	    formData.append("alamat", this.alamat);

		this.http.put(this.dataService.urlEditProfile + "/alamat", formData, {withCredentials: true})
		.subscribe(res => {
			if(res['status'] == 204){
				this.showSuccess(value);
			} else if(res['_body'] == "Gagal mengupdate alamat user"){
				this.showFailed();
			} 
		});
	}

	showSuccess(routes) {
    	this.toastr.success("Edit Alamat Berhasil", 'Success!');
    	this.router.navigate(['/profil', routes]);
	}	  

	showFailed(){
		this.toastr.error("Edit Alamat Gagal", 'Error!');
	}

}
