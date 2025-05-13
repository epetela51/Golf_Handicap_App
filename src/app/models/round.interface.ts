export interface RoundForm {
  userRoundScore: number | null;
  courseRating: number;
  slopeRating: number;
  roundSelectionGroup: {
    roundSelection: number | null;
  };
}

export interface RoundFormGroup {
  roundInputsArray: RoundForm[];
}

export interface RoundDifferential {
  roundDifferential: number;
  isNineHole: boolean;
}

export interface RoundValidationResult {
  maxHolesExceeded: boolean;
  totalHolesPlayed: number;
  totalRoundsPlayed: number;
  totalHolesPlayedArray: number[];
}
