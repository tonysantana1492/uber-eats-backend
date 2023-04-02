import { Field, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Entity, Column, BeforeInsert, BeforeUpdate, OneToMany } from 'typeorm';
import { IsBoolean, IsEmail, IsEnum, IsString } from 'class-validator';
import { CoreEntity } from '../../common/entities/core.entity';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';

// El enum me mapeara en mi base de datos estos roles como [0, 1, 2]
export enum UserRole {
	Client = 'Client',
	Owner = 'Owner',
	Delivery = 'Delivery',
}

// Creo un enum para GraphQL
registerEnumType(UserRole, { name: 'UserRole' });

@InputType('UserInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
	@Field(() => String)
	@Column({ unique: true })
	@IsEmail()
	email: string;

	@Field(() => String)
	@Column({ select: false })
	@IsString()
	password: string;

	// Este UserRole que le defino al @Field de GrapQL es el que cree con registerEnumType
	@Field(() => UserRole)
	@Column({ type: 'enum', enum: UserRole })
	@IsEnum(UserRole)
	role: UserRole;

	@Field(() => Boolean)
	@Column({ default: false })
	@IsBoolean()
	verified: boolean;

	@Field(() => [Restaurant])
	@OneToMany(() => Restaurant, restaurant => restaurant.owner)
	restaurants: Restaurant[];

	@BeforeInsert()
	@BeforeUpdate()
	async hashPassword(): Promise<void> {
		// Si existe un password en el objeto que estoy salvando entonces es que hago el hash
		if (this.password) {
			try {
				this.password = await bcrypt.hash(this.password, 10);
			} catch (error) {
				throw new InternalServerErrorException();
			}
		}
	}

	async checkPassword(aPassword: string): Promise<boolean> {
		try {
			return await bcrypt.compare(aPassword, this.password);
		} catch (error) {
			throw new InternalServerErrorException();
		}
	}
}
