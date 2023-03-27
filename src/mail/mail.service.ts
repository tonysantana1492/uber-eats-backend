import * as FormData from 'form-data';
import { Inject, Injectable } from '@nestjs/common';
import { MailModuleOptions, EmailVar } from './mail.interfaces';
import { CONFIG_OPTIONS } from '../common/common.constants';
import { HttpService } from '@nestjs/axios/dist';

@Injectable()
export class MailService {
	constructor(
		@Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
		private readonly httpService: HttpService,
	) {}

	async sendEmail(subject: string, template: string, emailVars: EmailVar[]): Promise<boolean> {
		// Para crear multipart/form-data
		const form = new FormData();
		form.append('from', `Tony from Nuber Eats <mailgun@${this.options.domain}>`);
		form.append('to', `tonysantana1492@gmail.com`);
		form.append('subject', subject);
		form.append('template', template);
		emailVars.forEach(({ key, value }) => form.append(`v:${key}`, value));

		try {
			await this.httpService.post(`https://api.mailgun.net/v3/${this.options.domain}/messages`, {
				headers: {
					Authorization: `Basic ${Buffer.from(`api:${this.options.apiKey}`).toString('base64')}`,
				},
				body: form,
			});
			return true;
		} catch (error) {
			return false;
		}
	}

	async sendVerificationEmail(email: string, code: string): Promise<any> {
		this.sendEmail('Verify your email', 'verify-email', [
			{ key: 'username', value: email },
			{ key: 'code', value: code },
		]);
	}
}
