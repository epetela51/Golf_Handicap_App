import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormArray } from "@angular/forms";
// import { Round } from '../data/user-handicap-modal';

@Component({
  selector: 'app-round-input',
  templateUrl: './round-input.component.html',
  styleUrls: ['./round-input.component.css']
})
export class RoundInputComponent implements OnInit {

  // defines form model. Template will bind to this root form model
  roundForm: FormGroup;
  roundTotal: number;
  eighteenHoleValidationMsg: string;
  nineHoleValidationMsg: string;
  eighteenHoleRoundMin: number = 18;
  nineHoleRoundMin: number = 9;

  // must set the type to 'any' for this property otherwise you get an error when trying to use setMessages function
  validationMessages: any = {
    required: 'Please enter a valid number',

    // DYNAMICALLY ADD A NUMBER TO THIS MIN SO IT SAYS 'PLEASE ENTER A NUMBER LARGER THAN (X)'??????
    min: 'Please enter a larger number'
  }

  constructor(private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.roundForm = this.fb.group({
      eighteenHoleScore: [null, [Validators.required, Validators.min(this.eighteenHoleRoundMin)]],
      nineHoleScore: [null, [Validators.required, Validators.min(this.nineHoleRoundMin)]]
    })

    // display validation based on user input (only for 18 hole score)
    const eighteenHoleControl = this.roundForm.get('eighteenHoleScore');
    eighteenHoleControl?.valueChanges.subscribe(value => {
      this.eighteenHoleValidationMsg = this.setValidationMessage(eighteenHoleControl, this.eighteenHoleValidationMsg);
    })

    const nineHoleControl = this.roundForm.get('nineHoleScore');
    nineHoleControl?.valueChanges.subscribe(value => {
      this.nineHoleValidationMsg = this.setValidationMessage(nineHoleControl, this.nineHoleValidationMsg);
    })
  };

  setValidationMessage(control: AbstractControl, validationMsg: any): any {
    validationMsg = '';
    if ((control.touched || control.dirty) && control.errors) {
      return validationMsg = Object.keys(control.errors).map(
        key => this.validationMessages[key]).join(' ');
    }
  }

  // will PROBABLY need to use this method to calculate the handicap and display it on the screen
  calculateHandicapBtnClick() {
    console.log(this.roundForm);
    console.log(`18 Hole Score value: ${this.roundForm.get('eighteenHoleScore')?.value}`);

    const eighteeenHoleScore = this.roundForm.get('eighteenHoleScore')?.value
    const nineHoleScore = this.roundForm.get('nineHoleScore')?.value

    if (this.roundForm.valid) {
      console.log('form is valid, do calculation')
      this.roundTotal = eighteeenHoleScore + nineHoleScore
      console.log(`The sum of scores is: ${this.roundTotal}`);
    } else {
      console.log('run validation messages');
    }

  }

}