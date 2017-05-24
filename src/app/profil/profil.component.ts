import { Component, OnInit} from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Router , ActivatedRoute} from '@angular/router';
import { ToastrService } from 'toastr-ng2';
import { DataService } from '../data/data.service';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.css'],
  animations: [

   // Define animations here.

  ],
  providers:[DataService]
})

export class ProfilComponent implements OnInit {

	//untuk routes
	paramsRoutes;
  	private sub: any;

  	//user
  	private username;
  	private nama;
  	private jeniskelamin;
  	private email;
  	private notelp;
  	private urlImage = '../assets/profileuser/';

  	private alamat;

  	//lapak
  	private listlapak;


	constructor(private http: Http, private route: ActivatedRoute,private toastr: ToastrService, private router: Router,private dataService: DataService) { }

	ngOnInit() {
		this.sub = this.route.params.subscribe(params => {
       		this.paramsRoutes = params['username'];
	  	});

	  	this.http.get(this.dataService.urlGetUser + "/" + this.paramsRoutes, {withCredentials: true})
	    .subscribe(res =>{
	    	let data = JSON.parse(res['_body']);
	    	this.username = data['user'].username;
	    	this.nama = data['user'].nama; 
	    	this.jeniskelamin = data['user'].jeniskelamin;
	    	this.email = data['user'].email;
	    	this.notelp = data['user'].notelp;
	    	this.alamat = data['user'].alamat;
	    	this.urlImage = this.urlImage + this.username + "/" + data['user'].fotoprofile;

	    	this.listlapak = data['lelang'];
	    });
	}

	//Akun
	routesEditGeneral(routes){
		this.router.navigate(['/editgeneral', routes]);
	}

	routesEditEmail(routes){
		this.router.navigate(['/editemail', routes]);
	}

	routesEditPass(routes){
		this.router.navigate(['/editpass', routes]);
	}

	//Alamat
	routesEditAlamat(routes){
		this.router.navigate(['/editalamat', routes]);
	}
}
