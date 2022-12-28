import { Result } from "./models/resultLogin.model";

export class ResponseLoginDto { //es para el login
    status: string;
    result: Result;

    constructor(status: string, result:Result){
        this.status=status;
        this.result=result;
    }
}