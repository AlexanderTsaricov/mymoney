import { DB, MoneyType } from '../../storage/DB';
import { StorageHandle } from '../../storage/StorageHandle';

export class Expence {
    storage: StorageHandle;
    db: DB;
    allMoney: number = 0;

    constructor(dbName: string) {
        this.db = new DB(dbName);
        this.storage = new StorageHandle(this.db);
    }

    async deleteExpences(name: string) {
        return await this.storage.deleteFromStorage(name, 'expences');
    }

    async addExpences(name: string, expences: MoneyType) {
        return await this.storage.setToStorage(name, expences);
    }

    async addNewTypeExpences(name: string) {
        return await this.storage.addNewMoneyStorage(name, 'expences');
    }

    async getExpences(name: string) {
        return await this.storage.getData('expences', name);
    }

    async getAllExpences(): Promise<MoneyType[]> {
        const arrayExpences = this.storage.storages['expences'];
        const result: MoneyType[] = [];

        arrayExpences.forEach(async (storageName) => {
            const data = await this.storage.getData('expences', storageName);
            result.push(data);
        });

        return result;
    }

    async changeExpences(name: string, id: number, data: MoneyType): Promise<boolean> {
        return await this.storage.updateDateInStorage(name, data, id);
    }

    getExpencesTypes() {
        return this.storage.storages.expences;
    }
}