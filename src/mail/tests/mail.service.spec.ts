import { Test } from '@nestjs/testing';
import { MailService } from '../mail.service';
import { CONFIG_OPTIONS } from '../../common/common.constants';
import { MailModuleOptions } from '../mail.interfaces';
import { HttpService } from '@nestjs/axios/dist';
import * as FormData from 'form-data';

jest.mock('form-data');

const TEST_DOMAIN = 'test-domain';

const mockMailModuleOptions = () => ({
	apiKey: 'test-apiKey',
	domain: TEST_DOMAIN,
	fromEmail: 'test-fromEmail',
});

const mockHttpService = () => ({
	post: jest.fn(),
});

describe('MailService', () => {
	let service: MailService;
	let options: MailModuleOptions;
	let httpService: HttpService;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				MailService,
				{ provide: CONFIG_OPTIONS, useValue: mockMailModuleOptions() },
				{ provide: HttpService, useValue: mockHttpService() },
			],
		}).compile();

		service = module.get<MailService>(MailService);
		httpService = module.get<HttpService>(HttpService);
		options = module.get(CONFIG_OPTIONS);
	});

	it('should be defined', () => {
		expect(MailService).toBeDefined();
	});

	describe('sendEmail', () => {
		const sendEmailArgs = {
			subject: 'test-subject',
			template: 'test-template',
			emailVars: [{ key: 'test', value: 'test' }],
		};

		it('should sends email', async () => {
			jest.spyOn(httpService, 'post').mockImplementation((async () => {
				return Promise.resolve(true);
			}) as any);

			const formSpy = jest.spyOn(FormData.prototype, 'append');
			const emailVarsSpy = jest.spyOn(sendEmailArgs.emailVars, 'forEach');

			const result = await service.sendEmail(
				sendEmailArgs.subject,
				sendEmailArgs.template,
				sendEmailArgs.emailVars,
			);

			expect(formSpy).toHaveBeenCalled();
			expect(formSpy).toHaveBeenCalledWith(
				`v:${sendEmailArgs.emailVars[0].key}`,
				sendEmailArgs.emailVars[0].value,
			);

			expect(emailVarsSpy).toHaveBeenCalled();

			expect(httpService.post).toHaveBeenCalledTimes(1);
			expect(httpService.post).toHaveBeenCalledWith(
				`https://api.mailgun.net/v3/${options.domain}/messages`,
				expect.any(Object),
			);

			expect(result).toEqual(true);
		});

		it('should be fail', async () => {
			jest.spyOn(httpService, 'post').mockImplementation(() => {
				throw new Error();
			});

			const result = await service.sendEmail(
				sendEmailArgs.subject,
				sendEmailArgs.template,
				sendEmailArgs.emailVars,
			);

			expect(result).toEqual(false);
		});
	});

	describe('sendVerificationEmail', () => {
		const sendVerificationEmailArgs = {
			email: 'email',
			code: 'code',
		};

		it('should call sendEmail', () => {
			// Si se llama sendEmail ejecuto mi mockImplementation
			jest.spyOn(service, 'sendEmail').mockImplementation(async () => {
				return Promise.resolve(true);
			});

			service.sendVerificationEmail(sendVerificationEmailArgs.email, sendVerificationEmailArgs.code);

			expect(service.sendEmail).toHaveBeenCalledTimes(1);
			expect(service.sendEmail).toHaveBeenCalledWith('Verify your email', 'verify-email', [
				{ key: 'username', value: sendVerificationEmailArgs.email },
				{ key: 'code', value: sendVerificationEmailArgs.code },
			]);
		});
	});
});
