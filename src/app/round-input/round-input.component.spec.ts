import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoundInputComponent } from './round-input.component';

describe('RoundInputComponent', () => {
  let component: RoundInputComponent;
  let fixture: ComponentFixture<RoundInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoundInputComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoundInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
