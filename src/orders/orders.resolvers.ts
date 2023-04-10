import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { Order } from './entities/order.entity';
import { OrderService } from './orders.service';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/auth/role.decorator';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { GetOrderOutput, GetOrderInput } from './dtos/get-order.dto';
import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';
import { NEW_COOKED_ORDER, NEW_PENDING_ORDER, PUB_SUB } from 'src/common/common.constants';
import { Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { OrderUpdatesInput } from './dtos/order-updates.dto';
import { NEW_ORDER_UPDATE } from '../common/common.constants';
import { TakeOrderInput, TakeOrderOutput } from './dtos/take-order.dto';

@Resolver(() => Order)
export class OrderResolver {
	constructor(private readonly orderService: OrderService, @Inject(PUB_SUB) private readonly pubSub: PubSub) {}

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

	@Subscription(() => Order, {
		// payload: payload de un publish de esta subscripcion
		// variables: variables definidas como argumentos de esta subcripcion
		// context: context de Graphql
		filter: (payload, _, context) => {
			const { user } = context;
			const { ownerId } = payload.pendingOrders;

			return ownerId === user.id;
		},
		// Transforma la respuesta de este subscription que le llega de un publish
		resolve: payload => {
			const { order } = payload.pendingOrders;

			return order;
		},
	})
	@Role(['Owner'])
	pendingOrders() {
		return this.pubSub.asyncIterator(NEW_PENDING_ORDER);
	}

	@Subscription(() => Order)
	@Role(['Delivery'])
	cookedOrders() {
		return this.pubSub.asyncIterator(NEW_COOKED_ORDER);
	}

	@Subscription(() => Order, {
		filter: (
			{ orderUpdates: order }: { orderUpdates: Order },
			{ input }: { input: OrderUpdatesInput },
			{ user }: { user: User },
		) => {
			// La orden puede ser vista por el repartidor, el dueño del restaurante o el cliente q la solicitó
			if (order.driverId !== user.id && order.customerId !== user.id && order.restaurant.ownerId !== user.id) {
				return false;
			}

			return order.id === input.id;
		},
	})
	@Role(['Any'])
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	orderUpdates(@Args('input') _orderUpdatesInput: OrderUpdatesInput) {
		return this.pubSub.asyncIterator(NEW_ORDER_UPDATE);
	}

	@Mutation(() => TakeOrderOutput)
	@Role(['Delivery'])
	takeOrder(@AuthUser() driver: User, @Args('input') takeOrderInput: TakeOrderInput): Promise<TakeOrderOutput> {
		return this.orderService.takeOrder(driver, takeOrderInput);
	}
}
