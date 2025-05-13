import { Injectable } from '@angular/core';
import { FormArray, FormGroup, AbstractControl } from '@angular/forms';
import { determineTrue18HoleRounds } from '../round-input/utils/round-utils';
import { RoundForm } from '../models/round.interface';

@Injectable({
  providedIn: 'root',
})
export class RoundValidationService {
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
    const totalRoundsPlayed = determineTrue18HoleRounds(
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

  validateTotalHoles(
    totalHolesPlayed: number,
    maxHolesAllowed: number
  ): boolean {
    return totalHolesPlayed < maxHolesAllowed;
  }
}
