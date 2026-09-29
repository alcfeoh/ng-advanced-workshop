import { Component, computed, input, linkedSignal, model } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { DropdownOption } from '../types';
import { HighlightPipe } from '../../solution3/highlight.pipe';

@Component({
    selector: 'app-autofilter-dropdown',
    templateUrl: './autofilter-dropdown.component.html',
    styleUrls: ['./autofilter-dropdown.component.css'],
    imports: [FormField, HighlightPipe]
})
export class AutofilterDropdownComponent<T extends DropdownOption> {

  /** Option list. Parent passes a signal/resource value, not an Observable. */
  entries = input<T[]>([]);

  placeholder = input('');

  /**
   * Banana-in-a-box [(selection)]. model() is the [selection] input
   * and the (selectionChange) output.
   */
  selection = model<T | undefined>(undefined);

  // Form text follows the selection, but typing can still override it to filter.
  textModel = linkedSignal(() => ({
    text: this.selection()?.description ?? '',
  }));
  textForm = form(this.textModel);

  filteredEntries = computed(() => {
    const filter = this.textForm.text().value().toLowerCase();
    return this.entries().filter(
      entry => entry.description.toLowerCase().indexOf(filter) !== -1
    );
  });

  newSelection(entry: T) {
    this.selection.set(entry);
  }
}
