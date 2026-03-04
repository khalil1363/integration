import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MenuItem } from '../../shared/sidebar/sidebar.component';
import { AuthService } from '../../services/auth.service';
import { CurrentUserService } from '../../core/services/current-user.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit, OnDestroy {
  isSidebarCollapsed = false;
  username = 'User';
  userAvatar = '';
  private destroy$ = new Subject<void>();

  frontofficeMenuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', routerLink: '/frontoffice/dashboard' },
    { id: 'evaluations', label: 'Evaluations', icon: 'assignment', routerLink: '/frontoffice/evaluations' },
    { id: 'certificate', label: 'My Certificate', icon: 'workspace_premium', routerLink: '/frontoffice/certificate' },
    { id: 'profile', label: 'Profile', icon: 'person', routerLink: '/frontoffice/profile' },
    { id: 'courses', label: 'Courses', icon: 'school', routerLink: '/frontoffice/courses' },
    { id: 'chat', label: 'Chat', icon: 'chat', routerLink: '/frontoffice/chat' },
    { id: 'settings', label: 'Settings', icon: 'settings', routerLink: '/frontoffice/settings' },
    { id: 'help', label: 'Help', icon: 'help', routerLink: '/frontoffice/help' }
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private currentUserService: CurrentUserService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      if (!user) {
        this.router.navigate(['/auth/signin']);
        return;
      }
      this.username = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || 'User';
      this.userAvatar = this.toAvatarUrl(user.photoBase64);
      this.currentUserService.setUserId(user.id);
    });
    const u = this.authService.getCurrentUser();
    if (u) {
      this.username = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || 'User';
      this.userAvatar = this.toAvatarUrl(u.photoBase64);
      this.currentUserService.setUserId(u.id);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private toAvatarUrl(photoBase64?: string): string {
    if (!photoBase64 || !photoBase64.trim()) return '';
    if (photoBase64.startsWith('http://') || photoBase64.startsWith('https://')) return photoBase64;
    return `data:image/jpeg;base64,${photoBase64}`;
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  onMenuItemClick(item: MenuItem) {
    this.router.navigate([item.routerLink]);
  }

  onLogout() {
    this.authService.signout();
    this.router.navigate(['/auth/signin']);
  }

  onProfile() {
    this.router.navigate(['/frontoffice/profile']);
  }

  onSettings() {
    this.router.navigate(['/frontoffice/settings']);
  }
}
