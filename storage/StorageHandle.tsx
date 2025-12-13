import DBException from "../exeptions/DBExeption";
import { DB, RowType, MoneyType } from "./DB";

export type Result = {
    result: boolean,
    message: string | null
}

export type MoneyResultType = Result & MoneyType;

export type MoneyStorageType = 'expences' | 'income' | 'wallet' | 'incomeType' | 'expenceType';


export type Storages = {
    [key in MoneyStorageType]: Record<string, string>;
};

type typeData = {
    name: string,
    idType: number
}

/**
 * Класс обработки хранилища
 */
export class StorageHandle {
    private db: DB;

    storages: Storages = {
        expences: {},
        income: {},
        wallet: {},
        incomeType: {},
        expenceType: {}
    };

    private templateMoneyChanger: RowType[] = [
        { name: 'name', type: 'TEXT' },
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

    private templateType: RowType[] = [
        { name: 'name', type: 'TEXT' },
        { name: 'id_type', type: 'INTEGER' }
    ];

    private generateSafeId(length = 6) {
        const letters = 'abcdefghijklmnopqrstuvwxyz';
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let id = letters.charAt(Math.floor(Math.random() * letters.length));
        for (let i = 1; i < length; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    }

    constructor(db: DB) {
        this.db = db;
    }

    /**
     * Обновляет данные о хранилищах
     */
    async updateTablesNames() {
        const tables = await this.db.getTablesData();

        // очищение перед обновлением
        this.storages.expences = {};
        this.storages.income = {};
        this.storages.wallet = {};

        // обновление
        for (const [tableName, idRaw] of Object.entries(tables)) {
            const parts = tableName.split("_");
            const storageName = parts[0];
            if (storageName == 'wallets') {
                const type = 'wallet';
                const id = String(idRaw);
                this.storages[type][storageName] = id;
            } else {
                const type = parts[1] as MoneyStorageType;
                console.log("type", type);
                console.log("storageName", storageName);
                const id = String(idRaw);
                this.storages[type][storageName] = id;
            }

        }

        console.log("Обновились хранилища: ", this.storages);
    }

    /**
     * 
     * @param name - имя хранилища
     * @param storageType - тип хранилища: кошелек, расходы, доходы (wallet, expences, income)
     * @returns 
     */
    async addNewMoneyStorage(name: string, storageType: MoneyStorageType, storage_id: number | null = null): Promise<any> {
        try {
            let result = null;
            const id = this.generateSafeId();
            switch (storageType) {
                case 'expences':
                case 'income':
                    const tableFullName = `${id}_${storageType}`;
                    console.log("save new table with name: ", tableFullName);
                    await this.db.addNewTable(tableFullName, this.templateMoneyChanger);
                    break;
                case 'wallet':
                    await this.db.addNewTable('wallets', this.templateWallet);
                    break;
                case 'incomeType':
                    const incomeTypeTableExist = await this.db.isTableExists('incomeTypes');
                    if (!incomeTypeTableExist) {
                        await this.db.addNewTable('incomeTypes', this.templateType);
                    }
                    const typeData = { ''}
                    await this.db.setTypeDataToTable('incomeTypes',)
                default:
                    throw new DBException('Incorrect storage type');
            }
            this.storages[storageType][name] = id;
            console.log("addNewMoneyStorage result: ", result);
            return await this.getData(storageType, id);
        } catch (error) {
            console.error(error);
            return false;
        }
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
     * Возвращает все данные по типу
     * @param typeName - тип хранилища: кошелек, расходы, доходы (wallet, expences, income)
     * @returns 
     */
    async getAllDataByType(typeName: MoneyStorageType): Promise<MoneyType[]> {
        const result: MoneyType[] = [];
        console.log("getAllDataByType search by type: ", typeName);

        const typeData = this.storages[typeName];
        console.log('typeData', typeData);
        try {
            const data = await this.db.getAllDataFromTable(typeName);
            console.log("getAllDataByType result: ", data);
            return data;
        } catch (error) {
            console.error(error);
            return [];
        }
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