import { Component, OnInit } from '@angular/core';
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
  handicapIndex:  number = 0;
  calcBtnEnabled: boolean = false;
  recalcHandicapMsg: String = 'Handicap needs to be re-calculated'
  roundInputsArrayIndex: number = 3; // starts at 3 because the first 3 formGroups are positions 0 - 2
  totalHolesPlayedArray: number [] = [];
  totalHolesPlayed: number = 0;
  maxHolesAllowed: number = 360;
  maxHolesExceeded: boolean = false;

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
        { value: null, disabled: true },
        { updateOn: 'change' }
      ],
      courseRating: [67.5, [Validators.required]],
      slopeRating: [117, [Validators.required]],
      roundSelectionGroup: this.fb.group({
        roundSelection: [null, [Validators.required]],
      })
    });

    // fires on change of radio button
    roundFormGroup.controls.roundSelectionGroup.controls.roundSelection.valueChanges.subscribe(value => {
      // this is used to bypass issue that roundSelected COULD be null
      let roundSelectionValue: number = 0;
      if (value != null) {
        roundSelectionValue = value
      }
      // reset handicap value if round selection changes
      if (this.handicapIndex !== 0) {
        this.handicapIndex = 0;
      }
      // reset boolean for message if user changes radio button
      if (this.maxHolesExceeded == true) {
        this.maxHolesExceeded = false
      }
      this.checkIfMaxTotalRoundsAreMet(roundSelectionValue, index)
    });

    /*
      Enable calculate handicap btn if user calculates handicap and then makes a changes.  After initial calculation btn is disabled until a value is changed
      Have the score differential calculated whenever the formGroup value change fires
    */
    roundFormGroup.valueChanges.subscribe(control => {
      if (control && control.userRoundScore !== null && this.calcBtnEnabled) {
        this.calcBtnEnabled = false;
       }
      this.calcScoreDifferential();
    });
  
    return roundFormGroup;
  }

  checkIfMaxTotalRoundsAreMet(roundSelected: number, index: number) {
    const difference = this.maxHolesAllowed - this.totalHolesPlayed
    const userRoundScoreFormControl = this.roundInputsArray.controls[index].get('userRoundScore')

    if (difference  <= 9) {
      if (roundSelected == 18) {
        console.log('You can ONLY enter in a 9 hole round.  STOP THEM FROM SELECTING 18 HOLE VALUE')
        this.maxHolesExceeded = true;
        // below is used in event user selects 18 and the user round score is disabled, they hit 9 and enables the user round score
        // and then hits 18 again and the user round score is STILL enabled
        userRoundScoreFormControl?.setValue(null)
        userRoundScoreFormControl?.disable()
        // alert(`Your total holes played is ${this.totalHolesPlayed} so you can only enter a 9 hole round`)
      } else {
        this.handleRoundSelectionChange(roundSelected, index)
      }
    } else {
      this.handleRoundSelectionChange(roundSelected, index)
    }

    // set the round selected value from radio button into the array at the specific position
    this.totalHolesPlayedArray[index] = roundSelected;

    // reset back to 0 on each radio btn click otherwise totalHolesPlayed will hold onto a value and incorreectly add to current loop of round values 
    this.totalHolesPlayed = 0;
    this.totalHolesPlayedArray.forEach(round => {
      this.totalHolesPlayed += round;
    })
  }

  // used to dynamically set validation for user round input based on radio button selection
  handleRoundSelectionChange(roundSelected: number, index: number) {
    const userRoundScoreFormControl = this.roundInputsArray.controls[index].get('userRoundScore')

    // on radio btn change, clear out the value for user round score
    userRoundScoreFormControl?.setValue(null)

    if (this.calcBtnEnabled === false) {
      this.calcBtnEnabled = true
    }

    userRoundScoreFormControl?.enable();
    userRoundScoreFormControl?.setValidators([
      Validators.required,
      Validators.min(roundSelected),
      this.roundInputValidation(roundSelected)
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
    this.calcBtnEnabled = true;

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
    // tweak below because it won't be based off number of rounds but number of holes played
    if (this.totalHolesPlayed < this.maxHolesAllowed) {
      this.roundInputsArray.push(this.buildRoundForm(this.roundInputsArrayIndex))
      this.roundInputsArrayIndex++;
      this.roundTotal.push(0)
    } else {
      alert(`Maximum of ${this.maxHolesAllowed} holes allowed`);
    }
  }

  removeRound() {
    if (this.roundInputsArray.length > 3) {
      this.roundInputsArray.removeAt(-1)
      this.roundTotal.pop()
    } else {
      alert('Minimum of 3 rounds are required');
    }
    this.calcBtnEnabled = false;
    const lastRoundInArray = this.totalHolesPlayedArray[this.totalHolesPlayedArray.length - 1]
    this.totalHolesPlayed -= lastRoundInArray;
    this.totalHolesPlayedArray.pop()
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
    this.maxHolesExceeded = false;
  }

}