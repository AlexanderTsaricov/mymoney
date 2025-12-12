import DBException from '../../exeptions/DBExeption';
import { DB, MoneyType } from '../../storage/DB';
import { StorageHandle } from '../../storage/StorageHandle';


export class Wallet {
    storage: StorageHandle;
    db: DB;
    allMoney: number = 0;

    constructor(dbName: string) {
        this.db = new DB(dbName);
        this.storage = new StorageHandle(this.db);
    }

    async deleteWallet(name: string, id: number) {
        try {
            return await this.storage.deleteFromStorage('wallets', 'wallet', id);
        } catch (error) {
            console.error(error);
        }

    }
    async addWallet(startMoney: MoneyType): Promise<boolean> {
        const tableExist = await this.storage.isStorageExist('wallets');
        try {
            if (!tableExist) {
                const created = await this.storage.addNewMoneyStorage('wallets', 'wallet', startMoney);
                if (!created) {
                    throw new DBException('Не удалось создать таблицу кошелька');
                }
            }
            const result = await this.storage.setToStorage('wallets', startMoney);
            await this.storage.updateTablesNames();

            return result;
        } catch (error) {
            console.error(error);
        }

        return false;

    }



    async addNewTypeWallet(name: string) {
        return await this.storage.addNewMoneyStorage(name, 'wallet');
    }

    async getWallet(name: string) {
        const result = await this.storage.getData('wallet', 'wallets', 'name', name);
        return result;
    }

    async getAllWallets(): Promise<MoneyType[]> {
        return await this.storage.getAllDataByName('wallets');
    }

    async changeMoney(name: string, id: number, data: MoneyType): Promise<boolean> {
        return await this.storage.updateDateInStorage(name, data, id);
    }

    getWalletsNames() {
        return this.storage.storages.wallet;
    }
}