import { Component, OnInit } from '@angular/core';
import { NgForm, NgModel } from '@angular/forms';
import { UserHandicapRounds } from '../data/user-handicap-modal';

@Component({
  selector: 'app-round-input',
  templateUrl: './round-input.component.html',
  styleUrls: ['./round-input.component.css']
})
export class RoundInputComponent implements OnInit {

  // used to keep the original data and helps prevent from lost data from user pressing back button, cancel btn, etc.
  originalUserHandicapRounds: UserHandicapRounds = {
    eighteenHole_score: 0,
    nineHole_score: 0
  }

  userHandicapRounds: UserHandicapRounds = { ...this.originalUserHandicapRounds };

  constructor() { 
  }

  ngOnInit(): void {
  };

  addRowOnBtnClick() {
    alert('Add a row on click')
  }

  deleteRowOnBtnClick() {
    alert('Delete a row on click');
  }

  // will PROBABLY need to use this method to calculate the handicap and display it on the screen
  calculateHandicapBtnClick() {
    console.log('button firing for calculation')
  }

}