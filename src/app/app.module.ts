import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RoundInputComponent } from './round-input/round-input.component';
import { CourseInputComponent } from './course-input/course-input.component';
import { RoundFormService } from './services/round-form.service';
import { HandicapCalculationService } from './services/handicap-calculation.service';
import { RoundValidationService } from './services/round-validation.service';

@NgModule({
  declarations: [AppComponent, RoundInputComponent, CourseInputComponent],
  imports: [BrowserModule, AppRoutingModule, FormsModule, ReactiveFormsModule],
  providers: [
    RoundFormService,
    HandicapCalculationService,
    RoundValidationService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
