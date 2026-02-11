import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, TouchableOpacity } from "react-native";
import { pageStyles } from "../Styles/page";
import { Money } from "../models/Money";
import { MoneyMoovmentType, MoneyType, WalletType } from "../storage/StorageHandle";
import { Wallets } from "../components/Wallets";
import Graphic, { GraphicProps } from "../components/Graphic";
import { Dataset } from "react-native-chart-kit/dist/HelperTypes";
import { MoneyMoovmentTypes } from "../components/MoneyMoovmentTypes";
import Selector, { SelectorProps } from "../components/Selector";

type HomeProps = {
	money: Money;
};

type WalletsProps = {
	money: Money;
};

type TimeType = "year" | "month" | "day" | "hour" | "minutes";

const Home: React.FC<HomeProps> = ({ money }) => {
	const [wallets, setWallets] = useState<WalletType[]>([]);
	const [expencies, setExpencies] = useState<MoneyType[]>([]);
	const [incomes, setIncomes] = useState<MoneyType[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectWallet, setSelectWallet] = useState<WalletType | null>(null);
	const [moneyMoovmentByWallet, setMoneyMoovmentByWallet] = useState<MoneyType[]>([]);
	const [timeDatas, setTimeDatas] = useState<string[]>([]);
	const [graphicLabels, setGraphicLabels] = useState<string[]>([]);
	const [graphicDatasets, setGraphicDatasets] = useState<Dataset[]>([]);
	const [selectTimeType, setSelectTimeType] = useState<TimeType>("day");
	const [walletsGraphicProps, setWalletsGraphicProps] = useState<GraphicProps>({ labels: [], data: [] });
	const [selectorWalletsProps, setSelectorWalletsProps] = useState<SelectorProps<WalletType>>({
		title: "Кошелёк на графике",
		titleDontHave: "Нет кошельков",
		items: wallets,
		onChange: setSelectWallet,
	});
	const [selectorTimeTypeProps, setSelectorTimeTypeProps] = useState<SelectorProps<TimeType>>({
		title: "Интервал",
		titleDontHave: "Нет типов времени",
		items: ["day", "hour", "minutes", "month", "year"],
		onChange: (value) => {
			if (value !== null) {
				setSelectTimeType(value);
			}
		},
	});

	useEffect(() => {
		const loadWallets = async () => {
			const data = await money.wallet.getAllWallets();
			setWallets(data.value as unknown as WalletType[]);
			setSelectWallet(wallets[0]);
		};

		const loadExpencies = async () => {
			const data = await money.expence.getAllExpences();
			setExpencies(data);
		};

		const loadIncomes = async () => {
			const data = await money.income.getAllIncome();
			setIncomes(data);
		};

		const loadAll = async () => {
			setLoading(true);
			await loadWallets();
			await loadExpencies();
			await loadIncomes();
			setLoading(false);
		};

		loadAll();
	}, [money]);

	const loadMoneyMoovmentByWallet = async () => {
		//TODO: debug
		console.log("select wallet", selectWallet);

		if (selectWallet != null) {
			// Загружаем доходы и расходы по id кошелька
			const incomes = await money.income.getAllIncomeByProps("wallet_id", selectWallet.id);
			const expences = await money.expence.getAllExpenceByProps("wallet_id", selectWallet.id);

			//TODO: debug
			console.log("incomes", incomes);
			console.log("expences", expences);

			const moneyMoovment = [...incomes, ...expences];

			//TODO: debug
			console.log("moneyMoovment", moneyMoovment);

			// Сортируем по времени и ставим в стейт
			if (moneyMoovment.length > 0) {
				moneyMoovment.sort((a, b) => new Date(a.time_data).getTime() - new Date(b.time_data).getTime());
				setMoneyMoovmentByWallet(moneyMoovment);
			}
		} else {
			console.log("Page: home", "Не выбран кошелёк");
			return setMoneyMoovmentByWallet([]);
		}
	};

	const loadGraphicData = async (timeType: TimeType) => {
		await loadMoneyMoovmentByWallet();

		//TODO: debug
		console.log("select wallet", selectWallet);

		if (selectWallet != null) {
			const filtredTimes: string[] = [];
			const filtredDatas: Dataset = {
				data: [],
			};
			let sum = 0;
			switch (timeType) {
				case "year":
					moneyMoovmentByWallet.forEach((moneyMoovment) => {
						const date = new Date(moneyMoovment.time_data).getFullYear().toString();

						if (moneyMoovment.moneyMovementType == "income") {
							sum += moneyMoovment.money;
						} else {
							sum -= moneyMoovment.money;
						}

						if (!filtredTimes.includes(date)) {
							filtredTimes.push(date);
							filtredDatas.data.push(sum);
						} else {
							filtredDatas.data[filtredDatas.data.length - 1] = filtredDatas.data[filtredDatas.data.length - 1] + sum;
						}
					});
					break;
				case "month":
					moneyMoovmentByWallet.forEach((moneyMoovment) => {
						const date = new Date(moneyMoovment.time_data).getMonth().toString();

						if (moneyMoovment.moneyMovementType == "income") {
							sum += moneyMoovment.money;
						} else {
							sum -= moneyMoovment.money;
						}

						if (!filtredTimes.includes(date)) {
							filtredTimes.push(date);
							filtredDatas.data.push(sum);
						} else {
							filtredDatas.data[filtredDatas.data.length - 1] = filtredDatas.data[filtredDatas.data.length - 1] + sum;
						}
					});
					break;
				case "day":
					moneyMoovmentByWallet.forEach((moneyMoovment) => {
						const date = new Date(moneyMoovment.time_data).getDay().toString();

						if (moneyMoovment.moneyMovementType == "income") {
							sum += moneyMoovment.money;
						} else {
							sum -= moneyMoovment.money;
						}

						if (!filtredTimes.includes(date)) {
							filtredTimes.push(date);
							filtredDatas.data.push(sum);
						} else {
							filtredDatas.data[filtredDatas.data.length - 1] = filtredDatas.data[filtredDatas.data.length - 1] + sum;
						}
					});
					break;
				case "hour":
					moneyMoovmentByWallet.forEach((moneyMoovment) => {
						const date = new Date(moneyMoovment.time_data).getHours().toString();

						if (moneyMoovment.moneyMovementType == "income") {
							sum += moneyMoovment.money;
						} else {
							sum -= moneyMoovment.money;
						}

						if (!filtredTimes.includes(date)) {
							filtredTimes.push(date);
							filtredDatas.data.push(sum);
						} else {
							filtredDatas.data[filtredDatas.data.length - 1] = filtredDatas.data[filtredDatas.data.length - 1] + sum;
						}
					});
					break;
				case "minutes":
					moneyMoovmentByWallet.forEach((moneyMoovment) => {
						const date = new Date(moneyMoovment.time_data).getMinutes().toString();

						if (moneyMoovment.moneyMovementType == "income") {
							sum += moneyMoovment.money;
						} else {
							sum -= moneyMoovment.money;
						}

						if (!filtredTimes.includes(date)) {
							filtredTimes.push(date);
							filtredDatas.data.push(sum);
						} else {
							filtredDatas.data[filtredDatas.data.length - 1] = filtredDatas.data[filtredDatas.data.length - 1] + sum;
						}
					});
					break;
			}

			setGraphicLabels(filtredTimes);

			const datasets: Dataset[] = [];
			datasets.push(filtredDatas);

			//TODO: debug
			console.log("filtredTimes", filtredTimes);
			console.log("filtredDatas", filtredDatas);

			if (filtredDatas.data.length == 0) {
				setGraphicDatasets([]);
			} else {
				setGraphicDatasets(datasets);
			}
		}
	};

	const loadWalletsSelectorProps = async (wallets: WalletType[]) => {
		setSelectorWalletsProps({
			title: "Кошелёк на графике",
			titleDontHave: "Нет кошельков",
			items: wallets,
			onChange: setSelectWallet,
		});
	};

	useEffect(() => {
		loadWalletsSelectorProps(wallets);
	}, [wallets]);

	useEffect(() => {
		loadGraphicData(selectTimeType);
	}, [selectWallet, selectTimeType]);

	return (
		<View style={pageStyles.headContainer}>
			{loading ? (
				<Text style={pageStyles.text}>Загрузка...</Text>
			) : (
				<View>
					<View style={pageStyles.block}>
						<Text style={pageStyles.text}>Баланс</Text>
						<Wallets money={money} wallets={wallets} setWallets={setWallets} showButton={false} />
						<TouchableOpacity style={pageStyles.button} onPress={async () => await money.deleteDatabase()}>
							<Text style={pageStyles.buttonText}>Удалить данные</Text>
						</TouchableOpacity>
					</View>
					<View style={pageStyles.block}>
						<Graphic labels={graphicLabels} data={graphicDatasets} />
						<Selector {...selectorWalletsProps} />
						<Selector {...selectorTimeTypeProps} />
					</View>
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, justifyContent: "center", alignItems: "center" },
	title: { fontSize: 24, marginBottom: 20 },
	money: { fontSize: 20, marginBottom: 10 },
});

export default Home;
