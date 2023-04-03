// export interface UserHandicapRounds {
//     eighteenHoleScore: number;
//     nineHoleScore: number;
//     courseRating: number;
//     slopeRating: number;
//     scoreDifferential: number;
// }

export class Round {
    constructor(
        public eighteenHoleScore = 0,
        public nineHoleScore = 0) { }
}