import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsResolver } from './payments.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { PaymentsController } from './payments.controller';

@Module({
	imports: [TypeOrmModule.forFeature([Payment, Restaurant])],
	controllers: [PaymentsController],
	providers: [PaymentsService, PaymentsResolver],
})
export class PaymentsModule {}
