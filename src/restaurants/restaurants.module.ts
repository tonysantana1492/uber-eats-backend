import { Module } from '@nestjs/common';
import { RestaurantResolver } from './restaurants.resolver';
import { RestaurantsService } from './restaurants.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryRepository } from './repositories/category.repository';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryService } from './category.service';
import { CategoryResolver } from './category.resolver';

@Module({
	imports: [TypeOrmModule.forFeature([Restaurant, CategoryRepository])],
	providers: [RestaurantResolver, RestaurantsService, CategoryRepository, CategoryResolver, CategoryService],
})
export class RestaurantsModule {}
