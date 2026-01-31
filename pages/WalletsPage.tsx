import * as React from "react";
import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, TextInput, GestureResponderEvent } from "react-native";
import { Money } from "../models/Money";
import { pageStyles } from "../Styles/page";
import { Currency, returnOjb } from "../storage/StorageHandle";
import { Wallets } from "../components/Wallets";
import { WalletType } from "../storage/StorageHandle";
import Form, { FormProps, InputBySelector, InputByText } from "../components/Form";
import { SelectorProps } from "../components/Selector";
import CreateDataExeption from "../exeptions/CreateDataExeption";

type WalletsPageProps = {
	money: Money;
};

export default function WalletsPage({ money }: WalletsPageProps) {
	const [isNameFocused, setNameIsFocused] = React.useState(false);
	const [isSumFocused, setSumIsFocused] = React.useState(false);
	const [wallets, setWallets] = useState<WalletType[]>([]);
	const [loading, setLoading] = useState(true);
	const [enterError, setEnterError] = useState(false);
	const [currencies, setCurrencies] = useState<Currency[]>([]);

	const loadWallets = async () => {
		setLoading(true);
		const data = await money.wallet.getAllWallets();
		setWallets(data.value as WalletType[]);
		setLoading(false);
	};

	useEffect(() => {
		const loadCurrencies = async () => {
			const data: Currency[] = await money.currencies.getAllCurrencies();
			const headCurrency: Currency | null = await money.currencies.getHeadCurrency();

			if (headCurrency) {
				setCurrencies([headCurrency, ...data]);
			}
		};

		loadCurrencies();
		loadWallets();
	}, [money]);

	// Форма создания кошелька (начало) ------------------------------------

	const [newWalletName, onChangeNewWalletName] = React.useState("");
	const [startSum, onChangeStartSum] = React.useState("");
	const [selectCurrency, setSelectCurrency] = React.useState<Currency | null>(null);

	const selectorProps: SelectorProps<Currency> = {
		title: "",
		titleDontHave: "Отсутствуют валюты",
		items: currencies,
		onChange: setSelectCurrency,
	};

	const inputs: (InputByText | InputBySelector)[] = [
		{
			labelText: "",
			placeholder: "Имя кошелька",
			keyboardType: undefined,
			value: newWalletName,
			onChangeText: onChangeNewWalletName,
			required: true,
			textError: "Имя не может быть пустым",
		},
		{
			labelText: "",
			placeholder: "Стартовая сумма",
			keyboardType: "numeric",
			value: startSum,
			onChangeText: onChangeStartSum,
		},
		{
			labelText: "Валюта",
			selectorProps: selectorProps,
		},
	];

	const addNewWallet = async () => {
		try {
			if (selectCurrency == null) {
				return;
			}
			if (selectCurrency.id == null) {
				return;
			}

			const createResult = await money.wallet.addWallet(newWalletName, selectCurrency.id);
			if (!createResult.result) {
				throw new CreateDataExeption(createResult.message);
			}
			const returnRequest = (await money.wallet.getWalletByName(newWalletName)) as unknown as returnOjb;
			if (returnRequest.value != null) {
				const newWallet = (returnRequest.value as WalletType[])[0];
				if (parseFloat(startSum) != 0 && newWallet.id != undefined) {
					await money.wallet.changeMoney(newWallet.id, parseFloat(startSum));
				}
			}
		} catch (error) {
			console.error("Ошибка создания кошелька", error);
		}

		await loadWallets();
	};

	const formProps: FormProps = {
		inputs: inputs,
		submitTextButton: "Добавить кошелёк",
		submitOnPress: addNewWallet,
	};

	// Форма создания кошелька (конец) ------------------------------------

	return (
		<View style={pageStyles.headContainer}>
			<View style={pageStyles.block}>
				<Text style={pageStyles.text}>Новый кошелек</Text>
				<Form {...formProps} />
			</View>
			<View style={pageStyles.block}>
				<Text style={pageStyles.text}>Кошельки</Text>
				<Wallets money={money} wallets={wallets} setWallets={setWallets} showButton={true} />
			</View>
		</View>
	);
}
