import { Component } from '@angular/core';

@Component({
  selector: 'app-info-box',
  imports: [],
  templateUrl: './info-box.html',
  styleUrl: './info-box.scss',
  standalone: true,
})
export class InfoBox {
  isExpanded = false;

  toggleScroll() {
    this.isExpanded = !this.isExpanded;
  }
}
