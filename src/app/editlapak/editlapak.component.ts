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

    private username;
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
    window.scrollTo(0,0);
		this.sub = this.route.params.subscribe(params => {
       		this.paramsRoutes = params['idlapak'];
	  	});

    this.http.get(this.dataService.urlGetLapak + "/" + this.paramsRoutes, {withCredentials: true})
    .subscribe(res =>{
      let data = JSON.parse(res['_body']);
      console.log(data);
      this.username = data['username'];
      this.namabarang = data['namabarang'];
      this.kategori = data['kategori'];
      this.berat = data['berat'];
      this.kondisi = data['kondisi'];
      this.hargasementara = data['hargasementara'];
      this.hargalimit = data['hargalimit'];
      this.bataspenawaran = data['bataspenawaran'];
      this.spesifikasibarang = data['spesifikasibarang'];
    });


	}

  submit(){
      /*let inputEl: HTMLInputElement = this.inputEl.nativeElement;
      let fileCount: number = inputEl.files.length;*/
      let formData = new FormData();
     
         /* if (fileCount > 0) { // a file was selected
              for (let i = 0; i < fileCount; i++) {
                  formData.append('foto', inputEl.files.item(i));
              }
          }*/
            formData.append("namabarang", this.namabarang);
            formData.append("kategori", this.kategori);
            formData.append("berat", this.berat);
            formData.append("kondisi", this.kondisi);
            formData.append("hargasementara", this.hargasementara);
            formData.append("hargalimit", this.hargalimit);
            formData.append("bataspenawaran", this.bataspenawaran);
            formData.append("spesifikasibarang", this.spesifikasibarang);
            this.http.put(this.dataService.urlEditLapak + "/" + this.paramsRoutes , formData, {withCredentials: true})
                .subscribe(res =>{
                  if(res['status'] == 204){
                      this.showSuccess(this.username);
                  } else if(res['_body'] == "Gagal mengupdate lapak") {
                    this.showFailed();
                  } 
                });
         
  }

  showSuccess(routes) {
      this.toastr.success("Edit Lapak Berhasil", 'Success!');
      this.router.navigate(['/profil', routes]);
  }    

  showFailed(){
    this.toastr.error("Edit Lapak Gagal", 'Error!');
  }

  back(routes){
    this.router.navigate(['/profil', routes]);
  }


  
}
