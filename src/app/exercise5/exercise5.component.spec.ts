import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Exercise5Component } from './exercise5.component';

describe('Exercise5Component', () => {
  let component: Exercise5Component;
  let fixture: ComponentFixture<Exercise5Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [Exercise5Component]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Exercise5Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
