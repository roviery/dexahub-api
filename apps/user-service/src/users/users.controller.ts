import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from '@app/common';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern({ cmd: 'users.findAll' })
  findAll(@Payload() data: { page: number; limit: number }) {
    return this.usersService.findAll(data.page, data.limit);
  }

  @MessagePattern({ cmd: 'users.findOne' })
  findOne(@Payload() data: { id: string }) {
    return this.usersService.findOne(data.id);
  }

  @MessagePattern({ cmd: 'users.create' })
  create(@Payload() dto: CreateEmployeeDto) {
    return this.usersService.create(dto);
  }

  @MessagePattern({ cmd: 'users.update' })
  update(@Payload() data: { id: string; dto: UpdateEmployeeDto }) {
    return this.usersService.update(data.id, data.dto);
  }
}
