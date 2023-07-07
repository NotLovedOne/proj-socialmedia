import {Component, OnDestroy, OnInit} from '@angular/core';
import {User} from "../../model/user";
import {Subscription} from "rxjs";
import {AuthService} from "../../services/auth.service";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {environment} from "../../../environments/environment";
import {PostDialogComponent} from "../post-dialog/post-dialog.component";
import {UsersComponent} from "../users/users.component";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  authUser: User;
  isUserLoggedIn: boolean = false;
  isProfilePage: boolean = false;
  notifications: Notification[] = [];
  hasUnseenNotification: boolean = false;
  resultPage: number = 1;
  resultSize: number = 5;
  hasMoreNotifications: boolean = false;
  fetchingResult: boolean = false;
  defaultProfilePhotoUrl = environment.defaultProfilePhotoUrl;
  private subscriptions: Subscription[] = [];
  notificationMenu: any;
  profileImage = environment.defaultProfilePhotoUrl;
  constructor(
    private authService: AuthService,
    // private notificationService: NotificationService,
    private matDialog: MatDialog,
    private matSnackbar: MatSnackBar
  ) { }

  ngOnInit(): void {
    if (this.authService.isUserLoggedIn()) {
      this.isUserLoggedIn = true;
      this.authUser = this.authService.getAuthUserFromCache();
      if(this.authUser.profilePhoto!=null) this.profileImage = environment.photoUrl + this.authUser.profilePhoto;
    } else {
      this.isUserLoggedIn = false;
    }
    this.authService.logoutSubject.subscribe(loggedOut => {
      if (loggedOut) {
        this.isUserLoggedIn = false;
      }
    });
    this.authService.loginSubject.subscribe(loggedInUser => {
      if (loggedInUser) {
        this.authUser = loggedInUser;
        this.isUserLoggedIn = true;
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  openPostDialog(): void {
    this.matDialog.open(PostDialogComponent, {
      data: null,
      autoFocus: false,
      minWidth: '500px',
      maxWidth: '700px'
    });
  }

  openSearchDialog(): void {
    // this.matDialog.open(SearchDialogComponent, {
    //   autoFocus: true,
    //   width: '500px'
    // });
  }

  loadNotifications(page: number): void {
    this.fetchingResult = true;

    // this.subscriptions.push(
    //   this.notificationService.getNotifications(page,  this.resultSize).subscribe({
    //     next: (notifications: Notification[]) => {
    //       this.fetchingResult = false;
    //
    //       notifications.forEach(n => {
    //         this.notifications.push(n);
    //         if (!n.isSeen) this.hasUnseenNotification = true;
    //       });
    //
    //       if (notifications.length > 0) {
    //         this.hasMoreNotifications = true;
    //       } else {
    //         this.hasMoreNotifications = false;
    //       }
    //
    //       this.resultPage++;
    //     },
    //     error: (errorResponse: HttpErrorResponse) => {
    //       this.matSnackbar.openFromComponent(SnackbarComponent, {
    //         data: AppConstants.snackbarErrorContent,
    //         panelClass: ['bg-danger'],
    //         duration: 5000
    //       });
    //       this.fetchingResult = false;
    //     }
    //   })
    // );
  }

  handleUnseenNotifications(): void {
    // if (this.hasUnseenNotification) {
    //   this.subscriptions.push(
    //     this.notificationService.markAllSeen().subscribe({
    //       next: (response: any) => {
    //         this.hasUnseenNotification = false;
    //       },
    //       error: (errorResponse: HttpErrorResponse) => {
    //         this.matSnackbar.openFromComponent(SnackbarComponent, {
    //           data: AppConstants.snackbarErrorContent,
    //           panelClass: ['bg-danger'],
    //           duration: 5000
    //         });
    //       }
    //     })
    //   );
    // }
  }

  openUsersDialog() {
    this.matDialog.open(UsersComponent,{
      autoFocus: true,
      width: '500px'
    });
  }
}
