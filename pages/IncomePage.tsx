import * as React from "react";
import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, GestureResponderEvent } from "react-native";
import { Money } from "../models/Money";
import { pageStyles } from "../Styles/page";
import { Currency, MoneyMoovmentType, MoneyType, WalletType } from "../storage/StorageHandle";
import Selector, { SelectorProps } from "../components/Selector";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { MoneyMoovmentTypes } from "../components/MoneyMoovmentTypes";
import Form, { FormProps, InputBySelector, InputByText } from "../components/Form";
import ModalMessage, { ModalMessageProp } from "../components/ModalMessage";

type IncomeProps = {
	money: Money;
};

export default function IncomePage({ money }: IncomeProps) {
	const [isCommentFocused, setNameIsFocused] = React.useState(false);
	const [isSumFocused, setSumIsFocused] = React.useState(false);
	const [isIncomeNameFocused, setIncomeNameIsFocused] = React.useState(false);
	const [comment, onChangeComment] = React.useState("");
	const [loading, setLoading] = useState<boolean>(false);

	// Форма добавления дохода (начало) -----------------------------
	const [sum, onChangeSum] = React.useState("");
	const [wallets, setWallets] = useState<WalletType[]>([]);
	const [incomeTypes, setIncomeTypes] = useState<MoneyMoovmentType[]>([]);
	const [newIncomeName, setNewIncome] = useState("");
	const [selectWallet, setSelectWallet] = useState<WalletType | null>(null);
	const [selectIncomeType, setSelectIncomeType] = useState<MoneyMoovmentType | null>(null);
	const [currencies, setCurrencies] = useState<Currency[]>([]);
	const [selectCurrency, setSelectCurrency] = useState<Currency | null>(null);
	const [showModalMessage, setShowModalMessage] = useState<boolean>(false);

	const loadWallets = async () => {
		const data = await money.wallet.getAllWallets();
		setWallets(data.value as WalletType[]);
	};

	const loadIncomeTypes = async () => {
		const data = await money.income.getIncomesTypes();
		setIncomeTypes(data);
	};

	const loadCurrency = async () => {
		const data = await money.currencies.getAllCurrencies();
		setCurrencies(data);
	};

	const selectorTypeIncomeProps: SelectorProps<MoneyMoovmentType> = {
		title: "",
		titleDontHave: "Отстутсвуют типы доходов",
		items: incomeTypes,
		onChange: setSelectIncomeType,
	};

	const selectorWalletsProps: SelectorProps<WalletType> = {
		title: "",
		titleDontHave: "Отсутствуют кошельки",
		items: wallets,
		onChange: setSelectWallet,
	};

	const selectorCurrencyProps: SelectorProps<Currency> = {
		title: "",
		titleDontHave: "Отсутствуют валюты",
		items: currencies,
		onChange: setSelectCurrency,
	};

	const inputsNewIncome: (InputByText | InputBySelector)[] = [
		{
			labelText: "",
			placeholder: "Сумма",
			keyboardType: "numeric",
			value: sum,
			onChangeText: onChangeSum,
		},
		{
			labelText: "",
			placeholder: "Комментарий",
			keyboardType: undefined,
			value: comment,
			onChangeText: onChangeComment,
		},
		{
			labelText: "Тип дохода",
			selectorProps: selectorTypeIncomeProps,
		},
		{
			labelText: "Кошелёк",
			selectorProps: selectorWalletsProps,
		},
		{
			labelText: "Валюта",
			selectorProps: selectorCurrencyProps,
		},
	];

	const formNewIncomeProps: FormProps = {
		inputs: inputsNewIncome,
		submitTextButton: "Добавить доход",
		submitOnPress: async () => {
			if (sum.length == 0) return;
			if (selectIncomeType == null) return;
			if (selectWallet == null) return;
			if (selectWallet.id == null) return;
			if (selectCurrency == null) return;
			if (selectCurrency.id == null) return;

			const newIncome: MoneyType = {
				money: parseFloat(sum),
				time_data: new Date().toString(),
				comment: comment,
				type: selectIncomeType.id,
				wallet_id: selectWallet.id,
				moneyMovmentType: "income",
				currency_id: selectCurrency.id,
			};

			try {
				const result = await money.addIncome(newIncome);
				if (!result.result) {
					console.error(result.message);
				} else {
					console.log(result.message);
					setShowModalMessage(true);
				}
			} catch (error) {
				console.error(error);
			}
		},
	};
	// Форма добавления дохода (конец) ------------------------------

	useEffect(() => {
		setLoading(true);
		const allLoading = async () => {
			await loadWallets();
			await loadIncomeTypes();
			await loadCurrency();
		};
		setLoading(false);
		allLoading();
	}, [money]);

	const clearForm = () => {
		onChangeSum("");
		onChangeComment("");
	};

	return (
		<KeyboardAwareScrollView
			style={pageStyles.headContainer}
			contentContainerStyle={{ paddingBottom: 20 }}
			extraScrollHeight={120}
			enableOnAndroid={true}
			keyboardShouldPersistTaps="handled"
		>
			{loading ? (
				<Text style={pageStyles.text}>Загрузка...</Text>
			) : (
				<View>
					<ModalMessage
						message="Доход добавлен"
						show={showModalMessage}
						setShow={setShowModalMessage}
						style={pageStyles.messageModal}
						callbackIfOk={clearForm}
					/>
					<ScrollView>
						<View style={pageStyles.block}>
							<Text style={pageStyles.text}>Доходы</Text>
							<Form {...formNewIncomeProps} />
						</View>
						<View style={pageStyles.block}>
							<Text style={pageStyles.text}>Типы доходов</Text>
							<View style={pageStyles.blockAtRow}>
								<TextInput
									placeholder="Название типа"
									value={newIncomeName}
									onChangeText={setNewIncome}
									style={[pageStyles.inputText, pageStyles.flexChild, isIncomeNameFocused && pageStyles.inputTextFocus]}
									onFocus={() => setIncomeNameIsFocused(true)}
									onBlur={() => setIncomeNameIsFocused(false)}
									placeholderTextColor={"#a68ebf"}
								/>
								<TouchableOpacity
									style={[pageStyles.button, pageStyles.flexChild, { maxWidth: 50, height: 38 }]}
									onPress={async () => {
										await money.income.addNewTypeIncome(newIncomeName);
										const newIncomeTypes = await money.income.getIncomesTypes();

										setIncomeTypes(newIncomeTypes);
									}}
								>
									<Text style={pageStyles.buttonText}>✚</Text>
								</TouchableOpacity>
							</View>
							<MoneyMoovmentTypes money={money} moov={incomeTypes} setMoovTypes={setIncomeTypes} showButton={true} type="income" />
						</View>
					</ScrollView>
				</View>
			)}
		</KeyboardAwareScrollView>
	);
}
