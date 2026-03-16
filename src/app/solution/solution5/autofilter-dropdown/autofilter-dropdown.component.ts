import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {combineLatest, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {DropdownOption} from '../types';
import { AsyncPipe } from '@angular/common';
import { HighlightPipe } from '../../solution3/highlight.pipe';

@Component({
    selector: 'app-autofilter-dropdown',
    templateUrl: './autofilter-dropdown.component.html',
    styleUrls: ['./autofilter-dropdown.component.css'],
    imports: [ReactiveFormsModule, AsyncPipe, HighlightPipe]
})
export class AutofilterDropdownComponent<T extends DropdownOption> implements OnInit {

  @Input()
  entries$: Observable<T[]>;

  @Input()
  placeholder: string;

  @Input()
  set selection(entry: T) {
    if (entry) {
      this.entryControl.setValue(entry.description);
    } else {
      this.entryControl.setValue('');
    }
  }

  @Output()
  selectionChange = new EventEmitter<T>();

  filteredEntries$: Observable<T[]>;
  entryControl = new FormControl<string>('');

  ngOnInit() {
    this.filteredEntries$ = combineLatest([this.entryControl.valueChanges, this.entries$]).pipe(
      map(([userInput, entries]) => entries.filter(c => c.description.toLowerCase().indexOf(userInput.toLowerCase()) !== -1))
    );
  }

  newSelection(entry: T) {
    this.entryControl.setValue(entry.description);
    this.selectionChange.emit(entry);
  }
}
