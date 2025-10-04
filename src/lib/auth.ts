export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'employee';
  companyId: number;
  managerId?: number;
  isManagerApprover: boolean;
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

export function setUser(user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('user');
}

export function isAuthenticated(): boolean {
  return getUser() !== null;
}

export function hasRole(role: string): boolean {
  const user = getUser();
  return user?.role === role;
}

export function canAccessRoute(route: string): boolean {
  const user = getUser();
  if (!user) return false;

  if (route.startsWith('/admin/')) {
    return user.role === 'admin';
  }
  
  if (route.startsWith('/manager/')) {
    return user.role === 'manager' || user.role === 'admin';
  }
  
  if (route.startsWith('/employee/')) {
    return ['employee', 'manager', 'admin'].includes(user.role);
  }

  return true;
}