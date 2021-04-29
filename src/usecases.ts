import { Produtos } from "@entities/energia/Produtos";
import { Projetos } from "@entities/energia/Projetos";
import { ProjetosInversores } from "@entities/energia/ProjetosInversores";
import { FIELD_COMPANY, FIELD_DATE_CREATE, FIELD_USER_CREATE, TYPE_FIELD } from "@lib/entity/EntityConsts";
import { IEntity } from "@lib/entity/IEntity";
import * as fs from "fs";

async function getFolderComplete(folder: String, name: String): Promise<string> {
    return "./src/usecases/" + folder + "/" + await getFolderNameEntity(name) + "/";
}

async function getFolderNameEntity(name: String): Promise<string> {
    let nameCustom = "";
    let useNext = false;

    for (const idxName in name) {
        if (name[idxName] !== "_") {
            if (useNext) {
                nameCustom += name[idxName].toUpperCase(); 
                useNext = false;
            } else {
                nameCustom += name[idxName].toLowerCase(); 
            }
        }

        if (name[idxName] == "_") {
            useNext = true; 
        }
    }

    return nameCustom;
}

async function getFileNameEntity(name: String, firstLoweCase?: boolean): Promise<string> {
    let nameCustom = "";
    let useNext = (!firstLoweCase);

    for (const idxName in name) {
        if (name[idxName] !== "_") {
            if (useNext) {
                nameCustom += name[idxName].toUpperCase(); 
                useNext = false;
            } else {
                nameCustom += name[idxName].toLowerCase(); 
            }
        }

        if (name[idxName] == "_") {
            useNext = true; 
        }
    }

    return nameCustom;
}

async function createFolders(folder: String, name: String): Promise<void> {
    const folderGroup =  "./src/usecases/" + folder + "/";

    const folderComplete: string = await getFolderComplete(folder, name);
    const folderImplement = folderComplete + "/implements";

    if (!fs.existsSync(folderGroup)){
        fs.mkdirSync(folderGroup);
    }

    if (!fs.existsSync(folderComplete)){
        fs.mkdirSync(folderComplete);
    }

    if (!fs.existsSync(folderImplement)){
        fs.mkdirSync(folderImplement);
    }
}

async function createLayerRepository(folder: String, name: String): Promise<void> {    
    const nameUseCase = await getFileNameEntity(name);
    const file = await getFileNameEntity(name) + "Repository.ts";
    const fileImplements = await getFolderComplete(folder, name) + "/implements/" + file;
    const fileInterface = await getFolderComplete(folder, name) + "/I" + file;

    if (!fs.existsSync(fileInterface)) {
        let writeStream = fs.createWriteStream(fileInterface);

        writeStream.write('import { ILayerRepository } from "@lib/layers/repository/ILayerRepository";\n');
        writeStream.write('export interface I' + nameUseCase + 'Repository extends ILayerRepository { }\n');
        writeStream.end();
    }

    if (!fs.existsSync(fileImplements)) {
        let writeStream = fs.createWriteStream(fileImplements);

        writeStream.write('import { ' + nameUseCase + ' } from "@entities/' + folder + '/' + nameUseCase + '";\n');
        writeStream.write('import { AbstractLayerRepository } from "@lib/layers/repository/AbstractLayerRepository";\n');
        writeStream.write('import { I' + nameUseCase + 'Repository } from "../I' + nameUseCase + 'Repository";\n');
        writeStream.write('export class ' + nameUseCase + 'Repository extends AbstractLayerRepository implements I' + nameUseCase + 'Repository {\n');
        writeStream.write('    static instance: ' + nameUseCase + 'Repository;\n');
        writeStream.write('    constructor() {\n');
        writeStream.write('        super(' + nameUseCase + '.getInstance());\n');
        writeStream.write('    }\n');
        writeStream.write('    static getInstance(): ' + nameUseCase + 'Repository {\n');
        writeStream.write('        if (!' + nameUseCase + 'Repository.instance) {\n');
        writeStream.write('            ' + nameUseCase + 'Repository.instance = new ' + nameUseCase + 'Repository();\n');
        writeStream.write('        }\n');
        writeStream.write('        return ' + nameUseCase + 'Repository.instance;\n');
        writeStream.write('    }\n');
        writeStream.write('}\n');
        writeStream.end();
    }
}

