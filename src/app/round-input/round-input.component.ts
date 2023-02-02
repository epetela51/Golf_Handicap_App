import { Component, OnInit } from '@angular/core';
import { UserHandicapRounds } from '../data/user-handicap-modal';

@Component({
  selector: 'app-round-input',
  templateUrl: './round-input.component.html',
  styleUrls: ['./round-input.component.css']
})
export class RoundInputComponent implements OnInit {

  // used to keep the original data and helps prevent from lost data from user pressing back button, cancel btn, etc.
  originalUserHandicapRounds: UserHandicapRounds = {
    eighteenHoleScore: 0,
    nineHoleScore: 0,
    courseRating: 0,
    slopeRating: 0,
    scoreDifferential: 0
  }

  test: Array <any> = [
    '18 Hole Score',
    '9 Hole Score',
    'Course Rating',
    'Slope Rating',
    'Score Differential'
  ]

  userHandicapRounds: UserHandicapRounds = { ...this.originalUserHandicapRounds };

  handicapNumber: number;

  constructor() { 
  }

  ngOnInit(): void {
  };

  addRowOnBtnClick() {
    console.log('Add a row on click')
  }

  deleteRowOnBtnClick() {
    console.log('Delete a row on click');
  }

  // will PROBABLY need to use this method to calculate the handicap and display it on the screen
  calculateHandicapBtnClick() {
    console.log('button firing for calculation')
    console.log(this.userHandicapRounds);

    this.handicapNumber = this.userHandicapRounds.eighteenHoleScore + this.userHandicapRounds.nineHoleScore

    console.log(`Addition is: ${this.handicapNumber}`);
  }

}