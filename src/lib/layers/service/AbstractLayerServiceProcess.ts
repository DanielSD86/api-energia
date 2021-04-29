import { IDataMail, IResultMail } from "@lib/mail/IConfigMail";
import { IRepositoryClient } from "@lib/repository/IRepositoryClient";
import { MailService } from "@services/MailService";
import { RepositoryService } from "@services/RepositoryService";
import { IBusinessProcess } from "../business/IBusinessProcess";
import { IDataRequest, IResultAdapter } from "../IAdapter";

export abstract class AbstractLayerServiceProcess {
    protected async executeProcess(process: IBusinessProcess, repositoryClient: IRepositoryClient, dataRequest: IDataRequest) : Promise<IResultAdapter> {
        await process.fill(repositoryClient, dataRequest);

        const resultValidate = await process.validate(repositoryClient, dataRequest);
        if (!resultValidate.status) return resultValidate;

        return await process.execute(repositoryClient, dataRequest);
    }

    async executeTransactionProcess(process: IBusinessProcess, dataRequest: IDataRequest): Promise<IResultAdapter> {
        const repository = await RepositoryService();
        const repositoryClient = await repository.getClient(true);

        await repositoryClient.beginTransaction();

        try {            
            const resultService = await this.executeProcess(process, repositoryClient, dataRequest);

            await repositoryClient.commit();

            return resultService;
        } catch (e) {
            await repositoryClient.rollback();
            throw e
        } finally {
            await repositoryClient.disconnect();
        }
    }

    async executeReadOnlyProcess(process: IBusinessProcess, dataRequest: IDataRequest): Promise<IResultAdapter> {
        const repository = await RepositoryService();
        const repositoryClient = await repository.getClient(true);

        try {            
            const resultService = await this.executeProcess(process, repositoryClient, dataRequest);

            return resultService;
        } catch (e) {
            throw e
        } finally {
            await repositoryClient.disconnect();
        }
    }

    async sendMailNoWait(data: IDataMail): Promise<void> {
        const email = await MailService()
        email.sendNoWait(data);
    }

    async sendMail(data: IDataMail): Promise<IResultMail> {
        const email = await MailService()
        return email.send(data);
    }
}
