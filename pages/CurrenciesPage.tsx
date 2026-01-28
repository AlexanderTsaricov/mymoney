import { Currency, HeadCurrency } from "../storage/StorageHandle";
import { CurrecyCourse } from "../components/CurrecyCourse";
import { Text, TextInput, View, TouchableOpacity, GestureResponderEvent } from "react-native";
import { useEffect, useState } from "react";
import { Money } from "../models/Money";
import Form from "../components/Form";
import { InputByText } from "../components/Form";
import { FormProps } from "../components/Form";
import { pageStyles } from "../Styles/page";
import ModelParamsExeption from "../exeptions/ModelExeprion";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type CurrenciesPageProps = {
	money: Money;
};

export default function CurrenciesPage({ money }: CurrenciesPageProps) {
	const [headCurrency, setHeadCurrency] = useState<HeadCurrency | null>(null);
	const [currencies, setCurrencies] = useState<Currency[]>([]);
	const [loading, setLoading] = useState(true);
	const navigation = useNavigation<NativeStackNavigationProp<any>>();

	// Форма основной валюты (начало) --------------------------------
	const [nameHeadCurrecy, setNameHeadCurrecy] = useState("");
	const [wordCodeHeadCurrency, setWordCodeHeadCurrency] = useState("");
	const inputsHeadCurrecyFormProps: InputByText[] = [
		{
			labelText: "Название валюты",
			placeholder: "Рубль",
			keyboardType: undefined,
			value: nameHeadCurrecy,
			onChangeText: setNameHeadCurrecy,
			required: true
		},
		{
			labelText: "Буквенный код",
			placeholder: "RUB",
			keyboardType: undefined,
			value: wordCodeHeadCurrency,
			onChangeText: setWordCodeHeadCurrency,
			required: true
		},
	];
	const formHeadSubmitCallback = async () => {
		if (nameHeadCurrecy.length !== 0 && wordCodeHeadCurrency.length !== 0) {
			await money.currencies.createHeadCurrency(nameHeadCurrecy, wordCodeHeadCurrency);
			await updateCurrencies();
		}
	};
	const formHeadCurrencyProps: FormProps = {
		inputs: inputsHeadCurrecyFormProps,
		submitTextButton: "Создать валюту",
		submitOnPress: formHeadSubmitCallback,
	};
	// Форма основной валюты (конец) --------------------------------------------------

	// Форма дополнительной валюты (начало) -------------------------------------------
	const [newCurrencyName, setNewCurrencyName] = useState("");
	const [newCurrencyWordCode, setNewCurrencyWordCode] = useState("");
	const [newCurrencyCourse, setNewCurrencyCourse] = useState("");
	const inputsNewCurrencyFormProps: InputByText[] = [
		{
			labelText: "Название валюты",
			placeholder: "Рубль",
			keyboardType: undefined,
			value: newCurrencyName,
			onChangeText: setNewCurrencyName,
			required: true
		},
		{
			labelText: "Буквенный код",
			placeholder: "RUB",
			keyboardType: undefined,
			value: newCurrencyWordCode,
			onChangeText: setNewCurrencyWordCode,
			required: true
		},
		{
			labelText: "Курс к основной валюте",
			placeholder: "80.06",
			keyboardType: "number-pad",
			value: newCurrencyCourse,
			onChangeText: setNewCurrencyCourse,
			required: true
		},
	];
	const submitFormNewCurrency = async () => {
		if (newCurrencyName.length != 0 && newCurrencyWordCode.length != 0 && newCurrencyCourse.length != 0) {
			await money.currencies.createCurrency(newCurrencyName, newCurrencyWordCode, parseFloat(newCurrencyCourse));
			await updateCurrencies();
		}
	};
	const formNewCurrencyProps: FormProps = {
		inputs: inputsNewCurrencyFormProps,
		submitTextButton: "Добавить валюту",
		submitOnPress: submitFormNewCurrency,
	};
	// Форма дополнительной валюты (конец) --------------------------------------------

	const updateCurrencies = async () => {
		const head = await money.currencies.getHeadCurrency();
		const all = await money.currencies.getAllCurrencies();
		console.log(all);
		setHeadCurrency(head);
		setCurrencies(all);
	};

	useEffect(() => {
		const load = async () => {
			await updateCurrencies();
			setLoading(false);
		};

		load();
	}, []);

	const deleteCurrency = async (id: number) => {
		await money.currencies.deleteCurrency(id);
		await updateCurrencies();
	};

	return (
		<View style={pageStyles.headContainer}>
			{loading ? (
				<View style={pageStyles.block}>
					<Text style={pageStyles.text}>Загрузка...</Text>
				</View>
			) : (
				<View>
					{headCurrency == null ? (
						<View style={pageStyles.block}>
							<Text style={pageStyles.text}>Необходимо создать основную валюту</Text>
							<Form {...formHeadCurrencyProps} />
						</View>
					) : (
						<View>
							<View style={pageStyles.block}>
								<Text style={pageStyles.text}>
									<Text>Основная валюта:</Text> <Text style={{ color: "blue" }}>{headCurrency.name}</Text>{" "}
									<Text style={{ color: "green" }}>{headCurrency.short_name}</Text>
								</Text>
							</View>
							<View style={pageStyles.block}>
								<Text style={pageStyles.text}>Дополнительные валюты</Text>
								<Form {...formNewCurrencyProps} />
								<View>
									{currencies.length == 0 ? (
										<Text style={[pageStyles.text, { color: "red" }]}>У вас нет дополнительных валют</Text>
									) : (
										currencies.map((currency) => (
											<CurrecyCourse
												key={currency.id}
												currency={currency}
												headCurrency={headCurrency}
												navigation={navigation}
												deleteCurrency={() => {
													if (currency.id) {
														deleteCurrency(currency.id);
													} else {
														throw new ModelParamsExeption(`Некорректный ID валюты ${currency.short_name}`);
													}
												}}
											/>
										))
									)}
								</View>
							</View>
						</View>
					)}
				</View>
			)}
		</View>
	);
}
