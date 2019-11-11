import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-input-button-unit',
  template: `
    <p>
      input-button-unit works!
        The title is: <i>{{ title }}</i>
    </p>
  `,
  styleUrls: ['./input-button-unit.component.css']
})
export class InputButtonUnitComponent implements OnInit {
  title = 'Hello World!';

  changeTitle(newTitle: string) {
    console.log('Changing title from ' + this.title + ' to ' + newTitle);
    this.title = newTitle;
  }

  constructor() {
    console.log('in constructor')
    const rand = Math.floor(Math.random() * 6) + 1;
    this.title += ' Random dice: ' + rand;
  }

  ngOnInit() {
    console.log('in ngOnInit')
    this.title += ' (hello from ngOnInit)';
  }

}
