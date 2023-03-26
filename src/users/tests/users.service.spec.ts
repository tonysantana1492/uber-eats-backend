import { UsersService } from '../users.service';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Verification } from '../entities/verification.entity';
import { JwtService } from '../../jwt/jwt.service';
import { MailService } from '../../mail/mail.service';
import { Repository } from 'typeorm';

const mockRepository = {
	findOne: jest.fn(),
	save: jest.fn(),
	create: jest.fn(),
};

const mockJwtService = {
	sign: jest.fn(),
	verify: jest.fn(),
};

const mockMailService = {
	sendEmail: jest.fn(),
	sendVerificationEmail: jest.fn(),
};

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UserService', () => {
	let service: UsersService;
	let usersRepository: MockRepository<User>;

	beforeAll(async () => {
		const module = await Test.createTestingModule({
			providers: [
				UsersService,
				//TODO: Defino las dependencias que injecto en UsersService y mockeo todos sus metodos
				{
					provide: getRepositoryToken(User),
					useValue: mockRepository,
				},
				{
					provide: getRepositoryToken(Verification),
					useValue: mockRepository,
				},
				{
					provide: JwtService,
					useValue: mockJwtService,
				},
				{
					provide: MailService,
					useValue: mockMailService,
				},
			],
		}).compile();
		service = module.get<UsersService>(UsersService);
		usersRepository = module.get(getRepositoryToken(User));
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('createAccount', () => {
		it('should fail if user exists', async () => {
			usersRepository.findOne.mockResolvedValue({
				id: 1,
				email: 'tonysantna1492@gmail.com',
			});

			const result = await service.createAccount({
				email: '',
				password: '',
				role: 0,
			});

			expect(result).toMatchObject({
				ok: false,
				error: 'There is a user with that email already.',
			});
		});
	});
	it.todo('login');
	it.todo('findById');
	it.todo('editProfile');
	it.todo('verifyEmail');
});
