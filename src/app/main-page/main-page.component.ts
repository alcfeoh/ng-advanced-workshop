import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.css'],
    imports: [RouterLink]
})
export class MainPageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
