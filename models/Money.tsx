import { MoneyMoovmentType, MoneyType, StorageHandle, WalletType } from "../storage/StorageHandle";
import { Expence } from "./modelsClasses/Expence";
import { Income } from "./modelsClasses/Income";
import { Wallet } from "./modelsClasses/Wallet";
import { returnOjb } from "../storage/StorageHandle";
import { Currencies } from "./modelsClasses/Currencies";
import ModelParamsExeption from "../exeptions/ModelExeprion";

export class Money {
	allMoney: number = 0;
	storage: StorageHandle;
	expence: Expence;
	income: Income;
	wallet: Wallet;
	currencies: Currencies;

	constructor(dbName: string) {
		this.storage = new StorageHandle(dbName);
		this.expence = new Expence(this.storage);
		this.income = new Income(this.storage);
		this.wallet = new Wallet(this.storage);
		this.currencies = new Currencies(this.storage);
	}

	async init() {
		this.allMoney = await this.getAllHaveMoney();
	}

	async getAllHaveMoney(): Promise<number> {
		const resultRequest = (await this.wallet.getAllWallets()) as unknown as returnOjb;
		const allWalletsData = resultRequest.value as WalletType[];
		let result = 0;

		allWalletsData.forEach((wallet: WalletType) => {
			result += wallet.moneyCount;
		});

		return result;
	}

	async getAllWallet(): Promise<void | WalletType[]> {
		const resultRequest = await this.wallet.getAllWallets();
		if (resultRequest.result) {
			return resultRequest.value as WalletType[];
		} else {
			console.error(resultRequest.message);
		}
	}

	async deleteDatabase() {
		await this.wallet.storage.deleteAllData();
	}

	/**
	 * Конвертирует сумму из одной валюты в другую.
	 * @param amount Сумма для конвертации
	 * @param fromCurrencyId ID исходной валюты
	 * @param toCurrencyId ID целевой валюты (валюта кошелька)
	 * @returns Конвертированная сумма
	 */
	private async convertAmount(amount: number, fromCurrencyId: number, toCurrencyId: number): Promise<number> {
		if (fromCurrencyId === toCurrencyId) {
			return amount;
		}

		const fromCurrency = await this.currencies.getCurrecy(fromCurrencyId);
		const toCurrency = await this.currencies.getCurrecy(toCurrencyId);

		// Переводим сумму в базовую (head) валюту, а затем в целевую
		const amountInHeadCurrency = amount * fromCurrency.course_to_head;
		const convertedAmount = amountInHeadCurrency / toCurrency.course_to_head;

		if (!Number.isFinite(convertedAmount)) {
			throw new Error("Некорректный результат расчёта валют");
		}

		return convertedAmount;
	}

	/**
	 * Списывает расход с кошелька.
	 *
	 * @param expences Объект расхода MoneyType
	 * Возвращает ошибку при отсутствии кошелька или недостатке средств,
	 * либо результат обновления баланса кошелька.
	 */
	async addExpences(expences: MoneyType) {
		const wallets = (await this.wallet.getWalletByID(expences.wallet_id)).value as WalletType[];
		const wallet = wallets[0];

		if (wallet.id == undefined) {
			return {
				result: false,
				message: `id - undefined`,
			};
		}

		if (expences.moneyMovmentType !== "expences") {
			return {
				result: false,
				message: "Некорректный тип - income",
			};
		}

		if (wallet == null) {
			return {
				result: false,
				message: `Кошелька с id=${expences.wallet_id} не существует`,
			};
		}

		if (wallet.currency_id == expences.currency_id) {
			if (wallet.moneyCount < expences.money) {
				return {
					result: false,
					message: "Не хватает денежных средств",
				};
			}

			const resultAdd = await this.expence.addExpences(expences);

			return await this.wallet.changeMoney(wallet.id, wallet.moneyCount - expences.money);
		}

		const convertedMoneyMoovment = await this.convertAmount(expences.money, expences.currency_id, wallet.currency_id);

		if (wallet.moneyCount < convertedMoneyMoovment) {
			return {
				result: false,
				message: "Не хватает денежных средств",
			};
		}

		const resultMoney = wallet.moneyCount - convertedMoneyMoovment;

		if (!Number.isFinite(resultMoney)) {
			return {
				result: false,
				message: "Некорректный результат расчёта",
			};
		}

		const resultAdd = await this.expence.addExpences(expences);

		if (resultAdd) {
			return {
				result: await this.wallet.changeMoney(wallet.id, resultMoney),
				message: "Изменение средств кошелька с id: " + wallet.id
			}
		} else {
			return {
				result: false,
				message: "Неизвестная ошибка: не удалось добавить расход",
			};
		}
		
	}

