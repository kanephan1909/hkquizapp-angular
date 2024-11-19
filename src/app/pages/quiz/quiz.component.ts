import { Component, inject } from '@angular/core';
import { TestService } from '../../services/test.service';
import { Question, Quiz, QuizResult } from '../../types';
import { Router } from '@angular/router';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [MatRadioModule, MatButtonModule],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.css'
})
export class QuizComponent {

  testService = inject(TestService);
  router = inject(Router);
  questions: Question[] = [];
  quizInfo!: Quiz;
  quizResult!: QuizResult;
  currentQuestionNo: number = 0;

  timeLeft: number = 1200 ; // Thời gian ban đầu tính bằng giây (ví dụ: 3600 giây = 1 giờ)
  timerInterval: any; // Lưu ID của interval

  ngOnInit() {
    this.quizResult = this.testService.quizResult;
    if (!this.quizResult) {
      this.router.navigateByUrl("/");
      return;
    }

    this.testService.getQuestions().subscribe(results => {
      this.questions = results;
    });

    this.testService.getQuizById(this.quizResult.quizId).subscribe(result => {
      this.quizInfo = result;
    });

    this.startTimer();
  }

  // Phương thức để bắt đầu bộ đếm thời gian
  startTimer() {
    this.timerInterval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.submit(); // Tự động gửi bài khi hết thời gian
      }
    }, 1000); // Cập nhật mỗi giây
  }

  // Phương thức để dừng bộ đếm thời gian (nếu cần)
  stopTimer() {
    clearInterval(this.timerInterval);
  }

  // Getter để định dạng thời gian (giờ:phút:giây)
  get formattedTime(): string {
    let hours = Math.floor(this.timeLeft / 3600);
    let minutes = Math.floor((this.timeLeft % 3600) / 60);
    let seconds = this.timeLeft % 60;

    return `${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(seconds)}`;
  }

  // Phương thức để thêm số 0 vào nếu là số nhỏ hơn 10
  padZero(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  get currentQuestion() {
    let questionId = this.quizInfo?.questions[this.currentQuestionNo];
    return this.questions.find(x => x.id == questionId);
  }

  currentSelectedOptionId: string = '';
  next() {
    this.quizResult.response?.push({
      questionId: this.currentQuestion!.id,
      answerOptionId: this.currentSelectedOptionId
    });
    this.currentQuestionNo++;
    this.currentSelectedOptionId = "";
  }

  submit() {
    this.next();
    this.calculateResult();
    this.stopTimer(); // Dừng bộ đếm thời gian khi nộp bài
    this.testService.updateQuizResult(this.quizResult.id!, this.quizResult).subscribe();
    this.router.navigateByUrl("quiz-score");
  }

  calculateResult() {
    let score = 0;
    let correct = 0;
    let inCorrect = 0;
    let unAttempt = 0;
    let totalMark = 0;

    this.quizResult.response?.forEach((response) => {
      let questionId = response.questionId;
      let selectedOptionId = response.answerOptionId;
      let question = this.questions.find((x) => x.id == questionId);
      let correctOption = question?.options.find((x) => x.isCorrect);

      totalMark += question!.marks;

      if (!selectedOptionId) {
        unAttempt++;
      } else if (selectedOptionId === correctOption?.id) {
        correct++;
        score += question!.marks;
      } else {
        inCorrect++;
        score -= question!.negativeMarks;
      }
    });

    this.quizResult.correct = correct;
    this.quizResult.inCorrect = inCorrect;
    this.quizResult.unAttempt = unAttempt;
    this.quizResult.score = score;
    this.quizResult.percentage = Math.round((score / totalMark) * 100);
  }
}
