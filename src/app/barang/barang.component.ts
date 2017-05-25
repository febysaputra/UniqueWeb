import { Component, OnInit} from '@angular/core';
import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs/Subject';
import { Http, Headers } from '@angular/http';
import { Router , ActivatedRoute} from '@angular/router';
import { DataService } from '../data/data.service';

@Component({
  selector: 'app-barang',
  templateUrl: './barang.component.html',
  styleUrls: ['./barang.component.css'],
  animations: [

   // Define animations here.

  ],
  providers:[DataService]
})
export class BarangComponent implements OnInit {

	//untuk routes
	id: number;
  	private sub: any;

	public usernamepenjual;
	public namabarang;
	public spesifikasibarang;
	public statuslapak;
	public tanggal;
	public kategori;
	public sertifikat;
	public waktu;
	public usernamepemenang;
	public hargasementara;
  	public bataspenawaran;

  	private foto;
  	private urlImage: any[]= [];
 	private tempUrl = '../assets/lapak/';

 	private urlFoto = '../assets/profileuser/';

	constructor(public http: Http, public route: ActivatedRoute, public router: Router,public dataService: DataService) { }

	ngOnInit() {
		this.sub = this.route.params.subscribe(params => {
       		this.id = +params['id'];
	  	});

	  	this.http.get(this.dataService.urlLapak + "/" + this.id)
	    .subscribe(res =>{
	    	let data = JSON.parse(res['_body']);
	    	this.usernamepenjual = data['usernamepenjual'];
	    	this.namabarang = data['namabarang'];
	    	this.spesifikasibarang = data['spesifikasibarang'];
	    	this.statuslapak = data['statuslapak'];
	    	this.tanggal = data['tanggal'];
	    	this.kategori = data['kategori'];
	    	this.sertifikat = data['sertifikat'];
	    	this.waktu = data['waktu'];
	    	this.usernamepemenang = data['usernamepemenang'];
			this.hargasementara = data['hargasementara'];
			this.bataspenawaran = data['bataspenawaran'];
			this.foto = data['foto'];
	   		for (var i = 0; i < this.foto.length; i++) {
	    		this.urlImage[i] = this.tempUrl + this.id + "/" + this.foto[i.toString()];
	    	}

	    	//ambil foto profile
	    	this.http.get(this.dataService.urlGetUser + "/" + this.usernamepenjual)
	    	.subscribe(res =>{
	    		let data = JSON.parse(res['_body']);
	    		this.urlFoto = this.urlFoto + data['user'].iduser + "/" + data['user'].fotoprofile;

	    	});
	    });
	}

	getBatasPenawaran(){
		return this.bataspenawaran;
	}

	setBatasPenawaran(value){
		this.bataspenawaran = value;
	}

	setHargaSementara(value){
		this.hargasementara = value;
	}

}
