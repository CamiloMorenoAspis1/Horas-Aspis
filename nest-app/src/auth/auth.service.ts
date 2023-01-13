import { Body, HttpException, HttpStatus, Injectable} from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { User } from 'src/models/user.model';
import {
  AuthError,
  createUserWithEmailAndPassword,
  deleteUser,
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
  getFirestore,
} from 'firebase/firestore';
import { ResponseDto } from 'src/app.DTO.responseDto';
import { ResponseLoginDto } from 'src/app.DTO.responseLoginDto';
import { Result } from 'src/models/resultLogin.model';
import { Resulta } from 'src/models/resultaDelete.model';
import { ResponseDeleteDto } from 'src/app.DTO.responseDeleteDto';

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

      if (firebaseAuthError.code === 'invalid-argument') {
        throw new HttpException('usuario no existe', HttpStatus.NOT_ACCEPTABLE);
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
 
      console.log('[FIREBASE AUTH ERROR CODE]: ',firebaseAuthError.code);

      if (firebaseAuthError.code === 'auth/email-already-in-use') {
        console.log('email ya existe');
        throw new HttpException('Email ya existe', HttpStatus.CONFLICT);
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
public async delete(email: string, password: string): Promise<ResponseDeleteDto>{//Omit<User, 'password'>> {
  console.log('Iniciando borrado()...'); // adicion 
  try {
      const responseDeleteDto: ResponseDeleteDto = new ResponseDeleteDto (HttpStatus.PROCESSING, new Result());
      const userCredential: UserCredential = await signInWithEmailAndPassword(
      this.firebaseService.auth,
      email,
      password,
    );

    if (userCredential) {
      const id: string = userCredential.user.uid;
      const  db = getFirestore();
      //const docRef: DocumentReference = doc(this.firebaseService.usersCollection, id);
      const docRef: DocumentReference = doc(db, "/users", id);
      const snapshot: DocumentSnapshot<DocumentData> = await getDoc(docRef);
      const loggedUser: User = {...snapshot.data(), id: snapshot.id, } as User;
        
      console.log('Proceso de borrado', HttpStatus.PROCESSING);
       //_______________adicion__________
      responseDeleteDto.statusCode = HttpStatus.PROCESSING;
      responseDeleteDto.resulta.token = "Usuario Borrado "+ loggedUser;
      delete(this.firebaseService.usersCollection);
      deleteDoc(docRef);
      console.log('borrado completo');
      //______________fin de adicion____________    
    } 
    return responseDeleteDto;  
  } catch (error: unknown) {
    const firebaseAuthError = error as AuthError;

    console.log(`[FIREBASE AUTH ERROR CODE]: ${firebaseAuthError.code}`);

    if (firebaseAuthError.code === 'auth/wrong-password') {
      throw new HttpException('Password incorrect.', HttpStatus.FORBIDDEN);
    }

    if (firebaseAuthError.code === 'auth/user-not-found' || firebaseAuthError.code === 'auth/invalid-email') {
      throw new HttpException('Email de usuario no existe.', HttpStatus.NOT_FOUND);
    }

    if (firebaseAuthError.code === 'invalid-argument') {
      throw new HttpException('usuario no existe', HttpStatus.NOT_ACCEPTABLE);
    }

  }
}
//--------------------------------------------------------------------------------------------------*/
}
