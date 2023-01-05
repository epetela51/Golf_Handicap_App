import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-round-input',
  templateUrl: './round-input.component.html',
  styleUrls: ['./round-input.component.css']
})
export class RoundInputComponent implements OnInit {

  constructor() { 
  }

  ngOnInit(): void {
  };

  addRowOnBtnClick() {
    alert('Add a row on click')
  }

  deleteRowOnBtnClick() {
    alert('Delete a row on click');
  }

  calculateHandicapBtnClick() {
    alert('Calculate Handicap on click')
  }
}