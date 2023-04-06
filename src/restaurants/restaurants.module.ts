import { Module } from '@nestjs/common';
import { RestaurantResolver } from './restaurants.resolver';
import { RestaurantsService } from './restaurants.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryRepository } from './repositories/category.repository';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryService } from './category.service';
import { CategoryResolver } from './category.resolver';
import { Dish } from './entities/dish.entity';
import { DishResolver } from './dish.resolver';
import { DishService } from './dish.service';

@Module({
	imports: [TypeOrmModule.forFeature([Restaurant, CategoryRepository, Dish])],
	providers: [
		RestaurantResolver,
		RestaurantsService,
		CategoryRepository,
		CategoryResolver,
		CategoryService,
		DishResolver,
		DishService,
	],
})
export class RestaurantsModule {}
