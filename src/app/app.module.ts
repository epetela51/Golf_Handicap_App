import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RoundInputComponent } from './round-input/round-input.component';
import { CourseInputComponent } from './course-input/course-input.component';

@NgModule({
  declarations: [
    AppComponent,
    RoundInputComponent,
    CourseInputComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
