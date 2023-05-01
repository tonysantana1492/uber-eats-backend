import { CoreOutput } from 'src/common/dtos/output.dto';
import { Restaurant } from '../entities/restaurant.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MyRestaurantsOutput extends CoreOutput {
	@Field(() => [Restaurant], { nullable: true })
	restaurants?: Restaurant[];
}