async function createLayerBusiness(folder: String, name: String, withRepository: boolean = true): Promise<void> {    
    const nameUseCase = await getFileNameEntity(name);
    const file = await getFileNameEntity(name) + "Business.ts";
    const fileImplements = await getFolderComplete(folder, name) + "/implements/" + file;
    const fileInterface = await getFolderComplete(folder, name) + "/I" + file;

    if (!fs.existsSync(fileInterface)) {
        let writeStream = fs.createWriteStream(fileInterface);

        writeStream.write('import { ILayerBusiness } from "@lib/layers/business/ILayerBusiness";\n');
        writeStream.write('export interface I' + nameUseCase + 'Business extends ILayerBusiness { }\n');
        writeStream.end();
    }

    if (!fs.existsSync(fileImplements)) {
        let writeStream = fs.createWriteStream(fileImplements);

        writeStream.write('import { AbstractLayerBusiness } from "@lib/layers/business/AbstractLayerBusiness";\n');
        writeStream.write('import { ' + nameUseCase + 'Repository } from "./' + nameUseCase + 'Repository";\n');
        writeStream.write('import { I' + nameUseCase + 'Business } from "../I' + nameUseCase + 'Business";\n');
        writeStream.write('export class ' + nameUseCase + 'Business extends AbstractLayerBusiness implements I' + nameUseCase + 'Business {\n');
        writeStream.write('    static instance: ' + nameUseCase + 'Business;\n');
        writeStream.write('    constructor() {\n');
        if (withRepository) writeStream.write('        super(' + nameUseCase + 'Repository.getInstance());\n');
        else writeStream.write('        super(null);\n');
        writeStream.write('    }\n');
        writeStream.write('    static getInstance(): ' + nameUseCase + 'Business {\n');
        writeStream.write('        if (!' + nameUseCase + 'Business.instance) {\n');
        writeStream.write('            ' + nameUseCase + 'Business.instance = new ' + nameUseCase + 'Business();\n');
        writeStream.write('        }\n');
        writeStream.write('        return ' + nameUseCase + 'Business.instance;\n');
        writeStream.write('    }\n');
        writeStream.write('}\n');
        writeStream.end();
    }
}

async function createLayerService(folder: String, name: String): Promise<void> {    
    const nameUseCase = await getFileNameEntity(name);
    const file = await getFileNameEntity(name) + "Service.ts";
    const fileImplements = await getFolderComplete(folder, name) + "/implements/" + file;
    const fileInterface = await getFolderComplete(folder, name) + "/I" + file;

    if (!fs.existsSync(fileInterface)) {
        let writeStream = fs.createWriteStream(fileInterface);

        writeStream.write('import { ILayerService } from "@lib/layers/service/ILayerService";\n');
        writeStream.write('export interface I' + nameUseCase + 'Service extends ILayerService { }\n');
        writeStream.end();
    }

    if (!fs.existsSync(fileImplements)) {
        let writeStream = fs.createWriteStream(fileImplements);

        writeStream.write('import { AbstractLayerService } from "@lib/layers/service/AbstractLayerService";\n');
        writeStream.write('import { I' + nameUseCase + 'Service } from "../I' + nameUseCase + 'Service";\n');
        writeStream.write('import { ' + nameUseCase + 'Business } from "./' + nameUseCase + 'Business";\n');
        writeStream.write('export class ' + nameUseCase + 'Service extends AbstractLayerService implements I' + nameUseCase + 'Service {\n');
        writeStream.write('    static instance: ' + nameUseCase + 'Service;\n');
        writeStream.write('    constructor() {\n');
        writeStream.write('        super(' + nameUseCase + 'Business.getInstance());\n');
        writeStream.write('    }\n');
        writeStream.write('    static getInstance(): ' + nameUseCase + 'Service {\n');
        writeStream.write('        if (!' + nameUseCase + 'Service.instance) {\n');
        writeStream.write('            ' + nameUseCase + 'Service.instance = new ' + nameUseCase + 'Service();\n');
        writeStream.write('        }\n');
        writeStream.write('        return ' + nameUseCase + 'Service.instance;\n');
        writeStream.write('    }\n');
        writeStream.write('}\n');
        writeStream.end();
    }
}

