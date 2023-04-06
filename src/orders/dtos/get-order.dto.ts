import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Order } from '../entities/order.entity';

@InputType()
export class GetOrderInput {
	@Field(() => Number, { nullable: true })
	orderId?: number;
}

@ObjectType()
export class GetOrderOutput extends CoreOutput {
	@Field(() => Order, { nullable: true })
	order?: Order;
}
