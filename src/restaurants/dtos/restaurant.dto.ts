import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from '../../common/dtos/output.dto';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class RestaurantInput {
	@Field(() => Number)
	restaurantId: number;
}

@ObjectType()
export class RestaurantOutput extends CoreOutput {
	@Field(() => Restaurant, { nullable: true })
	restaurant?: Restaurant;
}
