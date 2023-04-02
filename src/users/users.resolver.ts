import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { CreateAccountOutput, CreateAccountInput } from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { UserProfileInput, UserProfileOutput } from './dtos/user-profile.dto';
import { EditProfileOutput, EditProfileInput } from './dtos/edit-profile.dto';
import { VerifyEmailOutput, VerifyEmailInput } from './dtos/verify-email.dto';
import { Role } from 'src/auth/role.decorator';

@Resolver(() => User)
export class UsersResolver {
	constructor(private readonly usersService: UsersService) {}

	@Mutation(() => CreateAccountOutput)
	createAccount(@Args('input') createAccountInput: CreateAccountInput): Promise<CreateAccountOutput> {
		return this.usersService.createAccount(createAccountInput);
	}

	@Mutation(() => LoginOutput)
	login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
		return this.usersService.login(loginInput);
	}

	@Query(() => User)
	@Role(['Any'])
	me(@AuthUser() authUser: User) {
		return authUser;
	}

	@Role(['Any'])
	@Query(() => UserProfileOutput)
	userProfile(@Args() { userId }: UserProfileInput): Promise<UserProfileOutput> {
		return this.usersService.findById(userId);
	}

	@Role(['Any'])
	@Mutation(() => EditProfileOutput)
	editProfile(
		@AuthUser() authUser: User,
		@Args('input') editProfileInput: EditProfileInput,
	): Promise<EditProfileOutput> {
		return this.usersService.editProfile(authUser.id, editProfileInput);
	}

	@Mutation(() => VerifyEmailOutput)
	verifyEmail(@Args('input') { code }: VerifyEmailInput): Promise<VerifyEmailOutput> {
		return this.usersService.verifyEmail(code);
	}
}
