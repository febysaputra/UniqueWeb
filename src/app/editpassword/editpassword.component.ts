import { Component, OnInit } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Router, ActivatedRoute} from '@angular/router';
import { ToastrService } from 'toastr-ng2';
import { DataService } from '../data/data.service';

@Component({
  selector: 'app-editpassword',
  templateUrl: './editpassword.component.html',
  styleUrls: ['./editpassword.component.css'],
  animations: [

   // Define animations here.

  ],
  providers:[DataService]
})
export class EditpasswordComponent implements OnInit {

	paramsRoutes;
  public sub: any;

  private username;
  private newpass;
  private renewpass;
  private oldpass;

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
        this.oldpass = data['user'].password;
      });
	}

  submit(value){
    let formData = new FormData();

    formData.append("newpass", this.newpass);
    formData.append("oldpass", this.oldpass);

    this.http.put(this.dataService.urlEditProfile + "/password", formData,{withCredentials: true})
    .subscribe(res => {
      if(res['status'] == 204){
        this.showSuccess(value);
      } else if(res['_body'] == "Gagal mengupdate password user"){
        this.showFailed();
      } 
    });
  }

  showSuccess(routes) {
      this.toastr.success("Edit Akun Berhasil", 'Success!');
      this.router.navigate(['/profil', routes]);
  }    

  showFailed(){
    this.toastr.error("Edit Akun Gagal, password lama tidak ditemukan", 'Error!');
  }

  back(routes){
    this.router.navigate(['/profil', routes]);
  }

}
