import ModelParamsExeption from "../../exeptions/ModelExeprion";
import { StorageHandle, Currency, HeadCurrency } from "../../storage/StorageHandle";

export class Currencies {
    storage: StorageHandle;

    constructor(dbName: string) {
        this.storage = new StorageHandle(dbName);
    }

    /**
     * Создает основную валюту
     * @param currencyName - имя основной валюты
     * @param shortCurrencyName - сокращенное имя (например, RUB)
     */
    public async createHeadCurrency(currencyName: string, shortCurrencyName: string) {
        if (await this.isHaveCurrency(currencyName)) {
            throw new ModelParamsExeption(`${currencyName} is have exists`);
        }
        await this.storage.createCurrencyStorage('head_currency', currencyName, shortCurrencyName);
    }

    /**
     * Создает валюту
     * @param currencyName - имя валюты
     * @param shortCurrencyName - сокращеное имя (например, RUB)
     * @param course_to_head - курс по отношению к основной валюте
     */
    public async createCurrency(currencyName: string, shortCurrencyName: string, course_to_head: number) {
        if (await this.isHaveCurrency(currencyName)) {
            throw new ModelParamsExeption(`${currencyName} is have exists`);
        }
        await this.storage.createCurrencyStorage('currencies', currencyName, shortCurrencyName, course_to_head);
    }

    /**
     * Проверяет наличие валюты
     * @param currencyName - имя валюты
     * @returns Promise<boolean>
     */
    public async isHaveCurrency(currencyName: string):Promise<boolean> {
        return await this.storage.isHaveCurrency(currencyName);
    }

    /**
     * Возвращает дополнительную валюту
     * @param id - id дополнительной валюты
     * @returns Promise<Currency>
     */
    public async getCurrecy(id: number):Promise<Currency> {
        return await this.storage.getCurrency(id);
    }

    /**
     * Возвращает основную валюту
     * @returns Promise<HeadCurrency>
     */
    public async getHeadCurrency():Promise<HeadCurrency | null> {
        return await this.storage.getHeadCurrency();
    }

    /**
     * Возвращает все дополнительные валюты
     * @returns Promise<Currency[]>
     */
    public async getAllCurrencies():Promise<Currency[]> {
        return await this.storage.getAllCurrency();
    }

    /**
     * Удаляет дополнительную валюту
     */
    public async deleteCurrency(id: number) {
        await this.storage.deleteDataFromTable('currencies', id);
    }
}