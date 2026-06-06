import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AttendanceController } from './attendance.controller';
import { RolesGuard } from '@app/common';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'ATTENDANCE_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get('ATTENDANCE_SERVICE_HOST', 'attendance-service'),
            port: 3003,
          },
        }),
      },
    ]),
  ],
  controllers: [AttendanceController],
  providers: [RolesGuard],
})
export class AttendanceModule {}
