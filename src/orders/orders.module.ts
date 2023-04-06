import { Module } from '@nestjs/common';
import { OrderService } from './orders.service';
import { OrderResolver } from './orders.resolvers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { OrderItem } from './entities/order-item.entity';
import { Dish } from '../restaurants/entities/dish.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Order, Restaurant, OrderItem, Dish])],
	providers: [OrderService, OrderResolver],
})
export class OrdersModule {}
