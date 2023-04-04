import { InputType, ObjectType, Field } from '@nestjs/graphql';
import { PaginationOutput, PaginationInput } from '../../common/dtos/pagination.dto';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class RestaurantsInput extends PaginationInput {}

@ObjectType()
export class RestaurantsOutput extends PaginationOutput {
	@Field(() => [Restaurant], { nullable: true })
	results?: Restaurant[];
}
