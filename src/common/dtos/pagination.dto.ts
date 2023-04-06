import { CoreOutput } from './output.dto';
import { ObjectType, InputType, Field } from '@nestjs/graphql';

@InputType()
export class PaginationInput {
	@Field(() => Number, { defaultValue: 1 })
	page: number;
}

@ObjectType()
export class PaginationOutput extends CoreOutput {
	@Field(() => Number, { nullable: true })
	totalPages?: number;

	@Field(() => Number, { nullable: true })
	totalResults?: number;
}
