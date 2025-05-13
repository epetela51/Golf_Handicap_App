import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { roundInputValidation } from '../round-input/utils/round-utils';

@Injectable({
  providedIn: 'root',
})
export class RoundFormService {
  constructor(private fb: FormBuilder) {}

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

  initializeRoundForm(): FormGroup {
    return this.fb.group({
      roundInputsArray: this.fb.array([
        this.buildRoundForm(0),
        this.buildRoundForm(1),
        this.buildRoundForm(2),
      ]),
    });
  }

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

  resetForm(): FormGroup {
    return this.initializeRoundForm();
  }
}
