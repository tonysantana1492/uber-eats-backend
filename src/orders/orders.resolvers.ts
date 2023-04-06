import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Order } from './entities/order.entity';
import { OrderService } from './orders.service';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/auth/role.decorator';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { GetOrderOutput, GetOrderInput } from './dtos/get-order.dto';
import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';

@Resolver(() => Order)
export class OrderResolver {
	constructor(private readonly orderService: OrderService) {}

	@Mutation(() => CreateOrderOutput)
	@Role(['Client'])
	createOrder(
		@AuthUser() customer: User,
		@Args('input') createOrderInput: CreateOrderInput,
	): Promise<CreateOrderOutput> {
		return this.orderService.createOrder(customer, createOrderInput);
	}

	@Query(() => GetOrdersOutput)
	@Role(['Any'])
	getOrders(@AuthUser() user: User, @Args('input') getOrdersInput: GetOrdersInput): Promise<GetOrdersOutput> {
		return this.orderService.getOrders(user, getOrdersInput);
	}

	@Query(() => GetOrderOutput)
	@Role(['Any'])
	getOrder(@AuthUser() user: User, @Args('input') getOrderInput: GetOrderInput): Promise<GetOrderOutput> {
		return this.orderService.getOrder(user, getOrderInput);
	}

	@Mutation(() => EditOrderOutput)
	@Role(['Any'])
	editOrder(@AuthUser() user: User, @Args('input') editOrderInput: EditOrderInput): Promise<EditOrderOutput> {
		return this.orderService.editOrder(user, editOrderInput);
	}
}
