import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';

@Module({
	imports: [],
	controllers: [],
	providers: [],
})
export class AppModule {}

// export class AppModule implements NestModule {
// 	configure(consumer: MiddlewareConsumer) {
// 		consumer.apply(JwtMiddleware).forRoutes({
// 			// aplico el middleware creado  al modulo general y defino a cuales rutas y metodos lo voy a aplicar
// 			path: '/graphql',
// 			method: RequestMethod.ALL,
// 		});
// 	}
// }
