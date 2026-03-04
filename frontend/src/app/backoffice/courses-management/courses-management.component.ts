import { Component } from '@angular/core';
import { PLACEHOLDERS } from '../../core/utils/placeholder.util';

export interface Course {
  id: number;
  title: string;
  image: string;
}

@Component({
  selector: 'app-courses-management',
  templateUrl: './courses-management.component.html',
  styleUrls: ['./courses-management.component.css']
})
export class CoursesManagementComponent {
  courses: Course[] = [
    { id: 1, title: 'Introduction to Angular', image: PLACEHOLDERS.course300x200('Angular') },
    { id: 2, title: 'Advanced CSS Techniques', image: PLACEHOLDERS.course300x200('CSS') },
    { id: 3, title: 'JavaScript Fundamentals', image: PLACEHOLDERS.course300x200('JavaScript') },
    { id: 4, title: 'React Development', image: PLACEHOLDERS.course300x200('React') },
    { id: 5, title: 'Node.js Backend', image: PLACEHOLDERS.course300x200('Node.js') },
    { id: 6, title: 'Python for Data Science', image: PLACEHOLDERS.course300x200('Python') }
  ];

  editCourse(course: Course): void {
    console.log('Edit course:', course);
  }

  deleteCourse(course: Course): void {
    console.log('Delete course:', course);
  }

  addCourse(): void {
    console.log('Add new course');
  }
}
