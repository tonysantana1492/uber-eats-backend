import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/create-account.dto';
import { LoginOutput, LoginInput } from './dtos/login.dto';
import { JwtService } from '../jwt/jwt.service';
import { EditProfileInput } from './dtos/edit-profile.dto';
import { Verification } from './entities/verification.entity';
import { VerifyEmailOutput } from './dtos/verify-email.dto';
import { UserProfileOutput } from './dtos/user-profile.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User) private readonly users: Repository<User>,
		@InjectRepository(Verification) private readonly verifications: Repository<Verification>,
		private readonly jwtService: JwtService,
		private readonly mailService: MailService,
	) {}

	async createAccount({ email, password, role }: CreateAccountInput): Promise<{ ok: boolean; error?: string }> {
		try {
			const exists = await this.users.findOne({
				where: {
					email,
				},
			});

			if (exists) return { ok: false, error: 'There is a user with that email already.' };

			const user = await this.users.save(this.users.create({ email, password, role }));

			const verification = await this.verifications.save(this.verifications.create({ user }));

			await this.mailService.sendVerificationEmail(user.email, verification.code);
			return { ok: true };
		} catch (error) {
			return { ok: false, error: "Couldn't create account." };
		}
	}

	async login({ email, password }: LoginInput): Promise<LoginOutput> {
		try {
			const user = await this.users.findOne({ where: { email }, select: ['id', 'password'] });

			if (!user) return { ok: false, error: 'User not found.' };

			const passwordCorrect = await user.checkPassword(password);

			if (!passwordCorrect) return { ok: false, error: 'Wrong password.' };

			const token = this.jwtService.sign(user.id);

			return { ok: true, token };
		} catch (error) {
			return { ok: false, error };
		}
	}

	async findById(id: number): Promise<UserProfileOutput> {
		try {
			const user = await this.users.findOneByOrFail({ id });

			return { ok: true, user };
		} catch (error) {
			return { ok: false, error: 'User not found.' };
		}
	}

	async editProfile(userId: number, { email, password }: EditProfileInput) {
		//TODO: Esto no dispara la @BeforeUpdate() de la Entity pq que hace la consulta directo a la BD
		// return await this.users.update(userId, { email, password });
		try {
			const user = await this.users.findOneBy({ id: userId });

			if (email) {
				user.email = email;
				user.verified = false;

				await this.verifications.delete({ user: { id: user.id } });

				const verification = await this.verifications.save(this.verifications.create({ user }));
				await this.mailService.sendVerificationEmail(user.email, verification.code);
			}

			if (password) user.password = password;

			await this.users.save(user);

			return { ok: true };
		} catch (error) {
			return { ok: false, error: 'Could not update profile.' };
		}
	}

	async verifyEmail(code: string): Promise<VerifyEmailOutput> {
		try {
			const verification = await this.verifications.findOne({ where: { code }, relations: { user: true } });

			if (verification) {
				verification.user.verified = true;
				await this.users.save(verification.user);
				await this.verifications.delete(verification.id);
				return { ok: true };
			}

			return { ok: false, error: 'Verification not found.' };
		} catch (error) {
			return { ok: false, error };
		}
	}
}
