import { DB, MoneyType } from '../../storage/DB';
import { StorageHandle } from '../../storage/StorageHandle';

export class Income {
    storage: StorageHandle;
    db: DB;
    allMoney: number = 0;

    constructor(dbName: string) {
        this.db = new DB(dbName);
        this.storage = new StorageHandle(this.db);
    }

    async deleteIncome(name: string, id: number) {
        return await this.storage.deleteFromStorage(name, 'income', id);
    }

    async addIncome(name: string, income: MoneyType) {
        return await this.storage.setToStorage(name, income);
    }

    async addNewTypeIncome(name: string) {
        return await this.storage.addNewMoneyStorage(name, 'income');
    }

    async getIncome(name: string, id: string) {
        return await this.storage.getData('income', name, 'id', id);
    }

    async getAllIncome(): Promise<MoneyType[]> {
        const arrayIncome = this.storage.getAllDataByType('income');
        console.log("getAllIncome result: ", arrayIncome);
        return arrayIncome;
    }

    async changeIncomes(name: string, id: number, data: MoneyType): Promise<boolean> {
        return await this.storage.updateDateInStorage(name, data, id);
    }

    async getIncomesTypes() {
        await this.storage.updateTablesNames();
        return this.storage.storages.income;
    }
}