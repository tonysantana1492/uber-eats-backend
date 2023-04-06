import { Injectable } from '@nestjs/common';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { CategoryRepository } from './repositories/category.repository';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import { Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { RestaurantsService } from './restaurants.service';

@Injectable()
export class CategoryService {
	constructor(
		private readonly categories: CategoryRepository,
		@InjectRepository(Restaurant) private readonly restaurants: Repository<Restaurant>,
		private readonly restaurantsService: RestaurantsService,
	) {}

	async allCategories(): Promise<AllCategoriesOutput> {
		try {
			const categories = await this.categories.find();

			return { ok: true, categories };
		} catch (error) {
			return { ok: false, error: 'Could not load categories' };
		}
	}

	async findCategoryBySlug({ slug, page }: CategoryInput): Promise<CategoryOutput> {
		try {
			const category = await this.categories.findOneBy({ slug });

			if (!category) {
				return { ok: false, error: 'Category not found' };
			}

			// Quiero paginar los restaurantes que obtengo de la relacion de categorias
			const restaurants = await this.restaurants.find({
				where: {
					category: {
						id: category.id,
					},
				},
				take: 25,
				skip: (page - 1) * 25,
			});

			category.restaurants = restaurants;

			const totalResults = await this.restaurantsService.countRestaurants(category);
			const totalPages = Math.ceil(totalResults / 25);

			return { ok: true, category, totalPages };
		} catch (error) {
			return { ok: false, error: 'Could not load category' };
		}
	}
}
