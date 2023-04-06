import { Field, Float, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsNumber } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, RelationId } from 'typeorm';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
	Pending = 'Pending',
	Cooking = 'Cooking',
	Cooked = 'Cooked',
	PickedUp = 'PickedUp',
	Delivered = 'Delivered',
}

// Creo un enum para GraphQL
registerEnumType(OrderStatus, { name: 'OrderStatus' });

@InputType('OrderInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Order extends CoreEntity {
	@Field(() => User, { nullable: true })
	@ManyToOne(() => User, user => user.orders, { onDelete: 'SET NULL', nullable: true, eager: true })
	customer?: User;

	@RelationId((order: Order) => order.customer)
	customerId: number;

	@Field(() => User, { nullable: true })
	@ManyToOne(() => User, user => user.rides, { onDelete: 'SET NULL', nullable: true, eager: true })
	driver?: User;

	@RelationId((order: Order) => order.driver)
	driverId: number;

	@Field(() => Restaurant, { nullable: true })
	@ManyToOne(() => Restaurant, restaurant => restaurant.orders, { onDelete: 'SET NULL', nullable: true, eager: true })
	restaurant?: Restaurant;

	@Field(() => [OrderItem])
	@ManyToMany(() => OrderItem, { eager: true })
	@JoinTable() // Se pone en el owning side (es el lado desde el cual deseo adquirir los otros datos), por ejemplo cuando listo una order quiero obtener cuantos platos tiene
	items: OrderItem[];

	@Field(() => Float, { nullable: true })
	@Column({ type: 'float4', nullable: true })
	@IsNumber()
	total?: number;

	@Field(() => OrderStatus)
	@Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.Pending })
	@IsEnum(OrderStatus)
	status: OrderStatus;
}
