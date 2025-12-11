import * as SQLite from 'expo-sqlite';
import DBException from '../exeptions/DBExeption';
import { SQLiteDatabase } from 'expo-sqlite';

export type MoneyType = {
    name: string | null,
    id: number;
    money: number;
    time_data: string;
    comment: string | null;
};

export type RowType = {
    name: string;
    type: 'TEXT' | 'INTEGER';
};

declare module 'expo-sqlite' {
    export function openDatabaseAsync(name: string, version?: string, description?: string, size?: number): Promise<SQLiteDatabase>;
}

export class DB {
    dbName: string;
    private db: SQLite.SQLiteDatabase | null = null;

    constructor(dbName: string) {
        this.dbName = dbName;
    }



    async open() {
        if (!this.db) {
            const tmp = await SQLite.openDatabaseAsync(this.dbName);
            this.db = tmp;

            await new Promise(r => setTimeout(r, 200));
        }
    }

    private async execute(sql: string, params: any[] = []): Promise<any[]> {
        if (!this.db) throw new DBException('database not opened');

        try {
            return await (await this.db).getAllAsync(sql, params);
        } catch (err: any) {
            throw new DBException(`SQL error: ${err.message || err}`);
        }
    }




    private async get(sqlRequest: string, sqlArguments: any[] = []): Promise<any[]> {
        await this.open();
        return this.execute(sqlRequest, sqlArguments);
    }

    private async set(sqlRequest: string, sqlArguments: any[] = []): Promise<boolean> {
        await this.open();
        await this.execute(sqlRequest, sqlArguments);
        return true;
    }

    async getTablesNames(): Promise<string[]> {
        const rows = await this.get(
            `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';`
        );
        return rows.map((r: any) => r.name);
    }

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





    async addNewTable(tableName: string, rows: RowType[]): Promise<boolean> {
        const exist = await this.isTableExists(tableName);

        if (exist) throw new DBException(`Table with name ${tableName} already exists`);

        const hasId = rows.some(r => r.name.toLowerCase() === 'id');
        const columns = rows.map(r => `${r.name} ${r.type}`).join(', ');

        if (!/^[a-zA-Z0-9_]+$/.test(tableName)) throw new DBException('Invalid table name');


        const sql = `CREATE TABLE ${tableName} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ${columns}
        );`;
        return this.set(sql);
    }

    async getDataFromTable(tableName: string, selector: string, selectVal: string): Promise<MoneyType> {
        const exist = await this.isTableExists(tableName);
        if (!exist) throw new DBException(`table ${tableName} not exist`);
        const rows = await this.get(
            `SELECT * FROM ${tableName} WHERE ${selector} = ?;`,
            [selectVal]
        );

        if (!rows || rows.length === 0) {
            throw new DBException('row not found');
        }

        return rows[0] as MoneyType;
    }

    async setDataToTable(tableName: string, data: MoneyType): Promise<boolean> {
        if (!(await this.isTableExists(tableName))) throw new DBException(`table ${tableName} not exist`);

        const sql = `INSERT INTO ${tableName} (name, money, time_data, comment) VALUES (?, ?, ?, ?);`;
        return this.set(sql, [data.name, data.money, data.time_data, data.comment]);
    }

    async deleteDateFromTable(tableName: string, id: number): Promise<boolean> {
        if (!(await this.isTableExists(tableName))) throw new DBException(`table ${tableName} not exist`);

        const sql = `DELETE FROM ${tableName} WHERE id = ?;`;
        return this.set(sql, [id]);
    }

    async changeDataInTable(tableName: string, id: number, data: MoneyType): Promise<boolean> {
        if (!(await this.isTableExists(tableName))) throw new DBException(`table ${tableName} not exist`);

        const rows = await this.get(`SELECT EXISTS(SELECT 1 FROM ${tableName} WHERE id=?) as exist;`, [id]);
        if (!rows[0]?.exist) throw new DBException('id not exist');

        const sql = `UPDATE ${tableName} SET money=?, time_data=?, comment=? WHERE id=?;`;
        return this.set(sql, [data.money, data.time_data, data.comment, id]);
    }

    async dropTable(tableName: string): Promise<boolean> {
        if (!(await this.isTableExists(tableName))) throw new DBException(`table ${tableName} not exist`);
        const sql = `DROP TABLE IF EXISTS ${tableName};`;
        return this.set(sql);
    }

    async getAllData(tableName: string) {
        if (!(await this.isTableExists(tableName))) throw new DBException(`table ${tableName} not exist`);
        const sql = `SELECT * FROM ${tableName}`;
        return this.get(sql);
    }

}