	/**
	 * Добавляет доход в кошельк.
	 *
	 * @param expences Объект дохода MoneyType
	 * Возвращает ошибку при отсутствии кошелька,
	 * либо результат обновления баланса кошелька.
	 */
	async addIncome(income: MoneyType) {
		const wallets = (await this.wallet.getWalletByID(income.wallet_id)).value as WalletType[];
		const wallet = wallets[0];

		if (wallet.id == undefined) {
			return {
				result: false,
				message: `id - undefined`,
			};
		}

		if (income.moneyMovmentType !== "income") {
			return {
				result: false,
				message: "Некорректный тип - expences",
			};
		}

		if (wallet == null) {
			return {
				result: false,
				message: `Кошелька с id=${income.wallet_id} не существует`,
			};
		}

		if (wallet.currency_id == income.currency_id) {
			await this.income.addIncome(income);
			return await this.wallet.changeMoney(wallet.id, wallet.moneyCount + income.money);
		}

		const convertedMoneyMoovment = await this.convertAmount(income.money, income.currency_id, wallet.currency_id);
		const resultMoney = wallet.moneyCount + convertedMoneyMoovment;

		if (!Number.isFinite(resultMoney)) {
			return {
				result: false,
				message: "Некорректный результат расчёта",
			};
		}
		await this.income.addIncome(income);
		return await this.wallet.changeMoney(wallet.id, resultMoney);
	}

	/**
	 * Удаляет денежный поток
	 * @param moneyMovment - удаляемый денежный поток
	 * @returns true, если денежный поток удалось удалить
	 */
	async deleteMoneyMoovment(moneyMovment: MoneyType): Promise<boolean> {
		if (!moneyMovment.id) {
			throw new ModelParamsExeption("ID не может быть null у moneyMoovment при удалении");
		}

		let resDelete = false;
		const wallet = (await this.wallet.getWalletByID(moneyMovment.wallet_id)).value as WalletType;

		let moneyMoovmentCount = 0;

		if (moneyMovment.currency_id == wallet.currency_id) {
			moneyMoovmentCount = moneyMovment.money;
		} else {
			moneyMoovmentCount = await this.convertAmount(moneyMovment.money, moneyMovment.currency_id, wallet.currency_id);
		}
		
		switch (moneyMovment.moneyMovmentType) {
			case "income":
				resDelete = await this.income.deleteIncome(moneyMovment.id);
				if (resDelete) {
					await this.wallet.changeMoney(moneyMovment.wallet_id, wallet.moneyCount - moneyMoovmentCount);
				}
				break;
			case "expences":
				resDelete = await this.expence.deleteExpences(moneyMovment.id);
				if (resDelete) {
					await this.wallet.changeMoney(moneyMovment.wallet_id, wallet.moneyCount + moneyMoovmentCount);
				}
				break;
		}

		return resDelete;
	}

	async getAllMoneyMoovmentTypesExpences(): Promise<MoneyMoovmentType[]> {
        const tempExpences = await this.storage.getAllDataFromStorage("expenceTypes");
        return tempExpences;
    }

    async getAllMoneyMoovmentTypesIncomes(): Promise<MoneyMoovmentType[]> {
        const tempIncomes = await this.storage.getAllDataFromStorage("incomeTypes");
        return tempIncomes;
    }
}
