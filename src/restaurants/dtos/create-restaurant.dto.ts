import { InputType, OmitType } from '@nestjs/graphql';

import { Restaurant } from '../entities/restaurant.entity';

@InputType()
// Puedo pasar InputType como argumento para cambiar el decorador del padre que es ObjectType por este InputType
export class CreateRestaurantDto extends OmitType(Restaurant, ['id']) {}
