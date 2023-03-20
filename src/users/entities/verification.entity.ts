import { BeforeInsert, Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { ObjectType, InputType, Field } from '@nestjs/graphql';
import { CoreEntity } from '../../common/entities/core.entity';
import { User } from './user.entity';
import { v4 as uuidv4 } from 'uuid';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Verification extends CoreEntity {
	@Field(() => String)
	@Column()
	code: string;

	@OneToOne(() => User, { onDelete: 'CASCADE' })
	@JoinColumn()
	user: User;

	@BeforeInsert()
	createdCode(): void {
		this.code = uuidv4();
	}
}
