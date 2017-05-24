import { Component, OnInit } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Router, ActivatedRoute} from '@angular/router';
import { ToastrService } from 'toastr-ng2';
import { DataService } from '../data/data.service';

@Component({
  selector: 'app-editlapak',
  templateUrl: './editlapak.component.html',
  styleUrls: ['./editlapak.component.css'],
  animations: [

   // Define animations here.

  ],
  providers:[DataService]
})
export class EditlapakComponent implements OnInit {

	paramsRoutes;
  	public sub: any;

  	private namabarang;
  	private kategori;
  	private berat;
  	private kondisi;
  	private hargasementara;
  	private hargalimit;
  	private bataspenawaran;
  	private spesifikasibarang;

	constructor(private http: Http, private route: ActivatedRoute, private toastr: ToastrService, private router: Router,private dataService: DataService) { }

	ngOnInit() {
		this.sub = this.route.params.subscribe(params => {
       		this.paramsRoutes = params['id'];
	  	});

	}

  
}
