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

// improve this into one array???
  rows: string[] = [
    'number',
    'number',
    'number',
  ]

  constructor() { 
  }

  ngOnInit(): void {
  };

  addRowOnBtnClick() {
    
    if (this.rows.length <= 19) {
      this.rows.push('number')
    } else {
      // alert being used as a placeholder
      // replace with disabling the button?? Event Binding to do this??
      alert('Can\'t have more than 20 total rounds')
    }
  }

}
