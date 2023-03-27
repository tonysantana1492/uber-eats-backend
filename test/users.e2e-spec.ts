import { INestApplication } from '@nestjs/common/interfaces';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { User } from '../src/users/entities/user.entity';
import { Verification } from '../src/users/entities/verification.entity';

const GRAPHQL_ENDPOINT = '/graphql';

const testUser = {
	email: 'nico@las.com',
	password: '12345',
};

const dataSource = new DataSource({
	type: 'postgres',
	host: process.env.DB_HOST,
	port: +process.env.DB_PORT,
	username: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	synchronize: process.env.NODE_ENV !== 'production',
	logging: process.env.NODE_ENV === 'development',
	entities: [User, Verification],
});

describe('UserModule (e2e)', () => {
	let app: INestApplication;
	let jwtToken: string;

	const baseTest = () => request(app.getHttpServer()).post(GRAPHQL_ENDPOINT);
	const publicTest = (query: string) => baseTest().send({ query });
	const privateTest = (query: string) => baseTest().set('X-JWT', jwtToken).send({ query });

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = module.createNestApplication();
		await app.init();
		await dataSource.initialize();
	});

	afterAll(async () => {
		await dataSource.dropDatabase();
		await dataSource.destroy();
		app.close();
	});

	describe('createAccount', () => {
		it('should create account', () => {
			return publicTest(`
						mutation {
						  createAccount(input: {
							email:"${testUser.email}",
							password:"${testUser.password}",
							role:Owner
						  }) {
							ok
							error
						  }
						}
				`)
				.expect(200)
				.expect(res => {
					expect(res.body.data.createAccount.ok).toBe(true);
					expect(res.body.data.createAccount.error).toBe(null);
				});
		});

		it('should fail if account already exists', async () => {
			return await publicTest(`
				mutation {
				  createAccount(input: {
					email:"${testUser.email}",
					password:"${testUser.password}",
					role:Owner
				  }) {
					ok
					error
				  }
				}
				`)
				.expect(200)
				.expect(res => {
					expect(res.body.data.createAccount.ok).toBe(false);
					expect(res.body.data.createAccount.error).toEqual(expect.any(String));
				});
		});
	});

	describe('login', () => {
		it('should login with correct credentials', () => {
			return publicTest(`
				mutation {
					login(
						input: {
							email: "${testUser.email}",
							password: "${testUser.password}"
						}
					) {
						ok
						error
						token
					}
				}			
				`)
				.expect(200)
				.expect(res => {
					expect(res.body.data.login.ok).toBe(true);
					expect(res.body.data.login.error).toBe(null);
					expect(res.body.data.login.token).toEqual(expect.any(String));
				});
		});

		it('should not be able to login with wrong credentials', () => {
			return publicTest(`
				mutation {
					login(
						input: {
							email: "${testUser.email}",
							password: "wrong.password"
						}
					) {
						ok
						error
						token
					}
				}			
				`)
				.expect(200)
				.expect(res => {
					expect(res.body.data.login.ok).toBe(false);
					expect(res.body.data.login.error).toBe('Wrong password.');
					expect(res.body.data.login.token).toBe(null);

					jwtToken = res.body.data.login.token;
				});
		});
	});

	describe('userProfile', () =);
	it.todo('me');
	it.todo('verifyEmail');
	it.todo('editProfile');
});
