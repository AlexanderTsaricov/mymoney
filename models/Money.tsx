import { MoneyType } from '../storage/DB';
import { Expence } from './modelsClasses/Expence';
import { Income } from './modelsClasses/Income';
import { Wallet } from './modelsClasses/Wallet';

export class Money {
    allMoney: number = 0;
    expence: Expence;
    income: Income;
    wallet: Wallet;

    constructor(dbName: string) {
        this.expence = new Expence(dbName);
        this.income = new Income(dbName);
        this.wallet = new Wallet(dbName);
    }

    async init() {
        this.allMoney = await this.getAllHaveMoney();
    }

    async getAllHaveMoney(): Promise<number> {
        const allWalletsData = await this.wallet.getAllWallets();
        let result = 0;

        allWalletsData.forEach((wallet) => {
            result += wallet.money;
        });

        console.log("allMoney: ", result);

        return result;
    }

    async getAllWallet(): Promise<MoneyType[]> {
        return await this.wallet.getAllWallets();
    }

    async addExpence(walletName: string, expenceName: string, expence: MoneyType): Promise<boolean> {
        const walletData = await this.wallet.getWallet(walletName);
        if (walletData.money > expence.money) {
            this.allMoney -= expence.money;
            this.expence.addExpences(expenceName, expence);
            walletData.money = walletData.money - expence.money;
            walletData.time_data = new Date().toUTCString();

            return await this.wallet.changeMoney(walletName, 1, walletData)
        } else {
            return false;
        }
    }

    async addIncome(walletName: string, incomeName: string, income: MoneyType): Promise<boolean> {
        const walletData = await this.wallet.getWallet(walletName);
        this.allMoney += income.money;
        this.income.addIncome(incomeName, income);
        walletData.money += income.money;
        walletData.time_data = new Date().toUTCString();

        return await this.wallet.changeMoney(walletName, 1, walletData);
    }

    async getIncome(incomeName: string, id: number): Promise<MoneyType> {
        return await this.income.getIncome(incomeName, id.toString());
    }

    async getExpence(expenceName: string): Promise<MoneyType> {
        return await this.expence.getExpences(expenceName);
    }

    async deleteIncome(incomeName: string, id: number): Promise<boolean> {
        return await this.income.deleteIncome(incomeName, id);
    }

    async deleteExpence(expenceName: string): Promise<boolean> {
        return await this.expence.deleteExpences(expenceName);
    }

    async deleteDatabase() {
        await this.wallet.deletData();
    }

}