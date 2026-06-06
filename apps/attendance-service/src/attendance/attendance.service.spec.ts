import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AttendanceService } from './attendance.service';
import { AttendanceRecord } from '../entities/attendance-record.entity';

const mockRecord: Partial<AttendanceRecord> = {
  id: 'uuid-1',
  employeeId: 'emp-uuid-1',
  checkInAt: new Date('2026-06-06T08:00:00'),
  photoPath: 'attendance/2026-06-06-emp-uuid-1.jpg',
  date: '2026-06-06',
};

describe('AttendanceService', () => {
  let service: AttendanceService;
  let repo: jest.Mocked<Pick<Repository<AttendanceRecord>, 'findOne' | 'create' | 'save' | 'find' | 'count'>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        {
          provide: getRepositoryToken(AttendanceRecord),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            count: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
    repo = module.get(getRepositoryToken(AttendanceRecord));
  });

  describe('checkIn', () => {
    it('saves attendance record and returns it', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(null);
      (repo.create as jest.Mock).mockReturnValue(mockRecord);
      (repo.save as jest.Mock).mockResolvedValue(mockRecord);

      const result = await service.checkIn('emp-uuid-1', 'attendance/photo.jpg');
      expect(result).toHaveProperty('id');
    });

    it('throws ConflictException when already checked in today', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(mockRecord);

      await expect(service.checkIn('emp-uuid-1', 'photo.jpg')).rejects.toThrow(ConflictException);
    });
  });

  describe('getMyRecords', () => {
    it('returns records for a given employee', async () => {
      (repo.find as jest.Mock).mockResolvedValue([mockRecord]);

      const result = await service.getMyRecords('emp-uuid-1');
      expect(result).toHaveLength(1);
    });
  });
});
