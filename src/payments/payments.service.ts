import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { LessThan, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { CreatePaymentInput, CreatePaymentOutput } from './dtos/create-payment';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { GetPaymentOutput } from './dtos/get-payments';
import { Interval } from '@nestjs/schedule';

@Injectable()
export class PaymentsService {
	constructor(
		@InjectRepository(Payment) private readonly payments: Repository<Payment>,
		@InjectRepository(Restaurant) private readonly restaurants: Repository<Restaurant>,
	) {}

	async createPayment(
		owner: User,
		{ transactionId, restaurantId }: CreatePaymentInput,
	): Promise<CreatePaymentOutput> {
		try {
			const restaurant = await this.restaurants.findOneBy({ id: restaurantId });

			if (!restaurant) return { ok: false, error: 'Restaurant not found' };

			if (restaurant.ownerId !== owner.id) return { ok: false, error: 'You are not allowed to do this' };

			await this.payments.save(
				this.payments.create({
					transactionId,
					user: owner,
					restaurant,
				}),
			);

			const datePromotedUntil = new Date();
			datePromotedUntil.setDate(datePromotedUntil.getDate() + 7);

			restaurant.isPromoted = true;
			restaurant.promotedUntil = datePromotedUntil;

			await this.restaurants.save(restaurant);

			return { ok: true };
		} catch (error) {
			return { ok: true, error: 'Could not create payment' };
		}
	}

	async getPayments(owner: User): Promise<GetPaymentOutput> {
		try {
			const payments = await this.payments.find({
				where: {
					user: {
						id: owner.id,
					},
				},
			});

			return { ok: true, payments };
		} catch (error) {
			return { ok: false, error: 'Could not load payments' };
		}
	}

	@Interval(20000)
	async checkPromotedRestaurants() {
		const restaurants = await this.restaurants.find({
			where: {
				isPromoted: true,
				promotedUntil: LessThan(new Date()),
			},
		});

		const restaurantsRemovePromoted = restaurants.map(restaurant => {
			restaurant.isPromoted = false;
			restaurant.promotedUntil = null;

			return restaurant;
		});

		await this.restaurants.save(restaurantsRemovePromoted);
	}
}
