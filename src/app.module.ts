import { Module } from '@nestjs/common';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { UserModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { JwtModule } from './jwt/jwt.module';
import { Verification } from './users/entities/verification.entity';
import { MailModule } from './mail/mail.module';
import { Restaurant } from './restaurants/entities/restaurant.entity';
import { Category } from './restaurants/entities/category.entity';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { AuthModule } from './auth/auth.module';
import { Dish } from './restaurants/entities/dish.entity';
import { OrdersModule } from './orders/orders.module';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { CommonModule } from './common/common.module';
import { PaymentsModule } from './payments/payments.module';
import { Payment } from './payments/entities/payment.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { UploadsModule } from './uploads/uploads.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
			ignoreEnvFile: process.env.NODE_ENV === 'production',
			validationSchema: Joi.object({
				NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
				APP_URL: Joi.string().required(),
				APP_PORT: Joi.string().required(),
				DB_HOST: Joi.string().required(),
				DB_PORT: Joi.string().required(),
				DB_USERNAME: Joi.string().required(),
				DB_PASSWORD: Joi.string().required(),
				DB_NAME: Joi.string().required(),
				PRIVATE_KEY: Joi.string().required(),
				MAIL_GUN_API_KEY: Joi.string().required(),
				MAIL_GUN_DOMAIN_NAME: Joi.string().required(),
				MAIL_GUN_FROM_MAIL: Joi.string().required(),
				AWS_KEY: Joi.string().required(),
				AWS_SECRET: Joi.string().required(),
				BUCKET_NAME: Joi.string().required(),
			}),
		}),
		GraphQLModule.forRoot<ApolloDriverConfig>({
			driver: ApolloDriver,
			autoSchemaFile: true,
			// Esto se dispara luego de los middlewares y antes que los guards
			// Es lo que Graphql inserta en su contexto cuando recibe un peticion http/https
			context: ({ req }) => ({ headers: req.headers }),
			// Es lo que Graphql inserta en su contexto cuando recibe un peticion ws para usar luego en AuthGuard por ejemplo
			subscriptions: {
				// Activa websocket en nuestro servidor
				'subscriptions-transport-ws': {
					onConnect: connectionParams => {
						const connectionParamsToLowerCase = Object.fromEntries(
							Object.entries(connectionParams).map(([key, value]) => [key.toLocaleLowerCase(), value]),
						);
						return { headers: connectionParamsToLowerCase };
					},
				},
			},
		}),
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '..', 'public'),
		}),
		TypeOrmModule.forRoot({
			type: 'postgres',
			host: process.env.DB_HOST,
			port: +process.env.DB_PORT,
			username: process.env.DB_USERNAME,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_NAME,
			synchronize: process.env.NODE_ENV !== 'production',
			// logging: process.env.NODE_ENV === 'development',
			logging: false,
			entities: [User, Verification, Restaurant, Category, Dish, Order, OrderItem, Payment],
		}),
		JwtModule.forRoot({
			privateKey: process.env.PRIVATE_KEY,
		}),
		MailModule.forRoot({
			apiKey: process.env.MAIL_GUN_API_KEY,
			domain: process.env.MAIL_GUN_DOMAIN_NAME,
			fromEmail: process.env.MAIL_GUN_FROM_MAIL,
		}),
		ScheduleModule.forRoot(),
		CommonModule,
		AuthModule,
		UserModule,
		RestaurantsModule,
		OrdersModule,
		PaymentsModule,
		UploadsModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
