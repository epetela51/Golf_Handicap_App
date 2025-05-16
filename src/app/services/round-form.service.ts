import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { roundInputValidation } from '../round-input/utils/form-validators';

/**
 * Service responsible for managing the round input form structure and validation.
 * Handles form creation, initialization, and round selection changes.
 */
@Injectable({
  providedIn: 'root',
})
export class RoundFormService {
  constructor(private fb: FormBuilder) {}

  /**
   * Builds a form group for a single round input.
   * @param formGroupIndex - Index of the form group being created
   * @returns FormGroup containing controls for round score, course rating, slope rating, and round selection
   */
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

    return roundFormGroup;
  }

  /**
   * Initializes the main round form with three default round input groups.
   * @returns FormGroup containing the main form structure
   */
  initializeRoundForm(): FormGroup {
    return this.fb.group({
      roundInputsArray: this.fb.array([
        this.buildRoundForm(0),
        this.buildRoundForm(1),
        this.buildRoundForm(2),
      ]),
    });
  }

  /**
   * Handles changes in round selection (9 or 18 holes) and updates form validation accordingly.
   * @param roundSelected - Number of holes selected (9 or 18)
   * @param formGroupIndex - Index of the form group being modified
   * @param roundInputsArray - FormArray containing all round inputs
   * @param calcBtnEnabled - Current state of the calculate button
   * @returns Object indicating whether the calculate button should be enabled
   */
  handleRoundSelectionChange(
    roundSelected: number,
    formGroupIndex: number,
    roundInputsArray: FormArray,
    calcBtnEnabled: boolean
  ): { shouldEnableCalcBtn: boolean } {
    const userRoundScoreFormControl =
      roundInputsArray.controls[formGroupIndex].get('userRoundScore');
    const userRoundSelectionFormControl = roundInputsArray.controls[
      formGroupIndex
    ]
      .get('roundSelectionGroup')
      ?.get('roundSelection');

    const previousValue = userRoundSelectionFormControl?.value;

    if (previousValue === roundSelected) {
      userRoundScoreFormControl?.reset(null, { emitEvent: false });
    }

    userRoundScoreFormControl?.setValue(null, { emitEvent: false });
    const shouldEnableCalcBtn = !calcBtnEnabled;

    userRoundScoreFormControl?.enable({ emitEvent: false });
    userRoundScoreFormControl?.setValidators([
      Validators.required,
      Validators.min(roundSelected),
      roundInputValidation(roundSelected),
    ]);

    userRoundScoreFormControl?.updateValueAndValidity({ onlySelf: true });

    return { shouldEnableCalcBtn };
  }

  /**
   * Resets the form to its initial state with three empty round inputs.
   * @returns Newly initialized form group
   */
  resetForm(): FormGroup {
    return this.initializeRoundForm();
  }
}
