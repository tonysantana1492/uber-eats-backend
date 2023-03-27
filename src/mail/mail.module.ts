import { Module, DynamicModule, Global } from '@nestjs/common';
import { CONFIG_OPTIONS } from '../common/common.constants';
import { MailModuleOptions } from './mail.interfaces';
import { HttpModule } from '@nestjs/axios';
import { MailService } from './mail.service';

@Module({})
@Global()
export class MailModule {
	static forRoot(options: MailModuleOptions): DynamicModule {
		return {
			imports: [HttpModule],
			module: MailModule,
			exports: [MailService],
			providers: [
				{
					provide: CONFIG_OPTIONS,
					useValue: options,
				},
				MailService,
			],
		};
	}
}
