import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Payment } from './entities/payment.entity';
import { PaymentsService } from './payments.service';
import { CreatePaymentInput, CreatePaymentOutput } from './dtos/create-payment';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/auth/role.decorator';
import { GetPaymentOutput } from './dtos/get-payments';

@Resolver(() => Payment)
export class PaymentsResolver {
	constructor(private readonly paymentsService: PaymentsService) {}

	@Mutation(() => CreatePaymentOutput)
	@Role(['Owner'])
	createPayment(
		@AuthUser() owner: User,
		@Args('input') createPaymentInput: CreatePaymentInput,
	): Promise<CreatePaymentOutput> {
		return this.paymentsService.createPayment(owner, createPaymentInput);
	}

	@Query(() => GetPaymentOutput)
	@Role(['Owner'])
	getPayments(@AuthUser() owner: User): Promise<GetPaymentOutput> {
		return this.paymentsService.getPayments(owner);
	}
}
