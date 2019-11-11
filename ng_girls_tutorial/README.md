# Tutorial 
https://ng-girls.gitbook.io/todo-list-tutorial/

# History
Started on 11th November during ngGirls event

### Introduction
We'll need a browser to see the result, NodeJS to run scripts on our computer, and NPM to easily fetch libraries from the web. With NPM we'll install the Angular CLI, which will run a script with NodeJS to create a starter project for us, and use NPM to fetch the libraries we'll need for the project (such as Angular)

Скачала WebStorm

Установила Node по инструкциям из https://github.com/nodesource/distributions/blob/master/README.md#debinstall
```
$node -v
v13.1.0 

$npm -v
6.12.1
```

Установила Angular CLI

Запуск сервера `ng serve -o`


### Angular kicks in

Объяснение структуры приложения: https://ng-girls.gitbook.io/todo-list-tutorial/workshop-todo-list/angular-kicks-in

IOT using Angular: https://medium.com/@urish/building-simon-with-angular2-iot-fceb78bb18e5#.430qu216w


### Component
```
A component is a software object, meant to interact with other components, encapsulating certain functionality or a set of functionalities. A component has a clearly defined interface and conforms to a prescribed behaviour common to all components within an architecture.
```

A component has template (html), style (css) and controller (js). It can also have other elements like directives, pipes and services

The double curly braces and their content are called [Interpolation](https://angular.io/guide/glossary#interpolation). It makes it really simple to insert dynamic data into the view.

Command for inline templates by default:
```ng config schematics.@schematics/angular.component.inlineTemplate true```


`.spec.ts` файлы предназначены для тестирования компонентов


### Class
Has members: properties and methods.

Property binding docs: https://angular.io/guide/template-syntax#property-binding-property

### Events

Events binding docs: https://angular.io/guide/template-syntax#event-binding-event

Template reference variables docs: https://angular.io/guide/template-syntax#template-reference-variables--var-

### The TODO list

Now you have to tell the browser to display those items. For this, you will use the Angular built-in directive, `*ngFor`. It works like an enhanced loop in Java. The `*` notation causes Angular to use the current element as a template when rendering the list.

**Directives** are pieces of logic (written as classes) that can be attached to elements and components. They are used to change the display or the behavior of the element. Angular comes with some built-in directives.
* `ngFor`
* `ngIf`
