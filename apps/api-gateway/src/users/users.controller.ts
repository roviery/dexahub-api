import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard, RolesGuard, Roles, UserRole, CreateEmployeeDto, UpdateEmployeeDto } from '@app/common';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.HRD_ADMIN)
export class UsersController {
  constructor(@Inject('USER_SERVICE') private readonly userClient: ClientProxy) {}

  @Get()
  findAll(@Query('page') page = '1', @Query('limit') limit = '10') {
    return firstValueFrom(
      this.userClient.send({ cmd: 'users.findAll' }, { page: +page, limit: +limit }),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return firstValueFrom(this.userClient.send({ cmd: 'users.findOne' }, { id }));
  }

  @Post()
  create(@Body() dto: CreateEmployeeDto) {
    return firstValueFrom(this.userClient.send({ cmd: 'users.create' }, dto));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    return firstValueFrom(this.userClient.send({ cmd: 'users.update' }, { id, dto }));
  }
}
