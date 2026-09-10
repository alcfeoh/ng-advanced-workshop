# NgAdvancedWorkshop

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Concepts

Here are the Angular concepts covered during this workshop:
- #### Exercise 1 
  + Signal Forms: <code>signal(...)</code> model, <code>form()</code> from <code>@angular/forms/signals</code>, <code>[formField]</code> on the country dropdown, and FieldTree values (e.g. <code>countryForm.countryId().value()</code>)
  + <code>async</code> pipe and the no-subscription pattern
  + Template microsyntax variables for structural directives
  + Template reference variables (hashtag syntax)
  + <code>tap</code> operator from RxJs
  
- #### Exercise 2
  + Signal Forms for the country and state dropdowns: <code>signal(...)</code> model, <code>form()</code> from <code>@angular/forms/signals</code>, <code>[formField]</code>, and FieldTree values
  + <code>httpResource</code> for countries (template reads resource signals, no <code>async</code> pipe)
  + Country → states with an <code>httpResource</code> whose URL/params depend on the country FieldTree value
  + <code>inject()</code> instead of constructor DI
  + <code>ng-container</code> as an empty DOM wrapper for content to show/hide
  
- #### Exercise 3
  + Signal Forms for the country filter: <code>signal(...)</code> model, <code>form()</code> from <code>@angular/forms/signals</code>, <code>[formField]</code> on the text input
  + Bridge Signal Forms → RxJS with <code>toObservable</code> so <code>withLatestFrom</code> can combine the filter with the countries stream
  + Creating a custom pipe to format data
  + <code>withLatestFrom</code> operator from RxJs
  + How to combine multiple Observable streams into one
  + Using <code>innerHTML</code> to render dynamically generated HTML code
  + <code>inject()</code> instead of constructor DI
  
- #### Exercise 4 
  + <code>switchMap</code> operator from RxJs
  + <code>combineLatest</code> operator from RxJs
  + Using RxJs <code>Subject</code> to create action streams
  + How to combine dynamic Observable streams that evolve over time
  
- #### Exercise 5
    + Refactoring HTML templates and TypeScript code into reusable components
    + Creating custom 2-way bindings with the <code>[()]</code> syntax
    + Using <code>Input</code> and <code>Output</code> for component communication
    
- #### Exercise 6
    + Creating custom directives
    + Using custom CSS selectors with a directive
    + Using <code>HostBinding</code> and <code>HostListener</code>
    
- #### Exercise 7
    + Multi-slot content projection
    + Creating a highly reusable and customizable component


   
        

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
