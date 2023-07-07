import {Component, OnInit} from '@angular/core';
import {environment} from "../../../environments/environment";
import {AuthService} from "../../services/auth.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs";
import {User} from "../../model/user";
import {UserService} from "../../services/user.service";
import {PostService} from "../../services/post.service";
import {PostResponse} from "../../model/post-response";
import {logCumulativeDurations} from "@angular-devkit/build-angular/src/builders/browser-esbuild/profiling";
import {PhotoUploadDialogComponent} from "../photo-upload-dialog/photo-upload-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {HttpErrorResponse} from "@angular/common/http";
import {UserResponse} from "../../model/user-response";
import {ConfimationDialogComponent} from "../confimation-dialog/confimation-dialog.component";
import {SnackbarComponent} from "../../snackbar/snackbar.component";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  loadingProfile = true;
  hasMoreResult: boolean = true;
  fetchingResult: boolean = false;
  coverPhoto: any;
  hasNoPost: boolean = false;
  profileUserId: number;
  profileUser: any;
  isProfileViewerOwner: boolean = false;
  authUser: User;
  profileImage = environment.defaultProfilePhotoUrl;

  constructor(private authService: AuthService,
              private matDialog: MatDialog,
              private userService: UserService,
              private postService: PostService,
              private router: Router,private matSnackbar: MatSnackBar,
              private activatedRoute: ActivatedRoute,) {
  }

  profileUserPostResponses: any;
  viewerFollowsProfileUser: false;

  ngOnInit(): void {
    this.coverPhoto = environment.defaultCoverPhotoUrl
    if (!this.authService.isUserLoggedIn()) {
      this.router.navigateByUrl('/login');
    } else {
      this.loadingProfile = true;
      this.authUser = this.authService.getAuthUserFromCache();
      if (this.activatedRoute.snapshot.paramMap.get('userId') === null) {
        this.isProfileViewerOwner = true;
        this.profileUserId = this.authService.getAuthUserId();
      } else {
        this.profileUserId = Number(this.activatedRoute.snapshot.paramMap.get('userId'));
      }
      console.log(this.profileUserId)
      if (this.profileUserId === this.authService.getAuthUserId()) {
        this.router.navigateByUrl('/profile')
      }
      this.userService.getUserById(this.profileUserId).subscribe((res) => {
        console.log(res)
        this.profileUser = res.user;
        this.viewerFollowsProfileUser = res.followedByAuthUser;
        console.log('followed by auth user: ', this.viewerFollowsProfileUser)
        this.userService.getPostsOfUserById(this.profileUserId).subscribe((res) => {
          this.profileUserPostResponses = res;
        }, error => {
          console.log(error)
        })
        if (this.profileUser.profilePhoto != null) {
          this.profileImage = environment.photoUrl + this.profileUser.profilePhoto
        }
        this.loadingProfile = false;
      }, error => {
        console.log(error)
      });

    }

    // this.profileUser = this.authService.getAuthUserFromCache();
    // this.userService.getUserById(this.profileUser.id).subscribe((res) => {
    //   this.profileUser = res;
    //   console.log(res);
    //   if (this.profileUser.profilePhoto != null) {
    //     this.profileImage = environment.photoUrl + this.profileUser.profilePhoto;
    //     this.profileUser.profilePhoto = this.profileImage;
    //   }
    // })
    // this.userService.getMyPosts().subscribe((res) => {
    //   this.profileUserPostResponses = res;
    // });
    // this.loadingProfile = false;
    // this.coverPhoto = environment.defaultCoverPhotoUrl
    // const id = this.authService.getAuthUserId();

    // this.subscriptions.push(
    //   this.userService.getUserById(this.profileUserId).subscribe({
    //     next: (foundUserResponse: UserResponse) => {
    //       const foundUser: User = foundUserResponse.user;
    //       if (foundUser.id === this.authUser.id) {
    //         this.router.navigateByUrl('/profile');
    //       }
    //       this.viewerFollowsProfileUser = foundUserResponse.followedByAuthUser;
    //       if (!foundUser.profilePhoto) {
    //         foundUser.profilePhoto = environment.defaultProfilePhotoUrl
    //       }
    //       this.coverPhoto = environment.defaultCoverPhotoUrl
    //       this.profileUser = foundUser;
    //       this.loadingProfile = false;
    //     },
    //     error: (errorResponse: HttpErrorResponse) => {
    //       this.loadingProfile = false;
    //       this.router.navigateByUrl('/message');
    //     }
    //   })
    // );


    // ngOnInit(): void {
    //   if (!this.authService.isUserLoggedIn()) {
    //     this.router.navigateByUrl('/login');
    //   } else {
    //     this.profileUser = this.authService.getAuthUserFromCache();
    //     this.userService.getUserById(this.profileUser.id).subscribe((res) => {
    //       this.profileUser = res.user;
    //       console.log(res);
    //       if (this.profileUser.profilePhoto != null) {
    //         this.profileImage = environment.photoUrl + this.profileUser.profilePhoto;
    //         this.profileUser.profilePhoto = this.profileImage;
    //       }
    //     })
    //     this.userService.getMyPosts().subscribe((res) => {
    //       this.profileUserPostResponses = res;
    //     });
    //     this.loadingProfile = false;
    //     this.coverPhoto = environment.defaultCoverPhotoUrl
    //     const id = this.authService.getAuthUserId();
    //     console.log(this.authUser)
    //   }
  }

  handlePostDeletedEvent(postResponse: PostResponse): void {
    document.getElementById(`profilePost${postResponse.post.id}`).remove();
  }

  openPhotoUploadDialog($event: Event, uploadType: string) {
    console.log($event)
    $event.stopPropagation();
    let header: string;
    if (uploadType === 'profilePhoto') {
      header = 'Upload Profile Photo';
    }
    const dialogRef = this.matDialog.open(PhotoUploadDialogComponent, {
      data: {authUser: this.profileUser, uploadType, header},
      autoFocus: false,
      minWidth: '300px',
      maxWidth: '900px',
      maxHeight: '500px'
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(result)
      if (result) {
        if (uploadType === 'profilePhoto') {
          this.profileUser.profilePhoto = result.updatedUser.profilePhoto;
        }
      }
      window.location.reload();
    });
  }

  protected readonly environment = environment;

  openFollowConfirmDialog(id) {
    const dialogRef = this.matDialog.open(ConfimationDialogComponent, {
      data: `Do you want to follow ${this.profileUser.name + ' ' + this.profileUser.surname}?`,
      autoFocus: false,
      maxWidth: '500px'
    });
    dialogRef.afterClosed().subscribe(
      (result) => {
        if (result) {
          this.userService.followUser(id).subscribe((res) => {
            console.log(res);
            window.location.reload();
          }, error => {
            this.matSnackbar.openFromComponent(SnackbarComponent, {
              data:"Couldn't perform task,try again later",
              panelClass: ['bg-danger'],
              duration: 5000
            });
          })
        }
      }
    );

  }

  openUnfollowConfirmDialog(id) {
    const dialogRef = this.matDialog.open(ConfimationDialogComponent, {
      data: `Do you want to stop following ${this.profileUser.name + ' ' + this.profileUser.surname}?`,
      autoFocus: false,
      maxWidth: '500px'
    });
    dialogRef.afterClosed().subscribe(
      (result) => {
        if (result) {
          this.userService.unfollowUser(id).subscribe((res) => {
            console.log(res);
            this.viewerFollowsProfileUser = false;
            this.matSnackbar.openFromComponent(SnackbarComponent, {
              data: `You no longer follow ${this.profileUser.firstName + ' ' + this.profileUser.lastName}.`,
              duration: 5000
            });
            window.location.reload();
          }, error => {
            this.matSnackbar.openFromComponent(SnackbarComponent, {
              data:"Couldn't perform task,try again later",
              panelClass: ['bg-danger'],
              duration: 5000
            });
          })
        }
      }
    )
  }
}
