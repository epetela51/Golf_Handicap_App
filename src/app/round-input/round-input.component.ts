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
    alert('Calculate Handicap on click')
  }

  // allows you to have something take place when the blur event takes place.  This can be used on any event, just using blur as the current example
  onBlur(field: NgModel) {
    console.log('in inBlur ', field.valid)
  }

  // used for submitting a form.  This MIGHT be more applicable if I want to save round scores in the future????
  onSubmit(form: NgForm) {
    console.log('in onSubmit: ', form.valid)
  }
}