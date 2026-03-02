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
import PageParamExeption from "../exeptions/PageParamExeption";
import Calendar from "../components/Calendar";
import Logger from "../logger/Logger";

type HomeProps = {
	money: Money;
};

type WalletsProps = {
	money: Money;
};

type TimeType = "year" | "month" | "day" | "hour" | "minutes";

function getSumMoney(moneyMoovments: MoneyType[]) {
	const result = moneyMoovments.reduce((sum, item) => {
		if (item.moneyMovmentType == "income") {
			return sum + item.money;
		} else if (item.moneyMovmentType == "expences") {
			return sum - item.money;
		} else {
			throw new PageParamExeption("Не верный параметр moneyMovmentType: " + item.moneyMovmentType);
		}
	}, 0);

	return result;
}

const Home: React.FC<HomeProps> = ({ money }) => {
	const [loading, setLoading] = useState<boolean>(false);
	const [wallets, setWallets] = useState<WalletType[]>([]);
	const [selectWallet, setSelectWallet] = useState<WalletType | null>(null);
	const [selectTimeType, setSelectTimeType] = useState<TimeType | null>(null);
	const [graphicLabels, setGraphicLabels] = useState<string[]>([]);
	const [graphicDatasets, setGraphicDatasets] = useState<Dataset[]>([]);
	const [moneyMoovments, setMoneyMoovments] = useState<MoneyType[]>([]);
	const [minTimeCalendar, setMinTimeCalendar] = useState<number>(0);
	const [maxTimeCalendar, setMaxTimeCalendar] = useState<number>(0);
	const [showCalendar, setShowCalendar] = useState<boolean>(false);

	const emptyWalletsProps: SelectorProps<WalletType> = {
		title: "Выбор кошелька для графика",
		titleDontHave: "Нет кошельков",
		items: [],
		onChange: function (value: WalletType | null): void {},
	};
	const [selectorWalletsProps, setSelectorWalletProps] = useState<SelectorProps<WalletType>>(emptyWalletsProps);

	const getAllWallets = async () => {
		const result: WalletType[] = (await money.getAllWallet()) as unknown as WalletType[];
		return result;
	};

	// Устанавливает параметры селектора кошелька
	const loadWalletSelectorProps = async (wallets: WalletType[]) => {
		if (wallets.length > 0) {
			const props: SelectorProps<WalletType> = {
				title: "Выбор кошелька для графика",
				titleDontHave: "Нет кошельков",
				items: wallets,
				onChange: (v) => setSelectWallet(v),
			};

			setSelectorWalletProps(props);
		}
	};

	// Устанавливает максимальное и минимальное значения календаря
	const loadCalendarData = (moneyMoovments: MoneyType[]) => {
		if (moneyMoovments.length > 0) {
			setMinTimeCalendar(new Date(moneyMoovments[0].time_data).getTime());
			setMaxTimeCalendar(new Date(moneyMoovments[moneyMoovments.length - 1].time_data).getTime());
		}
	};

	// Загружает денежные потоки по переданному кошельку и сортирует по времени
	const loadMoneyMoovmentByWallet = async (wallet: WalletType) => {
		if (!wallet.id) return;

		const incomes = await money.income.getAllIncomeByProps("wallet_id", wallet.id);
		const expences = await money.expence.getAllExpenceByProps("wallet_id", wallet.id);

		const moneyMoovment: MoneyType[] = [...incomes, ...expences];

		moneyMoovment.sort((a, b) => {
			const aDate = new Date(a.time_data).getTime();
			const bDate = new Date(b.time_data).getTime();

			return aDate - bDate;
		});

		setMoneyMoovments(moneyMoovment);
	};

	const setterGraphicProps = async (moneyMoovments: MoneyType[], wallet: WalletType, startTime: Date, endTime: Date | null = null) => {
		let moneyMoovmentsFromStart = moneyMoovments.filter((moneyMoovment) => {
			const moneyMoovmentDate = new Date(moneyMoovment.time_data).getTime();

			return moneyMoovmentDate >= startTime.getTime();
		});

		if (endTime) {
			moneyMoovmentsFromStart = moneyMoovmentsFromStart.filter((moneyMoovment) => {
				const moneyMoovmentDate = new Date(moneyMoovment.time_data).getTime();
				return moneyMoovmentDate <= endTime.getTime();
			});
		}

		const fromStartSum = getSumMoney(moneyMoovmentsFromStart);

		const startMoney = wallet.moneyCount - fromStartSum;

		const moneyChangedProps: number[] = [startMoney];
		const timeChangedProps: number[] = [];
		let money = startMoney;

		moneyMoovmentsFromStart.forEach((moneyMoovment) => {
			switch (moneyMoovment.moneyMovmentType) {
				case "income":
					money += moneyMoovment.money;
					moneyChangedProps.push(money);
					break;
				case "expences":
					money -= moneyMoovment.money;
					moneyChangedProps.push(money);
					break;
			}
		});
		let dataset: Dataset = {
			data: [],
		};
		try {
			dataset = {
				data: moneyChangedProps,
			};
		} catch (e) {
			console.error(e);
		}

		let datasets: Dataset[] = [];

		try {
			datasets.push(dataset);
		} catch (e) {
			console.error(e);
		}
		setGraphicDatasets(datasets);

		switch (selectTimeType) {
			case "day":
				timeChangedProps.push(startTime.getDate());
				break;
			case "month":
				timeChangedProps.push(startTime.getMonth());
				break;
			case "year":
				timeChangedProps.push(startTime.getFullYear());
				break;
			case "minutes":
				timeChangedProps.push(startTime.getMinutes());
				break;
			case "hour":
				timeChangedProps.push(startTime.getHours());
				break;
		}

		moneyMoovmentsFromStart.forEach((moneyMoovment) => {
			switch (selectTimeType) {
				case "day":
					timeChangedProps.push(new Date(moneyMoovment.time_data).getDate());
					break;
				case "month":
					timeChangedProps.push(new Date(moneyMoovment.time_data).getMonth());
					break;
				case "year":
					timeChangedProps.push(new Date(moneyMoovment.time_data).getFullYear());
					break;
				case "minutes":
					timeChangedProps.push(new Date(moneyMoovment.time_data).getMinutes());
					break;
				case "hour":
					timeChangedProps.push(new Date(moneyMoovment.time_data).getHours());
					break;
			}
		});

		const timeChangePropsStringArr: string[] = [];

		timeChangedProps.forEach((element) => {
			timeChangePropsStringArr.push(element.toString());
		});

		setGraphicLabels(timeChangePropsStringArr);
	};

	const loadAllWallets = async () => {
		const wallets = await getAllWallets();
		setWallets(wallets);
	};

	// поочередная загрузка ----------  начало
	useEffect(() => {
		setLoading(true);
		loadAllWallets();
	}, []);

	useEffect(() => {
		if (wallets.length > 0) {
			loadWalletSelectorProps(wallets);
		}
	}, [wallets]);

	useEffect(() => {
		if (selectWallet) {
			loadMoneyMoovmentByWallet(selectWallet);
		}
	}, [selectWallet]);

	useEffect(() => {
		if (moneyMoovments.length > 0) {
			loadCalendarData(moneyMoovments);
		}
	}, [moneyMoovments]);

	useEffect(() => {
		if (selectWallet && selectTimeType && moneyMoovments.length > 0) {
			const startTimeData = new Date(moneyMoovments[0].time_data);
			setterGraphicProps(moneyMoovments, selectWallet, startTimeData);
		}
	}, [selectTimeType, moneyMoovments]);
	//[selectWallet, selectTimeType, moneyMoovments]

	useEffect(() => {
		setLoading(false);
	}, [graphicDatasets]);

	// поочередная загрузка ---------- конец

	const selectorTimeTypeProps: SelectorProps<TimeType> = {
		title: "Выбор интервала для графика",
		titleDontHave: "Ошибка",
		items: ["day", "year", "month", "hour", "minutes"],
		onChange: (v) => setSelectTimeType(v),
	};

	const selectDatasCollbackCalendar = (result: number[]) => {
		const selectedStartDate: Date = new Date(result[0]);
		const selectedEndDate: Date = new Date(result[1]);
		Logger.log(
			`Год: ${selectedStartDate.getFullYear()}, месяц: ${selectedStartDate.getMonth()}, день: ${selectedStartDate.getDate()}`,
			false,
			"Выбранное время от: ",
		);
		Logger.log(
			`Год: ${selectedEndDate.getFullYear()}, месяц: ${selectedEndDate.getMonth()}, день: ${selectedEndDate.getDate()}`,
			false,
			"Выбранное время до: ",
		);
		if (selectWallet) {
			setterGraphicProps(moneyMoovments, selectWallet, selectedStartDate, selectedEndDate);
		}
	};

	let graphicElement = <Text style={pageStyles.text}>Нет данных</Text>;

	try {
		graphicElement = <Graphic labels={graphicLabels} data={graphicDatasets} />;
	} catch (e) {
		console.error("Graphic render error:", e);
	}

	if (loading) {
		return (
			<View style={pageStyles.headContainer}>
				<Text style={pageStyles.text}>Загрузка...</Text>
			</View>
		);
	} else {
		return (
			<View style={pageStyles.headContainer}>
				<View style={pageStyles.block}>
					<Text style={pageStyles.text}>Баланс</Text>
					<Wallets money={money} wallets={wallets} setWallets={setWallets} showButton={false} />
					<TouchableOpacity style={pageStyles.button} onPress={async () => await money.deleteDatabase()}>
						<Text style={pageStyles.buttonText}>Удалить данные</Text>
					</TouchableOpacity>
				</View>
				<View style={pageStyles.block}>{graphicElement}</View>
				<View style={pageStyles.block}>
					<TouchableOpacity
						onPress={() => {
							if (showCalendar) {
								setShowCalendar(false);
							} else {
								setShowCalendar(true);
							}
						}}
						style={pageStyles.button}
					>
						<Text style={pageStyles.buttonText}>Выбрать диапазон графика</Text>
					</TouchableOpacity>
					<Calendar
						showCalendar={showCalendar}
						setShowCalendar={setShowCalendar}
						callbackSelect={(value) => {
							selectDatasCollbackCalendar(value);
						}}
						minTime={minTimeCalendar}
						maxTime={maxTimeCalendar}
					/>
				</View>
				<View style={pageStyles.block}>
					<Selector {...selectorWalletsProps} />
					<Selector {...selectorTimeTypeProps} />
				</View>
			</View>
		);
	}
};

export default Home;
