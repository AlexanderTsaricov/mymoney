import { MoneyType, WalletType } from '../storage/StorageHandle';
import { Expence } from './modelsClasses/Expence';
import { Income } from './modelsClasses/Income';
import { Wallet } from './modelsClasses/Wallet';
import { returnOjb } from '../storage/StorageHandle';

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
        const resultRequest = await this.wallet.getAllWallets() as unknown as returnOjb;
        const allWalletsData = resultRequest.value as WalletType[];
        let result = 0;

        allWalletsData.forEach((wallet: WalletType) => {
            result += wallet.moneyCount;
        });

        console.log("allMoney: ", result);

        return result;
    }

    async getAllWallet(): Promise<void | WalletType[]> {
        const resultRequest = await this.wallet.getAllWallets();
        if (resultRequest.result) {
            return resultRequest.value as WalletType[];
        } else {
            console.error(resultRequest.message);
        }
    }

    async deleteDatabase() {
        await this.wallet.storage.deleteAllData();
    }

}