async function createLayerController(folder: String, name: String): Promise<void> {    
    const nameUseCase = await getFileNameEntity(name);
    const file = await getFileNameEntity(name) + "Controller.ts";
    const fileImplements = await getFolderComplete(folder, name) + "/implements/" + file;
    const fileInterface = await getFolderComplete(folder, name) + "/I" + file;

    if (!fs.existsSync(fileInterface)) {
        let writeStream = fs.createWriteStream(fileInterface);

        writeStream.write('import { ILayerController } from "@lib/layers/controller/ILayerController";\n');
        writeStream.write('export interface I' + nameUseCase + 'Controller extends ILayerController { }\n');
        writeStream.end();
    }

    if (!fs.existsSync(fileImplements)) {
        let writeStream = fs.createWriteStream(fileImplements);

        writeStream.write('import { AbstractLayerController } from "@lib/layers/controller/AbstractLayerController";\n');
        writeStream.write('import { I' + nameUseCase + 'Controller } from "../I' + nameUseCase + 'Controller";\n');
        writeStream.write('import { ' + nameUseCase + 'Service } from "./' + nameUseCase + 'Service";\n');
        writeStream.write('export class ' + nameUseCase + 'Controller extends AbstractLayerController implements I' + nameUseCase + 'Controller {\n');
        writeStream.write('    static instance: ' + nameUseCase + 'Controller;\n');
        writeStream.write('    constructor() {\n');
        writeStream.write('        super(' + nameUseCase + 'Service.getInstance());\n');
        writeStream.write('    }\n');
        writeStream.write('    static getInstance(): ' + nameUseCase + 'Controller {\n');
        writeStream.write('        if (!' + nameUseCase + 'Controller.instance) {\n');
        writeStream.write('            ' + nameUseCase + 'Controller.instance = new ' + nameUseCase + 'Controller();\n');
        writeStream.write('        }\n');
        writeStream.write('        return ' + nameUseCase + 'Controller.instance;\n');
        writeStream.write('    }\n');
        writeStream.write('}\n');
        writeStream.end();
    }
}

async function createRouter(folder: String, name: String, readOnly: boolean = false): Promise<void> {
    const nameUseCase = await getFileNameEntity(name);
    const file = await getFileNameEntity(name) + "Router.ts";
    const fileComplete = await getFolderComplete(folder, name) + "/implements/" + file;

    if (!fs.existsSync(fileComplete)) {
        let writeStream = fs.createWriteStream(fileComplete);

        writeStream.write('import { SecutiryAuthService } from "@services/SecurityAuthService";\n');
        writeStream.write('import express from "express";\n');
        writeStream.write('import { ' + nameUseCase + 'Controller } from "./' + nameUseCase + 'Controller";\n');
        writeStream.write('export function Router' + nameUseCase + '() {\n');
        writeStream.write('    const router = express.Router();\n');
        writeStream.write('    const controller = ' + nameUseCase + 'Controller.getInstance();\n');
        writeStream.write('    router.get("/", SecutiryAuthService().validateAuthController, controller.findAll);\n');
        writeStream.write('    router.get("/:id", SecutiryAuthService().validateAuthController, controller.findById);\n'); 
        
        if (!readOnly) {
            writeStream.write('    router.post("/", SecutiryAuthService().validateAuthController, controller.create);\n');
            writeStream.write('    router.put("/:id", SecutiryAuthService().validateAuthController, controller.update);\n');
            writeStream.write('    router.delete("/:id", SecutiryAuthService().validateAuthController, controller.disable);\n');
        }

        writeStream.write('    return router;\n');
        writeStream.write('}\n');
        writeStream.end();
    }
}

