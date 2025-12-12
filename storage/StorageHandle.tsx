import DBException from "../exeptions/DBExeption";
import { DB, RowType, MoneyType } from "./DB";

export type Result = {
    result: boolean,
    message: string | null
}

export type MoneyResultType = Result & MoneyType;

export type MoneyStorageType = 'expences' | 'income' | 'wallet';


export type Storages = {
    [key in MoneyStorageType]: string[];
}

/**
 * Класс обработки хранилища
 */
export class StorageHandle {
    private db: DB;

    storages: Storages = {
        expences: [],
        income: [],
        wallet: []
    }

    private templateMoneyChanger: RowType[] = [
        { name: 'money', type: 'INTEGER' },
        { name: 'comment', type: 'TEXT' },
        { name: 'time_data', type: 'TEXT' }
    ];

    private templateWallet: RowType[] = [
        { name: 'name', type: 'TEXT' },
        { name: 'money', type: 'INTEGER' },
        { name: 'time_data', type: 'TEXT' },
        { name: 'comment', type: 'TEXT' }
    ];

    constructor(db: DB) {
        this.db = db;
    }

    /**
     * Обновляет данные о хранилищах
     */
    async updateTablesNames() {
        const tablesNames = await this.db.getTablesNames();

        // очищение перед обновлением
        Object.keys(this.storages).forEach(key => this.storages[key as MoneyStorageType] = []);

        for (const tableName of tablesNames) {
            if (tableName === 'wallets') {
                const wallets = await this.getAllDataByName('wallets');
                this.storages.wallet = wallets.map(money => money.name) as unknown as string[];
            } else {
                const parts = tableName.split("_").filter(Boolean);
                if (parts.length < 2) continue;
                const [storageName, typeName] = parts;
                if (this.storages[typeName as MoneyStorageType]) {
                    this.storages[typeName as MoneyStorageType].push(storageName);
                }
            }
        }

    }

    /**
     * 
     * @param name - имя хранилища
     * @param storageType - тип хранилища: кошелек, расходы, доходы (wallet, expences, income)
     * @returns 
     */
    async addNewMoneyStorage(name: string, storageType: MoneyStorageType, money: MoneyType | null = null): Promise<boolean> {
        const tableFullName = `${name}_${storageType}`;
        let result = null;
        if (storageType == "expences" || storageType == "income") {
            result = await this.db.addNewTable(tableFullName, this.templateMoneyChanger);
        } else {
            result = await this.db.addNewTable('wallets', this.templateWallet);
        }
        this.storages[storageType].push(name);
        return result;
    }


    /**
     * 
     * @param typeName - тип хранилища: кошелек, расходы, доходы (wallet, expences, income)
     * @param storageName - имя хранилища
     * @returns 
     */
    async getData(
        typeName: MoneyStorageType,
        storageName: string,
        selector: string,
        selectVal: string
    ): Promise<MoneyResultType> {
        try {
            let data: MoneyType;

            if (typeName === 'wallet') {
                // просто вызываем метод, который уже умеет работать с транзакцией
                data = await this.db.getDataFromTable('wallets', selector, selectVal);
            } else {
                data = await this.db.getDataFromTable(`${storageName}_${typeName}`, selector, selectVal);
            }

            return {
                ...data,
                result: true,
                message: 'Ok'
            };
        } catch (e) {
            if (e instanceof DBException) {
                return {
                    result: false,
                    message: e.message,
                    id: 0,
                    money: 0,
                    time_data: '',
                    comment: '',
                    name: null
                };
            }
            throw e;
        }
    }



    /**
     * 
     * @param typeName - тип хранилища: кошелек, расходы, доходы (wallet, expences, income)
     * @returns 
     */
    async getAllDataByType(typeName: MoneyStorageType): Promise<MoneyType[]> {
        const typeDataArray = this.storages[typeName];
        const data = await Promise.all(
            typeDataArray.map(name =>
                this.db.getDataFromTable(`${name}_${typeName}`, 'name', name)
            )
        );
        return data;

    }

    async getAllDataByName(tableName: string): Promise<MoneyType[]> {
        return await this.db.getAllData(tableName);
    }

    /**
     * Добавить данные в хранилище
     * @param name - имя хранилища
     * @param data - объект данных хранилища
     */
    async setToStorage(name: string, data: MoneyType): Promise<boolean> {
        return this.db.setDataToTable(name, data);
    }

    /**
     * Удалить данные из хранилища
     * @param name - имя хранилища
     * @param id - ID трат или доходов
     * @returns - boolean удалось удалить или нет
     */
    async deleteFromStorage(name: string, type: MoneyStorageType, id: number): Promise<boolean> {
        const data = await this.getData(type, name, 'id', id.toString()) as MoneyResultType;
        if (data.result) {
            return await this.db.deleteDateFromTable(name, data.id);
        } else {
            return false;
        }
    }


    /**
     * Изменяет данные в хранилище
     * @param name - имя хранилища
     * @param data - данные (вставятся все)
     * @param id - ID данных в хранилище
     * @returns 
     */
    async updateDateInStorage(name: string, data: MoneyType, id: number): Promise<boolean> {
        const result = await this.db.changeDataInTable(name, id, data);

        return result
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
     * Удаляет таблицу
     * @param tableName - имя хранилища
     * @returns 
     */
    async deletStorage(tableName: string) {
        return this.db.dropTable(tableName)
    }
}