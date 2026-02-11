import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, TouchableOpacity } from "react-native";
import { pageStyles } from "../Styles/page";
import { Money } from "../models/Money";
import { MoneyMoovmentType, MoneyType, WalletType } from "../storage/StorageHandle";
import { Wallets } from "../components/Wallets";
import Graphic, { GraphicProps } from "../components/Graphic";
import { Dataset } from "react-native-chart-kit/dist/HelperTypes";
import { MoneyMoovmentTypes } from "../components/MoneyMoovmentTypes";

type HomeProps = {
	money: Money;
};

type WalletsProps = {
	money: Money;
};

type TimeType = 'year' | 'month' | 'day' | 'hour' | 'minutes';

const Home: React.FC<HomeProps> = ({ money }) => {
	const [wallets, setWallets] = useState<WalletType[]>([]);
	const [expencies, setExpencies] = useState<MoneyType[]>([]);
	const [incomes, setIncomes] = useState<MoneyType[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectWallet, setSelectWallet] = useState<WalletType | null>(null);
	const [incomesByWallet, setIncomesByWallet] = useState<MoneyType[] | null>(null);
	const [expencesByWallet, setExpencesByWalley] = useState<MoneyType[] | null>(null);
	const [moneyMoovmentByWallet, setMoneyMoovmentByWallet] = useState<MoneyType[]>([]);
	const [timeDatas, setTimeDatas] = useState<string[]>([]);
	const [graphicLabels, setGraphicLabels] = useState<string[]>([]);
	const [graphicDatasets, setGraphicDatasets] = useState<Dataset[]>([]);

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
		if (selectWallet != null) {
			// Загружаем доходы и расходы по id кошелька
			const incomes = await money.income.getAllIncomeByProps("wallet_id", selectWallet.id);
			const expences = await money.expence.getAllExpenceByProps("wallet_id", selectWallet.id);

			//TODO: Удалить стейт, если будет не нужен
			setIncomesByWallet(incomes);
			setExpencesByWalley(expences);
		}

		if (incomesByWallet != null && expencesByWallet != null) {
			const moneyMoovment = [...incomesByWallet, ...expencesByWallet];
			moneyMoovment.sort((a, b) => new Date(a.time_data).getTime() - new Date(b.time_data).getTime());

			setMoneyMoovmentByWallet(moneyMoovment);
		}
	};

	const loadGraphicData = async (timeType: TimeType) => {
		if (selectWallet != null) {
			const filtredTimes: string[] = [];
			switch (timeType) {
				case "year":
					moneyMoovmentByWallet.forEach(moneyMoovment => {
						const date = (new Date(moneyMoovment.time_data)).getFullYear().toString();
						if (!filtredTimes.includes(date)) {
							filtredTimes.push(date);
						}
						
					});
					break;
				case "month":
					moneyMoovmentByWallet.forEach(moneyMoovment => {
						const date = (new Date(moneyMoovment.time_data)).getMonth().toString();
						if (!filtredTimes.includes(date)) {
							filtredTimes.push();
						}
					});
					break;
				case "day":
					moneyMoovmentByWallet.forEach(moneyMoovment => {
						const date = (new Date(moneyMoovment.time_data)).getDay().toString();
						if (!filtredTimes.includes(date)) {
							filtredTimes.push(date);
						}
					});
					break;
				case "hour":
					moneyMoovmentByWallet.forEach(moneyMoovment => {
						const date = (new Date(moneyMoovment.time_data)).getHours().toString();
						if (!filtredTimes.includes(date)) {
							filtredTimes.push(date);
						}
					});
					break;
				case "minutes":
					moneyMoovmentByWallet.forEach(moneyMoovment => {
						const date = (new Date(moneyMoovment.time_data)).getMinutes().toString();
						if (!filtredTimes.includes(date)) {
							filtredTimes.push(date);
						}
					})
					break;		
			}

			setGraphicLabels(filtredTimes)
		}
	};

	const loadDatas = async () => {
		
	}

	useEffect(() => {}, [selectWallet]);

	const walletsGraphicProps: GraphicProps = {
		labels: [],
		data: [],
	};
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
					<View style={pageStyles.block}></View>
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
