import { AbstractControl, ValidatorFn } from '@angular/forms';

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
