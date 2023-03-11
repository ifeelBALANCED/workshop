import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { useContainer } from 'class-validator';
import { PrismaService } from 'nestjs-prisma';
import { AppModule } from '../src/app/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const articleShape = expect.objectContaining({
    id: expect.any(Number),
    body: expect.any(String),
    title: expect.any(String),
    published: expect.any(Boolean),
    createdAt: expect.any(String),
    updatedAt: expect.any(String),
  });

  const articlesData = [
    {
      id: 100001,
      title: 'title1',
      description: 'description1',
      body: 'body1',
      published: true,
    },
    {
      id: 100002,
      title: 'title2',
      description: 'description2',
      body: 'body2',
      published: false,
    },
  ];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);

    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    await app.init();

    await prisma.article.create({
      data: articlesData[0],
    });
    await prisma.article.create({
      data: articlesData[1],
    });
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
