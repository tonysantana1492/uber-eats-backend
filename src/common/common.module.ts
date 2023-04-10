import { Global, Module } from '@nestjs/common';
import { PUB_SUB } from './common.constants';
import { PubSub } from 'graphql-subscriptions';

// TODO: Si deseo tener varias instancias de mi servidor, esto no funcionará ya que pubSub debe ser unico para todas esas instancias
// TODO: Tengo que crear entonces un pubsub implementation con redis.
const pubSub = new PubSub();

@Global()
@Module({
	providers: [
		{
			provide: PUB_SUB,
			useValue: pubSub,
		},
	],
	exports: [PUB_SUB],
})
export class CommonModule {}
