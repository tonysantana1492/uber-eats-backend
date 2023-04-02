import { CoreOutput } from '../../common/dtos/output.dto';
import { ObjectType, Field, InputType } from '@nestjs/graphql';

@InputType()
export class DeleteRestaurantInput {
	@Field(() => Number)
	restaurantId: number;
}

@ObjectType()
export class DeleteRestaurantOutput extends CoreOutput {}
