/**
 * Model representing a golf round with scores.
 * Tracks both full round scores and 9-hole scores.
 */
export class Round {
  /**
   * Creates a new Round instance.
   * @param userRoundScore - The total score for the round (default: 0)
   * @param nineHoleScore - The score for a 9-hole round (default: 0)
   */
  constructor(public userRoundScore = 0, public nineHoleScore = 0) {}
}
