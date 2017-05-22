import { Component, OnInit, EventEmitter ,ViewChild} from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Router , ActivatedRoute} from '@angular/router';
import { DataService } from '../data/data.service';
import { ToastrService } from 'toastr-ng2';
import { BarangComponent } from '../barang/barang.component';

@Component({
  selector: 'app-bid',
  templateUrl: './bid.component.html',
  styleUrls: ['./bid.component.css'],
  animations: [

   // Define animations here.

  ],
  providers:[DataService,BarangComponent]
})
export class BidComponent implements OnInit {
	//untuk routes
	public id: number;
  private sub: any;

  @ViewChild('listdata') listdata : BarangComponent;


	private hargatawar;

	//socket
	private ws: WebSocket;//server socket 
  private listener: EventEmitter<any> = new EventEmitter();
	//

	//harga
  private kelipatan;
	
	//scoreboard
	private usernamepembeli: any[] = [];
	private hargatawarpembeli: any[] = [];


  constructor(public http: Http, public route: ActivatedRoute, public router: Router,public dataService: DataService,public toastr: ToastrService) { 
  }

  ngOnInit() {
  	window.scrollTo(0,0);
  	this.sub = this.route.params.subscribe(params => {
       this.id = +params['id'];
  	});
  	this.realTimeHarga(this.id);
    this.hargatawar = this.listdata.getBatasPenawaran();
  }


  setKelipatan(value){
  	this.hargatawar = this.listdata.getBatasPenawaran()*value;
    this.kelipatan = value;
  }

  Bidding(){
  	let creds = JSON.stringify({hargatawar: this.hargatawar});
		
		var headers = new Headers();
		headers.append("Content-Type", "application/json");
		this.http.post(this.dataService.urlBid + "/" +this.id, creds, {withCredentials: true,headers: headers})
		.subscribe(res => {
			if(res['status'] == 204){
				this.showSuccess();
			} else if(res['_body'] == "belum login") {
				this.showFailed();
			} 
		});
  }

//socket
realTimeHarga(id){
  	this.ws = new WebSocket(this.dataService.urlRoomBid + "/" + id);
    this.ws.onmessage = event => {
        var msg = JSON.parse(event.data)
        //console.log(msg)
        if(msg != null){
          this.listener.emit({"type": "message", "data": msg});
          for (var i = 0; i < msg.length; i++) {
            this.usernamepembeli[i]=msg[i].usernamepembeli;
            this.hargatawarpembeli[i]=msg[i].hargatawar;
          }
          this.listdata.setHargaSementara(msg[i-1].hargasementara);
          this.listdata.setBatasPenawaran(msg[i-1].bataspenawaran);
        }
        if(this.hargatawar != (this.kelipatan*this.listdata.getBatasPenawaran())){
          this.hargatawar = this.listdata.getBatasPenawaran();
        }
    }
}

public getEventListener() {
    return this.listener;
}
//

viewProfile(routes){
  this.router.navigate(['/profil', routes]);
  console.log("belum ada component, ini masih sementara");
}

  getIdRoutes(){
    return this.id;
  }

  	showSuccess() {
		this.toastr.success("Bid Berhasil", 'Success!');
	}	  

	showFailed(){
		this.toastr.error("Anda harus login terlebih dahulu", 'Error!');
	}

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.ws.close();
  }

}
