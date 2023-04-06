import { CoreOutput } from '../../common/dtos/output.dto';
import { ObjectType, InputType, PickType, Field } from '@nestjs/graphql';
import { Dish } from '../entities/dish.entity';

@InputType()
export class CreateDishInput extends PickType(Dish, ['name', 'price', 'description', 'options']) {
	@Field(() => Number)
	restaurantId: number;
}

@ObjectType()
export class CreateDishOutput extends CoreOutput {}
