import { Body, Controller, Post} from '@nestjs/common';
import { Delete } from '@nestjs/common/decorators/http/request-mapping.decorator';
import { User } from 'src/models/user.model';
import { AuthService } from './auth.service';

//---------------------------------------------------------------------
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  public login(@Body() body: Pick<User, 'email' | 'password'>) {
    return this.authService.login(body.email, body.password);
    //return '[TEST]: login'    
  }

  @Post('register')
  public register(@Body() body: Omit<User, 'id'>) {
    return this.authService.register(body);
    //return '[TEST]: register'
  }
//--------------------------------
  @Delete('delete')
  public delete(@Body() body: Omit<User, 'id'>) {
    return this.authService.delete(body.email, body.password);
    //return '[TEST]: delete'
  }
//-----------------------------------------*/


}
function express() {
  throw new Error('Function not implemented.');
}

