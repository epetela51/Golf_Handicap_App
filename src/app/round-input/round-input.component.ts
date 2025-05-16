import { Component, OnInit } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';
import { RoundFormService } from '../services/round-form.service';
import { HandicapCalculationService } from '../services/handicap-calculation.service';
import { RoundValidationService } from '../services/round-validation.service';
import { RoundValidationResult } from '../models/round.interface';

/**
 * Component responsible for handling round input and handicap calculation.
 * Manages the form for entering golf rounds and calculates the handicap index.
 */
@Component({
  selector: 'app-round-input',
  templateUrl: './round-input.component.html',
  styleUrls: ['./round-input.component.css'],
})
export class RoundInputComponent implements OnInit {
  roundForm: FormGroup;
  roundScoreDifferentialArray: number[] = [0, 0, 0];
  nineHoleDifferentialArray: number[] = [];
  nineHoleTotalDifferentialArray: number[] = [];
  eighteenHoleDifferentialArray: number[] = [];
  totalHolesPlayedArray: number[] = [];
  handicapIndex: number = 0;
  calcBtnEnabled: boolean = false;
  recalcHandicapMsg: String = 'Handicap needs to be re-calculated';
  roundInputsArrayIndex: number = 3;
  totalRoundsPlayed: number = 0;
  totalHolesPlayed: number = 0;
  maxHolesAllowed: number = 360;
  maxHolesExceeded: boolean = false;

  get roundInputsArray(): FormArray {
    return <FormArray>this.roundForm.get('roundInputsArray');
  }

  constructor(
    private roundFormService: RoundFormService,
    private handicapCalculationService: HandicapCalculationService,
    private roundValidationService: RoundValidationService
  ) {}

  ngOnInit(): void {
    this.roundForm = this.roundFormService.initializeRoundForm();
    for (let i = 0; i < 3; i++) {
      this.setupFormGroupSubscriptions(
        this.roundInputsArray.at(i) as FormGroup,
        i
      );
    }
  }

  setupFormGroupSubscriptions(
    formGroup: FormGroup,
    formGroupIndex: number
  ): void {
    const roundSelectionGroup = formGroup.get(
      'roundSelectionGroup'
    ) as FormGroup;
    const roundSelection = roundSelectionGroup.get('roundSelection');

    roundSelection?.valueChanges.subscribe((value: number | null) => {
      let roundSelectionValue: number = value ?? 0;

      if (this.handicapIndex !== 0) {
        this.handicapIndex = 0;
      }

      if (this.maxHolesExceeded) {
        this.maxHolesExceeded = false;
      }

      const validationResult =
        this.roundValidationService.checkIfMaxTotalRoundsAreMet(
          roundSelectionValue,
          formGroupIndex,
          this.roundInputsArray,
          this.totalHolesPlayed,
          this.maxHolesAllowed,
          this.totalHolesPlayedArray
        );

      this.updateValidationState(validationResult);

      const { shouldEnableCalcBtn } =
        this.roundFormService.handleRoundSelectionChange(
          roundSelectionValue,
          formGroupIndex,
          this.roundInputsArray,
          this.calcBtnEnabled
        );

      if (shouldEnableCalcBtn) {
        this.calcBtnEnabled = true;
      }
    });

    formGroup.valueChanges.subscribe((control) => {
      if (control && control.userRoundScore !== null && this.calcBtnEnabled) {
        this.calcBtnEnabled = false;
      }
      this.calcScoreDifferential(formGroupIndex);
    });
  }

  buildRoundForm(formGroupIndex: number): FormGroup {
    const roundFormGroup = this.roundFormService.buildRoundForm(formGroupIndex);
    this.setupFormGroupSubscriptions(roundFormGroup, formGroupIndex);
    return roundFormGroup;
  }

  private updateValidationState(validationResult: RoundValidationResult): void {
    this.maxHolesExceeded = validationResult.maxHolesExceeded;
    this.totalHolesPlayed = validationResult.totalHolesPlayed;
    this.totalRoundsPlayed = validationResult.totalRoundsPlayed;
    this.totalHolesPlayedArray = validationResult.totalHolesPlayedArray;
  }

