import {Component, OnInit} from '@angular/core';
import {UserService} from "../../services/user.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatDialog} from "@angular/material/dialog";
import {Router} from "@angular/router";
import {UserResponse} from "../../model/user-response";
import {environment} from "../../../environments/environment";
import {ConfimationDialogComponent} from "../confimation-dialog/confimation-dialog.component";
import {SnackbarComponent} from "../../snackbar/snackbar.component";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  searchResult: any;
  searchUserFormGroup: FormGroup;

  constructor(private userService: UserService, private matSnackbar: MatSnackBar, private formBuilder: FormBuilder,
              private matDialog: MatDialog,
              private router: Router) {
  }

  get key() {
    return this.searchUserFormGroup.get('key');
  }

  ngOnInit(): void {
    this.userService.getUsers().subscribe((res) => {
      console.log('users', res);
      this.searchResult = res;
    })
    this.searchUserFormGroup = this.formBuilder.group({
      key: new FormControl('', [Validators.minLength(3), Validators.maxLength(64)])
    });
  }

  protected readonly environment = environment;

  openFollowConfirmDialog(userResponse: UserResponse) {
    const dialogRef = this.matDialog.open(ConfimationDialogComponent, {
      data: `Do you want to follow this ${userResponse.user.name + ' ' + userResponse.user.surname}?`,
      autoFocus: false,
      maxWidth: '500px'
    });
    dialogRef.afterClosed().subscribe(
      (result) => {
        if (result) {
          userResponse.followedByAuthUser = true;
          console.log(result)
          this.userService.followUser(userResponse.user.id).subscribe((res) => {
            this.matSnackbar.openFromComponent(SnackbarComponent, {
              data: `You are now following ${userResponse.user.name + ' ' + userResponse.user.surname}.`,
              duration: 5000
            });
          })
        }
      }
    )

    console.log(userResponse)
  }

  openUnfollowConfirmDialog(userResponse: any) {
    const dialogRef = this.matDialog.open(ConfimationDialogComponent, {
      data: `Do you want to unfollow this ${userResponse.user.name + ' ' + userResponse.user.surname}?`,
      autoFocus: false,
      maxWidth: '500px'
    });
    dialogRef.afterClosed().subscribe(
      (result) => {
        if (result) {
          userResponse.followedByAuthUser = false;
          console.log(result)
          this.userService.unfollowUser(userResponse.user.id).subscribe((res) => {
            this.matSnackbar.openFromComponent(SnackbarComponent, {
              data: `You are now not following ${userResponse.user.name + ' ' + userResponse.user.surname}.`,
              duration: 5000
            });
          })
        }
      }
    )
    console.log(userResponse)
  }

  searchUser() {
    if (this.key.value == ' ' || this.key.value == '') {
      this.userService.getUsers().subscribe((res) => {
        this.searchResult = res;
      })
      return;
    }
    this.userService.searchFilter(this.key.value).subscribe((res) => {
      console.log(res)
      this.searchResult = res;
    })
  }
}
