import { Dish } from './entities/dish.entity';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { RestaurantsService } from './restaurants.service';
import { CreateDishOutput, CreateDishInput } from './dtos/create-dish.dto';
import { DishService } from './dish.service';
import { Role } from '../auth/role.decorator';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { User } from '../users/entities/user.entity';
import { DeleteDishInput, DeleteDishOutput } from './dtos/delete-dish.dto';
import { EditDishInput, EditDishOutput } from './dtos/edit-dish.dto';

@Resolver(() => Dish)
export class DishResolver {
	constructor(private readonly restaurantsService: RestaurantsService, private readonly dishService: DishService) {}

	@Mutation(() => CreateDishOutput)
	@Role(['Owner'])
	createDish(@AuthUser() owner: User, @Args('input') createDishInput: CreateDishInput): Promise<CreateDishOutput> {
		return this.dishService.createDish(owner, createDishInput);
	}

	@Mutation(() => DeleteDishOutput)
	@Role(['Owner'])
	editDish(@AuthUser() owner: User, @Args('input') editDishInput: EditDishInput): Promise<EditDishOutput> {
		return this.dishService.editDish(owner, editDishInput);
	}

	@Mutation(() => DeleteDishOutput)
	@Role(['Owner'])
	deleteDish(@AuthUser() owner: User, @Args('input') deleteDishInput: DeleteDishInput): Promise<DeleteDishOutput> {
		return this.dishService.deleteDish(owner, deleteDishInput);
	}
}
