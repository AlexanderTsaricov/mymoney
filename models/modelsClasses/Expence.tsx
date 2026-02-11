import { MoneyTypeProp, StorageHandle } from '../../storage/StorageHandle';
import { MoneyType, MoneyMoovmentType } from '../../storage/StorageHandle';

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

    async deleteExpenceType(id: number) {
        await this.storage.deleteDataFromTable('expenceTypes', id);
    }

    async addExpences(expences: MoneyType) {
        const result = await this.storage.setMoneyToStorage(expences);
        //TODO: debug
        console.log("result add expences", result); 
        return result
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

    async getAllExpenceByProps(prop: MoneyTypeProp, value: any): Promise<MoneyType[]> {
            const arrayMoneyMoovment = await this.storage.getDataFromStorageByProp('moneyMovement', prop, value)
            const arrayExpence: MoneyType[] = [];
            arrayMoneyMoovment.forEach(moneyMoovment => {
                if (moneyMoovment.moneyMovementType == 'expences') {
                    arrayExpence.push(moneyMoovment);
                }
            });
            return arrayExpence;
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

    async getExpencesTypes(): Promise<MoneyMoovmentType[]> {
        return await this.storage.getAllDataFromStorage('expenceTypes');
    }
}