async function createEntity(folder: String, name: String, entity: IEntity): Promise<void> {
    const nameUseCase = await getFileNameEntity(name) + "Dom";
    const fileComplete = await getFolderComplete(folder, name) + "/implements/" + nameUseCase  + ".ts";

    let writeStream = fs.createWriteStream(fileComplete);

    writeStream.write('export interface ' + nameUseCase + ' {\n');

    for (const idx in entity.fields) {
        const field = entity.fields[idx];

        let fieldName = field.name;
        
        if (field.allowNull || [FIELD_COMPANY, FIELD_DATE_CREATE, FIELD_USER_CREATE].includes(fieldName) || field.autoGenerate) {
            fieldName += "?";
        }

        if (field.autoGenerate) {
            fieldName = "readonly " + fieldName;
        }

        switch (field.type) {
            case TYPE_FIELD.BIGDECIMAL:
            case TYPE_FIELD.BIGINTEGER:
            case TYPE_FIELD.DECIMAL:
            case TYPE_FIELD.INTEGER:
                fieldName += ": number, "; 
                break;
            case TYPE_FIELD.BOOLEAN:
                fieldName += ": boolean, "; 
                break;
            default:
                fieldName += ": string, "; 
                break;
        }

        writeStream.write('    ' + fieldName + '\n');    
    }

    writeStream.write('}\n');
    writeStream.end();
}

async function createLayerBusinessProcess(folder: String, name: String, withRepository: boolean = true): Promise<void> {    
    const nameUseCase = await getFileNameEntity(name);
    const file = await getFileNameEntity(name) + "Business.ts";
    const fileImplements = await getFolderComplete(folder, name) + "/implements/" + file;
    const fileInterface = await getFolderComplete(folder, name) + "/I" + file;

    if (!fs.existsSync(fileImplements)) {
        let writeStream = fs.createWriteStream(fileImplements);

        writeStream.write('import { IBusinessProcess } from "@lib/layers/business/IBusinessProcess";\n');
        writeStream.write('export class ' + nameUseCase + 'Business implements IBusinessProcess {\n');
        writeStream.write('    static instance: ' + nameUseCase + 'Business;\n');
        writeStream.write('    static getInstance(): ' + nameUseCase + 'Business {\n');
        writeStream.write('        if (!' + nameUseCase + 'Business.instance) {\n');
        writeStream.write('            ' + nameUseCase + 'Business.instance = new ' + nameUseCase + 'Business();\n');
        writeStream.write('        }\n');
        writeStream.write('        return ' + nameUseCase + 'Business.instance;\n');
        writeStream.write('    }\n');
        writeStream.write('}\n');
        writeStream.end();
    }
}

