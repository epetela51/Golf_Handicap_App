import { AbstractControl, FormArray, ValidatorFn } from '@angular/forms';

/**
 * Determines the total number of true 18-hole rounds played.
 * @param totalHolesPlayedArray - Array of holes played per round.
 * @returns Total number of 18-hole rounds.
 */
export function determineTrue18HoleRounds(
  totalHolesPlayedArray: number[]
): number {
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
 * Creates a custom validator for round input validation.
 * @param score - Minimum score required.
 * @returns Validator function.
 */
export function roundInputValidation(score: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    if ((control.touched || control.dirty) && control.value < score) {
      return { invalidForm: true };
    }
    return null;
  };
}

/**
 * Calculates the combined 9-hole differentials into 18-hole equivalents.
 * @param nineHoleDifferentialArray - Array of 9-hole differentials.
 * @returns An array of combined 18-hole differentials.
 */
export function calculateCombinedDifferentials(
  nineHoleDifferentialArray: number[]
): number[] {
  const filteredDiffArray = nineHoleDifferentialArray.filter(
    (value) => value !== undefined
  );

  const combined9HoleDifferentials: number[] = [];

  // Iterate through the filtered array in pairs of two
  for (let i = 0; i < filteredDiffArray.length; i += 2) {
    if (filteredDiffArray[i + 1] !== undefined) {
      // Sum the current pair of 9-hole differentials
      const summedDifferential =
        Math.round((filteredDiffArray[i] + filteredDiffArray[i + 1]) * 100) /
        100;
      const combinedDifferential = summedDifferential / 2;
      combined9HoleDifferentials.push(combinedDifferential);
    }
  }

  return combined9HoleDifferentials;
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
export function calculateRoundDifferential(
  roundInputsArray: FormArray,
  formGroupIndex: number
): number {
  const controlSelected = roundInputsArray.controls[formGroupIndex];

  const roundScoreInputValue = controlSelected.get('userRoundScore')?.value;
  const courseRatingValue = controlSelected.get('courseRating')?.value;
  const slopeRatingValue = controlSelected.get('slopeRating')?.value;

  const roundDifferential =
    Math.round(
      (113 / slopeRatingValue) * (roundScoreInputValue - courseRatingValue) * 10
    ) / 10;

  return roundDifferential;
}

export function calculateHandicap(
  eighteenHoleDifferentialArray: number[],
  nineHoleTotalDifferentialArray: number[]
): number {
  // combined the 9 and 18 hole differentials into one array and have it be sorted so the lowest values are first
  let combinedDifferentialArray = eighteenHoleDifferentialArray
    .filter((value) => value !== undefined)
    .concat(
      nineHoleTotalDifferentialArray.filter((value) => value !== undefined)
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
