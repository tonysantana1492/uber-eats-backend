import { InputType, ObjectType, PickType, Field, Int } from '@nestjs/graphql';

import { Restaurant } from '../entities/restaurant.entity';
import { CoreOutput } from '../../common/dtos/output.dto';

// Puedo pasar InputType como argumento para cambiar el decorador del padre que es ObjectType por este InputType
@InputType()
export class CreateRestaurantInput extends PickType(Restaurant, ['name', 'address', 'coverImg']) {
	@Field(() => String)
	categoryName: string;
}

@ObjectType()
export class CreateRestaurantOutput extends CoreOutput {
	@Field(() => Int)
	restaurantId?: number;
}
