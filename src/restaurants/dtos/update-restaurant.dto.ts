import { Field, InputType, PartialType } from '@nestjs/graphql';
import { CreateRestaurantDto } from './create-restaurant.dto';

@InputType()
// export class UpdateRestaurantInputType extends PartialType(CreateRestaurantDto) {}
export class UpdateRestaurantInputType extends CreateRestaurantDto {}

@InputType()
export class UpdateRestaurantDto {
	@Field(() => Number)
	id: number;

	@Field(() => UpdateRestaurantInputType)
	data: UpdateRestaurantInputType;
}
