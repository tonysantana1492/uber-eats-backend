import { Test } from '@nestjs/testing';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { JwtService } from '../jwt.service';
import { JwtModuleOptions } from '../jwt.interfaces';
import * as jwt from 'jsonwebtoken';

const TOKEN = 'TOKEN';
const TEST_KEY = 'testKey';
const USER_ID = 1;

// Mockear los metodos de una libreria externa
jest.mock('jsonwebtoken', () => {
	return {
		sign: jest.fn(() => TOKEN),
		verify: jest.fn(() => ({ id: USER_ID })),
	};
});

const mockJwtModuleOptions = () => ({
	privateKey: TEST_KEY,
});

describe('JwtService', () => {
	let service: JwtService;
	let options: JwtModuleOptions;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [JwtService, { provide: CONFIG_OPTIONS, useValue: mockJwtModuleOptions() }],
		}).compile();

		service = module.get<JwtService>(JwtService);
		options = module.get(CONFIG_OPTIONS);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('sign', () => {
		it('should return a signed token', () => {
			const token = service.sign(USER_ID);

			expect(jwt.sign).toHaveBeenCalledTimes(USER_ID);
			expect(jwt.sign).toHaveBeenCalledWith({ id: USER_ID }, options.privateKey);

			expect(typeof token).toBe('string');
			expect(token).toEqual('TOKEN');
		});
	});

	describe('verify', () => {
		it('should return decoded token', () => {
			const decodedToken = service.verify(TOKEN);

			expect(jwt.verify).toHaveBeenCalledTimes(1);
			expect(jwt.verify).toHaveBeenCalledWith(TOKEN, options.privateKey);

			expect(decodedToken).toEqual({ id: USER_ID });
		});
	});
});
