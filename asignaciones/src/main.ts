import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefijo global — las rutas serán /api/asignacion-trazabilidad/*
  app.setGlobalPrefix('api/asignacion-trazabilidad');

  const config = new DocumentBuilder()
    .setTitle('Gestión de Asignación y Trazabilidad')
    .setDescription('API para la gestión de asignación y trazabilidad de vehículos en el sistema de Parking')
    .setVersion('1.0')
    .addServer('/api/asignacion-trazabilidad')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // ValidationPipe global: valida DTOs automáticamente
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // elimina propiedades no declaradas en el DTO
      forbidNonWhitelisted: true, // lanza error si llegan propiedades extra
      transform: true,            // transforma payloads al tipo del DTO
    }),
  );

  // CORS — permite llamadas desde cualquier origen en desarrollo
  app.enableCors();

  const port = process.env.PORT ?? 3002;
  await app.listen(port);

  console.log(`🚀 Asignación-Trazabilidad corriendo en puerto ${port}`);
}
bootstrap();