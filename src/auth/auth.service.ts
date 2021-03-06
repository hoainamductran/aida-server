import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { UserRepository } from '../user/user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { AuthFormDto } from './dto/auth-form.dto';
import { JwtPayload } from './jwt/jwt-payload.interface';
import { TokenService } from '../token/token.service';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,

    @Inject(TokenService)
    private readonly tokenService: TokenService,
  ) {}

  async signUp(
    authFormDto: AuthFormDto,
  ): Promise<void> {
    return this.userRepository.signUp(authFormDto);
  }

  async signIn(authCredentialsDto: AuthCredentialsDto): Promise<any> {
    const user = await this.userRepository.validateUserPassword(authCredentialsDto);

    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payloadAccessToken: JwtPayload = { 
      userId: user.userId,
      username: user.username,
    };

    const payloadRefreshToken: JwtPayload = {
      userId: user.userId,
      username: user.username,
      tokenVersion: user.tokenVersion,
    };

    const accessToken = await this.tokenService.createAccessTokens(payloadAccessToken);
    const refreshToken = await this.tokenService.createRefreshToken(payloadRefreshToken);
    
    return { accessToken, refreshToken };
  }
}
