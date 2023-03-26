import { UsersService } from '../users.service';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Verification } from '../entities/verification.entity';
import { JwtService } from '../../jwt/jwt.service';
import { MailService } from '../../mail/mail.service';
import { Repository } from 'typeorm';

// Los hago funciones para que en cada prueba me devuelva un objeto limpio,
// sino se queda almacenado el objeto en cache y me cuenta todas las llamadas (toHaveBeenCalledTimes)
// incluida las de las de otros it, dandome una cantidad de llamadas superior a las realizadas en un unico it
const mockRepository = () => ({
	findOne: jest.fn(),
	save: jest.fn(),
	create: jest.fn(),
	findOneByOrFail: jest.fn(),
	findOneBy: jest.fn(),
	delete: jest.fn(),
});

const mockJwtService = () => ({
	sign: jest.fn(() => 'signed-token'),
	verify: jest.fn(),
});

const mockMailService = () => ({
	sendEmail: jest.fn(),
	sendVerificationEmail: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UserService', () => {
	let service: UsersService;
	let usersRepository: MockRepository<User>;
	let verificationRepository: MockRepository<Verification>;
	let mailService: MailService;
	let jwtService: JwtService;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				UsersService,
				//TODO: Defino las dependencias que injecto en UsersService y mockeo todos sus metodos
				{
					provide: getRepositoryToken(User),
					useValue: mockRepository(),
				},
				{
					provide: getRepositoryToken(Verification),
					useValue: mockRepository(),
				},
				{
					provide: JwtService,
					useValue: mockJwtService(),
				},
				{
					provide: MailService,
					useValue: mockMailService(),
				},
			],
		}).compile();

		service = module.get<UsersService>(UsersService);
		mailService = module.get<MailService>(MailService);
		jwtService = module.get<JwtService>(JwtService);
		usersRepository = module.get(getRepositoryToken(User));
		verificationRepository = module.get(getRepositoryToken(Verification));
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('createAccount', () => {
		const createAccountArgs = {
			email: '',
			password: '',
			role: 0,
		};

		it('should fail if user exists', async () => {
			usersRepository.findOne.mockResolvedValue({
				id: 1,
				email: 'test@gmail.com',
			});

			const result = await service.createAccount(createAccountArgs);

			expect(result).toMatchObject({
				ok: false,
				error: 'There is a user with that email already.',
			});
		});

		it('should create a new user', async () => {
			usersRepository.findOne.mockResolvedValue(undefined);
			usersRepository.create.mockReturnValue(createAccountArgs);
			usersRepository.save.mockResolvedValue(createAccountArgs);
			verificationRepository.create.mockReturnValue({ user: createAccountArgs });
			verificationRepository.save.mockResolvedValue({ code: 'code' });

			const result = await service.createAccount(createAccountArgs);

			expect(usersRepository.create).toHaveBeenCalledTimes(1);
			expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs);

			expect(usersRepository.save).toHaveBeenCalledTimes(1);
			expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgs);

			expect(verificationRepository.create).toHaveBeenCalledTimes(1);
			expect(verificationRepository.create).toHaveBeenCalledWith({ user: createAccountArgs });

			expect(verificationRepository.save).toHaveBeenCalledTimes(1);
			expect(verificationRepository.save).toHaveBeenCalledWith({ user: createAccountArgs });

			expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
			expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(expect.any(String), expect.any(String));
			expect(result).toEqual({ ok: true });
		});

		it('should fail on exception', async () => {
			usersRepository.findOne.mockRejectedValue(new Error());

			const result = await service.createAccount(createAccountArgs);

			expect(result).toEqual({ ok: false, error: "Couldn't create account." });
		});
	});

	describe('login', () => {
		const loginArgs = {
			email: 'test@email.com',
			password: 'test',
		};

		it('should fail if user does not exist', async () => {
			usersRepository.findOne.mockResolvedValue(undefined);

			const result = await service.login(loginArgs);

			expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
			expect(usersRepository.findOne).toHaveBeenCalledWith({
				where: expect.any(Object),
				select: expect.any(Array),
			});
			expect(result).toEqual({ ok: false, error: 'User not found.' });
		});

		it('should fail if the password is wrong', async () => {
			const mockUser = {
				checkPassword: jest.fn(() => Promise.resolve(false)),
			};

			usersRepository.findOne.mockResolvedValue(mockUser);

			const result = await service.login(loginArgs);

			expect(result).toEqual({ ok: false, error: 'Wrong password.' });
		});

		it('should return token if password correct', async () => {
			const mockUser = {
				id: 1,
				checkPassword: jest.fn(() => Promise.resolve(true)),
			};

			usersRepository.findOne.mockResolvedValue(mockUser);

			const result = await service.login(loginArgs);

			expect(jwtService.sign).toHaveBeenCalledTimes(1);
			expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number));
			expect(result).toEqual({ ok: true, token: 'signed-token' });
		});

		it('should fail on exception', async () => {
			usersRepository.findOne.mockRejectedValue(new Error());

			const result = await service.login(loginArgs);

			expect(result).toEqual({ ok: false, error: expect.any(Object) });
		});
	});

	describe('findById', () => {
		const findByIdArgs = {
			id: 1,
		};

		it('should find an existing user', async () => {
			usersRepository.findOneByOrFail.mockResolvedValue(findByIdArgs);

			const result = await service.findById(findByIdArgs.id);

			expect(usersRepository.findOneByOrFail).toHaveBeenCalledTimes(1);
			expect(usersRepository.findOneByOrFail).toHaveBeenCalledWith(findByIdArgs);
			expect(result).toEqual({ ok: true, user: findByIdArgs });
		});

		it('should fail if not user is found', async () => {
			usersRepository.findOneByOrFail.mockRejectedValue(new Error());

			const result = await service.findById(findByIdArgs.id);

			expect(result).toEqual({ ok: false, error: 'User not found.' });
		});
	});

	describe('editProfile', () => {
		it('should change email', async () => {
			const oldUSer = {
				verified: true,
				email: 'testOld@gmail.com',
			};

			const editProfileArgs = {
				userId: 1,
				input: {
					email: 'tes@gmail.com',
				},
			};

			const newVerification = {
				code: 'code',
			};

			const newUser = {
				verified: false,
				email: editProfileArgs.input.email,
			};

			usersRepository.findOneBy.mockResolvedValue(oldUSer);
			verificationRepository.create.mockReturnValue(newVerification);
			verificationRepository.save.mockResolvedValue(newVerification);

			const result = await service.editProfile(editProfileArgs.userId, editProfileArgs.input);

			expect(usersRepository.findOneBy).toHaveBeenCalledTimes(1);
			expect(usersRepository.findOneBy).toHaveBeenCalledWith({ id: editProfileArgs.userId });

			expect(usersRepository.save).toHaveBeenCalledTimes(1);
			expect(usersRepository.save).toHaveBeenCalledWith(expect.any(Object));

			expect(verificationRepository.create).toHaveBeenCalledTimes(1);
			expect(verificationRepository.create).toHaveBeenCalledWith({ user: newUser });

			expect(verificationRepository.save).toHaveBeenCalledTimes(1);
			expect(verificationRepository.save).toHaveBeenCalledWith(newVerification);

			expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
			expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(newUser.email, newVerification.code);

			expect(result).toEqual({ ok: true });
		});

		it('should change password', async () => {
			const editProfileArgs = {
				userId: 1,
				input: {
					password: 'new.password',
				},
			};

			usersRepository.findOneBy.mockResolvedValue({ password: 'old.password' });

			const result = await service.editProfile(editProfileArgs.userId, editProfileArgs.input);

			expect(usersRepository.save).toHaveBeenCalledTimes(1);
			expect(usersRepository.save).toHaveBeenCalledWith(editProfileArgs.input);
			expect(result).toEqual({ ok: true });
		});

		it('should fail on exception', async () => {
			const editProfileArgs = {
				userId: 1,
				input: {
					email: 'tes@gmail.com',
					password: 'test',
				},
			};

			usersRepository.findOneBy.mockRejectedValue(new Error());

			const result = await service.editProfile(editProfileArgs.userId, editProfileArgs.input);

			expect(result).toEqual({ ok: false, error: 'Could not update profile.' });
		});
	});

	describe('verifyEmail', () => {
		const verifyEmailArgs = {
			code: 'code',
		};

		const mockedVerification = {
			id: 1,
			code: 'code',
			user: {
				verified: false,
				email: 'test@gmail.com',
			},
		};

		const userVerify = {
			verified: true,
			email: mockedVerification.user.email,
		};

		it('should verify email', async () => {
			verificationRepository.findOne.mockResolvedValue(mockedVerification);

			const result = await service.verifyEmail(verifyEmailArgs.code);

			expect(verificationRepository.findOne).toHaveBeenCalledTimes(1);
			expect(verificationRepository.findOne).toHaveBeenCalledWith(expect.any(Object));

			expect(usersRepository.save).toHaveBeenCalledTimes(1);
			expect(usersRepository.save).toHaveBeenCalledWith(userVerify);

			expect(verificationRepository.delete).toHaveBeenCalledTimes(1);
			expect(verificationRepository.delete).toHaveBeenCalledWith(mockedVerification.id);

			expect(result).toEqual({ ok: true });
		});

		it('shoul fail on verification not found', async () => {
			verificationRepository.findOne.mockResolvedValue(undefined);

			const result = await service.verifyEmail(verifyEmailArgs.code);

			expect(verificationRepository.findOne).toHaveBeenCalledTimes(1);
			expect(verificationRepository.findOne).toHaveBeenCalledWith(expect.any(Object));

			expect(result).toEqual({ ok: false, error: 'Verification not found.' });
		});

		it('should fail on exception', async () => {
			verificationRepository.findOne.mockRejectedValue(new Error());

			const result = await service.verifyEmail(verifyEmailArgs.code);

			expect(result).toEqual({ ok: false, error: expect.any(Object) });
		});
	});
});
