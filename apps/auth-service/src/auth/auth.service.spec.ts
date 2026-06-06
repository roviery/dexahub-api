import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));
// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt = require('bcrypt') as { compare: jest.Mock; hash: jest.Mock };
import { Employee } from '../entities/employee.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { UserRole } from '@app/common';

const mockEmployee: Employee = {
  id: 'uuid-1',
  email: 'test@example.com',
  password: 'hashed',
  role: UserRole.EMPLOYEE,
  fullName: 'Test User',
  phone: null,
  department: null,
  position: null,
  joinedAt: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AuthService', () => {
  let service: AuthService;
  let employeeRepo: jest.Mocked<Pick<Repository<Employee>, 'findOne'>>;
  let refreshTokenRepo: jest.Mocked<Pick<Repository<RefreshToken>, 'create' | 'save' | 'findOne' | 'delete'>>;
  let jwtService: jest.Mocked<Pick<JwtService, 'sign' | 'verify'>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(Employee),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: { create: jest.fn(), save: jest.fn(), findOne: jest.fn(), delete: jest.fn() },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn(), verify: jest.fn() },
        },
        {
          provide: 'JWT_REFRESH_SECRET',
          useValue: 'refresh-secret',
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    employeeRepo = module.get(getRepositoryToken(Employee));
    refreshTokenRepo = module.get(getRepositoryToken(RefreshToken));
    jwtService = module.get(JwtService);
  });

  describe('login', () => {
    it('returns tokens when credentials are valid', async () => {
      bcrypt.compare.mockResolvedValue(true);
      (employeeRepo.findOne as jest.Mock).mockResolvedValue(mockEmployee);
      (jwtService.sign as jest.Mock).mockReturnValue('signed-token');
      (refreshTokenRepo.create as jest.Mock).mockReturnValue({});
      (refreshTokenRepo.save as jest.Mock).mockResolvedValue({});

      const result = await service.login({ email: 'test@example.com', password: 'password' });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('throws UnauthorizedException when employee not found', async () => {
      (employeeRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.login({ email: 'bad@example.com', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when password is wrong', async () => {
      bcrypt.compare.mockResolvedValue(false);
      (employeeRepo.findOne as jest.Mock).mockResolvedValue(mockEmployee);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when employee is deactivated', async () => {
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      (employeeRepo.findOne as jest.Mock).mockResolvedValue({ ...mockEmployee, isActive: false });

      await expect(
        service.login({ email: 'test@example.com', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
