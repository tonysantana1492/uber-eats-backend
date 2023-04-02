import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Column, Entity, OneToMany } from 'typeorm';
import { IsString, Length } from 'class-validator';
import { CoreEntity } from '../../common/entities/core.entity';
import { Restaurant } from './restaurant.entity';

@InputType('CategoryInputType', { isAbstract: true }) // Uso el InputType para que el DTO pueda extender de esta entidad
@ObjectType() // Esto es para el esquema de GraphQL le dice como lucen los datos, generalment para la respuesta de los queries y las mutations
@Entity() // Esto es para el TypeORM para crear la tabla
export class Category extends CoreEntity {
	@Field(() => String)
	@Column({ unique: true })
	@IsString()
	@Length(5)
	name: string;

	@Field(() => String, { nullable: true })
	@Column({ nullable: true })
	@IsString()
	coverImg: string;

	@Field(() => String)
	@Column({ unique: true })
	@IsString()
	slug: string;

	@Field(() => [Restaurant], { nullable: true })
	@OneToMany(() => Restaurant, restaurant => restaurant.category)
	restaurants: Restaurant[];
}
