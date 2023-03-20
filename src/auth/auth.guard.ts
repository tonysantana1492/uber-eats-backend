import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuthGuard implements CanActivate {
	canActivate(context: ExecutionContext) {
		const { user } = GqlExecutionContext.create(context).getContext();

		if (!user) return false;

		return true;
	}
}