  /**
   * Calculates the score differential for a specific round.
   * Updates the differential arrays based on whether it's a 9 or 18 hole round.
   * @param formGroupIndex - Index of the form group being calculated
   */
  calcScoreDifferential(formGroupIndex: number): void {
    const controlSelected = this.roundInputsArray.controls[formGroupIndex];
    const roundSelected = controlSelected
      .get('roundSelectionGroup')
      ?.get('roundSelection')?.value;

    const { roundDifferential, isNineHole } =
      this.handicapCalculationService.calculateScoreDifferential(
        this.roundInputsArray,
        formGroupIndex,
        roundSelected
      );

    if (isNineHole) {
      this.nineHoleTotalDifferentialArray =
        this.handicapCalculationService.calculateCombined9HoleDifferentials(
          formGroupIndex,
          roundDifferential,
          this.nineHoleDifferentialArray
        );
    } else {
      this.eighteenHoleDifferentialArray[formGroupIndex] = roundDifferential;
    }

    this.roundScoreDifferentialArray[formGroupIndex] = roundDifferential;
  }

  calculateHandicapBtnClick(): void {
    this.calcBtnEnabled = true;
    this.handicapIndex = this.handicapCalculationService.calculateFinalHandicap(
      this.nineHoleTotalDifferentialArray,
      this.eighteenHoleDifferentialArray,
      this.totalRoundsPlayed
    );
  }

  /**
   * Adds a new round input form group if the maximum holes limit hasn't been reached.
   * Updates the form array and related tracking arrays.
   */
  addRound(): void {
    if (
      this.roundValidationService.validateTotalHoles(
        this.totalHolesPlayed,
        this.maxHolesAllowed
      )
    ) {
      const newFormGroup = this.buildRoundForm(this.roundInputsArrayIndex);
      this.roundInputsArray.push(newFormGroup);
      this.roundInputsArrayIndex++;
      this.roundScoreDifferentialArray.push(0);
    } else {
      alert(`Maximum of ${this.maxHolesAllowed} holes allowed`);
    }
  }

  removeRound(): void {
    const lastSelectedRound =
      this.roundInputsArray.value[this.roundInputsArrayIndex - 1]
        .roundSelectionGroup.roundSelection;

    if (this.roundValidationService.validateRoundCount(this.roundInputsArray)) {
      this.roundInputsArray.removeAt(-1);
      this.roundScoreDifferentialArray.pop();

      if (lastSelectedRound === 9) {
        this.nineHoleDifferentialArray.pop();
      } else {
        this.eighteenHoleDifferentialArray.pop();
      }

      this.calcBtnEnabled = false;
      const lastRoundInArray =
        this.totalHolesPlayedArray[this.totalHolesPlayedArray.length - 1];
      this.totalHolesPlayed -= lastRoundInArray;
      this.totalHolesPlayedArray.pop();
      this.roundInputsArrayIndex--;

      // Recalculate total rounds played after removing a round
      this.totalRoundsPlayed =
        this.handicapCalculationService.determineTrue18HoleRounds(
          this.totalHolesPlayedArray
        );
    } else {
      alert('Minimum of 3 rounds are required');
    }
  }

  /**
   * Resets all rounds and form data to their initial state.
   * Clears all differential arrays and resets the form to three empty inputs.
   */
  resetAllRounds(): void {
    this.roundForm = this.roundFormService.resetForm();
    for (let i = 0; i < 3; i++) {
      this.setupFormGroupSubscriptions(
        this.roundInputsArray.at(i) as FormGroup,
        i
      );
    }
    this.handicapIndex = 0;
    this.roundInputsArrayIndex = 3;
    this.maxHolesExceeded = false;
    this.totalHolesPlayedArray = [0];
    this.nineHoleDifferentialArray = [];
    this.eighteenHoleDifferentialArray = [];
  }
}
