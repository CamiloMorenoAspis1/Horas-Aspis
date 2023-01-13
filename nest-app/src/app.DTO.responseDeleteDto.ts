import { Resulta } from "./models/resultaDelete.model";

export class ResponseDeleteDto { //es para el delete
    statusCode: number;
    resulta: Resulta;

    constructor(statusCode: number, resulta:Resulta){
        this.statusCode=statusCode;
        this.resulta=resulta;
    }
}