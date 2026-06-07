export interface SeedEmployee {
  email: string;
  password: string;
  role: 'employee' | 'hrd_admin';
  fullName: string;
  phone?: string;
  department?: string;
  position?: string;
  joinedAt?: Date;
}

export const SEED_EMPLOYEES: SeedEmployee[] = [
  {
    email: 'alice.johnson@dexahub.com',
    password: 'Test@123!',
    role: 'hrd_admin',
    fullName: 'Alice Johnson',
    phone: '+62-812-345-6789',
    department: 'Human Resources',
    position: 'HR Manager',
    joinedAt: new Date('2025-01-15'),
  },
  {
    email: 'bob.smith@dexahub.com',
    password: 'Test@123!',
    role: 'employee',
    fullName: 'Bob Smith',
    phone: '+62-812-345-6790',
    department: 'Engineering',
    position: 'Software Engineer',
    joinedAt: new Date('2025-02-01'),
  },
  {
    email: 'carol.chen@dexahub.com',
    password: 'Test@123!',
    role: 'employee',
    fullName: 'Carol Chen',
    phone: '+62-812-345-6791',
    department: 'Engineering',
    position: 'DevOps Engineer',
    joinedAt: new Date('2025-02-15'),
  },
  {
    email: 'david.lee@dexahub.com',
    password: 'Test@123!',
    role: 'employee',
    fullName: 'David Lee',
    phone: '+62-812-345-6792',
    department: 'Sales',
    position: 'Sales Executive',
    joinedAt: new Date('2025-03-01'),
  },
];
