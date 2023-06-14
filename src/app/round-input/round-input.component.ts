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
  handicapIndex:  number = 0;
  calcBtnDisabled: boolean = false;
  recalcHandicapMsg: String = 'Handicap needs to be re-calculated'
  
  // must set the type to 'any' for this property otherwise you get an error when trying to use setMessages function
  validationMessages: any = {
    // remove below if I am NOT using a required or minimum validation message
    // required: 'Please enter a valid number',
    // min: 'Please enter a larger number',

    eighteenHoles: 'Enter in a round of at least 18',
    nineHoles: 'Enter in a round of at least 9'
  }

  get roundInputs(): FormArray{
    return <FormArray>this.roundForm.get('roundInputs')
  }

  constructor(private fb: FormBuilder) {
  }

  ngOnInit(): void {

    this.roundForm = this.fb.group({
      roundInputs: this.fb.array([ this.buildRoundForm(), this.buildRoundForm(), this.buildRoundForm() ])
    })

    this.displayValidation();
  };

  buildRoundForm() : FormGroup {
    const roundFormGroup = this.fb.group({
      eighteenHoleScore: [null, [Validators.required, Validators.min(this.eighteenHoleRoundMin)]],
      nineHoleScore: [null, [Validators.required, Validators.min(this.nineHoleRoundMin)]]
    })

    roundFormGroup.valueChanges.subscribe(value => {
      if (this.calcBtnDisabled && value) {
        this.calcBtnDisabled = false;
      }
    })
    
    roundFormGroup.statusChanges.subscribe(status => {
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
      this.eighteenHoleValidationMsg = this.setValidationMessage(eighteenHoleControl, this.eighteenHoleValidationMsg, 'eighteenHoles');
    })

    const nineHoleControl = this.roundInputs.get('0.nineHoleScore');
    nineHoleControl?.valueChanges.subscribe(value => {
      this.nineHoleValidationMsg = this.setValidationMessage(nineHoleControl, this.nineHoleValidationMsg, 'nineHoles');
    })
  }

  setValidationMessage(control: AbstractControl, validationMsg: any, roundNumberForValidation: string): any {
    validationMsg = '';
    if ((control.touched || control.dirty) && control.errors) {
      return validationMsg = this.validationMessages[roundNumberForValidation];
    }
  }

  // will PROBABLY need to use this method to calculate the handicap and display it on the screen
  calculateHandicapBtnClick() {
    this.calcBtnDisabled = true;

    let tempSum = 0;
    this.roundTotal.forEach((sum) => {
      tempSum += sum
    })
    // toFixed makes it a string so need to convert it back to a number using Number()
    this.handicapIndex = Number((tempSum / this.roundTotal.length).toFixed(1))
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
    this.calcBtnDisabled = false;
  }

  resetAllRounds() {
    this.roundForm.reset()
    // re-binding the formGroup will re-set the form array and the number of formControls back to it's default of 3
    this.roundForm = this.fb.group({
      roundInputs: this.fb.array([ this.buildRoundForm(), this.buildRoundForm(), this.buildRoundForm() ])
    })
    this.handicapIndex = 0;
  }

}