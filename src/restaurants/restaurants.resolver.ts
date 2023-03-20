import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { UpdateRestaurantDto } from './dtos/update-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantsService } from './restaurants.service';

@Resolver(() => Restaurant)
export class RestaurantResolver {
	constructor(private readonly restaurantsService: RestaurantsService) {}

	@Query(() => [Restaurant])
	restaurants(): Promise<Restaurant[]> {
		return this.restaurantsService.getAll();
	}

	@Mutation(() => Boolean)
	async createRestaurant(@Args('input') createRestaurantDto: CreateRestaurantDto): Promise<boolean> {
		try {
			await this.restaurantsService.createRestaurant(createRestaurantDto);
			return true;
		} catch (error) {
			return false;
		}
	}

	@Mutation(() => Boolean)
	async updateRestaurant(@Args('input') updateRestaurantDto: UpdateRestaurantDto): Promise<boolean> {
		try {
			await this.restaurantsService.updateRestaurant(updateRestaurantDto);
			return true;
		} catch (error) {
			return false;
		}
	}
}
