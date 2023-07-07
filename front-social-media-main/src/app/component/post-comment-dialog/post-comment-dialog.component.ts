import {Component, EventEmitter, Inject, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {environment} from "../../../environments/environment";
import {MAT_DIALOG_DATA, MatDialog} from "@angular/material/dialog";
import {Post} from "../../model/post";
import {AuthService} from "../../services/auth.service";
import {PostService} from "../../services/post.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {CommentResponse} from "../../model/comment";
import {error} from "@angular/compiler-cli/src/transformers/util";
import {SnackbarComponent} from "../../snackbar/snackbar.component";

@Component({
  selector: 'app-post-comment-dialog',
  templateUrl: './post-comment-dialog.component.html',
  styleUrls: ['./post-comment-dialog.component.css']
})
export class PostCommentDialogComponent implements OnInit {
  @Output() updatedCommentCountEvent = new EventEmitter<number>();
  @Output() newItemEvent = new EventEmitter<string>();
  authUserId: number;
  commentResponseList: CommentResponse[] = [];
  resultPage: number = 1;
  resultSize: number = 5;
  hasMoreResult: boolean = false;
  fetchingResult: boolean = false;
  creatingComment: boolean = false;
  commentFormGroup: FormGroup;
  defaultProfilePhotoUrl = environment.defaultProfilePhotoUrl;
  listOfComments:any;
  someArray:CommentResponse[] = [];
  get content() {
    return this.commentFormGroup.get('content')
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public dataPost: Post,
    private authService: AuthService,
    private postService: PostService,
    private formBuilder: FormBuilder,
    private matDialog: MatDialog,
    private matSnackbar: MatSnackBar) {
    this.postService.getPostById(this.dataPost.id).subscribe((res: any) => {
      this.listOfComments = res.comments;
      res.comments.forEach(comment=>{
        console.log(comment)
        this.commentResponseList.push(comment);
      })
    })
  }

  ngOnInit(): void {
    this.authUserId = this.authService.getAuthUserId();
    console.log(this.listOfComments)
    this.commentFormGroup = this.formBuilder.group({
      content: new FormControl('', [Validators.required, Validators.maxLength(1024)])
    });
  }

  temp: any;

  createNewComment(): void {
    this.creatingComment = true;
    let request = {
      'content': (this.content.value)
    }
    console.log(this.listOfComments)
    this.postService.createComment(this.dataPost.id, request).subscribe((res) => {
      Object.keys(this.commentFormGroup.controls).forEach(key => {
        this.commentFormGroup.get(key).setErrors(null);
      });
      this.temp = res;
      this.commentResponseList.unshift(this.temp);
      this.updatedCommentCountEvent.emit(this.commentResponseList.length);
      this.creatingComment = false;
    }, error => {
      this.matSnackbar.openFromComponent(SnackbarComponent, {
        data: "COMMENT NOT CREATED",
        panelClass: ['bg-danger'],
        duration: 5000
      });
      this.creatingComment = false;
    })
    console.log(request)
  }

  protected readonly environment = environment;
}
