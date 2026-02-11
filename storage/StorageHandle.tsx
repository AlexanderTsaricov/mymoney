import DBException from "../exeptions/DBExeption";
import { DB } from "./DB";

export type MoneyStorageType = 'expences' | 'income' | 'wallet' | 'incomeType' | 'expenceType';
export type tableNameType = 'wallets' | 'incomeTypes' | 'expenceTypes' | 'moneyMovement' | 'currencies';
export type Storages = {
    [key in MoneyStorageType]: Record<string, string>;
};

export type MoneyType = {
    id?: number;
    money: number;
    time_data: string;
    comment: string | null;
    type: number,
    wallet_id: number,
    moneyMovmentType: 'income' | 'expences',
    currency_id: number
};

export type MoneyTypeProp = 'id' | 'money' | 'time_data' | 'comment' | 'wallet_id' | MoneyMoovmentType | 'currency_id';

export type RowType = {
    name: string;
    type: 'TEXT' | 'INTEGER';
};

export type WalletType = {
    id?: number,
    name: string,
    moneyCount: number,
    currency_id: number
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

export type Currency = {
    id: number | null,
    name: string,
    short_name: string,
    course_to_head: number,
}

export type CurrencyChangeProp = 'name' | 'short_name' | 'course_to_head';
export type HeadCurrencyChangeProp = 'name' | 'short_name';

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
        // Создание таблицы валют
        if (!await this.isStorageExist('currencies')) {
            await this.db.createTable(
                'currencies',
                [
                    { name: 'name', type: 'TEXT', notNull: true },
                    { name: 'short_name', type: 'TEXT', notNull: true },
                    { name: 'course_to_head', type: 'FLOAT', notNull: true }
                ]
            );
        }

        // Создание таблицы кошельков
        if (!await this.isStorageExist("wallets")) {
            await this.db.createTable(
                'wallets',
                [
                    { name: 'name', type: 'TEXT', notNull: true },
                    { name: 'moneyCount', type: 'FLOAT', notNull: true },
                    { name: 'currency_id', type: 'INTEGER', notNull: true }
                ]
            );
        }

        // Создание таблицы денежных потоков
        if (!await this.isStorageExist('moneyMovement')) {
            await this.db.createTable('moneyMovement',
                [
                    { name: 'money', type: 'FLOAT', notNull: true },
                    { name: 'time_data', type: 'DATETIME', notNull: true },
                    { name: 'comment', type: 'TEXT', notNull: false },
                    { name: 'type', type: 'INTEGER', notNull: true },
                    { name: 'wallet_id', type: 'INTEGER', notNull: true },
                    { name: 'moneyMovmentType', type: 'TEXT', notNull: true },
                    { name: 'currency_id', type: 'INTEGER', notNull: true }
                ]
            );
        }

        // Создание таблицы типов доходов
        if (!await this.isStorageExist('incomeTypes')) {
            await this.db.createTable('incomeTypes', [{ name: 'name', type: 'TEXT', notNull: true }]);
        }

        // Создание таблицы типов расходов
        if (!await this.isStorageExist('expenceTypes')) {
            await this.db.createTable('expenceTypes', [{ name: 'name', type: 'TEXT', notNull: true }]);
        }

    }

    /**
     * Создать хранилище
     * @param storageName - имя нового хранилища
     * @param storageType - тип нового хранилища
     * @param id - ID типа данных при создании хранилища трат или доходов (default = null)
     * @param currency_id=null - ID валюты
     */
    async createStorage(storageName: string, storageType: MoneyStorageType, id: number | null = null, currency_id: number | null = null): Promise<returnOjb> {
        const result: returnOjb = {
            result: false,
            message: '',
            value: null
        };

        await this.createHeadStorages();

        try {
            switch (storageType) {
                case 'wallet':
                    if (!currency_id) throw new DBException('currency_id не может быть null');
                    const wallet: WalletType = {
                        name: storageName,
                        moneyCount: 0.00,
                        currency_id: currency_id
                    };

                    result.result = await this.db.setToTable(
                        'wallets',
                        [
                            { name: 'name', value: wallet.name },
                            { name: 'moneyCount', value: wallet.moneyCount },
                            { name: 'currency_id', value: wallet.currency_id }
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
     * Метод создает новую валюту
     * @param storageName - имя валюты
     * @param shortName - сокращенное имя валюты (например, RUB)
     * @param course_to_head - курс по отношению к главной валюте
     */
    async createCurrencyStorage(storageName: string, shortName: string, course_to_head: number = 1) {
        await this.createHeadStorages();

        await this.db.setToTable(
            'currencies',
            [
                { name: 'name', value: storageName },
                { name: 'short_name', value: shortName },
                { name: 'course_to_head', value: course_to_head }
            ]
        );
        
    }

    /**
     * Возвращает дополнительную валюту Currency по ID
     * @param id - ID валюты
     * @returns Promise<Currency>
     */
    async getCurrency(id:number):Promise<Currency> {
        await this.createHeadStorages();

        return (await this.db.getFromTableByProp('currencies', 'id', `${id}`, '='))[0] as unknown as Currency;
    }

    /**
     * Возвращает все дополнительные валюты
     * @returns Promise<Currency[]>
     */
    async getAllCurrency():Promise<Currency[]> {
        await this.createHeadStorages();

        return await this.db.getAllFromTable('currencies') as unknown[] as Currency[];
    }

    /**
     * Возвращает основную валюту
     * @returns Promise<HeadCurrency>
     */
    async getHeadCurrency():Promise<Currency | null> {
        await this.createHeadStorages();
        const result = await this.db.getFromTableByProp('currencies', 'id', '1', '=');
        if (result.length == 0) {
            return null
        } else {
            return result[0] as unknown as Currency;
        }
        
    }

    /**
     * Проверяет наличие валюты в таблице основной валюты и таблице простых валют
     * @param name - имя валюты
     * @returns Promise<boolean>
     *          true - если есть хотя бы в одной таблице валют
     *          false - если нет не в одной таблице валют
     */
    async isHaveCurrency(name: string):Promise<boolean> {
        await this.createHeadStorages();

        if (await this.db.isRowExistsByColumn('currencies', 'name', name)) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Добавляет денежное изменение в хранилище
     * @param data - денежные данные
     * @returns 
     */
    async setMoneyToStorage(data: MoneyType) {
        if (!await this.isStorageExist("moneyMovement")) throw new DBException('table moneyMovement not exist');
        const entries = Object.entries(data).filter(([key]) => key !== "id") as [keyof MoneyType, MoneyType[keyof MoneyType]][];
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
     * Меняет значение свойства у дополнительной валюты
     * @param id - id валюты
     * @param prop - Свойство валюты требующее изменения
     * @param value  - Новое значение свойства валюты
     */
    async updateCurrencyData(id:number, prop: CurrencyChangeProp, value: string) {
        if (await this.db.isRowExists('currencies', id)) {
            await this.db.updateDataInTable('currencies', prop, value, 'id', id.toString(), '=');
        } else {
            throw new DBException('Отсутствует валюта с таким id');
        }
    }

    /**
     * Изменяет значение свойства основной валюты
     * @param prop - Свойство валюты
     * @param value - Новое значение валюты
     */
    async updateHeadCurrencyData(prop: HeadCurrencyChangeProp, value: string) {
        if (await this.db.isRowExists('currencies', 1)) {
            await this.db.updateDataInTable('currencies', prop, value, 'id', '1', '=');
        } else {
            throw new DBException('Отсутствует основная валюта');
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
     * Возвращает массив объектов, поле prop, которого соответствует value
     * @param tableName имя таблицы
     * @param prop имя поля
     * @param value значение поля
     * @returns 
     */
    async getDataFromStorageByProp(tableName: tableNameType, prop: MoneyTypeProp, value: any) {
        return await this.db.getFromTableByProp(tableName, prop as string, value, '=');
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