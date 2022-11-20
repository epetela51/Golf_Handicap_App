import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-round-input',
  templateUrl: './round-input.component.html',
  styleUrls: ['./round-input.component.css']
})
export class RoundInputComponent implements OnInit {

  tableHeaders: string [] = [
    'Round Number',
    '18 Hole Score',
    '9 Hole Score',
    'Course Rating',
    'Slope Rating',
    'Score Differential'
  ]

  // used to loop through and generate rows & columns of the table with input type of number
  columnsAndRows: string[] = [
    'number',
    'number',
    'number',
    'number',
    'number'
  ]

  constructor() { 

  }

  ngOnInit(): void {
  }

  

}
