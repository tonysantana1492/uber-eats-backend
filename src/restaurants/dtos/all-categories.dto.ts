import { CoreOutput } from '../../common/dtos/output.dto';
import { ObjectType, Field } from '@nestjs/graphql';
import { Category } from '../entities/category.entity';

@ObjectType()
export class AllCategoriesOutput extends CoreOutput {
	@Field(() => [Category], { nullable: true })
	categories?: Category[];
}
