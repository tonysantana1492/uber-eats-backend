import { DynamicModule, Module, Global } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { CONFIG_OPTIONS } from '../common/common.constants';
import { JwtModuleOptions } from './jwt.interfaces';

@Module({})
@Global()
export class JwtModule {
	static forRoot(options: JwtModuleOptions): DynamicModule {
		return {
			module: JwtModule,
			exports: [JwtService],
			providers: [
				{
					provide: CONFIG_OPTIONS,
					useValue: options,
				},
				JwtService,
			],
		};
	}
}
