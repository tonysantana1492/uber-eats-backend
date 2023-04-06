import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Restaurant } from '../entities/restaurant.entity';
import { PaginationOutput, PaginationInput } from '../../common/dtos/pagination.dto';

@InputType()
export class SearchRestaurantInput extends PaginationInput {
	@Field(() => String)
	query: string;
}

@ObjectType()
export class SearchRestaurantOutput extends PaginationOutput {
	@Field(() => [Restaurant], { nullable: true })
	results?: Restaurant[];
}
