import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormArray, ValidatorFn, ValidationErrors } from "@angular/forms";
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
  eighteenHoleRoundMin: number = 18;
  nineHoleRoundMin: number = 9;
  handicapIndex:  number = 0;
  calcBtnDisabled: boolean = false;
  recalcHandicapMsg: String = 'Handicap needs to be re-calculated'

  get roundInputs(): FormArray{
    return <FormArray>this.roundForm.get('roundInputs')
  }

  constructor(private fb: FormBuilder) {
  }

  ngOnInit(): void {

    this.roundForm = this.fb.group({
      roundInputs: this.fb.array([ this.buildRoundForm(), this.buildRoundForm(), this.buildRoundForm() ])
    })
  };

  buildRoundForm() : FormGroup {
    const roundFormGroup = this.fb.group({
      eighteenHoleScore: [null, [Validators.required, Validators.min(this.eighteenHoleRoundMin), this.roundInputValidation(this.eighteenHoleRoundMin)]],
      nineHoleScore: [null, [Validators.required, Validators.min(this.nineHoleRoundMin), this.roundInputValidation(this.nineHoleRoundMin)]]
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

  roundInputValidation(score: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if ((control.touched || control.dirty) && control.value < score) {
        return { 'invalidForm': true };
      }
      return null;
  }}

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