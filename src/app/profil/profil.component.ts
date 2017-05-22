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

  	private alamat;

  	//lapak
  	private namabarang;
  	private kategori;
  	private berat;
  	private kondisi;
  	private hargasementara;
  	private hargalimit;
  	private bataspenawaran;
  	private spesifikasibarang;


	constructor(private http: Http, private route: ActivatedRoute,private toastr: ToastrService, private router: Router,private dataService: DataService) { }

	ngOnInit() {
		this.sub = this.route.params.subscribe(params => {
       		this.paramsRoutes = params['username'];
	  	});

	  	this.http.get(this.dataService.urlGetUser + "/" + this.paramsRoutes, {withCredentials: true})
	    .subscribe(res =>{
	    	let data = JSON.parse(res['_body']);
	    	console.log(data['user']); 
	    	console.log(data['lelang']);
	    });
	}

}
