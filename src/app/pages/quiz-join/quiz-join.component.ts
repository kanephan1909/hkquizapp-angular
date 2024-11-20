import { Component, inject } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { TestService } from '../../services/test.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-quiz-join',
  standalone: true,
  imports: [MatInputModule, MatButtonModule, FormsModule,CommonModule, MatIconModule],
  templateUrl: './quiz-join.component.html',
  styleUrls: ['./quiz-join.component.css']
})
export class QuizJoinComponent {
  code: string = '';  // Initialize as an empty string
  name: string = '';  // Initialize as an empty string
  password: string = ''; //Initialize as an empty string

  testservice = inject(TestService);
  router = inject(Router);
  errorMessage: any;



  join() {
    // Kiểm tra xem cả mã và tên đã được cung cấp chưa
    if (!this.code || !this.name || !this.password) {
      alert('Please enter both the quiz code and your name , password.');
      return;
    }

    // Gọi service để nhận bài kiểm tra theo mã
    this.testservice.getQuizByCode(this.code).subscribe({
      next: (result) => {
        if (result.length === 0) {
          // Nếu mã quiz sai, hiển thị thông báo
          alert('Sorry, your quiz code is wrong. Please try again!');
        } else {
          // Nếu mã đúng, xử lý logic tham gia quiz
          const quiz = result[0];
          const userQuiz = {
            name: this.name,
            quizId: quiz.id,
            response: []
          };

          this.testservice.joinQuiz(userQuiz).subscribe({
            next: (response) => {
              this.testservice.quizResult = response;
              this.router.navigateByUrl("/quiz-info");
            },
            error: (error) => {
              console.error("Error joining quiz:", error);
            },
          });
        }
      },
      error: (error) => {
        console.error("Error fetching quiz by code:", error);
      },
    });
  }


    // Đăng nhập bằng Google
    signInWithGoogle() {
      console.log('Đăng nhập với Google');
      // Tích hợp Google API ở đây
    }

    // Đăng nhập bằng Zalo
    signInWithZalo() {
      console.log('Đăng nhập với Zalo');
      // Tích hợp Zalo API ở đây
    }
}
