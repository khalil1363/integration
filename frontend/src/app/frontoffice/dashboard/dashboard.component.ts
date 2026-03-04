import { Component } from '@angular/core';
import { PLACEHOLDERS } from '../../core/utils/placeholder.util';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  getCourseImage(text: string): string {
    return PLACEHOLDERS.course300x150(text);
  }
}
