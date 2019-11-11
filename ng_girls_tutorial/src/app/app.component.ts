import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  // templateUrl: './app.component.html',
  template: `
      <h1>
          Welcome to {{ title }}!
      </h1>

      <app-input-button-unit></app-input-button-unit>

      <ul>
          <li *ngFor="let todoItem of todoList">
              <app-todo-item [item]="todoItem"></app-todo-item>
          </li>
      </ul>

      <h1 *ngIf="userLoggedIn">Welcome!</h1>
      <h1 *ngIf="!userLoggedIn">You are not logged in!</h1>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'todo-list';
  todoList = [
    {title: 'install NodeJS'},
    {title: 'install Angular CLI'},
    {title: 'create new app'},
    {title: 'serve app'},
    {title: 'develop app'},
    {title: 'deploy app'},
  ];
}
