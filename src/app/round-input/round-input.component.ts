import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';

import {
  determineTrue18HoleRounds,
  roundInputValidation,
  calculateCombinedDifferentials,
  calculateRoundDifferential,
} from './utils/round-utils';
// import { Round } from '../data/user-handicap-modal';

@Component({
  selector: 'app-round-input',
  templateUrl: './round-input.component.html',
  styleUrls: ['./round-input.component.css'],
})
export class RoundInputComponent implements OnInit {
  roundForm: FormGroup; // defines form model. Template will bind to this root form model
  roundScoreDifferentialArray: number[] = [0, 0, 0]; // used to display the differential for each individual round that's entered
  nineHoleDifferentialArray: number[] = []; // holds all the 9 hole differentials
  nineHoleTotalDifferentialArray: number[] = []; // holds the total of the 9 hole differentials
  eighteenHoleDifferentialArray: number[] = []; // array holding only 18 hole differentials
  totalHolesPlayedArray: number[] = [];
  handicapIndex: number = 0;
  calcBtnEnabled: boolean = false;
  recalcHandicapMsg: String = 'Handicap needs to be re-calculated';
  roundInputsArrayIndex: number = 3; // starts at 3 because the first 3 formGroups are positions 0 - 2
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

  buildRoundForm(formGroupIndex: number): FormGroup {
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
        this.checkIfMaxTotalRoundsAreMet(roundSelectionValue, formGroupIndex);
        this.handleRoundSelectionChange(roundSelectionValue, formGroupIndex);
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
      this.calcScoreDifferential(formGroupIndex);
    });

    return roundFormGroup;
  }

  checkIfMaxTotalRoundsAreMet(roundSelected: number, formGroupIndex: number) {
    const difference = this.maxHolesAllowed - this.totalHolesPlayed;
    const userRoundScoreFormControl =
      this.roundInputsArray.controls[formGroupIndex].get('userRoundScore');

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
      }
    }

    // set the round selected value from radio button into the array at the specific position
    this.totalHolesPlayedArray[formGroupIndex] = roundSelected;

    // reset back to 0 on each radio btn click otherwise totalHolesPlayed will hold onto a value and incorreectly add to current loop of round values
    this.totalHolesPlayed = 0;
    this.totalHolesPlayedArray.forEach((round) => {
      this.totalHolesPlayed += round;
    });
    // call below function to determine how many true 'rounds' of golf were played (i.e. how many rounds of 18 holes total)
    this.totalRoundsPlayed = determineTrue18HoleRounds(
      this.totalHolesPlayedArray
    );
  }

  // used to dynamically set validation for user round input based on radio button selection
  handleRoundSelectionChange(roundSelected: number, formGroupIndex: number) {
    const userRoundScoreFormControl =
      this.roundInputsArray.controls[formGroupIndex].get('userRoundScore');
    const userRoundSelectionFormControl = this.roundInputsArray.controls[
      formGroupIndex
    ]
      .get('roundSelectionGroup')
      ?.get('roundSelection');

    // Store the previous value of the radio button selection
    const previousValue = userRoundSelectionFormControl?.value;

    // Check if the value has changed, if it has, reset the userRoundScore control so it's not 'touched' or 'dirty'
    if (previousValue === roundSelected) {
      userRoundScoreFormControl?.reset(null, { emitEvent: false });
    }

    // on radio btn change, clear out the value for user round score
    userRoundScoreFormControl?.setValue(null, { emitEvent: false }); // emitEvent: false ==> to prevent formGroup observable from firing

    if (this.calcBtnEnabled === false) {
      this.calcBtnEnabled = true;
    }

    userRoundScoreFormControl?.enable({ emitEvent: false });
    userRoundScoreFormControl?.setValidators([
      Validators.required,
      Validators.min(roundSelected),
      roundInputValidation(roundSelected),
    ]);

    // onlySelf is an optional parameter which only runs updateValueAndValidity for this specific control
    // since we are only setting validators for userRoundScore we only need to update validation runs for this control
    userRoundScoreFormControl?.updateValueAndValidity({ onlySelf: true });
  }

  calcScoreDifferential(formGroupIndex: number) {
    let controlSelected = this.roundInputsArray.controls[formGroupIndex];

    let roundScoreInputValue = controlSelected.get('userRoundScore')?.value;
    let roundSelected = controlSelected
      .get('roundSelectionGroup')
      ?.get('roundSelection')?.value;

    let roundDifferential;

    if (controlSelected.status === 'VALID' && roundScoreInputValue !== null) {
      roundDifferential = calculateRoundDifferential(
        this.roundInputsArray,
        formGroupIndex
      );

      if (roundSelected === 9) {
        this.calculateCombined9HoleDifferentials(
          formGroupIndex,
          roundDifferential
        );
      } else {
        this.eighteenHoleDifferentialArray[formGroupIndex] = roundDifferential;
      }
      // this is needed to push the individual 9 hole differential into the array to be displayed on the UI
      this.roundScoreDifferentialArray[formGroupIndex] = roundDifferential;
    } else {
      roundDifferential = 0;
      this.roundScoreDifferentialArray[formGroupIndex] = roundDifferential;
    }
  }

  /**
   * Used to calculate the total differential for 2 combined 9 hole rounds
   * This is needed for caluculating the final handicap index
   * @param formGroupIndex - index of the formGroup in the formArray.  Used when updated existing 9 hole differential to override the value in the array at the correct position
   * @param nineHoleDifferential - the individual 9 hole differential to be added to the array
   */
  calculateCombined9HoleDifferentials(
    formGroupIndex: number,
    nineHoleDifferential: number
  ) {
    this.nineHoleDifferentialArray[formGroupIndex] = nineHoleDifferential;

    // Use the helper function to calculate combined differentials
    this.nineHoleTotalDifferentialArray = calculateCombinedDifferentials(
      this.nineHoleDifferentialArray
    );
  }

  calculateHandicapBtnClick() {
    this.calcBtnEnabled = true;

    // combined the 9 and 18 hole differentials into one array and have it be sorted so the lowest values are first
    let combinedDifferentialArray = this.eighteenHoleDifferentialArray
      .filter((value) => value !== undefined)
      .concat(
        this.nineHoleTotalDifferentialArray.filter(
          (value) => value !== undefined
        )
      )
      .sort((a, b) => a - b);

    // based on the number of differentials, grab the lowest values
    switch (combinedDifferentialArray.length) {
      case 3:
      case 4:
      case 5:
        combinedDifferentialArray = combinedDifferentialArray.slice(0, 1);
        break;
      case 6:
      case 7:
      case 8:
        combinedDifferentialArray = combinedDifferentialArray.slice(0, 2);
        break;
      case 9:
      case 10:
      case 11:
        combinedDifferentialArray = combinedDifferentialArray.slice(0, 3);
        break;
      case 12:
      case 13:
      case 14:
        combinedDifferentialArray = combinedDifferentialArray.slice(0, 4);
        break;
      case 15:
      case 16:
        combinedDifferentialArray = combinedDifferentialArray.slice(0, 5);
        break;
      case 17:
      case 18:
        combinedDifferentialArray = combinedDifferentialArray.slice(0, 6);
        break;
      case 19:
        combinedDifferentialArray = combinedDifferentialArray.slice(0, 7);
        break;
      case 20:
        combinedDifferentialArray = combinedDifferentialArray.slice(0, 8);
        break;
      // no default
    }

    let summedUpDifferentials = combinedDifferentialArray.reduce(
      (total, currentValue) => total + currentValue,
      0
    );

    let average = summedUpDifferentials / combinedDifferentialArray.length;

    // Apply the 0.96 multiplier only if there are 7 or more ROUNDS
    if (this.totalRoundsPlayed >= 7) {
      this.handicapIndex = Math.round(average * 0.96 * 10) / 10;
    } else {
      this.handicapIndex = Math.round(average * 10) / 10;
    }
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
    const lastSelectedRound =
      this.roundInputsArray.value[this.roundInputsArrayIndex - 1]
        .roundSelectionGroup.roundSelection;

    if (this.roundInputsArray.length > 3) {
      this.roundInputsArray.removeAt(-1);
      this.roundScoreDifferentialArray.pop();
      if (lastSelectedRound === 9) {
        this.nineHoleDifferentialArray.pop();
      } else this.eighteenHoleDifferentialArray.pop();
    } else {
      return alert('Minimum of 3 rounds are required');
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
    this.nineHoleDifferentialArray = [];
    this.eighteenHoleDifferentialArray = [];
  }
}
