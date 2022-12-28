import { Body, Controller, Post, HttpException, HttpStatus, Get} from '@nestjs/common';
import { User } from 'src/models/user.model';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('login')
  public login(@Body() body: Pick<User, 'email' | 'password'>) {
    return this.authService.login(body.email, body.password);
    //return '[TEST]: login'    
  }

  @Post('register')
  public register(@Body() body: Omit<User, 'id'>) {
    return this.authService.register(body);
    //return '[TEST]: register'
  }
}
function express() {
  throw new Error('Function not implemented.');
}

