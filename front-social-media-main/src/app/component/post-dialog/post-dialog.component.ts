import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {Post} from "../../model/post";
import {PostService} from "../../services/post.service";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ConfimationDialogComponent} from "../confimation-dialog/confimation-dialog.component";
import {HttpErrorResponse} from "@angular/common/http";
import {SnackbarComponent} from "../../snackbar/snackbar.component";
import {Subscription} from "rxjs";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-post-dialog',
  templateUrl: './post-dialog.component.html',
  styleUrls: ['./post-dialog.component.css']
})
export class PostDialogComponent implements OnInit,OnDestroy {
  postFormGroup: FormGroup;
  postPhoto: File;
  postPhotoPreviewUrl: string;

  creatingPost: boolean = false;
  get content() { return this.postFormGroup.get('content'); }
  constructor(
    @Inject(MAT_DIALOG_DATA) public dataPost: Post,
    private postService: PostService,
    private formBuilder: FormBuilder,
    private router: Router,
    private matDialog: MatDialog,
    private matDialogRef: MatDialogRef<PostDialogComponent>,
    private matSnackbar: MatSnackBar) {
  }

  ngOnInit(): void {
    this.postFormGroup = this.formBuilder.group({
      content: new FormControl(((this.dataPost && this.dataPost.content) ? this.dataPost.content : ''), [Validators.maxLength(4096)])
    });

    if (this.dataPost) {
      if (this.dataPost.postPhoto) {
        this.postPhotoPreviewUrl = environment.photoUrl+this.dataPost.postPhoto;
      }
    }

  }

  previewPostPhoto(event: any): void {
    if (event.target.files) {
      this.postPhoto = event.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(this.postPhoto);
      reader.onload = (e: any) => {
        this.postPhotoPreviewUrl = e.target.result;
      }
    }
  }

  openPostPhotoDeleteConfirmDialog(): void {
    const dialogRef = this.matDialog.open(ConfimationDialogComponent, {
      data: 'Do you want to delete this photo?',
      width: '500px',
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(
      result => {
        if (result) {
          this.deletePostPhoto();
        }
      }
    );
  }

  private subscriptions: Subscription[] = [];

  private deletePostPhoto(): void {
    this.subscriptions.push(
      this.postService.deletePostPhoto(this.dataPost.id).subscribe({
        next: (createdPost: Post) => {
          this.postPhotoPreviewUrl = null;
          this.matSnackbar.openFromComponent(SnackbarComponent, {
            data: 'Photo deleted successfully.',
            duration: 5000
          });
        },
        error: (errorResponse: HttpErrorResponse) => {
          this.matSnackbar.openFromComponent(SnackbarComponent, {
            data: "Error",
            panelClass: ['bg-danger'],
            duration: 5000
          });
        }
      })
    )
  }

  private createNewPost(): void {
    if (!this.creatingPost) {
      this.creatingPost = true;
      this.subscriptions.push(
        this.postService.createNewPost(this.content.value, this.postPhoto).subscribe({
          next: (createdPost: Post) => {
            this.matDialogRef.close();
            this.matSnackbar.openFromComponent(SnackbarComponent, {
              data: 'Post created successfully.',
              duration: 5000
            });
            this.creatingPost = false;
            this.router.navigateByUrl(`/profile`).then(() => {
              window.location.reload();
            });
          },
          error: (errorResponse: HttpErrorResponse) => {
            this.matSnackbar.openFromComponent(SnackbarComponent, {
              data: "Error",
              panelClass: ['bg-danger'],
              duration: 5000
            });
            this.creatingPost = false;
          }
        })
      );
    }
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  handlePostSubmit(): void {
    if (this.content.value.length <= 0 && !this.postPhoto) {
      this.matSnackbar.openFromComponent(SnackbarComponent, {
        data: 'Post cannot be empty.',
        panelClass: ['bg-danger'],
        duration: 5000
      });
      return;
    }

    if (this.dataPost) {
      this.updatePost();
    } else {
      this.createNewPost();
    }
  }
  private updatePost(): void {
    this.subscriptions.push(
      this.postService.updatePost(this.dataPost.id, this.content.value, this.postPhoto).subscribe({
        next: (createdPost: Post) => {
          this.matDialogRef.close();
          this.matSnackbar.openFromComponent(SnackbarComponent, {
            data: 'Post updated successfully.',
            duration: 5000
          });
          window.location.reload();
          this.router.navigateByUrl(`/profile`);
        },
        error: (errorResponse: HttpErrorResponse) => {
          this.matSnackbar.openFromComponent(SnackbarComponent, {
            data:"ERROR",
            panelClass: ['bg-danger'],
            duration: 5000
          });
        }
      })
    );
  }
}
