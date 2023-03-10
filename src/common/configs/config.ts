import { DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger';
import { get } from 'env-var';

export const corsOrigin = {
  origin: get('ORIGIN').asString(),
  credentials: true,
};
export const config = new DocumentBuilder()
  .setTitle('workshop API')
  .setDescription('The workshop API description')
  .setVersion('1.0')
  .build();
export const swaggerOptions: SwaggerCustomOptions = {
  swaggerOptions: {
    tagsSorter: 'alpha',
    operationsSorter: 'alpha',
  },
};
