import { Field, InputType, ObjectType, PartialType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { CreateDishInput } from './create-dish.dto';

@InputType()
export class EditDishInput extends PartialType(CreateDishInput) {
	@Field(() => Number)
	dishId: number;
}

@ObjectType()
export class EditDishOutput extends CoreOutput {}
