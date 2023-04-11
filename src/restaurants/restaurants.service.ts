import { Injectable } from '@nestjs/common';
import { CreateRestaurantInput, CreateRestaurantOutput } from './dtos/create-restaurant.dto';
import { User } from '../users/entities/user.entity';
import { EditRestaurantOutput, EditRestaurantInput } from './dtos/edit-restaurant.dto';
import { CategoryRepository } from './repositories/category.repository';
import { ILike, Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { DeleteRestaurantOutput, DeleteRestaurantInput } from './dtos/delete-restaurant.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import { SearchRestaurantOutput, SearchRestaurantInput } from './dtos/search-restaurant.dto';

@Injectable()
export class RestaurantsService {
	constructor(
		private readonly categories: CategoryRepository,
		@InjectRepository(Restaurant)
		private readonly restaurants: Repository<Restaurant>,
	) {}

	async createRestaurant(owner: User, createRestaurantInput: CreateRestaurantInput): Promise<CreateRestaurantOutput> {
		try {
			const newRestaurant = this.restaurants.create(createRestaurantInput);
			newRestaurant.owner = owner;

			const category = await this.categories.getOrCreate(createRestaurantInput.categoryName);

			newRestaurant.category = category;
			await this.restaurants.save(newRestaurant);

			return { ok: true };
		} catch (error) {
			return { ok: false, error: 'Could not create restaurant' };
		}
	}

	async editRestaurant(owner: User, editRestaurantInput: EditRestaurantInput): Promise<EditRestaurantOutput> {
		try {
			const restaurant = await this.restaurants.findOneBy({ id: editRestaurantInput.restaurantId });

			if (!restaurant) {
				return { ok: false, error: 'Resturant not found' };
			}

			if (owner.id !== restaurant.ownerId) {
				return { ok: false, error: "You can't edit a restaurant that you don't own" };
			}

			let category: Category = null;
			if (editRestaurantInput.categoryName) {
				category = await this.categories.getOrCreate(editRestaurantInput.categoryName);
			}

			const editedRestaurant = {
				id: editRestaurantInput.restaurantId,
				...editRestaurantInput,
				...(category && { category }),
			};

			await this.restaurants.save([editedRestaurant]);

			return { ok: true };
		} catch (error) {
			return { ok: false, error };
		}
	}

	async deleteRestaurant(owner: User, { restaurantId }: DeleteRestaurantInput): Promise<DeleteRestaurantOutput> {
		try {
			const restaurant = await this.restaurants.findOneBy({ id: restaurantId });

			if (!restaurant) {
				return { ok: false, error: 'Restauran not found' };
			}

			if (restaurant.ownerId !== owner.id) {
				return { ok: false, error: "You can't delete a restaurant that don't own" };
			}

			await this.restaurants.delete(restaurantId);

			return { ok: true };
		} catch (error) {
			return { ok: false, error: 'Could not delete restaurant' };
		}
	}

	countRestaurants(category: Category): Promise<number> {
		return this.restaurants.countBy({ category: { id: category.id } });
	}

	async allRestaurants({ page }: RestaurantsInput): Promise<RestaurantsOutput> {
		try {
			const [restaurants, totalResults] = await this.restaurants.findAndCount({
				take: 25,
				skip: (page - 1) * 25,
				order: {
					isPromoted: 'DESC',
				},
			});

			if (!restaurants) {
				return { ok: false, error: 'Restaurants not found' };
			}

			const totalPages = Math.ceil(totalResults / 25);

			return { ok: true, totalPages, totalResults, results: restaurants };
		} catch (error) {
			return { ok: false, error: 'Could not load restaurants' };
		}
	}

	async findRestaurantById({ restaurantId }: RestaurantInput): Promise<RestaurantOutput> {
		try {
			const restaurant = await this.restaurants.findOne({
				where: {
					id: restaurantId,
				},
				relations: {
					menu: true,
				},
			});

			if (!restaurant) {
				return { ok: false, error: 'Restaurant not found' };
			}

			return { ok: true, restaurant };
		} catch (error) {
			return { ok: false, error: 'Could not find restaturant' };
		}
	}

	async searchRestaurantByName({ page, query }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
		try {
			const [restaurants, totalResults] = await this.restaurants.findAndCount({
				where: {
					name: ILike(`%${query}%`),
				},
				take: 25,
				skip: (page - 1) * 25,
			});

			if (!restaurants) {
				return { ok: false, error: 'Restaurant not found' };
			}

			const totalPages = Math.ceil(totalResults / 25);

			return { ok: true, results: restaurants, totalPages, totalResults };
		} catch (error) {
			return { ok: false, error: 'Could not search for restaurants' };
		}
	}
}
