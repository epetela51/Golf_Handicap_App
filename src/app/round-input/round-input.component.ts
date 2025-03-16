import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
  FormArray,
  ValidatorFn,
} from '@angular/forms';
// import { Round } from '../data/user-handicap-modal';

@Component({
  selector: 'app-round-input',
  templateUrl: './round-input.component.html',
  styleUrls: ['./round-input.component.css'],
})
export class RoundInputComponent implements OnInit {
  // defines form model. Template will bind to this root form model
  roundForm: FormGroup;
  roundScoreDifferentialArray: number[] = [0, 0, 0];
  handicapIndex: number = 0;
  calcBtnEnabled: boolean = false;
  recalcHandicapMsg: String = 'Handicap needs to be re-calculated';
  roundInputsArrayIndex: number = 3; // starts at 3 because the first 3 formGroups are positions 0 - 2
  totalHolesPlayedArray: number[] = [];
  totalRoundsPlayed: number = 0;
  totalHolesPlayed: number = 0;
  maxHolesAllowed: number = 360;
  maxHolesExceeded: boolean = false;

  get roundInputsArray(): FormArray {
    return <FormArray>this.roundForm.get('roundInputsArray');
  }

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.roundForm = this.fb.group({
      roundInputsArray: this.fb.array([
        this.buildRoundForm(0),
        this.buildRoundForm(1),
        this.buildRoundForm(2),
      ]),
    });
  }

  buildRoundForm(index: number): FormGroup {
    const roundFormGroup = this.fb.group({
      userRoundScore: [{ value: null, disabled: true }, { updateOn: 'blur' }],
      courseRating: [
        67.5,
        { validators: [Validators.required], updateOn: 'blur' },
      ],
      slopeRating: [
        117,
        { validators: [Validators.required], updateOn: 'blur' },
      ],
      roundSelectionGroup: this.fb.group({
        roundSelection: [null, [Validators.required]],
      }),
    });

    // fires on change of radio button
    roundFormGroup.controls.roundSelectionGroup.controls.roundSelection.valueChanges.subscribe(
      (value) => {
        // this is used to bypass issue that roundSelected COULD be null
        let roundSelectionValue: number = 0;
        if (value != null) {
          roundSelectionValue = value;
        }
        // reset handicap value if round selection changes
        if (this.handicapIndex !== 0) {
          this.handicapIndex = 0;
        }
        // reset boolean for message if user changes radio button
        if (this.maxHolesExceeded == true) {
          this.maxHolesExceeded = false;
        }
        this.checkIfMaxTotalRoundsAreMet(roundSelectionValue, index);
      }
    );

    /*
      Enable calculate handicap btn if user calculates handicap and then makes a changes.  After initial calculation btn is disabled until a value is changed
      Have the score differential calculated whenever the formGroup value change fires
    */
    roundFormGroup.valueChanges.subscribe((control) => {
      if (control && control.userRoundScore !== null && this.calcBtnEnabled) {
        this.calcBtnEnabled = false;
      }
      this.calcScoreDifferential();
    });

    return roundFormGroup;
  }

  checkIfMaxTotalRoundsAreMet(roundSelected: number, index: number) {
    const difference = this.maxHolesAllowed - this.totalHolesPlayed;
    const userRoundScoreFormControl =
      this.roundInputsArray.controls[index].get('userRoundScore');

    if (difference <= 9) {
      if (roundSelected == 18) {
        console.log(
          'You can ONLY enter in a 9 hole round.  STOP THEM FROM SELECTING 18 HOLE VALUE'
        );
        this.maxHolesExceeded = true;
        // below is used in event user selects 18 and the user round score is disabled, they hit 9 and enables the user round score
        // and then hits 18 again and the user round score is STILL enabled
        userRoundScoreFormControl?.setValue(null, { emitEvent: false });
        userRoundScoreFormControl?.disable();
        // alert(`Your total holes played is ${this.totalHolesPlayed} so you can only enter a 9 hole round`)
      } else {
        this.handleRoundSelectionChange(roundSelected, index);
      }
    } else {
      this.handleRoundSelectionChange(roundSelected, index);
    }

    // set the round selected value from radio button into the array at the specific position
    this.totalHolesPlayedArray[index] = roundSelected;

    // reset back to 0 on each radio btn click otherwise totalHolesPlayed will hold onto a value and incorreectly add to current loop of round values
    this.totalHolesPlayed = 0;
    this.totalHolesPlayedArray.forEach((round) => {
      this.totalHolesPlayed += round;
    });
    // call below function to determine how many true 'rounds' of golf were played (i.e. how many rounds of 18 holes total)
    this.totalRoundsPlayed = this.determineTrue18HoleRounds();
  }

  // used to dynamically set validation for user round input based on radio button selection
  handleRoundSelectionChange(roundSelected: number, index: number) {
    const userRoundScoreFormControl =
      this.roundInputsArray.controls[index].get('userRoundScore');

    // on radio btn change, clear out the value for user round score
    userRoundScoreFormControl?.setValue(null, { emitEvent: false }); // emitEvent: false ==> to prevent formGroup observable from firing

    if (this.calcBtnEnabled === false) {
      this.calcBtnEnabled = true;
    }

    userRoundScoreFormControl?.enable({ emitEvent: false });
    userRoundScoreFormControl?.setValidators([
      Validators.required,
      Validators.min(roundSelected),
      this.roundInputValidation(roundSelected),
    ]);

    // onlySelf is an optional parameter which only runs updateValueAndValidity for this specific control
    // since we are only setting validators for userRoundScore we only need to update validation runs for this control
    userRoundScoreFormControl?.updateValueAndValidity({ onlySelf: true });
  }

  roundInputValidation(score: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if ((control.touched || control.dirty) && control.value < score) {
        return { invalidForm: true };
      }
      return null;
    };
  }

  calcScoreDifferential() {
    // reset the array holding the round score differentials otherwise the array can double when doing a calc, adding a round and then doing another clac
    this.roundScoreDifferentialArray = [];

    let roundScoreInput;
    let courseRating;
    let slopeRating;
    let differential;

    this.roundInputsArray.controls.forEach((control) => {
      if (
        control.status === 'VALID' &&
        control.get('userRoundScore')?.value !== null
      ) {
        roundScoreInput = control.get('userRoundScore')?.value;
        courseRating = control.get('courseRating')?.value;
        slopeRating = control.get('slopeRating')?.value;
        // grab only up to the first decimal
        // Math.round requires you to take the number and multiply it by 10 and then take that number and divide by 10 to get 1 decimal
        differential =
          Math.round(
            (113 / slopeRating) * (roundScoreInput - courseRating) * 10
          ) / 10;
        this.roundScoreDifferentialArray.push(differential);
      } else {
        differential = 0;
        this.roundScoreDifferentialArray.push(differential);
      }
    });
  }

  determineTrue18HoleRounds() {
    let countOf18 = 0;
    let countPairsOf9 = 0;

    countOf18 = this.totalHolesPlayedArray.filter((num) => num === 18).length;

    this.totalHolesPlayedArray.forEach((number) => {
      if (number === 9) {
        countPairsOf9++;
      }
    });

    // only count it if there is a pair of 9s.  i.e. 2 rounds of 9 counts as 1 | 3 rounds of 9 counts as 1 | 4 rounds of 9 count as 2
    countPairsOf9 = Math.floor(countPairsOf9 / 2);
    let totalTrueRounds = countOf18 + countPairsOf9;
    return totalTrueRounds;
  }

  calculateHandicapBtnClick() {
    console.log('total rounds played: ', this.totalRoundsPlayed);
    console.log('Score Differential Array: ', this.roundScoreDifferentialArray);
    this.calcBtnEnabled = true;

    // create a switch(?) statement that takes the total rounds played and if it falls within a certain range calculate handicap
    // this will be based on score differentials so either lowest 1 or average of a certain number based on total true rounds played

    // example of current state: enter a round of 9 then 3 rounds of 18.  Handicap is calculated based off all these rounds but
    // should only be based off the 3 rounds of 18.  However it's taking that lone round of 9 into consideration

    // the below will need to be adjusted as the handicap index is just taking the total number of rounds (regardless of if it's a 'true' round) and SHOULD be going off the total of the 'true' number of rounds

    let totalScoreDifferential = 0;
    this.roundScoreDifferentialArray.forEach((sum) => {
      totalScoreDifferential += sum;
      console.log('totalScoreDifferential: ', totalScoreDifferential);
    });
    // toFixed makes it a string so need to convert it back to a number using Number()
    this.handicapIndex = Number(
      (
        (totalScoreDifferential / this.roundScoreDifferentialArray.length) *
        0.96
      ).toFixed(1)
    );
  }

  addRound() {
    // tweak below because it won't be based off number of rounds but number of holes played
    if (this.totalHolesPlayed < this.maxHolesAllowed) {
      this.roundInputsArray.push(
        this.buildRoundForm(this.roundInputsArrayIndex)
      );
      this.roundInputsArrayIndex++;
      this.roundScoreDifferentialArray.push(0);
    } else {
      alert(`Maximum of ${this.maxHolesAllowed} holes allowed`);
    }
  }

  removeRound() {
    if (this.roundInputsArray.length > 3) {
      this.roundInputsArray.removeAt(-1);
      this.roundScoreDifferentialArray.pop();
    } else {
      alert('Minimum of 3 rounds are required');
    }
    this.calcBtnEnabled = false;
    const lastRoundInArray =
      this.totalHolesPlayedArray[this.totalHolesPlayedArray.length - 1];
    this.totalHolesPlayed -= lastRoundInArray;
    this.totalHolesPlayedArray.pop();
    this.roundInputsArrayIndex--;
  }

  resetAllRounds() {
    this.roundForm.reset();
    // re-binding the formGroup will re-set the form array and the number of formControls back to it's default of 3
    this.roundForm = this.fb.group({
      roundInputsArray: this.fb.array([
        this.buildRoundForm(0),
        this.buildRoundForm(1),
        this.buildRoundForm(2),
      ]),
    });
    this.handicapIndex = 0;
    this.roundInputsArrayIndex = 3;
    this.maxHolesExceeded = false;
    this.totalHolesPlayedArray = [0];
  }
}
