import DBException from "../exeptions/DBExeption";
import { DB } from "./DB";

export type MoneyStorageType = 'expences' | 'income' | 'wallet' | 'incomeType' | 'expenceType';
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

type WalletType = {
    name: string,
    moneyCount: number
}



/**
 * Класс обработки хранилища
 */
export class StorageHandle {
    private db: DB;

    constructor(db: DB) {
        this.db = db;
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


    /**
     * Создать хранилище
     * @param storageName - имя нового хранилища
     * @param storageType - тип нового хранилища
     * @param id - ID типа данных при создании хранилища трат или доходов (default = null)
     */
    async createStorage(storageName: string, storageType: MoneyStorageType, id: number | null = null) {
        const result = {
            reuslt: false,
            message: ''
        };

        try {
            switch (storageType) {
                case 'wallet':
                    const wallet: WalletType = {
                        name: storageName,
                        moneyCount: 0.00
                    };

                    if (!await this.isStorageExist("wallets")) {
                        await this.db.createTable(
                            'wallets',
                            [
                                { name: 'name', type: 'TEXT', notNull: true },
                                { name: 'moneyCount', type: 'FLOAT', notNull: true }
                            ]
                        );
                    }

                    result.reuslt = await this.db.setToTable(
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
                    if (!await this.isStorageExist(tableName)) {
                        await this.db.createTable(tableName, [{ name: 'name', type: 'TEXT', notNull: true }]);
                    }

                    result.reuslt = await this.db.setToTable(tableName, [{ name: 'name', value: storageName }]);
                    break;
                case 'income':
                case 'expences':
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
                    break;
                default:
                    result.message = 'Не верный тип хранилища';
                    return result;

            }
        } catch (error) {
            result.message = error as string;
            return result;
        }
    }

    /**
     * Добавляет денежный поток в хранилище
     * @param data - денежные данные
     * @returns 
     */
    async setMoneyToStorage(data: MoneyType) {
        if (!await this.isStorageExist("moneyMovement")) throw new DBException('table wallets not exist');
        const entries = Object.entries(data) as [keyof MoneyType, MoneyType[keyof MoneyType]][];
        const setData = []
        for (const [key, value] of entries) {
            setData.push({ name: key, value: value });
        }
        return await this.db.setToTable('moneyMovement', setData);
    }



    /**
     * Удаляет таблицу
     * @param tableName - имя хранилища
     * @returns 
     */
    async deletStorage(tableName: string) {
        return this.db.dropTable(tableName)
    }
}