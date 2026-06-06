import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { LoginDto } from '@app/common';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'auth.login' })
  login(@Payload() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @MessagePattern({ cmd: 'auth.refresh' })
  refresh(@Payload() data: { refreshToken: string }) {
    return this.authService.refresh(data.refreshToken);
  }

  @MessagePattern({ cmd: 'auth.logout' })
  logout(@Payload() data: { refreshToken: string }) {
    return this.authService.logout(data.refreshToken);
  }
}
