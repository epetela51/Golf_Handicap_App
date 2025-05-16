import { Injectable } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { HandicapCalculationService } from './handicap-calculation.service';

/**
 * Service responsible for validating round inputs and ensuring they meet the requirements
 * for handicap calculation according to the World Handicap System.
 */
@Injectable({
  providedIn: 'root',
})
export class RoundValidationService {
  constructor(private handicapCalculationService: HandicapCalculationService) {}

  /**
   * Checks if the maximum number of holes has been exceeded and updates the form accordingly.
   * @param roundSelected - Number of holes selected for the current round
   * @param formGroupIndex - Index of the form group being validated
   * @param roundInputsArray - FormArray containing all round inputs
   * @param totalHolesPlayed - Current total number of holes played
   * @param maxHolesAllowed - Maximum number of holes allowed
   * @param totalHolesPlayedArray - Array tracking holes played per round
   * @returns Object containing validation results and updated totals
   */
  checkIfMaxTotalRoundsAreMet(
    roundSelected: number,
    formGroupIndex: number,
    roundInputsArray: FormArray,
    totalHolesPlayed: number,
    maxHolesAllowed: number,
    totalHolesPlayedArray: number[]
  ): {
    maxHolesExceeded: boolean;
    totalHolesPlayed: number;
    totalRoundsPlayed: number;
    totalHolesPlayedArray: number[];
  } {
    const difference = maxHolesAllowed - totalHolesPlayed;
    const formGroup = roundInputsArray.controls[formGroupIndex] as FormGroup;
    const userRoundScoreFormControl = formGroup.get('userRoundScore');
    let maxHolesExceeded = false;

    if (difference <= 9 && roundSelected === 18) {
      maxHolesExceeded = true;
      userRoundScoreFormControl?.setValue(null, { emitEvent: false });
      userRoundScoreFormControl?.disable();
    }

    // Copy the array to avoid mutation
    const updatedTotalHolesPlayedArray = [...totalHolesPlayedArray];
    updatedTotalHolesPlayedArray[formGroupIndex] = roundSelected;

    const newTotalHolesPlayed = updatedTotalHolesPlayedArray.reduce(
      (sum, round) => sum + (round || 0),
      0
    );
    const totalRoundsPlayed =
      this.handicapCalculationService.determineTrue18HoleRounds(
        updatedTotalHolesPlayedArray
      );

    return {
      maxHolesExceeded,
      totalHolesPlayed: newTotalHolesPlayed,
      totalRoundsPlayed,
      totalHolesPlayedArray: updatedTotalHolesPlayedArray,
    };
  }

  validateRoundCount(roundInputsArray: FormArray): boolean {
    return roundInputsArray.length > 3;
  }

  /**
   * Validates if the total number of holes played is within the allowed limit.
   * @param totalHolesPlayed - Current total number of holes played
   * @param maxHolesAllowed - Maximum number of holes allowed
   * @returns Boolean indicating if the total is valid
   */
  validateTotalHoles(
    totalHolesPlayed: number,
    maxHolesAllowed: number
  ): boolean {
    return totalHolesPlayed < maxHolesAllowed;
  }

  /**
   * Calculates the total number of valid rounds played, considering both 9 and 18 hole rounds.
   * @param totalHolesPlayedArray - Array tracking holes played per round
   * @returns Number of valid rounds played
   */
  validateRounds(totalHolesPlayedArray: number[]): number {
    return this.handicapCalculationService.determineTrue18HoleRounds(
      totalHolesPlayedArray
    );
  }
}
