import { MoneyMoovmentType, MoneyType, StorageHandle, WalletType } from "../storage/StorageHandle";
import { Expence } from "./modelsClasses/Expence";
import { Income } from "./modelsClasses/Income";
import { Wallet } from "./modelsClasses/Wallet";
import { returnOjb } from "../storage/StorageHandle";
import { Currencies } from "./modelsClasses/Currencies";

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

		const walletCurrency = await this.currencies.getCurrecy(wallet.currency_id);
		const expenceCurrency = await this.currencies.getCurrecy(expences.currency_id);

		let walletMoneyOnHeadCurrency = 0;
		let expenceMoneyOnHeadCurency = 0;

		walletMoneyOnHeadCurrency = wallet.moneyCount * walletCurrency.course_to_head;
		expenceMoneyOnHeadCurency = expences.money * expenceCurrency.course_to_head;

		if (walletMoneyOnHeadCurrency < expenceMoneyOnHeadCurency) {
			return {
				result: false,
				message: "Не хватает денежных средств",
			};
		}

		const newMoneyOnHeadCurrency = walletMoneyOnHeadCurrency - expenceMoneyOnHeadCurency;
		const resultMoney = newMoneyOnHeadCurrency / walletCurrency.course_to_head;

		if (!Number.isFinite(resultMoney)) {
			return {
				result: false,
				message: "Некорректный результат расчёта",
			};
		}

		const resultAdd = await this.expence.addExpences(expences);

		return await this.wallet.changeMoney(wallet.id, resultMoney);
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
			//TODO: debug
			console.log("income", income);
			await this.income.addIncome(income);
			return await this.wallet.changeMoney(wallet.id, wallet.moneyCount + income.money);
		}

		const walletCurrency = await this.currencies.getCurrecy(wallet.currency_id);
		const incomeCurrency = await this.currencies.getCurrecy(income.currency_id);

		let walletMoneyOnHeadCurrency = 0;
		let incomeMoneyOnHeadCurency = 0;

		walletMoneyOnHeadCurrency = wallet.moneyCount * walletCurrency.course_to_head;
		incomeMoneyOnHeadCurency = income.money * incomeCurrency.course_to_head;

		const newMoneyOnHeadCurrency = walletMoneyOnHeadCurrency + incomeMoneyOnHeadCurency;
		const resultMoney = newMoneyOnHeadCurrency / walletCurrency.course_to_head;

		if (!Number.isFinite(resultMoney)) {
			return {
				result: false,
				message: "Некорректный результат расчёта",
			};
		}
		await this.income.addIncome(income);
		return await this.wallet.changeMoney(wallet.id, resultMoney);
	}
}
