import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient, HttpErrorResponse, HttpResponse} from "@angular/common/http";
import {UserSignup} from "../model/user-signup";
import {Observable, Subject} from "rxjs";
import {User} from "../model/user";
import {UserLogin} from "../model/user-login";
import {JwtHelperService} from "@auth0/angular-jwt";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  logoutSubject = new Subject<boolean>();
  loginSubject = new Subject<User>();
  private host = environment.apiUrl;
  private principal: string;
  private jwtService = new JwtHelperService();
  private authToken: string;
  private authUser: User;
  constructor(private httpClient:HttpClient) { }

  signup(userSignup: UserSignup) {
    return this.httpClient.post<any>(`${this.host}/auth/register`, userSignup);
  }
  login(loginDto:UserLogin) :Observable<any>{
    return this.httpClient.post<User>(`${this.host}/auth/login`, loginDto,{ observe: 'response' });
  }
  storeTokenInCache(authToken: string): void {
    if (authToken != null && authToken != '') {
      this.authToken = authToken;
      localStorage.setItem('authToken', authToken);
    }
  }
  loadAuthTokenFromCache(): void {
    this.authToken = localStorage.getItem('authToken');
  }

  getAuthTokenFromCache(): string {
    return localStorage.getItem('authToken');
  }
  storeAuthUserInCache(authUser: User): void {
    if (authUser != null) {
      this.authUser = authUser;
      localStorage.setItem('authUser', JSON.stringify(authUser));
    }
    this.loginSubject.next(authUser);
  }
  isUserLoggedIn(): boolean {
    this.loadAuthTokenFromCache();
    if (this.authToken != null && this.authToken != '') {
      if (this.jwtService.decodeToken(this.authToken).sub != null || '') {
        if (!this.jwtService.isTokenExpired(this.authToken)) {
          this.principal = this.jwtService.decodeToken(this.authToken).sub;
          return true;
        }
      }
    }
    this.logout();
    return false;
  }

  getAuthUserFromCache(): User {
    return JSON.parse(localStorage.getItem('authUser'));
  }

  getAuthUserId(): number {
    return this.getAuthUserFromCache().id;
  }


  logout() {
    this.authToken = null;
    this.authUser = null;
    this.principal = null;
    localStorage.removeItem('authUser');
    localStorage.removeItem('authToken');
    this.logoutSubject.next(true);
  }
}
