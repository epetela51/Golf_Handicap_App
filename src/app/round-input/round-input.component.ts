import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormArray, ValidatorFn } from "@angular/forms";
import { map } from 'rxjs';
// import { Round } from '../data/user-handicap-modal';

@Component({
  selector: 'app-round-input',
  templateUrl: './round-input.component.html',
  styleUrls: ['./round-input.component.css']
})
export class RoundInputComponent implements OnInit {

  // defines form model. Template will bind to this root form model
  roundForm: FormGroup;
  roundTotal: number[] = [];
  handicapIndex:  number = 0;
  calcBtnDisabled: boolean = false;
  recalcHandicapMsg: String = 'Handicap needs to be re-calculated'
  roundInputsArrayIndex: number = 3; // starts at 3 because the first 3 formGroups are positions 0 - 2

  get roundInputsArray(): FormArray{
    return <FormArray>this.roundForm.get('roundInputsArray')
  }

  constructor(
    private fb: FormBuilder) {
  }

  ngOnInit(): void {

    this.roundForm = this.fb.group({
      roundInputsArray: this.fb.array([ this.buildRoundForm(0), this.buildRoundForm(1), this.buildRoundForm(2) ])
    })
  };

  buildRoundForm(index: number) : FormGroup {
    const roundFormGroup = this.fb.group({
      userRoundScore: [
        {
          value: null, disabled: true
        },
        {
        updateOn: 'change'
      }],
      courseRating: [67.5, [Validators.required]],
      slopeRating: [117, [Validators.required]],
      roundSelectionGroup: this.fb.group({
        roundSelection: [null, [Validators.required]],
      })
    });

    roundFormGroup.controls.roundSelectionGroup.controls.roundSelection.valueChanges.subscribe(value => {
      this.handleUserRoundScoreOnRoundSelectionChange(value, index);
    });
  
    roundFormGroup.valueChanges.subscribe(control => {
      if(control && control.userRoundScore !== null && this.calcBtnDisabled) {
        this.calcBtnDisabled = false;
       }
      this.calcScoreDifferential();
    });
  
    return roundFormGroup;
  }

  // used to dynamically set validation for user round input based on radio button selection
  handleUserRoundScoreOnRoundSelectionChange(roundSelected: number | null, index: number) {
    const userRoundScoreFormControl = this.roundInputsArray.controls[index].get('userRoundScore')

    // on radio btn change, clear out the value for user round score
    userRoundScoreFormControl?.setValue(null)

    if (this.calcBtnDisabled === false) {
      this.calcBtnDisabled = true
    }

    let roundSelectionValue: number = 0;
    if (roundSelected != null) {
      roundSelectionValue = roundSelected
    }

    userRoundScoreFormControl?.enable();
    userRoundScoreFormControl?.setValidators([
      Validators.required,
      Validators.min(roundSelectionValue),
      this.roundInputValidation(roundSelectionValue)
    ]);
    
    // onlySelf is an optional parameter which only runs updateValueAndValidity for this specific control
    // since we are only setting validators for userRoundScore we only need to update validation runs for this control
    userRoundScoreFormControl?.updateValueAndValidity({ onlySelf: true });
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
      this.roundInputsArray.push(this.buildRoundForm(this.roundInputsArrayIndex))
      this.roundInputsArrayIndex++;
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
    this.roundInputsArrayIndex--;
  }

  resetAllRounds() {
    this.roundForm.reset()
    // re-binding the formGroup will re-set the form array and the number of formControls back to it's default of 3
    this.roundForm = this.fb.group({
      roundInputsArray: this.fb.array([ this.buildRoundForm(0), this.buildRoundForm(1), this.buildRoundForm(2) ])
    })
    this.handicapIndex = 0;
    this.roundInputsArrayIndex = 3;
  }

}