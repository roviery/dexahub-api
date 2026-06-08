import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { HttpToRpcExceptionFilter } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: { host: '0.0.0.0', port: 3003 },
  });
  app.useGlobalFilters(new HttpToRpcExceptionFilter());
  await app.listen();
  console.log('attendance-service listening on TCP port 3003');
}
bootstrap();
