import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { Employee } from '../entities/employee.entity';
import { UserRole, CreateEmployeeDto } from '@app/common';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

const mockEmployee: Partial<Employee> = {
  id: 'uuid-1',
  email: 'emp@example.com',
  role: UserRole.EMPLOYEE,
  fullName: 'Jane Doe',
  isActive: true,
};

describe('UsersService', () => {
  let service: UsersService;
  let repo: jest.Mocked<Pick<Repository<Employee>, 'find' | 'findOne' | 'count' | 'create' | 'save'>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(Employee),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            count: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get(getRepositoryToken(Employee));
  });

  describe('findAll', () => {
    it('returns paginated employees', async () => {
      (repo.find as jest.Mock).mockResolvedValue([mockEmployee]);
      (repo.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll(1, 10);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('returns employee when found', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(mockEmployee);
      const result = await service.findOne('uuid-1');
      expect(result.id).toBe('uuid-1');
    });

    it('throws NotFoundException when not found', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('hashes password and saves employee', async () => {
      const dto: CreateEmployeeDto = {
        email: 'new@example.com',
        password: 'password123',
        role: UserRole.EMPLOYEE,
        fullName: 'New User',
      };
      (repo.findOne as jest.Mock).mockResolvedValue(null);
      (repo.create as jest.Mock).mockReturnValue({ ...dto });
      (repo.save as jest.Mock).mockResolvedValue({ id: 'uuid-2', ...dto });

      const result = await service.create(dto);
      expect(result).toHaveProperty('id');
    });

    it('throws ConflictException when email already exists', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(mockEmployee);
      await expect(
        service.create({ email: 'emp@example.com', password: 'p', role: UserRole.EMPLOYEE, fullName: 'X' }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
