import { Component } from '@angular/core';
import { PLACEHOLDERS } from '../../core/utils/placeholder.util';

export interface Course {
  id: number;
  title: string;
  image: string;
}

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent {
  courses: Course[] = [
    { id: 1, title: 'Introduction to Angular', image: PLACEHOLDERS.course300x200('Angular') },
    { id: 2, title: 'Advanced CSS Techniques', image: PLACEHOLDERS.course300x200('CSS') },
    { id: 3, title: 'JavaScript Fundamentals', image: PLACEHOLDERS.course300x200('JavaScript') },
    { id: 4, title: 'React Development', image: PLACEHOLDERS.course300x200('React') },
    { id: 5, title: 'Node.js Backend', image: PLACEHOLDERS.course300x200('Node.js') },
    { id: 6, title: 'Python for Data Science', image: PLACEHOLDERS.course300x200('Python') },
    { id: 7, title: 'Vue.js Complete Guide', image: PLACEHOLDERS.course300x200('Vue.js') },
    { id: 8, title: 'TypeScript Essentials', image: PLACEHOLDERS.course300x200('TypeScript') }
  ];

  viewDetails(course: Course): void {
    console.log('View course:', course);
  }
}
