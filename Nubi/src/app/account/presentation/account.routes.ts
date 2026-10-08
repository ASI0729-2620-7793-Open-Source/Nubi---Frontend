import { Routes } from '@angular/router';
import { AccountRole } from '../domain/model/account.enums';
import { adminGuard, caregiverGuard, roleGuard, teacherGuard } from '../infrastructure/role.guard';

/**
 * Routes of the Account bounded context, protected by role (rule 1).
 * The role comes from the session (AuthStore) through guards.
 */
export const accountRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./views/caregiver-account/caregiver-account').then((m) => m.CaregiverAccount),
    canActivate: [caregiverGuard],
    title: 'account.caregiver.title',
  },
  {
    path: 'institution',
    loadComponent: () =>
      import('./views/admin-account/admin-account').then((m) => m.AdminAccount),
    canActivate: [adminGuard],
    title: 'account.admin.title',
  },
  {
    path: 'students',
    loadComponent: () =>
      import('./views/teacher-account/teacher-account').then((m) => m.TeacherAccount),
    canActivate: [teacherGuard],
    title: 'account.teacher.title',
  },
  {
    path: 'access-denied',
    loadComponent: () =>
      import('./views/access-denied/access-denied').then((m) => m.AccessDenied),
    canActivate: [
      roleGuard([AccountRole.CAREGIVER, AccountRole.TEACHER, AccountRole.INSTITUTION_ADMIN]),
    ],
    title: 'account.denied.title',
  },
];
