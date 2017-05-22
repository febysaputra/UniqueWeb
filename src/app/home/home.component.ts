import { Component, OnInit } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Router } from '@angular/router';
import { DataService } from '../data/data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit { 
  days = {
      name:"6" 
    };
    hours = {
      name: "2"
    };
    minutes = {
      name: "30"
    };
    seconds = {
      name:"45"
    }; 
  
  private itemsterbaru;
  private itemsrecommend;
  private urlImage: any[]= [];
  private tempUrl = '../assets/lapak/';

  constructor(public http: Http, public router: Router,public dataService: DataService) { 

  }

  ngOnInit() {
      window.scrollTo(0,0);
      this.getLelangTerbaru();
  }
  
  getLelangTerbaru(){
    this.http.get(this.dataService.urlLapak)
    .subscribe(res =>{
      let data = JSON.parse(res['_body']);
        this.itemsterbaru = data;
        for (var i = 0; i < this.itemsterbaru.length; i++) {
          this.urlImage[i] = this.tempUrl + this.itemsterbaru[i.toString()].idlapak + "/" + this.itemsterbaru[i.toString()].foto["0"];  
        }
        // this.urlImage = this.urlImage + this.itemsterbaru["0"].foto["0"];
    });
  }

  bidnow(routeslapak){
    this.router.navigate(['/bid', routeslapak]);
  }

}


