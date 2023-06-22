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
  testMin: number;

  get roundInputs(): FormArray{
    return <FormArray>this.roundForm.get('roundInputs')
  }

  constructor(
    private fb: FormBuilder,
    private cdf: ChangeDetectorRef) {
  }

  ngOnInit(): void {

    this.roundForm = this.fb.group({
      roundInputs: this.fb.array([ this.buildRoundForm(), this.buildRoundForm(), this.buildRoundForm() ])
    })
  };

  buildRoundForm() : FormGroup {
    const roundFormGroup = this.fb.group({
      userRoundScore: [null, [Validators.required, this.roundInputValidation(this.eighteenHoleRoundMin)]],
      courseRating: [67.5, [Validators.required]],
      slopeRating: [117, [Validators.required]],
      roundSelection: ['18']
    });

    // console.log('round selection value: ', roundFormGroup.controls.roundSelection.value)
    let priorRoundSelection = roundFormGroup.controls.roundSelection.value;
  
    roundFormGroup.valueChanges.subscribe(value => {
      // console.log('round selection value: ', roundFormGroup.controls.roundSelection.value)
      // console.log('prior round selected was: ', priorRoundSelection)
      if (roundFormGroup.controls.roundSelection.value !== priorRoundSelection) {
        console.log('current round selected: ', roundFormGroup.controls.roundSelection.value)
        // console.log('change in round selection')
        priorRoundSelection = roundFormGroup.controls.roundSelection.value
        console.log(typeof priorRoundSelection)

        console.log(Number(priorRoundSelection))
        console.log(typeof Number(priorRoundSelection))


        // console.log(roundFormGroup.controls.userRoundScore)
        // this.testMin = Number(priorRoundSelection)
        roundFormGroup.controls.userRoundScore.setValidators(this.roundInputValidation(Number(priorRoundSelection)))
        roundFormGroup.updateValueAndValidity()
      } else {
        console.log('something else changed but current round selected: ', roundFormGroup.controls.roundSelection.value)
      }
      console.log('--------------------')


      // console.log(roundFormGroup.controls.roundSelection)
      // console.log(roundFormGroup.controls.userRoundScore)
      // console.log(value)
      if (this.calcBtnDisabled && value) {
        this.calcBtnDisabled = false;
      }
    });
    
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
      if (control.status === 'VALID') {
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
      this.testMin = score
      // this.cdf.detectChanges();
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