import { Module } from '@nestjs/common';
import { RestaurantResolver } from './restaurants.resolver';
import { RestaurantsService } from './restaurants.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryRepository } from './repositories/category.repository';
import { Restaurant } from './entities/restaurant.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Restaurant, CategoryRepository])],
	providers: [RestaurantResolver, RestaurantsService, CategoryRepository],
})
export class RestaurantsModule {}
