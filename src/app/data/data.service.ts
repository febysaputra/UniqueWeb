import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs/Subject';
// import { AuthHttp, JwtHelper, tokenNotExpired } from 'angular2-jwt';

@Injectable()
export class DataService{
	public loggedIn: boolean;
	public token;

	//user
	public urlLogin = 'http://localhost:8080/login';
	public urlRegister = 'http://localhost:8080/register';
	public urlLogout = 'http://localhost:8080/logout';
	public urlCheckExpiredToken = 'http://localhost:8080/checkexpiredtoken';
	public urlVerifikasiUser = 'http://localhost:8080/verifieduser';
	public urlCheckStatusUser = 'http://localhost:8080/checkstatususer';
	public urlGetUser = 'http://localhost:8080/profile';
	public urlEditProfile = 'http://localhost:8080/profile/editprofile';

	//lapak
	public urlLapak = 'http://localhost:8080/lapak';
	public urlNewLapak = 'http://localhost:8080/mylapak/newlapak';
	public urlBid = 'http://localhost:8080/room/recentbid';
	public urlRoomBid = 'ws://localhost:8080/lapak/room';

	public loginState(cek){
			this.loggedIn = cek;
	}

	public loginToken(cek){
			this.token = cek;
	}


}