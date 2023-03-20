import { Module } from '@nestjs/common';
import { RestaurantResolver } from './restaurants.resolver';
import { RestaurantsService } from './restaurants.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Restaurant])],
	providers: [RestaurantResolver, RestaurantsService],
})
export class RestaurantsModule {}