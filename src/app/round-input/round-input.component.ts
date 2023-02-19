import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from "@angular/forms";
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
    min: 'Please enter a larger number'
  }

  constructor(private fb: FormBuilder) {
  }

  ngOnInit(): void {
    // this uses Angulars FormBuilder service to create a form group and corresponding form controls
    // putting this in ngOnInit and providing a value gives these inputs a default value on page/form load
    this.roundForm = this.fb.group({
      // for a number, you can set 'null' as the default and that will leave the input field blank
      // you could also set the default value to 0 and the input will default to showing 0
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
    console.log(this.roundForm.get('eighteenHoleScore')?.value);

    // to get a value from a specific form control you need to use the get method on that FormGroup
    // this will look for the form control in that specific form group >> this will be case sensitive
    const eighteeenHoleScore = this.roundForm.get('eighteenHoleScore')?.value
    const nineHoleScore = this.roundForm.get('nineHoleScore')?.value
    // this.roundTotal = eighteeenHoleScore + nineHoleScore

    console.log(`The sum of scores is: ${this.roundTotal}`);

    if (this.roundForm.valid) {
      console.log('form is valid, do calculation')
      this.roundTotal = eighteeenHoleScore + nineHoleScore
    } else {
      console.log('run validation messages');
    }

  }

}