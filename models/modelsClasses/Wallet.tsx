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

    async deleteWallet(name: string) {
        return await this.storage.deletStorage(name + '_wallet');
    }
    async addWallet(name: string, startMoney: MoneyType): Promise<boolean> {
        const tableName = name + '_wallet';
        console.log("до проверки");
        const tableExist = await this.storage.isStorageExist(tableName);

        if (!tableExist) {
            const created = await this.storage.addNewMoneyStorage(name, 'wallet');
            if (!created) {
                throw new DBException('Не удалось создать таблицу кошелька');
            }
        }
        const result = await this.storage.setToStorage(tableName, startMoney);
        await this.storage.updateTablesNames();

        return result;
    }



    async addNewTypeWallet(name: string) {
        return await this.storage.addNewMoneyStorage(name, 'wallet');
    }

    async getWallet(name: string) {
        return await this.storage.getData('wallet', name);
    }

    async getAllWallet(): Promise<MoneyType[]> {
        const arrayIncome = this.storage.storages['wallet'];
        const result: MoneyType[] = [];

        arrayIncome.forEach(async (storageName) => {
            const data = await this.storage.getData('wallet', storageName);
            result.push(data);
        });

        return result;
    }

    async changeMoney(name: string, id: number, data: MoneyType): Promise<boolean> {
        return await this.storage.updateDateInStorage(name, data, id);
    }

    getWalletsNames() {
        return this.storage.storages.wallet;
    }
}