import { StorageHandle, Currency, HeadCurrency } from "../../storage/StorageHandle";

class Currencies {
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
        await this.storage.createCurrencyStorage('head_currency', currencyName, shortCurrencyName);
    }

    /**
     * Создает валюту
     * @param currencyName - имя валюты
     * @param shortCurrencyName - сокращеное имя (например, RUB)
     * @param course_to_head - курс по отношению к основной валюте
     */
    public async createCurrency(currencyName: string, shortCurrencyName: string, course_to_head: number) {
        await this.storage.createCurrencyStorage('currencies', currencyName, shortCurrencyName, course_to_head);
    }

    /**
     * Изменяет курса валюты по отношению к основной валюте
     * @param currencyId - ID валюты
     * @param course_to_head - новое значение курса по отношению к основной валюте
     */
    public async changeCourse (currencyId: number, course_to_head: number) {
        await this.storage.changeCourse(currencyId, course_to_head);
    }
}