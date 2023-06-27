import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormArray, ValidatorFn } from "@angular/forms";
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
  eighteenHoleRoundMin: number = 18;
  handicapIndex:  number = 0;
  calcBtnDisabled: boolean = false;
  recalcHandicapMsg: String = 'Handicap needs to be re-calculated'

  get roundInputs(): FormArray{
    return <FormArray>this.roundForm.get('roundInputs')
  }

  constructor(
    private fb: FormBuilder) {
  }

  ngOnInit(): void {

    this.roundForm = this.fb.group({
      roundInputs: this.fb.array([ this.buildRoundForm(), this.buildRoundForm(), this.buildRoundForm() ])
    })
  };

  buildRoundForm() : FormGroup {
    const roundFormGroup = this.fb.group({
      userRoundScore: [null, [Validators.required, Validators.min(18), this.roundInputValidation(this.eighteenHoleRoundMin)]],
      courseRating: [67.5, [Validators.required]],
      slopeRating: [117, [Validators.required]],
      roundSelection: ['18']
    });

    // used to dynamically set validation for user round input based on radio button selection
    roundFormGroup.controls.roundSelection.valueChanges.subscribe(value => {
      // on radio btn change clear out the values and errors so validation message is reset
      roundFormGroup.controls.userRoundScore.setValue(null)
      roundFormGroup.controls.userRoundScore.setErrors(null)
      if (this.calcBtnDisabled === false) {
        this.calcBtnDisabled = true
      }
      if (value === '9') {
        roundFormGroup.controls.userRoundScore.setValidators([Validators.min(9), this.roundInputValidation(Number(value))])
      } else {
        roundFormGroup.controls.userRoundScore.setValidators([Validators.min(18), this.roundInputValidation(Number(value))])
        Validators.min(18)
      }
      roundFormGroup.updateValueAndValidity()
    })
  
    // enable calculate handicap btn if user calculates handicap and then makes a changes.  After initial calculation btn is disabled until a value is changed
    roundFormGroup.valueChanges.subscribe(value => {
      if(value && value.userRoundScore !== null && this.calcBtnDisabled) {
          this.calcBtnDisabled = false;
      }
    });
    
    // calculate score differential whenever status changes
    roundFormGroup.statusChanges.subscribe(status => {
      this.calcScoreDifferential();
    });
  
    return roundFormGroup;
  }

  calcScoreDifferential() {
    // reset the array holding the sums otherwise the array can double when doing a calc, adding a round and then doing another clac
    this.roundTotal = [];

    let eighteeenHoleScore;
    let courseRating;
    let slopeRating;
    let total;

    this.roundInputs.controls.forEach((control) => {
      if (control.status === 'VALID' && control.get('userRoundScore')?.value !== null) {
        eighteeenHoleScore = control.get('userRoundScore')?.value
        courseRating = control.get('courseRating')?.value
        slopeRating = control.get('slopeRating')?.value
        // grab only up to the first decimal
        // Math.round requires you to take the number and multiply it by 10 and then take that number and divide by 10 to get 1 decimal
        total = Math.round(((113 / slopeRating) * (eighteeenHoleScore - courseRating)) * 10) / 10
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
    this.handicapIndex = Number(((tempSum / this.roundTotal.length) * 0.96).toFixed(1))
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