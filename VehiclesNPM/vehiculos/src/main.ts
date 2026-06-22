import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule} from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const config = new DocumentBuilder()
  .setTitle('Servicio Vehiculos')
  .setDescription('Desripcion de la API y los endpoints para el servicio de vehículos.')
  .setVersion('1.0')
  .build();

  const docs = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api',app, docs);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
