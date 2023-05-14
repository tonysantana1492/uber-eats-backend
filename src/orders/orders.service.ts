import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { Repository } from 'typeorm';
import { CreateOrderOutput, CreateOrderInput } from './dtos/create-order.dto';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { OrderItem } from './entities/order-item.entity';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';
import { EditOrderOutput, EditOrderInput } from './dtos/edit-order.dto';
import { NEW_COOKED_ORDER, NEW_ORDER_UPDATE, NEW_PENDING_ORDER, PUB_SUB } from 'src/common/common.constants';
import { PubSub } from 'graphql-subscriptions';
import { TakeOrderInput, TakeOrderOutput } from './dtos/take-order.dto';

@Injectable()
export class OrderService {
	constructor(
		@InjectRepository(Order) private readonly orders: Repository<Order>,
		@InjectRepository(Restaurant) private readonly restaurants: Repository<Restaurant>,
		@InjectRepository(OrderItem) private readonly orderItems: Repository<OrderItem>,
		@InjectRepository(Dish) private readonly dishes: Repository<Dish>,
		@Inject(PUB_SUB) private readonly pubSub: PubSub,
	) {}

	async createOrder(customer: User, createOrderInput: CreateOrderInput): Promise<CreateOrderOutput> {
		try {
			const restaurant = await this.restaurants.findOneBy({ id: createOrderInput.restaurantId });

			if (!restaurant) {
				return { ok: false, error: 'Restaurant not found' };
			}

			let orderFinalPrice = 0;
			const orderItems: OrderItem[] = [];

			// creo cada order items
			for (const item of createOrderInput.items) {
				const dish = await this.dishes.findOneBy({ id: item.dishId });

				if (!dish) {
					return { ok: false, error: 'Dish not found' };
				}

				let dishFinalPrice = dish.price;

				// verifico que cada itemOption exista realmente en el ese dish
				for (const itemOption of item.options) {
					const dishOption = dish.options.find(dishOption => dishOption.name === itemOption.name);

					if (dishOption) {
						if (dishOption.extra) {
							dishFinalPrice += dishOption.extra;
						} else {
							const dishOptionChoice = dishOption.choices?.find(
								optionChoice => optionChoice.name === itemOption.choice,
							);

							if (dishOptionChoice) {
								if (dishOptionChoice.extra) {
									dishFinalPrice += dishOptionChoice.extra;
								}
							}
						}
					} else {
						return { ok: false, error: 'Dish option not found' };
					}
				}

				orderFinalPrice += dishFinalPrice;

				const orderItem = await this.orderItems.save(
					this.orderItems.create({
						dish,
						options: item.options,
					}),
				);

				orderItems.push(orderItem);
			}

			const order = await this.orders.save(
				this.orders.create({
					customer,
					restaurant,
					total: orderFinalPrice,
					items: orderItems,
				}),
			);

			await this.pubSub.publish(NEW_PENDING_ORDER, { pendingOrders: { order, ownerId: restaurant.ownerId } });

			return { ok: true, orderId: order.id };
		} catch (error) {
			return { ok: false, error: 'Could not create order' };
		}
	}

	async getOrders(user: User, { status }: GetOrdersInput): Promise<GetOrdersOutput> {
		try {
			let orders: Order[] = [];

			if (user.role === UserRole.Client) {
				orders = await this.orders.find({
					where: {
						customer: {
							id: user.id,
						},
						...(status && { status }),
					},
				});
			} else if (user.role === UserRole.Delivery) {
				orders = await this.orders.find({
					where: {
						driver: {
							id: user.id,
						},
						...(status && { status }),
					},
				});
			} else if (user.role === UserRole.Owner) {
				const restaurants = await this.restaurants.find({
					where: {
						owner: {
							id: user.id,
						},
					},
					relations: {
						orders: true,
					},
				});

				orders = restaurants.map(restaurant => restaurant.orders).flat();

				if (status) {
					orders = orders.filter(order => order.status === status);
				}
			}

			return { ok: true, orders };
		} catch (error) {
			return { ok: false, error: 'Colud not load orders' };
		}
	}

	canSeeOrder(user: User, order: Order): boolean {
		let canSee = true;

		if (user.role === UserRole.Client && order.customerId !== user.id) {
			canSee = false;
		}

		if (user.role === UserRole.Delivery && order.driverId !== user.id) {
			canSee = false;
		}

		if (user.role === UserRole.Owner && order.restaurant.ownerId !== user.id) {
			canSee = false;
		}

		return canSee;
	}

	async getOrder(user: User, { orderId }: GetOrderInput): Promise<GetOrderOutput> {
		try {
			const order = await this.orders.findOne({
				where: {
					id: orderId,
				},
				relations: {
					restaurant: true,
				},
			});

			if (!order) {
				return { ok: false, error: 'Order not found' };
			}

			const canSeeOrder = this.canSeeOrder(user, order);

			if (!canSeeOrder) {
				return { ok: false, error: "You can't see that" };
			}

			return { ok: true, order };
		} catch (error) {
			return { ok: false, error: 'Could not load order' };
		}
	}

	async editOrder(user: User, { id: orderId, status }: EditOrderInput): Promise<EditOrderOutput> {
		try {
			const order = await this.orders.findOne({
				where: {
					id: orderId,
				},
				relations: {
					restaurant: true,
				},
			});

			if (!order) {
				return { ok: true, error: 'Order not found' };
			}

			const canSeeOrder = this.canSeeOrder(user, order);

			if (!canSeeOrder) {
				return { ok: false, error: "You can't see that" };
			}

			let canEdit = true;

			if (user.role === UserRole.Client) {
				canEdit = false;
			}

			if (user.role === UserRole.Owner) {
				if (status !== OrderStatus.Cooking && status !== OrderStatus.Cooked) {
					canEdit = false;
				}
			}

			if (user.role === UserRole.Delivery) {
				if (status !== OrderStatus.PickedUp && status !== OrderStatus.Delivered) {
					canEdit = false;
				}
			}

			if (!canEdit) {
				return { ok: false, error: "You can't do that" };
			}

			const updatedOrder = await this.orders.save({ ...order, status });

			if (user.role === UserRole.Owner) {
				if (status === OrderStatus.Cooked) {
					// Avisa a los deliveries
					await this.pubSub.publish(NEW_COOKED_ORDER, { cookedOrders: updatedOrder });
				}
			}

			// Avisa a todo el mundo
			await this.pubSub.publish(NEW_ORDER_UPDATE, { orderUpdates: updatedOrder });

			return { ok: true };
		} catch (error) {
			return { ok: false, error: 'Could not edit order' };
		}
	}

	async takeOrder(driver: User, takeOrderInput: TakeOrderInput): Promise<TakeOrderOutput> {
		try {
			const order = await this.orders.findOne({ where: { id: takeOrderInput.id } });

			if (!order) return { ok: false, error: 'Order not found' };

			if (order.driver) {
				return { ok: false, error: 'This order already has a driver' };
			}

			const updatedOrder = await this.orders.save({ ...order, driver });

			await this.pubSub.publish(NEW_ORDER_UPDATE, { orderUpdates: updatedOrder });

			return { ok: true };
		} catch (error) {
			return { ok: true, error: 'Could not update order' };
		}
	}
}
