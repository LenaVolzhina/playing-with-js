import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  // templateUrl: './app.component.html',
  template: `
      <h1>
          Welcome to {{ title }}!
      </h1>

      <app-input-button-unit></app-input-button-unit>
      <app-input-button-unit></app-input-button-unit>
      <b><app-input-button-unit></app-input-button-unit></b>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'todo-list';
}
