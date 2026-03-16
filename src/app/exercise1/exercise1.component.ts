import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-exercise1',
    templateUrl: './exercise1.component.html',
    styleUrls: ['./exercise1.component.css'],
    imports: [RouterLink, ReactiveFormsModule]
})
export class Exercise1Component implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
