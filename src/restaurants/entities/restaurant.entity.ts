import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsString, IsBoolean, Length, IsOptional } from 'class-validator';

@InputType({ isAbstract: true }) // Uso el InputType para que el DTO pueda extender de esta entidad
@ObjectType() // Esto es para el esquema de GraphQL le dice como lucen los datos, generalment para la respuesta de los queries y las mutations
@Entity() // Esto es para el TypeORM para crear la tabla
export class Restaurant {
	@Field(() => Number)
	@PrimaryGeneratedColumn()
	id: number;

	@Field(() => String)
	@Column()
	@IsString()
	@Length(5)
	name: string;

	@Field(() => Boolean, { nullable: true })
	@Column({ default: true })
	@IsBoolean()
	@IsOptional()
	isVegan: boolean;

	@Field(() => String, { defaultValue: 'New York' })
	@Column()
	@IsString()
	address: string;
}
