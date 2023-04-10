import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AllowedRoles } from './role.decorator';
import { JwtService } from 'src/jwt/jwt.service';
import { UsersService } from 'src/users/users.service';
import { TOKEN_KEY } from 'src/common/common.constants';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly jwtService: JwtService,
		private readonly usersService: UsersService,
	) {}
	async canActivate(context: ExecutionContext) {
		const roles = this.reflector.get<AllowedRoles>('roles', context.getHandler());
		if (!roles) {
			return true;
		}

		const gqlContext = GqlExecutionContext.create(context).getContext();

		const token = gqlContext.headers[TOKEN_KEY];

		if (!token) return false;

		const decoded = this.jwtService.verify(token.toString());

		if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
			const id = decoded['id'];
			const { user } = await this.usersService.findById(id);

			// Existe un usuario autenticado y su informacion se extrajo del token
			if (!user) return false;

			gqlContext.user = user;

			if (roles.includes('Any')) return true;

			return roles.includes(user.role);
		} else {
			return false;
		}
	}
}
