import { Injectable } from '@nestjs/common';
import { CreateDishOutput, CreateDishInput } from './dtos/create-dish.dto';
import { Repository } from 'typeorm';
import { Dish } from './entities/dish.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Restaurant } from './entities/restaurant.entity';
import { DeleteDishInput, DeleteDishOutput } from './dtos/delete-dish.dto';
import { EditDishInput, EditDishOutput } from './dtos/edit-dish.dto';

@Injectable()
export class DishService {
	constructor(
		@InjectRepository(Dish) private readonly dishes: Repository<Dish>,
		@InjectRepository(Restaurant) private readonly restaurants: Repository<Restaurant>,
	) {}

	async createDish(owner: User, createDishInput: CreateDishInput): Promise<CreateDishOutput> {
		try {
			const restaurant = await this.restaurants.findOneBy({ id: createDishInput.restaurantId });

			if (!restaurant) {
				return { ok: false, error: 'Restaurant not found' };
			}

			if (restaurant.ownerId !== owner.id) {
				return { ok: false, error: "You can't create a dish in a resturant that you don't own" };
			}

			await this.dishes.save(this.dishes.create({ ...createDishInput, restaurant }));

			return { ok: true };
		} catch (error) {
			return { ok: false, error: 'Could not create the dish' };
		}
	}

	async editDish(owner: User, editDishInput: EditDishInput): Promise<EditDishOutput> {
		try {
			const dish = await this.dishes.findOne({
				where: {
					id: editDishInput.dishId,
				},
				relations: {
					restaurant: true,
				},
			});

			if (!dish) {
				return { ok: false, error: 'Dish not found' };
			}

			if (dish.restaurant.ownerId !== owner.id) {
				return { ok: false, error: "You can't delte a dish in a resturant that you don't own" };
			}

			const editedDish = {
				id: editDishInput.dishId,
				...editDishInput,
			};

			await this.dishes.save(editedDish);
			return { ok: true };
		} catch (error) {
			return { ok: false, error: 'Could not edit the dish' };
		}
	}

	async deleteDish(owner: User, { dishId }: DeleteDishInput): Promise<DeleteDishOutput> {
		try {
			const dish = await this.dishes.findOne({
				where: {
					id: dishId,
				},
				relations: {
					restaurant: true,
				},
			});

			if (!dish) {
				return { ok: false, error: 'Dish not found' };
			}

			if (dish.restaurant.ownerId !== owner.id) {
				return { ok: false, error: "You can't delte a dish in a resturant that you don't own" };
			}

			await this.dishes.delete(dishId);
			return { ok: true };
		} catch (error) {
			return { ok: false, error: 'Could not delete dish' };
		}
	}
}
