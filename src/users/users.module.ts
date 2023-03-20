import { Module } from '@nestjs/common';
import { UsersResolver } from './users.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { Verification } from './entities/verification.entity';
@Module({
	// Los entities que importo en el TypeOrmModule son los que voy a injectar como repositorios en los servicios
	imports: [TypeOrmModule.forFeature([User, Verification])],
	providers: [UsersResolver, UsersService],
	exports: [UsersService],
})
export class UserModule {}
