import { AbstractControl, ValidatorFn } from '@angular/forms';

/**
 * Creates a custom validator for round input validation.
 * Ensures the score entered is not less than the minimum required score and not greater than 200.
 * @param score - Minimum score required for the round
 * @returns Validator function that returns an error object if validation fails
 */
export function roundInputValidation(score: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    if ((control.touched || control.dirty) && control.value < score) {
      return { invalidForm: true };
    }
    if ((control.touched || control.dirty) && control.value > 200) {
      return { maxScoreExceeded: true };
    }
    return null;
  };
}
