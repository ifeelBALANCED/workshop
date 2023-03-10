import { DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger';
import { get } from 'env-var';

export const corsOrigin = {
  origin: get('ORIGIN').asString(),
  credentials: true,
};
export const config = new DocumentBuilder()
  .setTitle('Median')
  .setDescription('The Median API')
  .setVersion('0.1')
  .build();
export const swaggerOptions: SwaggerCustomOptions = {
  swaggerOptions: {
    tagsSorter: 'alpha',
    operationsSorter: 'alpha',
  },
};
