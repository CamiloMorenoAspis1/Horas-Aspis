import { CACHE_MODULE_OPTIONS, HttpException, HttpStatus, Injectable} from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { User } from 'src/models/user.model';
import { Response } from 'express';
import {
  AuthError,
  AuthSettings,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
} from 'firebase/auth';
import {
  setDoc,
  DocumentReference,
  doc,
  getDoc,
  DocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { error } from 'console';
import { ResponseDto } from 'src/app.DTO.responseDto';
import { request } from 'http';
import { RequestDto } from 'src/app.DTO.requestDto';
import { Http2ServerResponse } from 'http2';
import { ResponseLoginDto } from 'src/app.DTO.responseLoginDto';
import { Result } from 'src/models/resultLogin.model';


@Injectable()
export class AuthService {
  constructor(private firebaseService: FirebaseService) {}  

  public async login(email: string, password: string): Promise<ResponseLoginDto>{//Omit<User, 'password'>> {
    console.log('Iniciando consulta()...'); // adicion 
    try {
        const responseLoginDto: ResponseLoginDto = new ResponseLoginDto ("", new Result());
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
        //delete loggedUser.password;
        //_______________adicion__________
        responseLoginDto.status = "ok";
        responseLoginDto.result.token = loggedUser.id;
        //______________fin de adicion____________
        //return loggedUser; //linea comentariada
   
      } 
      return responseLoginDto;//adicion   
    } catch (error: unknown) {
      const firebaseAuthError = error as AuthError;

      console.log(`[FIREBASE AUTH ERROR CODE]: ${firebaseAuthError.code}`);

      if (firebaseAuthError.code === 'auth/wrong-password') {
        throw new HttpException('Email or password incorrect.', HttpStatus.FORBIDDEN);
      }

      if (firebaseAuthError.code === 'auth/user-not-found') {
        throw new HttpException('Email not found.', HttpStatus.NOT_FOUND);
      }
    }
  }

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
        throw new HttpException('Email already exists.', HttpStatus.CONFLICT);
      }

      if (firebaseAuthError.code === 'auth/invalid-email') {
        throw new HttpException('Formato de email no valido:', HttpStatus.BAD_REQUEST);
      }
    }
  }
}


/*

NestJS, TypeScript, Firebase, Async/Await (Part 2)

In Part 1, we only printed the HTTP errors in the console.

In Part 2, we are gonna quickly send a formal HTTPException, so
we can get the error while doing the request with Thunder Client.

*/
