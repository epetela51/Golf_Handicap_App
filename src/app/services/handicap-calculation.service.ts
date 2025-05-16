import { Injectable } from '@angular/core';
import {
  FormArray,
  FormGroup,
  AbstractControl,
  ValidatorFn,
} from '@angular/forms';
import { RoundDifferential } from '../models/round.interface';

/**
 * Service responsible for calculating golf handicaps according to the World Handicap System (WHS).
 * Handles both 9-hole and 18-hole round calculations, differential computations, and final handicap index determination.
 */
@Injectable({
  providedIn: 'root',
})
export class HandicapCalculationService {
  /**
   * Determines the total number of true 18-hole rounds played.
   * @param totalHolesPlayedArray - Array of holes played per round.
   * @returns Total number of 18-hole rounds.
   */
  determineTrue18HoleRounds(totalHolesPlayedArray: number[]): number {
    let countOf18 = 0;
    let countPairsOf9 = 0;

    countOf18 = totalHolesPlayedArray.filter((num) => num === 18).length;

    totalHolesPlayedArray.forEach((number) => {
      if (number === 9) {
        countPairsOf9++;
      }
    });

    // only count it if there is a pair of 9s.  i.e. 2 rounds of 9 counts as 1 | 3 rounds of 9 counts as 1 | 4 rounds of 9 count as 2
    countPairsOf9 = Math.floor(countPairsOf9 / 2);
    let totalTrueRounds = countOf18 + countPairsOf9;
    return totalTrueRounds;
  }

  /**
   * Calculates the round differential for a given round of golf.
   *
   * The round differential is calculated using the formula:
   *
   * `(113 / slopeRating) * (roundScore - courseRating)`
   *
   * The result is rounded to one decimal place.
   *
   * @param roundInputsArray - The FormArray containing the round input form groups.
   * @param formGroupIndex - The index of the form group in the FormArray for which the differential is being calculated.
   * @returns The calculated round differential as a number.
   */
  private calculateRoundDifferential(
    roundInputsArray: FormArray,
    formGroupIndex: number
  ): number {
    const controlSelected = roundInputsArray.controls[formGroupIndex];

    const roundScoreInputValue = controlSelected.get('userRoundScore')?.value;
    const courseRatingValue = controlSelected.get('courseRating')?.value;
    const slopeRatingValue = controlSelected.get('slopeRating')?.value;

    const roundDifferential =
      Math.round(
        (113 / slopeRatingValue) *
          (roundScoreInputValue - courseRatingValue) *
          10
      ) / 10;

    return roundDifferential;
  }

  /**
   * Calculates the combined 9-hole differentials into 18-hole equivalents.
   * @param nineHoleDifferentialArray - Array of 9-hole differentials.
   * @returns An array of combined 18-hole differentials.
   */
  private calculateCombinedDifferentials(
    nineHoleDifferentialArray: number[]
  ): number[] {
    const filteredDiffArray = nineHoleDifferentialArray.filter(
      (value) => value !== undefined
    );
    const combined9HoleDifferentials: number[] = [];

    // Iterate through the filtered array in pairs of two
    if (filteredDiffArray.length > 1) {
      for (let i = 0; i < filteredDiffArray.length; i += 2) {
        if (filteredDiffArray[i + 1] !== undefined) {
          // Sum the current pair of 9-hole differentials
          const summedDifferential =
            Math.round(
              (filteredDiffArray[i] + filteredDiffArray[i + 1]) * 100
            ) / 100;
          combined9HoleDifferentials.push(summedDifferential);
        }
      }
    }
    return combined9HoleDifferentials;
  }

  /**
   * Calculates the handicap based on the differentials.
   * @param eighteenHoleDifferentialArray - Array of 18-hole differentials.
   * @param nineHoleTotalDifferentialArray - Array of 9-hole differentials.
   * @returns The calculated handicap.
   */
  private calculateHandicap(
    eighteenHoleDifferentialArray: number[],
    nineHoleTotalDifferentialArray: number[]
  ): number {
    // combined the 9 and 18 hole differentials into one array and have it be sorted so the lowest values are first
    let combinedDifferentialArray = eighteenHoleDifferentialArray
      .filter((value) => value !== undefined && value !== 0)
      .concat(
        nineHoleTotalDifferentialArray.filter(
          (value) => value !== undefined && value !== 0
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

    let handicapAverage =
      summedUpDifferentials / combinedDifferentialArray.length;

    return handicapAverage;
  }

  /**
   * Calculates the score differential for a given round.
   * @param roundInputsArray - FormArray containing the round input data
   * @param formGroupIndex - Index of the form group in the array
   * @param roundSelected - Number of holes played (9 or 18)
   * @returns Object containing the round differential and whether it's a 9-hole round
   */
  calculateScoreDifferential(
    roundInputsArray: FormArray,
    formGroupIndex: number,
    roundSelected: number
  ): RoundDifferential {
    const formGroup = roundInputsArray.controls[formGroupIndex] as FormGroup;
    const roundScoreInputValue = formGroup.get('userRoundScore')?.value;

    if (formGroup.status === 'VALID' && roundScoreInputValue !== null) {
      const roundDifferential = this.calculateRoundDifferential(
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

  /**
   * Calculates combined 9-hole differentials into 18-hole equivalents.
   * @param formGroupIndex - Index of the current form group
   * @param nineHoleDifferential - Differential for the current 9-hole round
   * @param nineHoleDifferentialArray - Array of all 9-hole differentials
   * @returns Array of combined 18-hole differentials
   */
  calculateCombined9HoleDifferentials(
    formGroupIndex: number,
    nineHoleDifferential: number,
    nineHoleDifferentialArray: number[]
  ): number[] {
    nineHoleDifferentialArray[formGroupIndex] = nineHoleDifferential;
    return this.calculateCombinedDifferentials(nineHoleDifferentialArray);
  }

  /**
   * Returns the adjustment value based on the number of total rounds played (18-hole rounds), according to the chart.
   * @param totalRounds - The number of differentials in the scoring record.
   * @returns The adjustment value.
   */
  getHandicapAdjustment(totalRounds: number): number {
    switch (totalRounds) {
      case 3:
        return -2.0;
      case 4:
        return -1.0;
      case 5:
        return 0;
      case 6:
        return -1.0;
      case 7:
      case 8:
      case 9:
      case 10:
      case 11:
      case 12:
      case 13:
      case 14:
      case 15:
      case 16:
      case 17:
      case 18:
      case 19:
      case 20:
        return 0;
      default:
        return 0;
    }
  }

  /**
   * Calculates the final handicap index based on the provided differentials and total rounds played.
   * @param nineHoleTotalDifferentialArray - Array of 9-hole differentials
   * @param eighteenHoleDifferentialArray - Array of 18-hole differentials
   * @param totalRoundsPlayed - Total number of rounds played
   * @returns The final handicap index rounded to one decimal place
   */
  calculateFinalHandicap(
    nineHoleTotalDifferentialArray: number[],
    eighteenHoleDifferentialArray: number[],
    totalRoundsPlayed: number
  ): number {
    const handicapAverage = this.calculateHandicap(
      eighteenHoleDifferentialArray,
      nineHoleTotalDifferentialArray
    );

    // Use totalRoundsPlayed as the number of differentials for adjustment
    const adjustment = this.getHandicapAdjustment(totalRoundsPlayed);

    // Remove the 0.96 multiplier and just use the adjustment
    return Math.round((handicapAverage + adjustment) * 10) / 10;
  }
}
