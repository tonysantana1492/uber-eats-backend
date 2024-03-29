import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { IsString, Length } from 'class-validator';
import { CoreEntity } from '../../common/entities/core.entity';
import { Category } from './category.entity';
import { User } from '../../users/entities/user.entity';
import { Dish } from './dish.entity';
import { Order } from 'src/orders/entities/order.entity';

// El isAbstract evita que se cree un type RestaurantInputType en el esquema
@InputType('RestaurantInputType', { isAbstract: true }) // Uso el InputType para que un DTO pueda extender de esta entidad
@ObjectType() // Esto es para el esquema de GraphQL le dice como lucen los datos, lo uso en los @Resolver
@Entity() // Esto es para el TypeORM para crear la tabla
export class Restaurant extends CoreEntity {
	@Field(() => String)
	@Column()
	@IsString()
	@Length(5)
	name: string;

	@Field(() => String)
	@Column()
	@IsString()
	coverImg: string;

	@Field(() => String)
	@Column()
	@IsString()
	address: string;

	@Field(() => Category, { nullable: true })
	@ManyToOne(() => Category, category => category.restaurants, { nullable: true, onDelete: 'SET NULL', eager: true }) // Si la categoria es eliminada este campo se pone a null
	category: Category;

	@Field(() => User)
	@ManyToOne(() => User, user => user.restaurants, { onDelete: 'CASCADE' }) // Si el dueño del restaurante es eliminado su restaurante tambien
	owner: User;

	// Para que te cargue el id de usuario ya que por defecto no te lo da en la consulta aunque este en la tabla resturant
	@RelationId((restaurant: Restaurant) => restaurant.owner)
	ownerId: number;

	@Field(() => [Dish], { nullable: true })
	@OneToMany(() => Dish, dish => dish.restaurant)
	menu: Dish[];

	@Field(() => [Order], { nullable: true })
	@OneToMany(() => Order, order => order.restaurant)
	orders: Order[];

	@Field(() => Boolean)
	@Column({ default: false })
	isPromoted: boolean;

	@Field(() => Date)
	@Column({ nullable: true })
	promotedUntil: Date;
}
