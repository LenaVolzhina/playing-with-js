import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-input-button-unit',
  template: `
      <p>
          input-button-unit works!
          The title is: {{ title }}
      </p>

      <!--<input value="Hello World! (constant)">-->
      <!-- dynamic -->
      <!--<input [value]="generateTitle()"-->
      <input [value]="title"
             (keyup)="changeTitle('up!')"
             (keyup.enter)="changeTitle('wow, you pressed enter!')"
             (keydown)="changeTitle($event.target.value)"
             (keyup.e)="logEvent($event)"
      >

      <button (click)="changeTitle('Button Clicked!')">
          Save
      </button>

      By the way, {{generateTitle()}}
  `,
  styleUrls: ['./input-button-unit.component.css']
})
export class InputButtonUnitComponent implements OnInit {
  title = 'Hello World';

  generateTitle(): string {
    const rand = Math.floor(Math.random() * 6) + 1;
    return 'Random dice: ' + rand;
  }

  changeTitle(newTitle: string) {
    console.log('new title: ', newTitle);
    this.title = newTitle;
  }

  logEvent(event) {
    console.log(event);
    // has .key, .keyCode, .ctrlKey, .shiftKey
  }

  constructor() { }

  ngOnInit() {
    setTimeout(() => {
      // NB: recalculates every part of the view!
      this.title = 'Delayed title';
    }, 1000);
  }
}
