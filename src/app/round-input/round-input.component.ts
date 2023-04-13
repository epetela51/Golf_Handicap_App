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
  roundTotal: number[] = [0, 0, 0];
  eighteenHoleValidationMsg: string;
  nineHoleValidationMsg: string;
  eighteenHoleRoundMin: number = 2;
  nineHoleRoundMin: number = 2;

  get roundInputs(): FormArray{
    return <FormArray>this.roundForm.get('roundInputs')
  }

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
      roundInputs: this.fb.array([ this.buildRoundForm(), this.buildRoundForm(), this.buildRoundForm() ])
    })

    // this.displayValidation();
  };

  buildRoundForm() : FormGroup {
    const roundFormGroup = this.fb.group({
      eighteenHoleScore: [null, [Validators.required, Validators.min(this.eighteenHoleRoundMin)]],
      nineHoleScore: [null, [Validators.required, Validators.min(this.nineHoleRoundMin)]]
    })
    
    roundFormGroup.statusChanges.subscribe(data => {
      this.calcScoreDifferential();
    })

    return roundFormGroup
  }

  calcScoreDifferential() {
    // reset the array holding the sums otherwise the array can double when doing a calc, adding a round and then doing another clac
    this.roundTotal = [];

    let eighteeenHoleScore;
    let nineHoleScore;
    let total;

    this.roundInputs.controls.forEach((control) => {
      if (control.status === 'VALID') {
        eighteeenHoleScore = control.get('eighteenHoleScore')?.value
        nineHoleScore = control.get('nineHoleScore')?.value
        total = eighteeenHoleScore + nineHoleScore
        this.roundTotal.push(total)
      } else {
        total = 0;
        this.roundTotal.push(total)
      }
    })
  }

  displayValidation() {
    // display validation based on user input
    const eighteenHoleControl = this.roundInputs.get('0.eighteenHoleScore');
    eighteenHoleControl?.valueChanges.subscribe(value => {
      this.eighteenHoleValidationMsg = this.setValidationMessage(eighteenHoleControl, this.eighteenHoleValidationMsg);
    })

    const nineHoleControl = this.roundInputs.get('0.nineHoleScore');
    nineHoleControl?.valueChanges.subscribe(value => {
      this.nineHoleValidationMsg = this.setValidationMessage(nineHoleControl, this.nineHoleValidationMsg);
    })
  }

  setValidationMessage(control: AbstractControl, validationMsg: any): any {
    validationMsg = '';
    if ((control.touched || control.dirty) && control.errors) {
      return validationMsg = Object.keys(control.errors).map(
        key => this.validationMessages[key]).join(' ');
    }
  }

  // will PROBABLY need to use this method to calculate the handicap and display it on the screen
  calculateHandicapBtnClick() {
    console.log('calculate handicap and display')
  }

  addRound() {
    if (this.roundInputs.length < 20) {
      this.roundInputs.push(this.buildRoundForm())
      this.roundTotal.push(0)
    } else {
      alert('Maximum of 20 rounds allowed');
    }

  }

  removeRound() {
    if (this.roundInputs.length > 3) {
      this.roundInputs.removeAt(-1)
      this.roundTotal.pop()
    } else {
      alert('Minimum of 3 rounds are required');
    }
  }

}