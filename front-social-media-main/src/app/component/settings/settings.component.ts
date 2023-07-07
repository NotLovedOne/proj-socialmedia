import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {UserService} from "../../services/user.service";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";
import {User} from "../../model/user";
import {UpdateUserInfo} from "../../model/update-user-info";
import {HttpErrorResponse} from "@angular/common/http";
import {SnackbarComponent} from "../../snackbar/snackbar.component";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  constructor(private authService: AuthService,
              private userService: UserService,
              private formBuilder: FormBuilder,
              private matSnackbar: MatSnackBar,
              private router: Router) {
  }

  authUser: User;
  updateInfoFormGroup: FormGroup;
  authUserId: number;
  submittingForm: boolean = false;

  get updateInfoIntro() {
    return this.updateInfoFormGroup.get('intro')
  }

  get updateInfoFirstName() {
    return this.updateInfoFormGroup.get('name')
  }

  get updateInfoLastName() {
    return this.updateInfoFormGroup.get('surname')
  }

  get updateInfoHometown() {
    return this.updateInfoFormGroup.get('hometown')
  }

  get updateInfoWorkplace() {
    return this.updateInfoFormGroup.get('workplace')
  }

  get updateInfoUsername() {
    return this.updateInfoFormGroup.get('username')
  }

  ngOnInit(): void {
    if (!this.authService.isUserLoggedIn()) {
      this.router.navigateByUrl('/login');
    } else {
      this.authUser = this.authService.getAuthUserFromCache();
      console.log(this.authUser)
      this.updateInfoFormGroup = this.formBuilder.group({
        name: new FormControl(this.authUser.name, [Validators.required, Validators.maxLength(64)]),
        surname: new FormControl(this.authUser.surname, [Validators.required, Validators.maxLength(64)]),
        intro: new FormControl(this.authUser.intro, [Validators.maxLength(100)]),
        username: new FormControl(this.authUser.username, [Validators.maxLength(128)]),
        hometown: new FormControl(this.authUser.hometown, [Validators.maxLength(128)]),
        workplace: new FormControl(this.authUser.workplace, [Validators.maxLength(128)]),
      });
    }
  }
  res:User;
  handleUpdateInfo() {
    this.submittingForm = true;
    const updateUserInfo = new UpdateUserInfo();
    updateUserInfo.intro = this.updateInfoIntro.value;
    updateUserInfo.workplace = this.updateInfoWorkplace.value;
    updateUserInfo.name = this.updateInfoFirstName.value;
    updateUserInfo.surname = this.updateInfoLastName.value;
    updateUserInfo.username = this.updateInfoUsername.value;
    updateUserInfo.hometown = this.updateInfoHometown.value;
    console.log(updateUserInfo);
    this.userService.updateInfoUser(updateUserInfo).subscribe({
        next: (user: User) => {
          this.matSnackbar.openFromComponent(SnackbarComponent, {
            data: 'Your account has been updated successfully.',
            panelClass: ['bg-success'],
            duration: 5000
          });
          this.res = user;
          this.authService.storeAuthUserInCache(user);
          this.submittingForm = false;
          this.router.navigateByUrl('/profile');
        }, error: (errorResponse: HttpErrorResponse) => {
          this.matSnackbar.openFromComponent(SnackbarComponent, {
            data: "ERROR",
            panelClass: ['bg-danger'],
            duration: 5000
          });
          this.submittingForm = false;
        }

      }
    )
  }
}
