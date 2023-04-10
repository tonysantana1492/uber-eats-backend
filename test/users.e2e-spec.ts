import { INestApplication } from '@nestjs/common/interfaces';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { User } from '../src/users/entities/user.entity';
import { Verification } from '../src/users/entities/verification.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TOKEN_KEY } from 'src/common/common.constants';
import { OrderItem } from 'src/orders/entities/order-item.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Category } from 'src/restaurants/entities/category.entity';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';

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
	entities: [User, Verification, Restaurant, Category, Dish, Order, OrderItem],
});

describe('UserModule (e2e)', () => {
	let app: INestApplication;
	let usersRepository: Repository<User>;
	let verifyRepository: Repository<Verification>;
	let jwtToken: string;

	const baseTest = () => request(app.getHttpServer()).post(GRAPHQL_ENDPOINT);
	const publicTest = (query: string) => baseTest().send({ query });
	const privateTest = (query: string) => baseTest().set(TOKEN_KEY, jwtToken).send({ query });

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = module.createNestApplication();
		usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
		verifyRepository = module.get<Repository<Verification>>(getRepositoryToken(Verification));

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

					jwtToken = res.body.data.login.token;
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
				});
		});
	});

	describe('userProfile', () => {
		let userId: number;

		beforeAll(async () => {
			const [user] = await usersRepository.find();
			userId = user.id;
		});

		it('should see a user profile', () => {
			return privateTest(`
        		  {
        		    userProfile(userId: ${userId}){
        		      ok
        		      error
        		      user {
        		        id
        		      }
        		    }
        		  }
        		`)
				.expect(200)
				.expect(res => {
					expect(res.body.data.userProfile.ok).toBe(true);
					expect(res.body.data.userProfile.error).toBe(null);
					expect(res.body.data.userProfile.user.id).toBe(userId);
				});
		});

		it('should not find a profile', () => {
			return privateTest(`
        		  {
        		    userProfile(userId: 3){
        		      ok
        		      error
        		      user {
        		        id
        		      }
        		    }
        		  }
        		`)
				.expect(200)
				.expect(res => {
					expect(res.body.data.userProfile.ok).toBe(false);
					expect(res.body.data.userProfile.error).toBe('User not found.');
					expect(res.body.data.userProfile.user).toBe(null);
				});
		});
	});

	describe('me', () => {
		it('should find my profile', () => {
			return privateTest(`
					{
						me {
							email
						}
					}
				`)
				.expect(200)
				.expect(res => {
					expect(res.body.data.me.email).toBe(testUser.email);
				});
		});

		it('should not allow logged out user', () => {
			return publicTest(`
				{
				  me {
					email
				  }
				}
			  `)
				.expect(200)
				.expect(res => {
					expect(res.body.errors[0].message).toBe('Forbidden resource');
				});
		});
	});

	describe('editProfile', () => {
		const NEW_EMAIL = 'change@gmail.com';

		it('should change email', () => {
			return privateTest(`
					mutation {
						editProfile(
							input: {
								email: "${NEW_EMAIL}"
							}
						) {
							ok
							error
						}
					}
				`)
				.expect(200)
				.expect(res => {
					expect(res.body.data.editProfile.ok).toBe(true);
					expect(res.body.data.editProfile.error).toBe(null);
				});
		});

		it('should have new email', () => {
			return privateTest(`
				{
				  me {
					email
				  }
				}
			  `)
				.expect(200)
				.expect(res => {
					expect(res.body.data.me.email).toBe(NEW_EMAIL);
				});
		});
	});

	describe('verifyEmail', () => {
		let verificationCode: string;

		beforeAll(async () => {
			const [verification] = await verifyRepository.find();
			verificationCode = verification.code;
		});

		it('should verify the email', () => {
			return privateTest(`
					mutation {
						verifyEmail(
							input: {
								code: "${verificationCode}"
							}
						) {
							ok
							error
						}
					}
				`)
				.expect(200)
				.expect(res => {
					expect(res.body.data.verifyEmail.ok).toBe(true);
					expect(res.body.data.verifyEmail.error).toBe(null);
				});
		});

		it('should fail on verification code not found', () => {
			return publicTest(`
				mutation {
				  verifyEmail(input:{
					code:"xxxxx"
				  }){
					ok
					error
				  }
				}
			  `)
				.expect(200)
				.expect(res => {
					expect(res.body.data.verifyEmail.ok).toBe(false);
					expect(res.body.data.verifyEmail.error).toBe('Verification not found.');
				});
		});
	});
});
