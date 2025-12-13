import * as SQLite from 'expo-sqlite';
import DBException from '../exeptions/DBExeption';
import { SQLiteDatabase } from 'expo-sqlite';

export type typeColumn = {
    name: string,
    type:
    | 'INTEGER'
    | 'REAL'
    | 'TEXT'
    | 'BLOB'
    | 'NUMERIC'
    | 'BOOLEAN'
    | 'DATE'
    | 'DATETIME'
    | 'CHAR'
    | 'VARCHAR'
    | 'DECIMAL'
    | 'FLOAT'
    | 'DOUBLE',
    notNull: boolean
};

export type setDataType = {
    name: string,
    value: any
};

export type oreratorType = '>' | '<' | '=' | '>=' | '<=';

declare module 'expo-sqlite' {
    export function openDatabaseAsync(name: string, version?: string, description?: string, size?: number): Promise<SQLiteDatabase>;
};

export class DB {
    dbName: string;
    private db: SQLite.SQLiteDatabase | null = null;

    constructor(dbName: string) {
        this.dbName = dbName;
    }

    /**
     * Проверяет открыта ли БД
     */
    async open() {
        if (!this.db) {
            const tmp = await SQLite.openDatabaseAsync(this.dbName);
            this.db = tmp;

            await new Promise(r => setTimeout(r, 200));
        }
    }

    /**
     * 
     * @param sql - sql строка
     * @param params - параметры sql строки
     * @returns 
     */
    private async execute(sql: string, params: any[] = []): Promise<any[]> {
        if (!this.db) throw new DBException('database not opened');

        try {
            return await (await this.db).getAllAsync(sql, params);
        } catch (err: any) {
            throw new DBException(`SQL error: ${err.message || err}`);
        }
    }




    /**
     * получить данные
     * @param sqlRequest - sql строка
     * @param sqlArguments - аргументы sql строкии
     * @returns 
     */
    private async get(sqlRequest: string, sqlArguments: any[] = []): Promise<any[]> {
        console.log("sql get: ", sqlRequest);
        await this.open();
        return await this.execute(sqlRequest, sqlArguments);
    }

    /**
     * Вставить данные
     * @param sqlRequest - sql строка
     * @param sqlArguments - аргументы sql строкии
     * @returns 
     */
    private async set(sqlRequest: string, sqlArguments: any[] = []): Promise<boolean> {
        console.log("sql set: ", sqlRequest);
        await this.open();
        await this.execute(sqlRequest, sqlArguments);
        return true;
    }

    /**
     * Проверяет есть ли таблица в БД
     * @param tableName - имя таблицы
     * @returns true - если таблица существует
     */
    async isTableExists(tableName: string): Promise<boolean> {
        await this.open();
        if (this.db == null) throw new DBException('db is null');

        try {
            const rows = await this.db!.getAllAsync(
                `PRAGMA table_info('${tableName}');`
            );
            return rows.length > 0;
        } catch (err: any) {
            if (err.message.includes('no such table')) return false;
            throw new DBException(`SQL error: ${err.message || err}`);
        }
    }

    /**
     * Создать таблицу
     * @param tableName - имя новой таблицы
     * @param columns - имена колонок и их тип
     */
    async createTable(tableName: string, columns: typeColumn[]) {
        if (await this.isTableExists(tableName)) throw new DBException(`table ${tableName} exist`);
        let sql = `CREATE TABLE ${tableName} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,\n
        `
        columns.forEach((column) => {
            sql += `    ${column.name} ${column.type} `;
            if (column.notNull) {
                sql += "NOT NULL,\n";
            } else {
                sql += ",\n";
            }
        });
        sql = sql.replace(/,\n$/, "\n") + ")";

        return await this.set(sql, []);
    }


    /**
     * Вставить данные в таблицу
     * @param tableName - имя таблицы
     * @param setData - данные для вставки
     * @returns true
     */
    async setToTable(tableName: string, setData: setDataType[]) {
        if (!await this.isTableExists(tableName)) throw new DBException(`table ${tableName} not exist`);
        let sql = `INSERT INTO ${tableName}\n (`;
        const insertData: string[] = [];
        setData.forEach(data => {
            sql += `${data.name}, `;
        });
        sql += ")\n VALUES (";
        setData.forEach(data => {
            sql += `?, `;
            insertData.push(data.value);
        });
        sql = sql.replace(/,\n$/, "\n") + ")";
        return await this.set(sql, insertData);
    }


    /**
     * Получить все данные из таблицы
     * @param tableName - имя таблицы
     * @returns 
     */
    async getAllFromTable(tableName: string) {
        if (!await this.isTableExists(tableName)) throw new DBException(`table ${tableName} not exist`);
        let sql = `SELECT * FROM ${tableName}`;
        return await this.get(sql, []);
    }

    /**
     * Получить данные по свойству
     * @param tableName - имя таблицы
     * @param propName - имя свойства
     * @param prop - значение свойства
     * @param operator - оператор сравнения (>, <, =, >=, <=)
     * @returns 
     */
    async getFromTableByProp(tableName: string, propName: string, prop: string, operator: oreratorType) {
        if (!await this.isTableExists(tableName)) throw new DBException(`table ${tableName} not exist`);
        const sql = `SELECT * FROM ${tableName} WHERE ${propName} ${operator} ?`;
        return await this.get(sql, [prop]);
    }

    async deleteDataFromTable(tableName: string, id: number): Promise<boolean> {
        if (!(await this.isTableExists(tableName))) throw new DBException(`table ${tableName} not exist`);

        const sql = `DELETE FROM "${tableName}" WHERE id = ?;`;
        return this.set(sql, [id]);
    }

    async dropTable(tableName: string): Promise<boolean> {
        if (!(await this.isTableExists(tableName))) throw new DBException(`table ${tableName} not exist`);
        const sql = `DROP TABLE IF EXISTS "${tableName}";`;
        return this.set(sql);
    }

    async dropAllTables(): Promise<void> {
        try {
            // Получаем все пользовательские таблицы
            const tables = await this.get(
                `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';`
            );

            for (const table of tables) {
                const tableName = table.name;
                try {
                    console.log(`Deleting table: "${tableName}"`);
                    await this.set(`DROP TABLE IF EXISTS "${tableName}";`);
                } catch (innerError) {
                    console.error(`Failed to drop table "${tableName}":`, innerError);
                    throw innerError; // пробрасываем дальше
                }
            }

            console.log('All tables deleted successfully.');
        } catch (error) {
            console.error('Error while dropping tables:', error);
            throw error; // пробрасываем дальше
        }
    }

}