async function createLayerServiceProcess(folder: String, name: String): Promise<void> {    
    const nameUseCase = await getFileNameEntity(name);
    const nameUseCaseLowerCase = await getFileNameEntity(name, true);
    const file = await getFileNameEntity(name) + "Service.ts";
    const fileImplements = await getFolderComplete(folder, name) + "/implements/" + file;
    const fileInterface = await getFolderComplete(folder, name) + "/I" + file;

    if (!fs.existsSync(fileInterface)) {
        let writeStream = fs.createWriteStream(fileInterface);

        writeStream.write('import { IDataRequest, IResultAdapter } from "@lib/layers/IAdapter";\n');
        writeStream.write('export interface I' + nameUseCase + 'Service {\n');
        writeStream.write('     ' + nameUseCaseLowerCase + '(dataRequest: IDataRequest): Promise<IResultAdapter>; \n');
        writeStream.write('}\n');
        writeStream.end();
    }

    if (!fs.existsSync(fileImplements)) {
        let writeStream = fs.createWriteStream(fileImplements);

        writeStream.write('import { IDataRequest, IResultAdapter } from "@lib/layers/IAdapter";\n');
        writeStream.write('import { AbstractLayerServiceProcess } from "@lib/layers/service/AbstractLayerServiceProcess";\n');
        writeStream.write('import { I' + nameUseCase + 'Service } from "../I' + nameUseCase + 'Service";\n');
        writeStream.write('import { ' + nameUseCase + 'Business } from "./' + nameUseCase + 'Business";\n');
        writeStream.write('export class ' + nameUseCase + 'Service extends AbstractLayerServiceProcess implements I' + nameUseCase + 'Service {\n');
        writeStream.write('    static instance: ' + nameUseCase + 'Service;\n');
        writeStream.write('    static getInstance(): ' + nameUseCase + 'Service {\n');
        writeStream.write('        if (!' + nameUseCase + 'Service.instance) {\n');
        writeStream.write('            ' + nameUseCase + 'Service.instance = new ' + nameUseCase + 'Service();\n');
        writeStream.write('        }\n');
        writeStream.write('        return ' + nameUseCase + 'Service.instance;\n');
        writeStream.write('    }\n');
        writeStream.write('    ' + nameUseCaseLowerCase + ' = async (dataRequest: IDataRequest): Promise<IResultAdapter> => {\n');
        writeStream.write('        return await this.executeReadOnlyProcess(' + nameUseCase +'Business.getInstance(), dataRequest);\n');
        writeStream.write('    }\n');
        writeStream.write('}\n');
        writeStream.end();
    }
}

async function createLayerControllerProcess(folder: String, name: String): Promise<void> {    
    const nameUseCase = await getFileNameEntity(name);
    const nameUseCaseLowerCase = await getFileNameEntity(name, true);
    const file = await getFileNameEntity(name) + "Controller.ts";
    const fileImplements = await getFolderComplete(folder, name) + "/implements/" + file;
    const fileInterface = await getFolderComplete(folder, name) + "/I" + file;

    if (!fs.existsSync(fileInterface)) {
        let writeStream = fs.createWriteStream(fileInterface);

        writeStream.write('import { Request, Response } from "express";\n');
        writeStream.write('import { I' + nameUseCase + 'Service } from "./I' + nameUseCase + 'Service";\n');
        writeStream.write('export interface I' + nameUseCase + 'Controller {\n');
        writeStream.write('     service : I' + nameUseCase + 'Service; \n');
        writeStream.write('     ' + nameUseCaseLowerCase + '(request: Request, response: Response); \n');
        writeStream.write('}\n');
        writeStream.end();
    }

    if (!fs.existsSync(fileImplements)) {
        let writeStream = fs.createWriteStream(fileImplements);

        writeStream.write('import { AbstractLayerControllerProcess } from "@lib/layers/controller/AbstractLayerControllerProcess";\n');
        writeStream.write('import { I' + nameUseCase + 'Controller } from "../I' + nameUseCase + 'Controller";\n');
        writeStream.write('import { ' + nameUseCase + 'Service } from "./' + nameUseCase + 'Service";\n');
        writeStream.write('import { I' + nameUseCase + 'Service } from "../I' + nameUseCase + 'Service";\n');
        writeStream.write('import { RESPONSE_STATUS } from "@lib/layers/controller/LayerControllerTypes";\n');
        writeStream.write('import { Request, Response } from "express";\n');
        writeStream.write('export class ' + nameUseCase + 'Controller extends AbstractLayerControllerProcess implements I' + nameUseCase + 'Controller {\n');
        writeStream.write('     service : I' + nameUseCase + 'Service; \n');
        writeStream.write('     static instance: ' + nameUseCase + 'Controller;\n');
        writeStream.write('     constructor() {\n');
        writeStream.write('         super();\n');
        writeStream.write('         this.service = ' + nameUseCase + 'Service.getInstance();\n');
        writeStream.write('     }\n');
        writeStream.write('     static getInstance(): ' + nameUseCase + 'Controller {\n');
        writeStream.write('         if (!' + nameUseCase + 'Controller.instance) {\n');
        writeStream.write('             ' + nameUseCase + 'Controller.instance = new ' + nameUseCase + 'Controller();\n');
        writeStream.write('         }\n');
        writeStream.write('         return ' + nameUseCase + 'Controller.instance;\n');
        writeStream.write('     }\n');
        writeStream.write('     ' + nameUseCaseLowerCase + ' = async (request: Request, response: Response) => {\n');
        writeStream.write('         return await this.executeRequest(\n');
        writeStream.write('             this.service.' + nameUseCaseLowerCase + ',\n');
        writeStream.write('             RESPONSE_STATUS.OK,\n');
        writeStream.write('             RESPONSE_STATUS.BAD_REQUEST,\n');
        writeStream.write('             request,\n');
        writeStream.write('             response,\n');
        writeStream.write('             false);\n');
        writeStream.write('    }\n');
        writeStream.write('}\n');
        writeStream.end();
    }
}

