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

type moneyMoovmentProps = {
	money: Money;
};

export default function ExpencesPage({ money }: moneyMoovmentProps) {
	const [sum, onChangeSum] = React.useState("");
	const [isCommentFocused, setNameIsFocused] = React.useState(false);
	const [isSumFocused, setSumIsFocused] = React.useState(false);
	const [wallets, setWallets] = useState<WalletType[]>([]);
	const [loading, setLoading] = useState(true);
	const [expenceTypes, setExpenceTypes] = useState<MoneyMoovmentType[]>([]);
	const [loadingExpenceTypes, setLoadingExpenceTypes] = useState(true);
	const [newExpenceName, setNewExpence] = useState("");
	const [isExpenceNameFocused, setExpenceNameIsFocused] = React.useState(false);
	const [comment, onChangeComment] = React.useState("");
	const [isInputExpenceError, setInputExpenceError] = useState(false);
	const [isInputTypeError, setInputTypeError] = useState(false);
	const [selectWallet, setSelectWallet] = useState<WalletType | null>(null);
	const [selectExpenceType, setSelectExpenceType] = useState<MoneyMoovmentType | null>(null);
	const [currencies, setCurrencies] = useState<Currency[]>([]);
	const [selectCurrency, setSelectCurrency] = useState<Currency | null>(null);

	useEffect(() => {
		const loadWallets = async () => {
			const data = await money.wallet.getAllWallets();
			setWallets(data.value as WalletType[]);
			setLoading(false);
		};

		const loadCurrencies = async () => {
			const data: Currency[] = await money.currencies.getAllCurrencies();
			const headCurrency: Currency | null = await money.currencies.getHeadCurrency();

			if (headCurrency) {
				const filtered = data.filter((c) => c.id !== headCurrency.id);
				setCurrencies([headCurrency, ...filtered]);
			} else {
				setCurrencies(data);
			}
		};

		loadCurrencies();
		loadWallets();
	}, [money]);

	useEffect(() => {
		const loadExpenceTypes = async () => {
			const data = await money.expence.getExpencesTypes();
			setExpenceTypes(data);
			setLoadingExpenceTypes(false);
		};

		loadExpenceTypes();
	}, [money]);

	// Форма добавления расходов (начало) ---------------------------
	const expenceSelectorProps: SelectorProps<MoneyMoovmentType> = {
		title: "",
		titleDontHave: "Нет типов расходов",
		items: expenceTypes,
		onChange: setSelectExpenceType,
	};

	const walletSelectorProps: SelectorProps<WalletType> = {
		title: "",
		titleDontHave: "Нет кошельков",
		items: wallets,
		onChange: setSelectWallet,
	};

	const currenciesSelectorProps: SelectorProps<Currency> = {
		title: "",
		titleDontHave: "Нет валют",
		items: currencies,
		onChange: setSelectCurrency,
	};

	const inputs: (InputByText | InputBySelector)[] = [
		{
			labelText: "",
			keyboardType: "numeric",
			value: sum,
			onChangeText: onChangeSum,
			placeholder: "Сумма",
			required: true,
			textError: "Сумма должна быть больше 0",
		},
		{
			labelText: "",
			placeholder: "Комментарий",
			value: comment,
			onChangeText: onChangeComment,
			keyboardType: undefined,
		},
		{
			labelText: "Тип расходов",
			selectorProps: expenceSelectorProps,
		},
		{
			labelText: "Кошелек",
			selectorProps: walletSelectorProps,
		},
		{
			labelText: "Валюта",
			selectorProps: currenciesSelectorProps,
		},
	];

	const formProps: FormProps = {
		inputs: inputs,
		submitTextButton: "Добавить расход",
		submitOnPress: async () => {
			if (sum.length == 0) return;
			if (comment.length == 0) return;
			if (selectExpenceType == null) return;
			if (selectWallet == null) return;
			if (selectWallet.id == null) return;
			if (selectCurrency == null) return;
			if (selectCurrency.id == null) return;

			const newExpence: MoneyType = {
				money: parseFloat(sum),
				time_data: new Date().toString(),
				comment: comment,
				type: 0,
				wallet_id: selectWallet.id,
				moneyMovmentType: "expences",
				currency_id: selectCurrency.id,
			};

			try {
				const result = await money.addExpences(newExpence);
				if (!result.result) {
					console.error(result.message);
				} else {
					console.log(result.message);
				}
			} catch (error) {
				console.error(error);
			}
		},
	};
	// Форма добавления расходов (конец) -----------------------------------------

	return (
		<KeyboardAwareScrollView
			style={pageStyles.headContainer}
			contentContainerStyle={{ paddingBottom: 40 }}
			extraScrollHeight={120}
			enableOnAndroid={true}
			keyboardShouldPersistTaps="handled"
		>
			<ScrollView>
				<View style={pageStyles.block}>
					<Text style={pageStyles.text}>Расходы</Text>
					<Form {...formProps} />
				</View>
				<View style={pageStyles.block}>
					<Text style={pageStyles.text}>Типы расходов</Text>
					<View style={pageStyles.blockAtRow}>
						<TextInput
							placeholder="Название типа"
							value={newExpenceName}
							onChangeText={setNewExpence}
							style={[
								pageStyles.inputText,
								pageStyles.flexChild,
								isExpenceNameFocused && pageStyles.inputTextFocus,
								isInputTypeError && pageStyles.inputError,
							]}
							onFocus={() => setExpenceNameIsFocused(true)}
							onBlur={() => setExpenceNameIsFocused(false)}
							placeholderTextColor={"#a68ebf"}
						/>
						<TouchableOpacity
							style={[pageStyles.button, pageStyles.flexChild, { maxWidth: 50, height: 38 }]}
							onPress={async () => {
								if (newExpenceName == "") {
									setInputTypeError(true);
								} else {
									setInputTypeError(false);
									await money.expence.addNewTypeExpences(newExpenceName);
									const newExpenceTypes = await money.expence.getExpencesTypes();
									setExpenceTypes(newExpenceTypes);
								}
							}}
						>
							<Text style={pageStyles.buttonText}>✚</Text>
						</TouchableOpacity>
					</View>

					<MoneyMoovmentTypes money={money} moov={expenceTypes} setMoovTypes={setExpenceTypes} showButton={true} type="expence" />
				</View>
			</ScrollView>
		</KeyboardAwareScrollView>
	);
}
