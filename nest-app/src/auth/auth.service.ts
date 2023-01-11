import { Body, HttpException, HttpStatus, Injectable} from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { User } from 'src/models/user.model';
import {
  AuthError,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
} from 'firebase/auth';
import {
  setDoc,
  DocumentReference,
  doc,
  getDoc,
  deleteDoc,
  DocumentSnapshot,
  DocumentData,
  Firestore,
  collection,
} from 'firebase/firestore';
import { ResponseDto } from 'src/app.DTO.responseDto';
import { ResponseLoginDto } from 'src/app.DTO.responseLoginDto';
import { Result } from 'src/models/resultLogin.model';

//--------------------------------------------------------------------------------------------------
@Injectable()
export class AuthService {
  constructor(private firebaseService: FirebaseService) {}  
//--------------------------------------------------------------------------------------------------
  public async login(email: string, password: string): Promise<ResponseLoginDto>{//Omit<User, 'password'>> {
    console.log('Iniciando consulta()...'); // adicion 
    try {
        const responseLoginDto: ResponseLoginDto = new ResponseLoginDto (HttpStatus.OK, new Result());
        const userCredential: UserCredential = await signInWithEmailAndPassword(
        this.firebaseService.auth,
        email,
        password,
      );

      if (userCredential) {
        const id: string = userCredential.user.uid;
        const docRef: DocumentReference = doc(this.firebaseService.usersCollection, id);

        const snapshot: DocumentSnapshot<DocumentData> = await getDoc(docRef);
        const loggedUser: User = {...snapshot.data(), id: snapshot.id, } as User;
        
        console.log('consulta', HttpStatus.OK);
         //_______________adicion__________
        responseLoginDto.statusCode = HttpStatus.OK;
        responseLoginDto.result.token = loggedUser.id;
        //______________fin de adicion____________    
      } 
      return responseLoginDto;//adicion   
    } catch (error: unknown) {
      const firebaseAuthError = error as AuthError;

      console.log(`[FIREBASE AUTH ERROR CODE]: ${firebaseAuthError.code}`);

      if (firebaseAuthError.code === 'auth/wrong-password') {
        throw new HttpException('Password incorrect.', HttpStatus.FORBIDDEN);
      }

      if (firebaseAuthError.code === 'auth/user-not-found' || firebaseAuthError.code === 'auth/invalid-email') {
        throw new HttpException('Email not found.', HttpStatus.NOT_FOUND);
      }

    }
  }
//--------------------------------------------------------------------------------------------------
  public async register(body: Omit<User, 'id'>): Promise<ResponseDto> {
    console.log('Iniciando register()...'); // adicion    
    try {
      const responseDto: ResponseDto = new ResponseDto;
      const userCredential: UserCredential =
        await createUserWithEmailAndPassword(
          this.firebaseService.auth,
          body.email,
          body.password,
        );

      if (userCredential) {
        const id: string = userCredential.user.uid;
        const docRef: DocumentReference = doc(this.firebaseService.usersCollection, id);
        await setDoc(docRef, body);       
        console.log('Usuario Registrado'); // adicion    
        
        responseDto.statusCode = HttpStatus.CREATED;
        responseDto.message ='Usuario Registrado';
               
      } 
      return responseDto;
      
    } catch (error: unknown) {
      const firebaseAuthError = error as AuthError;
      const responseDto: ResponseDto = new ResponseDto;

      console.log('[FIREBASE AUTH ERROR CODE]: ',firebaseAuthError.code);

      if (firebaseAuthError.code === 'auth/email-already-in-use') {
        console.log('email ya existe');
        throw new HttpException('Email ya exixte', HttpStatus.CONFLICT);
      }

      if (firebaseAuthError.code === 'auth/invalid-email') {
        throw new HttpException('Formato de email no valido:', HttpStatus.BAD_REQUEST);
      }
      if (firebaseAuthError.code === 'auth/weak-password') {
        throw new HttpException('Constraseña poco segura', HttpStatus.NOT_ACCEPTABLE);
      }

    }
  }
//---------------------------------------------------------------------------------------------------
public async delete(email: string, password: string): Promise<ResponseLoginDto>{//Omit<User, 'password'>> {
  console.log('Iniciando borrado()...'); // adicion 
  try {
      const responseLoginDto: ResponseLoginDto = new ResponseLoginDto (HttpStatus.PROCESSING, new Result());
      const userCredential: UserCredential = await signInWithEmailAndPassword(
      this.firebaseService.auth,
      email,
      password,
    );

    if (userCredential) {
      const id: string = userCredential.user.uid;
      const docRef: DocumentReference = doc(this.firebaseService.usersCollection, id);
      const snapshot: DocumentSnapshot<DocumentData> = await getDoc(docRef);
      const loggedUser: User = {...snapshot.data(), id: snapshot.id, } as User;
        
      console.log('Proceso de borrado', HttpStatus.PROCESSING, " ");
       //_______________adicion__________
      responseLoginDto.statusCode = HttpStatus.PROCESSING;
      responseLoginDto.result.token = loggedUser.id;
      //deleteDoc(loggedUser.id).delete();
      //______________fin de adicion____________    
    } 
    return responseLoginDto;  
  } catch (error: unknown) {
    const firebaseAuthError = error as AuthError;

    console.log(`[FIREBASE AUTH ERROR CODE]: ${firebaseAuthError.code}`);

    if (firebaseAuthError.code === 'auth/wrong-password') {
      throw new HttpException('Password incorrect.', HttpStatus.FORBIDDEN);
    }

    if (firebaseAuthError.code === 'auth/user-not-found' || firebaseAuthError.code === 'auth/invalid-email') {
      throw new HttpException('Email not found.', HttpStatus.NOT_FOUND);
    }

  }


}
//--------------------------------------------------------------------------------------------------*/
}
