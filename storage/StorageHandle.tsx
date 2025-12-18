import DBException from "../exeptions/DBExeption";
import { DB } from "./DB";

export type MoneyStorageType = 'expences' | 'income' | 'wallet' | 'incomeType' | 'expenceType';
export type tableNameType = 'wallets' | 'incomeTypes' | 'expenceTypes' | 'moneyMovement';
export type Storages = {
    [key in MoneyStorageType]: Record<string, string>;
};

export type MoneyType = {
    id: number;
    money: number;
    time_data: string;
    comment: string | null;
    type: number,
    walletHashName: string,
    moneyMovementType: 'income' | 'expences'
};

export type RowType = {
    name: string;
    type: 'TEXT' | 'INTEGER';
};

export type WalletType = {
    id?: number,
    name: string,
    moneyCount: number
}

export type returnOjb = {
    result: boolean,
    message: string,
    value: MoneyType | WalletType | null | MoneyType[] | WalletType[]
}

export type MoneyMoovmentType = {
    id: number,
    name: string
}



/**
 * Класс обработки хранилища
 */
export class StorageHandle {
    private db: DB;

    constructor(dbName: string) {
        this.db = new DB(dbName);
    }

    private generateSafeId(length = 6) {
        const letters = 'abcdefghijklmnopqrstuvwxyz';
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let id = letters.charAt(Math.floor(Math.random() * letters.length));
        for (let i = 1; i < length; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    }

    /**
     * Проверяет наличие хранилища по имени
     * @param name - имя хранилища
     * @returns boolean
     */
    async isStorageExist(name: string): Promise<boolean> {
        return await this.db.isTableExists(name);
    }

    async createHeadStorages() {
        if (!await this.isStorageExist("wallets")) {
            await this.db.createTable(
                'wallets',
                [
                    { name: 'name', type: 'TEXT', notNull: true },
                    { name: 'moneyCount', type: 'FLOAT', notNull: true }
                ]
            );
        }

        if (!await this.isStorageExist('moneyMovement')) {
            await this.db.createTable('moneyMovement',
                [
                    { name: 'money', type: 'FLOAT', notNull: true },
                    { name: 'time_data', type: 'DATETIME', notNull: true },
                    { name: 'comment', type: 'TEXT', notNull: false },
                    { name: 'type', type: 'INTEGER', notNull: true },
                    { name: 'walletHashName', type: 'TEXT', notNull: true },
                    { name: 'moneyMovmentType', type: 'TEXT', notNull: true }
                ]
            );
        }

        if (!await this.isStorageExist('incomeTypes')) {
            await this.db.createTable('incomeTypes', [{ name: 'name', type: 'TEXT', notNull: true }]);
        }

        if (!await this.isStorageExist('expenceTypes')) {
            await this.db.createTable('expenceTypes', [{ name: 'name', type: 'TEXT', notNull: true }]);
        }

    }

    /**
     * Создать хранилище
     * @param storageName - имя нового хранилища
     * @param storageType - тип нового хранилища
     * @param id - ID типа данных при создании хранилища трат или доходов (default = null)
     */
    async createStorage(storageName: string, storageType: MoneyStorageType, id: number | null = null): Promise<returnOjb> {
        const result: returnOjb = {
            result: false,
            message: '',
            value: null
        };

        await this.createHeadStorages();

        try {
            switch (storageType) {
                case 'wallet':
                    const wallet: WalletType = {
                        name: storageName,
                        moneyCount: 0.00
                    };

                    result.result = await this.db.setToTable(
                        'wallets',
                        [
                            { name: 'name', value: wallet.name },
                            { name: 'moneyCount', value: wallet.moneyCount }
                        ]
                    );
                    break;
                case 'incomeType':
                case 'expenceType':
                    const tableName = storageType + 's';
                    console.log("createStorage, tableName: ", tableName);
                    result.result = await this.db.setToTable(tableName, [{ name: 'name', value: storageName }]);
                    break;
                default:
                    console.error("Не верный тип хранилища");
                    result.message = 'Не верный тип хранилища';
                    return result;

            }
        } catch (error) {
            result.message = error as string;
            return result;
        }
        return result;
    }

    /**
     * Добавляет денежное изменение в хранилище
     * @param data - денежные данные
     * @returns 
     */
    async setMoneyToStorage(data: MoneyType) {
        if (!await this.isStorageExist("moneyMovement")) throw new DBException('table moneyMovement not exist');
        const entries = Object.entries(data) as [keyof MoneyType, MoneyType[keyof MoneyType]][];
        const setData = []
        for (const [key, value] of entries) {
            setData.push({ name: key, value: value });
        }
        return await this.db.setToTable('moneyMovement', setData);
    }

    /**
     * Обновление данных денег в кошельке
     * @param idWallet - ID кошелька
     * @param moneyCount - количество денег
     * @returns 
     */
    async updateWalletData(idWallet: string, moneyCount: number) {
        if (!await this.isStorageExist("wallets")) throw new DBException('table wallets not exist');
        return await this.db.updateDataInTable('wallets', 'moneyCount', moneyCount.toString(), 'id', idWallet, '=');
    }

    /**
     * Изменяе данные денежных потоков
     * @param id - ID 
     * @param channgedProp - имя изменяемого свойства
     * @param propValue - новое значение изменяемого свойства
     * @returns 
     */
    async updateMoneyData(id: number, channgedProp: string, propValue: any) {
        if (!await this.isStorageExist("moneyMovement")) throw new DBException('table moneyMovement not exist');

        try {
            return await this.db.updateDataInTable('moneyMovement', channgedProp, propValue, 'id', id.toString(), '=');
        } catch (error) {
            console.error("Error in method updateMoneyData: ", error);
        }
    }

    /**
     * Возвращает данные из хранилища по ID
     * @param tableName - имя таблицы
     * @param id - ID строки таблицы
     * @returns 
     */
    async getDataFromStorage(tableName: tableNameType, id: number) {
        return await this.db.getFromTableByProp(tableName, 'id', id.toString(), '=');
    }

    /**
     * Возвращает данные из хранилища по имени
     * @param tableName - имя таблицы
     * @param storageName - имя хранилища
     * @returns 
     */
    async getDataFromStorageByName(tableName: tableNameType, storageName: string) {
        return await this.db.getFromTableByProp(tableName, 'name', storageName, '=');
    }

    /**
     * Возвращает все данные из типа хранилища
     * @param tableName - имя хранилиза
     * @returns 
     */
    async getAllDataFromStorage(tableName: tableNameType) {
        return await this.db.getAllFromTable(tableName);
    }

    /**
     * Удаляет строку из таблицы
     * @param tableName - имя таблицы
     * @param id - ID удаляемых данных в таблице
     * @returns 
     */
    async deleteDataFromTable(tableName: tableNameType, id: number): Promise<boolean> {
        return await this.db.deleteDataFromTable(tableName, id);
    }

    /**
     * Удаляет таблицу
     * @param tableName - имя хранилища
     * @returns 
     */
    async deletStorage(tableName: string) {
        return this.db.dropTable(tableName)
    }


    /**
     * Удаляет все данные
     */
    async deleteAllData() {
        await this.db.dropAllTables();
    }
}