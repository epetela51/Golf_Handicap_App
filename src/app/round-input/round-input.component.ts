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
  numberMessage: string;

  // must set the type to 'any' for this property otherwise you get an error when trying to use setMessages function
  validationMessages: any = {
    required: 'Please enter a valid number'
  }

  constructor(private fb: FormBuilder) {
  }

  ngOnInit(): void {
    // this uses Angulars FormBuilder service to create a form group and corresponding form controls
    // putting this in ngOnInit and providing a value gives these inputs a default value on page/form load
    this.roundForm = this.fb.group({
      // for a number, you can set 'null' as the default and that will leave the input field blank
      // you could also set the default value to 0 and the input will default to showing 0
      eighteenHoleScore: [null, [Validators.required, Validators.min(18)]],
      nineHoleScore: [null, [Validators.required, Validators.min(9)]]
    })

    // display validation based on user input (only for 18 hole score)
    const numberControl = this.roundForm.get('eighteenHoleScore');
    numberControl?.valueChanges.subscribe(value => {
      console.log(value);
      this.setMessage(numberControl);
    })
  };

  setMessage(c: AbstractControl): void {
    this.numberMessage = '';
    console.log(c);
    if ((c.touched || c.dirty) && c.errors) {
      this.numberMessage = Object.keys(c.errors).map(
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
    this.roundTotal = eighteeenHoleScore + nineHoleScore

    console.log(`The sum of scores is: ${this.roundTotal}`);

  }

}