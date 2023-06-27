// export interface UserHandicapRounds {
//     userRoundScore: number;
//     nineHoleScore: number;
//     courseRating: number;
//     slopeRating: number;
//     scoreDifferential: number;
// }

export class Round {
    constructor(
        public userRoundScore = 0,
        public nineHoleScore = 0) { }
}