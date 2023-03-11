import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { useContainer } from 'class-validator';
import { PrismaService } from 'nestjs-prisma';
import { AppModule } from '../src/app/app.module';
import { articlesData } from './mocks/article';

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

  describe('GET /articles', () => {
    it('returns a list of published articles', async () => {
      const { status, body } = await request(app.getHttpServer()).get(
        '/articles'
      );

      expect(status).toBe(200);
      expect(body).toStrictEqual(expect.arrayContaining([articleShape]));
      expect(body).toHaveLength(1);
      expect(body[0].id).toEqual(articlesData[0].id);
      expect(body[0].published).toBeTruthy();
    });

    it('returns a list of draft articles', async () => {
      const { status, body } = await request(app.getHttpServer()).get(
        '/articles/drafts'
      );

      expect(status).toBe(200);
      expect(body).toStrictEqual(expect.arrayContaining([articleShape]));
      expect(body).toHaveLength(1);
      expect(body[0].id).toEqual(articlesData[1].id);
      expect(body[0].published).toBeFalsy();
    });
  });

  describe('GET /articles/{id}', () => {
    it('returns a given article', async () => {
      const { status, body } = await request(app.getHttpServer()).get(
        `/articles/${articlesData[0].id}`
      );

      expect(status).toBe(200);
      expect(body).toStrictEqual(articleShape);
      expect(body.id).toEqual(articlesData[0].id);
    });

    it('fails to return non existing user', async () => {
      const { status } = await request(app.getHttpServer()).get(
        `/articles/100`
      );

      expect(status).toBe(404);
    });

    it('fails to return article with invalid id type', async () => {
      const { status } = await request(app.getHttpServer()).get(
        `/articles/string-id`
      );

      expect(status).toBe(400);
    });
  });

  describe('POST /articles', () => {
    it('creates an article', async () => {
      const beforeCount = await prisma.article.count();

      const { status } = await request(app.getHttpServer())
        .post('/articles')
        .send({
          title: 'title3',
          description: 'description3',
          body: 'body3a',
          published: false,
        });

      const afterCount = await prisma.article.count();

      expect(status).toBe(201);
      expect(afterCount - beforeCount).toBe(1);
    });

    it('fails to create article without title', async () => {
      const { status } = await request(app.getHttpServer())
        .post('/articles')
        .send({
          description: 'description4',
          body: 'body4',
          published: true,
        });

      expect(status).toBe(400);
    });
  });

  describe('DELETE /articles/{id}', () => {
    it('deletes an article', async () => {
      const beforeCount = await prisma.article.count();

      const { status } = await request(app.getHttpServer()).delete(
        `/articles/${articlesData[0].id}`
      );

      const afterCount = await prisma.article.count();
      expect(status).toBe(200);
      expect(afterCount - beforeCount).toBe(-1);
    });
  });

  describe('PUT /articles/{id}', () => {
    it('fails to update article with invalid id type', async () => {
      const { status } = await request(app.getHttpServer())
        .put(`/articles/string-id`)
        .send({
          title: 'updated title',
        });

      expect(status).toBe(404);
    });
  });
});
