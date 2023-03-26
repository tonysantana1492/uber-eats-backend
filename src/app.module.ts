import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { UserModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { JwtModule } from './jwt/jwt.module';
import { JwtMiddleware } from './jwt/jwt.middleware';
import { Verification } from './users/entities/verification.entity';
import { MailModule } from './mail/mail.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: '.env',
			ignoreEnvFile: process.env.NODE_ENV === 'production',
			validationSchema: Joi.object({
				NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
				DB_HOST: Joi.string().required(),
				DB_PORT: Joi.string().required(),
				DB_USERNAME: Joi.string().required(),
				DB_PASSWORD: Joi.string().required(),
				DB_NAME: Joi.string().required(),
				PRIVATE_KEY: Joi.string().required(),
				MAIL_GUN_API_KEY: Joi.string().required(),
				MAIL_GUN_DOMAIN_NAME: Joi.string().required(),
				MAIL_GUN_FROM_MAIL: Joi.string().required(),
			}),
		}),
		GraphQLModule.forRoot<ApolloDriverConfig>({
			driver: ApolloDriver,
			autoSchemaFile: true,
			context: ({ req }) => ({ user: req.user }), // La propiedad definida en el context estra disponible para mis resolvers
		}),
		TypeOrmModule.forRoot({
			type: 'postgres',
			host: process.env.DB_HOST,
			port: +process.env.DB_PORT,
			username: process.env.DB_USERNAME,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_NAME,
			synchronize: process.env.NODE_ENV !== 'production',
			logging: process.env.NODE_ENV !== 'production',
			entities: [User, Verification],
		}),
		JwtModule.forRoot({
			privateKey: process.env.PRIVATE_KEY,
		}),
		UserModule,
		MailModule.forRoot({
			apiKey: process.env.MAIL_GUN_API_KEY,
			domain: process.env.MAIL_GUN_DOMAIN_NAME,
			fromEmail: process.env.MAIL_GUN_FROM_MAIL,
		}),
	],
	controllers: [],
	providers: [],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(JwtMiddleware).forRoutes({
			// aplico el middleware creado  al modulo general y defino a cuales rutas y metodos lo voy a aplicar
			path: '/graphql',
			method: RequestMethod.ALL,
		});
	}
}
