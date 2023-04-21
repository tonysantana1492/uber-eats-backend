import { Field, ObjectType, InputType } from '@nestjs/graphql';
import { Category } from '../entities/category.entity';
import { PaginationOutput, PaginationInput } from '../../common/dtos/pagination.dto';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class CategoryInput extends PaginationInput {
	@Field(() => String)
	slug: string;
}

@ObjectType()
export class CategoryOutput extends PaginationOutput {
	@Field(() => [Restaurant], { nullable: true })
	restaurants?: Restaurant[];

	@Field(() => Category, { nullable: true })
	category?: Category;
}
