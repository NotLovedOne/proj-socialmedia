import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {PostResponse} from "../../model/post-response";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatDialog} from "@angular/material/dialog";
import {environment} from "../../../environments/environment";
import {PostDialogComponent} from "../post-dialog/post-dialog.component";
import {ConfimationDialogComponent} from "../confimation-dialog/confimation-dialog.component";
import {SnackbarComponent} from "../../snackbar/snackbar.component";
import {HttpErrorResponse} from "@angular/common/http";
import {Subscription} from "rxjs";
import {PostService} from "../../services/post.service";
import {PostCommentDialogComponent} from "../post-comment-dialog/post-comment-dialog.component";

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {
  @Input() postResponse: PostResponse;
  @Input() isDetailedPost: boolean;
  @Output() postDeletedEvent = new EventEmitter<PostResponse>();

  constructor(private authService: AuthService, private matDialog: MatDialog, private postService: PostService,
              private matSnackbar: MatSnackBar,) {

  }

  private subscriptions: Subscription[] = [];
  postImage = environment.defaultProfilePhotoUrl;
  authUserId: number;

  ngOnInit(): void {
    this.authUserId = this.authService.getAuthUserId();
    if (this.postResponse.post.author.profilePhoto != null) {
      this.postImage = environment.photoUrl + this.postResponse.post.author.profilePhoto;
    }
  }

  openPostEditDialog() {
    const dialogRef = this.matDialog.open(PostDialogComponent, {
      data: this.postResponse.post,
      autoFocus: false,
      minWidth: '500px',
      maxWidth: '900px'
    });
  }

  openPostDeleteConfirmDialog() {
    const dialogRef = this.matDialog.open(ConfimationDialogComponent, {
      data: 'Do you want to delete this post permanently?',
      autoFocus: false,
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(
      result => {
        if (result) this.deletePost(this.postResponse.post.id);
      }
    );
  }

  deletePost(postId: number): void {
    this.subscriptions.push(
      this.postService.deletePost(postId).subscribe({
        next: (response: any) => {
          this.postDeletedEvent.emit(this.postResponse);
          this.matSnackbar.openFromComponent(SnackbarComponent, {
            data: 'Post deleted successfully.',
            panelClass: ['bg-success'],
            duration: 5000
          });
        },
        error: (errorResponse: HttpErrorResponse) => {
          this.matSnackbar.openFromComponent(SnackbarComponent, {
            data: "DELETED",
            panelClass: ['bg-success'],
            duration: 5000
          });
        }
      })
    );
    window.location.reload()
  }

  openLikeDialog() {

  }

  openCommentDialog() {
    console.log(this.postResponse.post)
    const dialogRef = this.matDialog.open(PostCommentDialogComponent, {
      data: this.postResponse.post,
      autoFocus: false,
      minWidth: '500px',
      maxWidth: '700px'
    });

    dialogRef.componentInstance.updatedCommentCountEvent.subscribe(
      data => this.postResponse.post.commentCount = data
    );
  }

  openShareDialog() {

  }

  likeOrUnlikePost(likedByAuthUser: boolean, id) {
    if (likedByAuthUser) {
      this.postService.likePost(id).subscribe((res) => {
        this.postResponse.likedByAuthUser = false;
        this.postResponse.post.likeCount--;
      })
    } else {
      this.postService.likePost(id).subscribe((res) => {
        this.postResponse.likedByAuthUser = true;
        this.postResponse.post.likeCount++;
      })
    }
  }

  protected readonly environment = environment;
}
