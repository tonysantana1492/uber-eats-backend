import { Category } from './entities/category.entity';
import { Resolver, Query, ResolveField, Parent, Args } from '@nestjs/graphql';
import { CategoryService } from './category.service';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { RestaurantsService } from './restaurants.service';
import { CategoryOutput, CategoryInput } from './dtos/category.dto';

@Resolver(() => Category)
export class CategoryResolver {
	constructor(
		private readonly categoryService: CategoryService,
		private readonly restaurantsService: RestaurantsService,
	) {}

	// restaurantCount es un campo calculado que sera devuelto con cada peticion
	// @Parent se refiere a cada record de categoria para acceder a sus datos
	// Para ver quien es el padre me fijo en el esquema grahpql cual type contiene a la propiedad calculada y ese es
	@ResolveField(() => Number)
	restaurantCount(@Parent() category: Category): Promise<number> {
		return this.restaurantsService.countRestaurants(category);
	}

	@Query(() => AllCategoriesOutput)
	allCategories(): Promise<AllCategoriesOutput> {
		return this.categoryService.allCategories();
	}

	@Query(() => CategoryOutput)
	category(@Args('input') categoryInput: CategoryInput): Promise<CategoryOutput> {
		return this.categoryService.findCategoryBySlug(categoryInput);
	}
}
