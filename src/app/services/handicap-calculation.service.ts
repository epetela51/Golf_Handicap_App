import { Injectable } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import {
  calculateRoundDifferential,
  calculateCombinedDifferentials,
  calculateHandicap,
} from '../round-input/utils/round-utils';
import { RoundDifferential } from '../models/round.interface';

@Injectable({
  providedIn: 'root',
})
export class HandicapCalculationService {
  calculateScoreDifferential(
    roundInputsArray: FormArray,
    formGroupIndex: number,
    roundSelected: number
  ): RoundDifferential {
    const formGroup = roundInputsArray.controls[formGroupIndex] as FormGroup;
    const roundScoreInputValue = formGroup.get('userRoundScore')?.value;

    if (formGroup.status === 'VALID' && roundScoreInputValue !== null) {
      const roundDifferential = calculateRoundDifferential(
        roundInputsArray,
        formGroupIndex
      );
      return {
        roundDifferential,
        isNineHole: roundSelected === 9,
      };
    }

    return { roundDifferential: 0, isNineHole: false };
  }

  calculateCombined9HoleDifferentials(
    formGroupIndex: number,
    nineHoleDifferential: number,
    nineHoleDifferentialArray: number[]
  ): number[] {
    nineHoleDifferentialArray[formGroupIndex] = nineHoleDifferential;
    return calculateCombinedDifferentials(nineHoleDifferentialArray);
  }

  calculateFinalHandicap(
    nineHoleTotalDifferentialArray: number[],
    eighteenHoleDifferentialArray: number[],
    totalRoundsPlayed: number
  ): number {
    const handicapAverage = calculateHandicap(
      nineHoleTotalDifferentialArray,
      eighteenHoleDifferentialArray
    );

    if (totalRoundsPlayed >= 7) {
      return Math.round(handicapAverage * 0.96 * 10) / 10;
    }
    return Math.round(handicapAverage * 10) / 10;
  }
}
