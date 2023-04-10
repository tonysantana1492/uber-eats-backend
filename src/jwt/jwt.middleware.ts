import { NestMiddleware, Injectable } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { JwtService } from './jwt.service';
import { UsersService } from '../users/users.service';
import { TOKEN_KEY } from 'src/common/common.constants';

@Injectable()
// ! No lo uso
export class JwtMiddleware implements NestMiddleware {
	constructor(private readonly jwtService: JwtService, private readonly usersService: UsersService) {}
	async use(req: Request, res: Response, next: NextFunction) {
		if (TOKEN_KEY in req.headers) {
			const token = req.headers[TOKEN_KEY];

			try {
				const decoded = this.jwtService.verify(token.toString());

				if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
					const id = decoded['id'];
					const { user, ok } = await this.usersService.findById(id);

					if (ok) {
						req['user'] = user;
					}
				}
			} catch (error) {}
		}
		next();
	}
}
