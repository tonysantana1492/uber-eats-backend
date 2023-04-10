import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { UserModule } from 'src/users/users.module';

@Module({
	imports: [UserModule],
	providers: [
		{
			provide: APP_GUARD, // Aplico AuthGuard a toda la aplicacion
			useClass: AuthGuard,
		},
	],
})
export class AuthModule {}
