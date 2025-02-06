import { INestApplication } from '@nestjs/common'
import { AppModule } from '@/infra/app.module'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { hash } from 'bcryptjs'
import { DatabaseModule } from '@/infra/database/database.module'
import { StudentFactory } from 'test/factories/make-student'

describe('Authenticate account (E2E)', () => {
  let app: INestApplication
  let studentFactory: StudentFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory],
    })
      .overrideProvider(AppModule)
      .useValue(AppModule)
      .compile()

    app = moduleRef.createNestApplication()
    studentFactory = moduleRef.get(StudentFactory)

    await app.init()
  })

  test('[POST] /sessions', async () => {
    await studentFactory.makePrismaStudent({
      email: 'johndoe@example.com',
      password: await hash('12345678', 8),
    })

    const response = await request(app.getHttpServer()).post('/sessions').send({
      email: 'johndoe@example.com',
      password: '12345678',
    })

    expect(response.statusCode).toBe(201)
    expect(response.body).toEqual({
      access_token: expect.any(String),
    })
  })
})
