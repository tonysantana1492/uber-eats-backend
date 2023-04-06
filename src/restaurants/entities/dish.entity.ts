import { Field, ObjectType, InputType, Int } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { CoreEntity } from '../../common/entities/core.entity';
import { Length, IsString, IsNumber } from 'class-validator';
import { Restaurant } from './restaurant.entity';

@InputType('DishChoiceInputType', { isAbstract: true })
@ObjectType()
export class DishChoice {
	@Field(() => String)
	name: string;

	@Field(() => Number, { nullable: true })
	extra?: number;
}

@InputType('DishOptionInputType', { isAbstract: true })
@ObjectType()
export class DishOption {
	@Field(() => String)
	name: string;

	@Field(() => [DishChoice], { nullable: true })
	choices?: DishChoice[];

	@Field(() => Number, { nullable: true })
	extra?: number;
}

@InputType('DishInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Dish extends CoreEntity {
	@Field(() => String)
	@Column()
	@IsString()
	@Length(5)
	name: string;

	@Field(() => Int)
	@Column({ type: 'float4' })
	@IsNumber()
	price: number;

	@Field(() => String, { nullable: true })
	@Column({ nullable: true })
	@IsString()
	photo: string;

	@Field(() => String)
	@Column()
	@IsString()
	@Length(5, 140)
	description: string;

	@Field(() => Restaurant, { nullable: true })
	@ManyToOne(() => Restaurant, restaurant => restaurant.menu, { onDelete: 'CASCADE' })
	restaurant: Restaurant;

	@RelationId((dish: Dish) => dish.restaurant)
	restaurantId: number;

	@Field(() => [DishOption], { nullable: true })
	@Column({ type: 'json', nullable: true })
	options?: DishOption[];
}
