import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Employee } from '../entities/employee.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { LoginDto, JwtPayload } from '@app/common';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    @Inject('JWT_REFRESH_SECRET')
    private readonly refreshSecret: string,
  ) {}

  async login(dto: LoginDto): Promise<{ accessToken: string; refreshToken: string }> {
    const employee = await this.employeeRepo.findOne({ where: { email: dto.email } });
    if (!employee) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(dto.password, employee.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const payload: JwtPayload = { sub: employee.id, role: employee.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.refreshSecret,
      expiresIn: '7d',
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const tokenRecord = this.refreshTokenRepo.create({
      employeeId: employee.id,
      token: refreshToken,
      expiresAt,
    });
    await this.refreshTokenRepo.save(tokenRecord);

    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(refreshToken, { secret: this.refreshSecret });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const stored = await this.refreshTokenRepo.findOne({ where: { token: refreshToken } });
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const accessToken = this.jwtService.sign({ sub: payload.sub, role: payload.role });
    return { accessToken };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.refreshTokenRepo.delete({ token: refreshToken });
  }
}
