import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { CreateRestaurantInput, CreateRestaurantOutput } from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantsService } from './restaurants.service';
import { User, UserRole } from '../users/entities/user.entity';
import { Role } from '../auth/role.decorator';
import { EditRestaurantOutput, EditRestaurantInput } from './dtos/edit-restaurant.dto';
import { DeleteRestaurantOutput, DeleteRestaurantInput } from './dtos/delete-restaurant.dto';
import { RestaurantsOutput, RestaurantsInput } from './dtos/restaurants.dto';
import { RestaurantOutput, RestaurantInput } from './dtos/restaurant.dto';
import { SearchRestaurantOutput, SearchRestaurantInput } from './dtos/search-restaurant.dto';
import { MyRestaurantsOutput } from './dtos/my-restaurants.dto';
import { MyRestaurantInput, MyRestaurantOutput } from './dtos/my-restaurant.dto';

@Resolver(() => Restaurant)
export class RestaurantResolver {
	constructor(private readonly restaurantsService: RestaurantsService) {}

	@Mutation(() => CreateRestaurantOutput)
	@Role([UserRole.Owner])
	createRestaurant(
		@AuthUser() authUser: User,
		@Args('input') createRestaurantInput: CreateRestaurantInput,
	): Promise<CreateRestaurantOutput> {
		return this.restaurantsService.createRestaurant(authUser, createRestaurantInput);
	}

	@Query(() => MyRestaurantsOutput)
	@Role([UserRole.Owner])
	myRestaurants(@AuthUser() owner: User): Promise<MyRestaurantsOutput> {
		return this.restaurantsService.myRestaurants(owner);
	}

	@Query(() => MyRestaurantOutput)
	@Role([UserRole.Owner])
	myRestaurant(
		@AuthUser() owner: User,
		@Args('input') myRestaurantInput: MyRestaurantInput,
	): Promise<MyRestaurantsOutput> {
		return this.restaurantsService.myRestaurant(owner, myRestaurantInput);
	}

	@Mutation(() => EditRestaurantOutput)
	@Role([UserRole.Owner])
	editRestaurant(
		@AuthUser() owner: User,
		@Args('input') editRestaurantInputType: EditRestaurantInput,
	): Promise<EditRestaurantOutput> {
		return this.restaurantsService.editRestaurant(owner, editRestaurantInputType);
	}

	@Mutation(() => DeleteRestaurantOutput)
	@Role([UserRole.Owner])
	deleteRestaurant(
		@AuthUser() owner: User,
		@Args('input') deleteRestaurantInput: DeleteRestaurantInput,
	): Promise<DeleteRestaurantOutput> {
		return this.restaurantsService.deleteRestaurant(owner, deleteRestaurantInput);
	}

	@Query(() => RestaurantsOutput)
	restaurants(@Args('input') restaurantsInput: RestaurantsInput): Promise<RestaurantsOutput> {
		return this.restaurantsService.allRestaurants(restaurantsInput);
	}

	@Query(() => RestaurantOutput)
	restaurant(@Args('input') restaurantInput: RestaurantInput): Promise<RestaurantOutput> {
		return this.restaurantsService.findRestaurantById(restaurantInput);
	}

	@Query(() => SearchRestaurantOutput)
	searchRestaurant(@Args('input') searchRestaurantInput: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
		return this.restaurantsService.searchRestaurantByName(searchRestaurantInput);
	}
}
