import { useEffect, useState } from "react";
import { Money } from "../models/Money";
import { Currency, MoneyMoovmentType, MoneyType, WalletType } from "../storage/StorageHandle";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { pageStyles } from "../Styles/page";
import Selector, { SelectorProps } from "../components/Selector";
import Graphic, { GraphicProps } from "../components/Graphic";

type MoneyMoovmentsPageProps = {
	money: Money;
};

type SelectTimeType = "day" | "month" | "year" | "minutes" | "hours";
const timeTypes: SelectTimeType[] = ["day", "year", "month", "hours", "minutes"];
const rusDaysweek = ["День", "Год", "Месяц", "Час", "Минута"];

type moneyMoovmentTypeType = "incomes" | "expences";

const formatterDate = new Intl.DateTimeFormat("ru-RU", {
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
	hour: "2-digit",
	minute: "2-digit",
});

export default function MoneyMoovmentsPage({ money }: MoneyMoovmentsPageProps) {
	const [loading, setLoading] = useState<boolean>(true);
	const [wallets, setWallets] = useState<WalletType[]>([]);
	const [walletsNames, setWalletsNames] = useState<string[]>([]);
	const [selectWallet, setSelectWallet] = useState<WalletType | null>(null);
	const [moneyMoovmentsByWallet, setMoneyMoovmentsByWallet] = useState<MoneyType[]>([]);
	const [currencies, setCurrencies] = useState<Currency[]>([]);
	const [moneyMoovmentTypesExpences, setMoneyMoovmentsTypesExpences] = useState<MoneyMoovmentType[]>([]);
	const [moneyMoovmentTypesIncomes, setMoneyMoovmentsTypesIncomes] = useState<MoneyMoovmentType[]>([]);
	const [graphicProps, setGraphicProps] = useState<GraphicProps>({ labels: [], data: [] });
	const [selectMoneyMoovmentType, setSelectMoneyMoovmentType] = useState<moneyMoovmentTypeType>("expences");
	const [selectTimeType, setSelectTimeType] = useState<SelectTimeType>("day");

	async function loadWallets(money: Money): Promise<WalletType[]> {
		setLoading(true);
		const wallets = await money.getAllWallet();
		setLoading(false);

		if (wallets && Array.isArray(wallets)) {
			return wallets;
		} else {
			return [];
		}
	}

	async function loadCurrencies(money: Money): Promise<Currency[]> {
		setLoading(true);
		const currenciesTemp = await money.currencies.getAllCurrencies();
		setLoading(false);

		return currenciesTemp;
	}

	async function loadMoneyMoovmentTypes(money: Money) {
		const tempMoneyTypesExpences = await money.getAllMoneyMoovmentTypesExpences();
		const tempMoneyTypesIncomes = await money.getAllMoneyMoovmentTypesIncomes();

		return {
			expences: tempMoneyTypesExpences,
			incomes: tempMoneyTypesIncomes,
		};
	}

	function getMoovmentTypeNameById(id: number, type: moneyMoovmentTypeType): string {
		try {
			if (type == "expences") {
				const typeMoovment = moneyMoovmentTypesExpences.find((type) => type.id == id);
				if (typeMoovment) {
					return typeMoovment.name;
				} else {
					return "";
				}
			} else if (type == "incomes") {
				const typeMoovment = moneyMoovmentTypesIncomes.find((type) => type.id == id);
				if (typeMoovment) {
					return typeMoovment.name;
				} else {
					return "";
				}
			} else {
				return "";
			}
		} catch (e) {
			console.log(e);
			return "";
		}
	}

	useEffect(() => {
		loadWallets(money).then((wallets_res: WalletType[]) => {
			setWallets(wallets_res);

			const walletsNamesTemp: string[] = [];

			wallets_res.forEach((wallet: WalletType) => {
				walletsNamesTemp.push(wallet.name);
			});

			setWalletsNames(walletsNamesTemp);
		});

		loadCurrencies(money).then((currencies: Currency[]) => {
			setCurrencies(currencies);
		});

		loadMoneyMoovmentTypes(money).then((result) => {
			setMoneyMoovmentsTypesExpences(result.expences);
			setMoneyMoovmentsTypesIncomes(result.incomes);
		});
	}, []);

	async function loadMoneyMoovmentByWallet(wallet: WalletType): Promise<MoneyType[]> {
		if (!selectWallet || !selectWallet.id) return [];
		const expences = await money.expence.getAllExpenceByProps("wallet_id", selectWallet.id);
		const incomes = await money.income.getAllIncomeByProps("wallet_id", selectWallet.id);

		const moneyMoovmentsTemp: MoneyType[] = [...expences, ...incomes];
		moneyMoovmentsTemp.sort((a: MoneyType, b: MoneyType) => {
			return new Date(a.time_data).getTime() - new Date(b.time_data).getTime();
		});

		return moneyMoovmentsTemp;
	}

	function getCurrencyShortNameById(id: number): string {
		if (currencies.length == 0) return "";
		const index = currencies.findIndex((currency) => currency.id == id);
		return currencies[index].short_name;
	}

	function loadGraphicData(moneyMoovments: MoneyType[], selectTimeType: SelectTimeType, selectMoneyMoovmentType: moneyMoovmentTypeType) {
		const graphicProps: GraphicProps = {
			labels: [],
			data: [
				{
					data: [],
				},
			],
		};

		moneyMoovments.forEach((moneyMoovment) => {
			let time = 0;
			const date = new Date(moneyMoovment.time_data);

			switch (selectTimeType) {
				case "day":
					time = date.getDate();
					break;
				case "month":
					time = date.getMonth();
					break;
				case "year":
					time = date.getFullYear();
					break;
				case "minutes":
					time = date.getMinutes();
					break;
				case "hours":
					time = date.getHours();
					break;
			}
			if (moneyMoovment.moneyMovmentType == selectMoneyMoovmentType) {
				if (graphicProps.labels[graphicProps.labels.length - 1] == time.toString()) {
					graphicProps.data[0].data[graphicProps.data[0].data.length - 1] += moneyMoovment.money;
				} else {
					graphicProps.labels.push(time.toString());
					graphicProps.data[0].data.push(moneyMoovment.money);
				}
			}
		});

		return graphicProps;
	}

	async function deleteMoneyMoovment(moneyMoovment: MoneyType) {
		const resDelete = await money.deleteMoneyMoovment(moneyMoovment);

		if (resDelete) {
			// Создаем НОВЫЙ массив, в который попадут все элементы, КРОМЕ удаляемого
			const updatedList = moneyMoovmentsByWallet.filter((item) => item.id !== moneyMoovment.id);

			// Обновляем состояние новым массивом
			setMoneyMoovmentsByWallet(updatedList);
		}
	}

	useEffect(() => {
		if (selectWallet) {
			loadMoneyMoovmentByWallet(selectWallet).then((moovments: MoneyType[]) => {
				setMoneyMoovmentsByWallet(moovments);
			});
		}
	}, [selectWallet]);

	useEffect(() => {
		const graphicProps: GraphicProps = loadGraphicData(moneyMoovmentsByWallet, selectTimeType, selectMoneyMoovmentType);
		setGraphicProps(graphicProps);
	}, [moneyMoovmentsByWallet, selectTimeType, selectMoneyMoovmentType]);

	if (loading) {
		return (
			<View style={pageStyles.headContainer}>
				<Text style={pageStyles.text}>Загрузка...</Text>
			</View>
		);
	}

	if (wallets.length == 0) {
		return (
			<View style={pageStyles.headContainer}>
				<Text style={[pageStyles.text, {textAlign: "center", marginTop: 100, fontSize: 25}]}>У вас нет кошельков</Text>
			</View>
		);
	}

	const walletSelectorProps: SelectorProps<WalletType> = {
		title: "Выбрете кошелёк",
		titleDontHave: "Нет кошельков",
		items: walletsNames,
		onChange: function (value): void {
			const index = wallets.findIndex((wallet) => wallet.name === value);
			setSelectWallet(wallets[index]);
		},
	};

	const selectMoneyMoovmentTypeProp: SelectorProps<string> = {
		title: "Тип денежных потоков на графике",
		titleDontHave: "Ошибка",
		items: ["Доходы", "Расходы"],
		onChange: function (value: string): void {
			if (value == "Доходы") {
				setSelectMoneyMoovmentType("incomes");
			} else {
				setSelectMoneyMoovmentType("expences");
			}
		},
	};

	const selectTimeTypeProp: SelectorProps<string> = {
		title: "Тип временных промежутков на графике",
		titleDontHave: "Ошибка",
		items: rusDaysweek,
		onChange: function (value: string): void {
			const index = rusDaysweek.indexOf(value);
			setSelectTimeType(timeTypes[index]);
		},
	};

	return (
		<ScrollView style={[pageStyles.headContainer, { paddingHorizontal: 10, paddingBottom: 50 }]}>
			<Selector {...walletSelectorProps} />
			<Selector {...selectMoneyMoovmentTypeProp} />
			<Selector {...selectTimeTypeProp} />
			<View style={{ marginHorizontal: 20,  }}>
				<Text style={[pageStyles.text, { textAlign: "center", margin: 10, fontSize: 20 }]}>График</Text>
			</View>
			<Graphic labels={graphicProps.labels} data={graphicProps.data} />
			<View style={{ marginHorizontal: 20 }}>
				<Text style={[pageStyles.text, { textAlign: "center", margin: 10, fontSize: 20 }]}>Список денежных потоков</Text>
			</View>
			{selectWallet && (
				<View style={{ paddingVertical: 10, display: "flex", flexDirection: "column-reverse" }}>
					{moneyMoovmentsByWallet.map((moneyMoovment: MoneyType, key) => (
						<View key={key}>
							{moneyMoovment.moneyMovmentType == "expences" ? (
								<View
									style={[
										pageStyles.block,
										{
											display: "flex",
											flexDirection: "row",
											justifyContent: "space-between",
											width: "100%",
											alignItems: "center",
										},
									]}
								>
									<View style={[{ alignItems: "flex-start", width: "auto" }]}>
										<Text style={[pageStyles.text, { color: "#9e1414", textAlign: "left" }]}>
											Расход: {moneyMoovment.money} {getCurrencyShortNameById(moneyMoovment.currency_id)}
										</Text>
										<Text style={pageStyles.text}>Комментарий: {moneyMoovment.comment}</Text>
										<Text style={pageStyles.text}>Тип: {getMoovmentTypeNameById(moneyMoovment.type, "expences")}</Text>
										<Text style={pageStyles.text}>{formatterDate.format(new Date(moneyMoovment.time_data))}</Text>
									</View>
									<TouchableOpacity
										style={pageStyles.button}
										onPress={async () => {
											deleteMoneyMoovment(moneyMoovment);
										}}
									>
										<Text style={pageStyles.buttonText}>Удалить</Text>
									</TouchableOpacity>
								</View>
							) : (
								<View
									style={[
										pageStyles.block,
										{
											display: "flex",
											flexDirection: "row",
											justifyContent: "space-between",
											width: "100%",
											alignItems: "center",
										},
									]}
								>
									<View style={[{ alignItems: "flex-start", width: "auto" }]}>
										<Text style={[pageStyles.text, { color: "#0e721e", textAlign: "left" }]}>
											Доход: {moneyMoovment.money} {getCurrencyShortNameById(moneyMoovment.currency_id)}
										</Text>
										<Text style={pageStyles.text}>Комментарий: {moneyMoovment.comment}</Text>
										<Text style={pageStyles.text}>Тип: {getMoovmentTypeNameById(moneyMoovment.type, "incomes")}</Text>
										<Text style={pageStyles.text}>{formatterDate.format(new Date(moneyMoovment.time_data))}</Text>
									</View>
									<TouchableOpacity
										style={pageStyles.button}
										onPress={async () => {
											deleteMoneyMoovment(moneyMoovment);
										}}
									>
										<Text style={pageStyles.buttonText}>Удалить</Text>
									</TouchableOpacity>
								</View>
							)}
						</View>
					))}
				</View>
			)}
		</ScrollView>
	);
}
