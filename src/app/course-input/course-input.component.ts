import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-course-input',
    templateUrl: './course-input.component.html',
    styleUrls: ['./course-input.component.css'],
    standalone: false
})
export class CourseInputComponent implements OnInit {

  tableHeaders: string [] = [
    'Handicap Index',
    'Course Rating',
    'Slope Rating',
    'Par'
  ]

  constructor() { }

  ngOnInit(): void {
  }

}
