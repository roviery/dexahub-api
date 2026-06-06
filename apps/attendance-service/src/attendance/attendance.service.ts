import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceRecord } from '../entities/attendance-record.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceRecord)
    private readonly recordRepo: Repository<AttendanceRecord>,
  ) {}

  private today(): string {
    return new Date().toISOString().split('T')[0];
  }

  async checkIn(employeeId: string, photoPath: string): Promise<AttendanceRecord> {
    const date = this.today();
    const existing = await this.recordRepo.findOne({ where: { employeeId, date } });
    if (existing) throw new ConflictException('Already checked in today');

    const record = this.recordRepo.create({
      employeeId,
      checkInAt: new Date(),
      photoPath,
      date,
    });
    return this.recordRepo.save(record);
  }

  async getMyRecords(employeeId: string): Promise<AttendanceRecord[]> {
    return this.recordRepo.find({
      where: { employeeId },
      order: { date: 'DESC' },
    });
  }

  async findAll(
    page: number,
    limit: number,
    filters: { date?: string; employeeId?: string },
  ): Promise<{ data: AttendanceRecord[]; total: number }> {
    const where: Partial<AttendanceRecord> = {};
    if (filters.date) where.date = filters.date;
    if (filters.employeeId) where.employeeId = filters.employeeId;

    const [data, total] = await Promise.all([
      this.recordRepo.find({ where, skip: (page - 1) * limit, take: limit, order: { date: 'DESC' } }),
      this.recordRepo.count({ where }),
    ]);
    return { data, total };
  }

  async findOne(id: string): Promise<AttendanceRecord> {
    const record = await this.recordRepo.findOne({ where: { id } });
    if (!record) throw new NotFoundException(`Record ${id} not found`);
    return record;
  }
}
