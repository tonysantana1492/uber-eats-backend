import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { CreateRestaurantInput, CreateRestaurantOutput } from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantsService } from './restaurants.service';
import { User, UserRole } from '../users/entities/user.entity';
import { Role } from '../auth/role.decorator';
import { EditRestaurantOutput, EditRestaurantInput } from './dtos/edit-restaurant.dto';
import { DeleteRestaurantOutput, DeleteRestaurantInput } from './dtos/delete-restaurant.dto';

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
}
