import { UserRole } from '@app/common';

/** Development/testing seed data interface - never use in production */
export interface SeedEmployee {
  email: string;
  password: string;
  role: UserRole;
  fullName: string;
  phone?: string;
  department?: string;
  position?: string;
  joinedAt?: Date;
  isActive?: boolean;
}

/** Development/testing password only - never use in production */
const DEFAULT_SEED_PASSWORD = 'Test@123!';

export const SEED_EMPLOYEES: SeedEmployee[] = [
  {
    email: 'hrd.admin@dexahub.com',
    password: DEFAULT_SEED_PASSWORD,
    role: UserRole.HRD_ADMIN,
    fullName: 'Fullname HRD Admin',
    phone: '+62-812-345-6789',
    department: 'Human Resources',
    position: 'HR Manager',
    joinedAt: new Date('2025-01-15'),
    isActive: true,
  },
  {
    email: 'employee.one@dexahub.com',
    password: DEFAULT_SEED_PASSWORD,
    role: UserRole.EMPLOYEE,
    fullName: 'Fullname Employee One',
    phone: '+62-812-345-6790',
    department: 'Engineering',
    position: 'Software Engineer',
    joinedAt: new Date('2025-02-01'),
    isActive: true,
  },
  {
    email: 'employee.two@dexahub.com',
    password: DEFAULT_SEED_PASSWORD,
    role: UserRole.EMPLOYEE,
    fullName: 'Fullname Employee Two',
    phone: '+62-812-345-6791',
    department: 'Engineering',
    position: 'DevOps Engineer',
    joinedAt: new Date('2025-02-15'),
    isActive: true,
  },
  {
    email: 'employee.three@dexahub.com',
    password: DEFAULT_SEED_PASSWORD,
    role: UserRole.EMPLOYEE,
    fullName: 'Fullname Employee Three',
    phone: '+62-812-345-6792',
    department: 'Sales',
    position: 'Sales Executive',
    joinedAt: new Date('2025-03-01'),
    isActive: true,
  },
];
