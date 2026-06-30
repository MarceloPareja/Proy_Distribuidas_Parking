import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);

    if (!user || !user.active) {
      throw new UnauthorizedException('Credenciales inválidas o usuario inactivo');
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas o usuario inactivo');
    }

    const { password_hash, ...result } = user;
    return result;
  }

  async login(user: any) {
    const roles = user.userRoles
      .filter((ur: any) => ur.active === true)
      .map((ur: any) => ur.role.name);

    const payload = {
      sub: user.id,
      username: user.username,
      roles,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
