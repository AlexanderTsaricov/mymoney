import { MoneyType } from '../../storage/StorageHandle';
import { StorageHandle } from '../../storage/StorageHandle';

export class Income {
    storage: StorageHandle;
    allMoney: number = 0;

    constructor(dbName: string) {
        this.storage = new StorageHandle(dbName);
    }

    async deleteIncome(id: number) {
        return await this.storage.deleteDataFromTable('moneyMovement', id);
    }

    async addIncome(income: MoneyType) {
        return await this.storage.setMoneyToStorage(income);
    }

    async addNewTypeIncome(name: string) {
        return await this.storage.createStorage(name, 'incomeType');
    }

    async getIncome(id: number) {
        return await this.storage.getDataFromStorage('moneyMovement', id)
    }

    async getIncomeByName(name: string) {
        return await this.storage.getDataFromStorageByName('moneyMovement', name);
    }

    async getAllIncome(): Promise<MoneyType[]> {
        const arrayMoneyMoovment = await this.storage.getAllDataFromStorage('moneyMovement') as MoneyType[];
        const arrayIncome: MoneyType[] = [];
        arrayMoneyMoovment.forEach(moneyMoovment => {
            if (moneyMoovment.moneyMovementType == 'income') {
                arrayIncome.push(moneyMoovment);
            }
        });
        return arrayIncome;
    }

    async changeIncomes(id: number, propName: string, propValue: any) {
        return await this.storage.updateMoneyData(id, propName, propValue);
    }

    async getIncomesTypes() {
        const  result = await this.storage.getAllDataFromStorage('incomeTypes');
        return result;
    }
}