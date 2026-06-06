import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AttendanceService } from './attendance.service';

@Controller()
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @MessagePattern({ cmd: 'attendance.checkIn' })
  checkIn(@Payload() data: { employeeId: string; photoPath: string }) {
    return this.attendanceService.checkIn(data.employeeId, data.photoPath);
  }

  @MessagePattern({ cmd: 'attendance.getMyRecords' })
  getMyRecords(@Payload() data: { employeeId: string }) {
    return this.attendanceService.getMyRecords(data.employeeId);
  }

  @MessagePattern({ cmd: 'attendance.findAll' })
  findAll(@Payload() data: { page: number; limit: number; filters: { date?: string; employeeId?: string } }) {
    return this.attendanceService.findAll(data.page, data.limit, data.filters);
  }

  @MessagePattern({ cmd: 'attendance.findOne' })
  findOne(@Payload() data: { id: string }) {
    return this.attendanceService.findOne(data.id);
  }
}
