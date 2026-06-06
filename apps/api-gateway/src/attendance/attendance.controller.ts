import {
  Controller, Post, Get, Param, Query, UseGuards, UseInterceptors,
  UploadedFile, Inject, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClientProxy } from '@nestjs/microservices';
import { diskStorage } from 'multer';
import { firstValueFrom } from 'rxjs';
import { extname } from 'path';
import { JwtAuthGuard, RolesGuard, Roles, UserRole, CurrentUser } from '@app/common';
import type { JwtPayload } from '@app/common';

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(@Inject('ATTENDANCE_SERVICE') private readonly attendanceClient: ClientProxy) {}

  @Post('check-in')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads/attendance',
        filename: (_req, file, cb) => {
          const date = new Date().toISOString().split('T')[0];
          const unique = `${date}-${Date.now()}${extname(file.originalname)}`;
          cb(null, unique);
        },
      }),
    }),
  )
  checkIn(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: JwtPayload) {
    if (!file) throw new BadRequestException('Photo is required');
    const photoPath = `attendance/${file.filename}`;
    return firstValueFrom(
      this.attendanceClient.send({ cmd: 'attendance.checkIn' }, { employeeId: user.sub, photoPath }),
    );
  }

  @Get('me')
  getMyRecords(@CurrentUser() user: JwtPayload) {
    return firstValueFrom(
      this.attendanceClient.send({ cmd: 'attendance.getMyRecords' }, { employeeId: user.sub }),
    );
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.HRD_ADMIN)
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('date') date?: string,
    @Query('employeeId') employeeId?: string,
  ) {
    return firstValueFrom(
      this.attendanceClient.send(
        { cmd: 'attendance.findAll' },
        { page: +page, limit: +limit, filters: { date, employeeId } },
      ),
    );
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.HRD_ADMIN)
  findOne(@Param('id') id: string) {
    return firstValueFrom(this.attendanceClient.send({ cmd: 'attendance.findOne' }, { id }));
  }
}
