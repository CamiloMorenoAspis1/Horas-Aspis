import { Result } from "./models/resultLogin.model";

export class ResponseLoginDto { //es para el login
    statusCode: number;
    result: Result;

    constructor(statusCode: number, result:Result){
        this.statusCode=statusCode;
        this.result=result;
    }
}