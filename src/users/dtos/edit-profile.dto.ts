import { User } from '../entities/user.entity';
import { ObjectType, PickType, InputType, PartialType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@ObjectType()
export class EditProfileOutput extends CoreOutput {}

// Uso el PartialType pq quiero q el email y el password sean opcional, a veces solo deseo editar el email o solo el password
@InputType()
export class EditProfileInput extends PartialType(PickType(User, ['email', 'password'])) {}