async function createRouterProcess(folder: String, name: String, readOnly: boolean = false): Promise<void> {
    const nameUseCase = await getFileNameEntity(name);
    const nameUseCaseLowerCase = await getFileNameEntity(name, true);
    const file = await getFileNameEntity(name) + "Router.ts";
    const fileComplete = await getFolderComplete(folder, name) + "/implements/" + file;

    if (!fs.existsSync(fileComplete)) {
        let writeStream = fs.createWriteStream(fileComplete);

        writeStream.write('import { SecutiryAuthService } from "@services/SecurityAuthService";\n');
        writeStream.write('import express from "express";\n');
        writeStream.write('import { ' + nameUseCase + 'Controller } from "./' + nameUseCase + 'Controller";\n');
        writeStream.write('export function Router' + nameUseCase + '() {\n');
        writeStream.write('    const router = express.Router();\n');
        writeStream.write('    const controller = ' + nameUseCase + 'Controller.getInstance();\n');
        writeStream.write('    router.get("/", SecutiryAuthService().validateAuthController, controller.' + nameUseCaseLowerCase + ');\n');
        writeStream.write('    return router;\n');
        writeStream.write('}\n');
        writeStream.end();
    }
}

async function createFiles(entity: IEntity, readOnly: boolean = false) {
    await createFolders(entity.schema, entity.name);
    await createRouter(entity.schema, entity.name, readOnly);
    await createLayerController(entity.schema, entity.name);
    await createLayerService(entity.schema, entity.name);
    await createLayerBusiness(entity.schema, entity.name);
    await createLayerRepository(entity.schema, entity.name);
    await createEntity(entity.schema, entity.name, entity);
}

async function createFilesProcess(folder: String, name: String): Promise<void> {
    await createFolders(folder, name);
    await createRouterProcess(folder, name, true);
    await createLayerControllerProcess(folder, name);
    await createLayerServiceProcess(folder, name);
    await createLayerBusinessProcess(folder, name, false);
}

async function execute() {
    try {
        console.log("Criação de casos de usos iniciado");
        console.time("USECASES");

        try {
            // Energia
            await createFiles(Produtos.getInstance());
            await createFiles(Projetos.getInstance());
            await createFiles(ProjetosInversores.getInstance());

            // Processos sem vinculo com entidades
            await createFilesProcess("energia", "inversor");

            console.log("Casos de uso finalizado com sucesso");
            console.timeEnd("USECASES");
        } catch (e) {
            console.log("Casos de uso finalizado com erro");
            throw e;
        }
    }
    finally {
        // Executa algo obrigatorio
    }
}

execute();
