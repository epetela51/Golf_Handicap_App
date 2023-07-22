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
  /*
  remove the below eighteenHoleRoundMin variable in the future since on page load userRoundScore is disabled
  and selecting a radio button will enable the round and also pass in the correct min
  */
  eighteenHoleRoundMin: number = 18;
  handicapIndex:  number = 0;
  calcBtnDisabled: boolean = false;
  recalcHandicapMsg: String = 'Handicap needs to be re-calculated'

  get roundInputsArray(): FormArray{
    return <FormArray>this.roundForm.get('roundInputsArray')
  }

  constructor(
    private fb: FormBuilder) {
  }

  ngOnInit(): void {

    this.roundForm = this.fb.group({
      roundInputsArray: this.fb.array([ this.buildRoundForm(), this.buildRoundForm(), this.buildRoundForm() ])
    })
  };

  buildRoundForm() : FormGroup {
    const roundFormGroup = this.fb.group({
      userRoundScore: [
        {
          value: null, disabled: true
        },
        {
        validators: [Validators.required, this.roundInputValidation(this.eighteenHoleRoundMin)],
        updateOn: 'change'
      }],
      courseRating: [67.5, [Validators.required]],
      slopeRating: [117, [Validators.required]],
      roundSelection: [null, [Validators.required]]
    });

    // used to dynamically set validation for user round input based on radio button selection
    roundFormGroup.controls.roundSelection.valueChanges.subscribe(value => {
      // on radio btn change clear out the values for round score
      roundFormGroup.controls.userRoundScore.setValue(null)

      if (this.calcBtnDisabled === false) {
        this.calcBtnDisabled = true
      }

      if (value === 9 || value === 18) {
        roundFormGroup.controls.userRoundScore.enable();
        roundFormGroup.controls.userRoundScore.setValidators([
          Validators.required,
          Validators.min(value),
          this.roundInputValidation(value)
        ]);
      }
    
      // onlySelf is an optional parameter which only runs updateValueAndValidity for this specific control
      // since we are only setting validators for userRoundScore we only need to update validation runs for this control
      roundFormGroup.controls.userRoundScore.updateValueAndValidity({ onlySelf: true });
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

    let roundScoreInput;
    let courseRating;
    let slopeRating;
    let total;

    this.roundInputsArray.controls.forEach((control) => {
      if (control.status === 'VALID' && control.get('userRoundScore')?.value !== null) {
        roundScoreInput = control.get('userRoundScore')?.value
        courseRating = control.get('courseRating')?.value
        slopeRating = control.get('slopeRating')?.value
        // grab only up to the first decimal
        // Math.round requires you to take the number and multiply it by 10 and then take that number and divide by 10 to get 1 decimal
        total = Math.round(((113 / slopeRating) * (roundScoreInput - courseRating)) * 10) / 10
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

  // dynamically sets the minimum value for user input based on round selection
  getMinScore(roundSelectionValue: number): number {
    return roundSelectionValue === 9 ? 9 : 18;
  }  

  addRound() {
    if (this.roundInputsArray.length < 20) {
      this.roundInputsArray.push(this.buildRoundForm())
      this.roundTotal.push(0)
    } else {
      alert('Maximum of 20 rounds allowed');
    }

  }

  removeRound() {
    if (this.roundInputsArray.length > 3) {
      this.roundInputsArray.removeAt(-1)
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
      roundInputsArray: this.fb.array([ this.buildRoundForm(), this.buildRoundForm(), this.buildRoundForm() ])
    })
    this.handicapIndex = 0;
  }

}