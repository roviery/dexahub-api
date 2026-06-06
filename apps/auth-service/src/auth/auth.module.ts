import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Employee } from '../entities/employee.entity';
import { RefreshToken } from '../entities/refresh-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee, RefreshToken]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: 'JWT_REFRESH_SECRET',
      useFactory: (config: ConfigService) => config.get<string>('JWT_REFRESH_SECRET'),
      inject: [ConfigService],
    },
  ],
})
export class AuthModule {}
