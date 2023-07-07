import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, Validators} from "@angular/forms";
import {UserLogin} from "../../model/user-login";
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginFormGroup: any;
  submittingForm: boolean = false;

  constructor(private formBuilder: FormBuilder, private authService: AuthService,private router:Router) {
  }

  ngOnInit(): void {
    this.loginFormGroup = this.formBuilder.group({
      email: new FormControl('',
        [Validators.required, Validators.email]
      ),
      password: new FormControl('',
        [Validators.required, Validators.minLength(6), Validators.maxLength(32)]
      )
    });
  }
  data:any;

  handleLogin() {
    this.submittingForm = true;
    if (this.loginFormGroup.valid) {
      const userToLogin = new UserLogin();
      userToLogin.username = this.email?.value;
      userToLogin.password = this.loginFormGroup.value.password;
      this.authService.login(userToLogin).subscribe(response => {
        console.log(response);
        this.data = response;
        console.log(this.data.token)
        this.authService.storeTokenInCache(this.data.body.token)
        delete this.data.body.token;
        this.authService.storeAuthUserInCache(this.data.body);
        this.router.navigateByUrl('/profile')
      }, error => {
        console.log(error);
      })

    }
  }

  get email() {
    return this.loginFormGroup.get('email')
  }

  get password() {
    return this.loginFormGroup.get('password')
  }
}
