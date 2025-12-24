import { StorageHandle } from '../../storage/StorageHandle';
import { MoneyType } from '../../storage/StorageHandle';

export type MoneyProp = 'money' | 'comment' | 'type'

export class Expence {
    storage: StorageHandle;
    allMoney: number = 0;

    constructor(dbName: string) {
        this.storage = new StorageHandle(dbName);
    }

    async deleteExpences(id: number) {
        return await this.storage.deleteDataFromTable('moneyMovement', id)
    }

    async addExpences(expences: MoneyType) {
        return await this.storage.setMoneyToStorage(expences)
    }

    async addNewTypeExpences(name: string) {
        return await this.storage.createStorage(name, 'expenceType');
    }

    async getExpencesByName(name: string) {
        return await this.storage.getDataFromStorageByName('moneyMovement', name);
    }

    async getExpencesById(id: number) {
        return await this.storage.getDataFromStorage('moneyMovement', id);
    }

    async getAllExpences(): Promise<MoneyType[]> {
        const allData = await this.storage.getAllDataFromStorage('moneyMovement');
        const result: MoneyType[] = [];
        allData.forEach(data => {
            if (data.moneyMovementType == "expences") {
                result.push(data);
            }
        });

        return result;
    }

    async changeExpences(id: number, changeedNameProp: MoneyProp, changedValueProp: any): Promise<boolean> {
        const result = await this.storage.updateMoneyData(id, changeedNameProp, changedValueProp);
        if (result != undefined) {
            return result;
        } else {
            return false;
        }
    }

    getExpencesTypes() {
        return this.storage.getAllDataFromStorage('expenceTypes');
    }
}