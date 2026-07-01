import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefijo global — las rutas serán /api/asignacion-trazabilidad/*
  app.setGlobalPrefix('api/asignacion-trazabilidad');

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

  const config = new DocumentBuilder()
    .setTitle('Asignación y Trazabilidad')
    .setDescription('API para la asignación de vehículos y trazabilidad del sistema de Parking')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/asignacion-trazabilidad/docs', app, document);

  const port = process.env.PORT ?? 3002;
  await app.listen(port);

  console.log(`🚀 Asignación-Trazabilidad corriendo en puerto ${port}`);
}
bootstrap();
