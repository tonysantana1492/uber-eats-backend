import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { User } from '../entities/user.entity';
import { CoreOutput } from '../../common/dtos/output.dto';

@ArgsType()
export class UserProfileInput {
	@Field(() => Number)
	userId: number;
}

@ObjectType()
export class UserProfileOutput extends CoreOutput {
	@Field(() => User, { nullable: true })
	user?: User;
}
