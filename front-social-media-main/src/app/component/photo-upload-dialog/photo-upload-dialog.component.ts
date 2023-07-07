import {Component, Inject, OnInit} from '@angular/core';
import {environment} from "../../../environments/environment";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {AuthService} from "../../services/auth.service";
import {UserService} from "../../services/user.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {SnackbarComponent} from "../../snackbar/snackbar.component";
import {User} from "../../model/user";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-photo-upload-dialog',
  templateUrl: './photo-upload-dialog.component.html',
  styleUrls: ['./photo-upload-dialog.component.css']
})
export class PhotoUploadDialogComponent implements OnInit{
  photoPreviewUrl: string;
  photo: File;
  defaultProfilePhotoUrl: string = environment.defaultProfilePhotoUrl;
  defaultCoverPhotoUrl: string = environment.defaultCoverPhotoUrl;

  constructor(	@Inject(MAT_DIALOG_DATA) public data: any,  private authService: AuthService,
                private userService: UserService,		private thisDialogRef: MatDialogRef<PhotoUploadDialogComponent>,
                private matSnackbar: MatSnackBar) {

  }
  ngOnInit(): void {
    if (this.data.uploadType === 'profilePhoto') {
      this.photoPreviewUrl = this.data.authUser.profilePhoto ? environment.photoUrl+this.data.authUser.profilePhoto : this.defaultProfilePhotoUrl;
    }
  }
  previewPhoto(e: any): void {
    if (e.target.files) {
      this.photo = e.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(this.photo);
      reader.onload = (e: any) => {
        this.photoPreviewUrl = e.target.result;
      }
    }
  }
  savePhoto(): void {
    if (this.photo) {
      if (this.data.uploadType === 'profilePhoto') {
       this.userService.updateProfilePhoto(this.photo).subscribe({
         next:(updatedUser:User) =>{
           this.authService.storeAuthUserInCache(updatedUser);
           this.photoPreviewUrl = null;
           this.matSnackbar.openFromComponent(SnackbarComponent, {
             data: 'Profile photo updated successfully.',
             duration: 5000
           });
           this.thisDialogRef.close({ updatedUser });
         },error:(err:HttpErrorResponse) =>{
           console.log(err)
           this.matSnackbar.openFromComponent(SnackbarComponent, {
             data: "Error",
             panelClass: ['bg-danger'],
             duration: 5000
           });
         }
       })
      }
    } else {
      this.matSnackbar.openFromComponent(SnackbarComponent, {
        data: 'Please, first upload a photo to save.',
        panelClass: ['bg-danger'],
        duration: 5000
      });
    }
  };

}
