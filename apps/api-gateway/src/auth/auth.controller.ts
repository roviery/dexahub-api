import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { LoginDto, JwtAuthGuard, RefreshTokenDto } from '@app/common';

@Controller('auth')
export class AuthController {
  constructor(@Inject('AUTH_SERVICE') private readonly authClient: ClientProxy) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return firstValueFrom(this.authClient.send({ cmd: 'auth.login' }, dto));
  }

  @Post('refresh')
  refresh(@Body() body: RefreshTokenDto) {
    return firstValueFrom(this.authClient.send({ cmd: 'auth.refresh' }, body));
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Body() body: RefreshTokenDto) {
    return firstValueFrom(this.authClient.send({ cmd: 'auth.logout' }, body));
  }
}
