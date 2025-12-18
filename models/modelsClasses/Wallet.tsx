import { StorageHandle, returnOjb } from '../../storage/StorageHandle';
import { MoneyType, WalletType } from '../../storage/StorageHandle';


export class Wallet {
    storage: StorageHandle;
    allMoney: number = 0;

    constructor(dbName: string) {
        this.storage = new StorageHandle(dbName);
    }

    /**
     * Добавляет новый кошелёк
     * @param walletName - имя нового кошелька
     */
    async addWallet(walletName: string): Promise<returnOjb> {
        const tableExist = await this.storage.isStorageExist('wallets');
        if (tableExist) {
            try {
                return await this.storage.createStorage(walletName, 'wallet');
            } catch (error) {
                console.error(error);
                return {
                    result: false,
                    message: error as string,
                    value: null
                };
            }
        } else {
            console.error("Не удалось создать кошельёк");
        }

        return {
            result: false,
            message: "Не удалось создать кошелек",
            value: null
        };

    }

    /**
     * Удаляет кошелёк
     * @param id - ID кошелька
     */
    async deleteWallet(id: number): Promise<returnOjb> {
        const result: returnOjb = {
            message: 'Не удалось удалить кошелёк',
            result: false,
            value: null
        }

        try {
            result.result = await this.storage.deleteDataFromTable('wallets', id);
            result.message = 'Кошелёк удален';
        } catch (error) {
            console.error(error);
            result.message = error as string;
        }

        return result;

    }

    /**
     * Возвращает кошелёк по ID
     * @param id - ID кошелька
     */
    async getWalletByID(id: number) {
        const result: returnOjb = {
            message: 'Не получить кошелёк',
            result: false,
            value: null
        }

        try {
            result.result = true;
            result.value = await this.storage.getDataFromStorage('wallets', id) as unknown as WalletType;
            result.message = 'Кошелёк получен';
        } catch (error) {
            console.error(error);
            result.message = error as string;
        }

        return result;
    }

    /**
     * Возвращает кошелёк по имени
     * @param name - имя кошелька
     */
    async getWalletByName(name: string) {
        const result: returnOjb = {
            message: 'Не получить кошелёк',
            result: false,
            value: null
        }

        try {
            result.result = true;
            result.value = await this.storage.getDataFromStorageByName('wallets', name) as unknown as WalletType;
            result.message = 'Кошелёк получен';
        } catch (error) {
            console.error(error);
            result.message = error as string;
        }

        return result;
    }

    /**
     * Возвращает все кошельки
     */
    async getAllWallets(): Promise<returnOjb> {
        const result: returnOjb = {
            message: 'Не вышло получить кошельки',
            result: false,
            value: null
        }
        try {
            if (!await this.storage.isStorageExist('wallets')) {
                await this.storage.createHeadStorages();
            }
            result.result = true;
            result.value = await this.storage.getAllDataFromStorage('wallets') as unknown as WalletType[];
            result.message = "Данные кошельков получены";
            console.log(result.value);
        } catch (error) {
            console.error(error);
            result.message = error as string;
        }

        return result;
    }

    /**
     * Изменяет количество денег в кошельке
     * @param id - ID кошелька
     * @param count - новое количество денег на кошельке
     */
    async changeMoney(id: number, count: number): Promise<returnOjb> {
        const result: returnOjb = {
            message: 'Не вышло получить кошельки',
            result: false,
            value: null
        }
        
        try {
            result.result = await this.storage.updateWalletData(id.toString(), count);
            result.message = `Изменены данные кошелька`;
        } catch (error) {
            console.error(error);
            result.message = error as string;
        }

        return result;

    }
}