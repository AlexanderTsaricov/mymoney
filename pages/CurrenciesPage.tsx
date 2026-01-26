import { Currency, HeadCurrency } from "../storage/StorageHandle";
import { CurrecyCourse } from "../components/CurrecyCourse";
import { Text, TextInput, View, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { Money } from "../models/Money";
import Form from "../components/Form";
import { InputByText } from "../components/Form";
import { FormProps } from "../components/Form";

type CurrenciesPageProps = {
	money: Money;
};

export default function CurrenciesPage({ money }: CurrenciesPageProps) {
	const [headCurrency, setHeadCurrency] = useState<HeadCurrency | null>(null);
	const [currencies, setCurrencies] = useState<Currency[]>([]);
	const [loading, setLoading] = useState(true);
	const [name, setName] = useState("");
	const [wordCode, setWordCode] = useState("");
	const [errorText, setErrorText] = useState("");

	const inputsFormProps: InputByText[] = [
		{
			labelText: "Название валюты",
			placeholder: "Рубль",
			keyboardType: undefined,
			value: name,
			onChangeText: setName,
		},
		{
			labelText: "Буквенный код",
			placeholder: "RUB",
			keyboardType: undefined,
			value: wordCode,
			onChangeText: setWordCode,
		},
	];

	const formHeadSubmitCallback = async () => {
		if (name.length !== 0 && wordCode.length !== 0) {
			await money.currencies.createHeadCurrency(name, wordCode);
			await updateCurrencies();
		} else {
			let errorInputs = "";
			if (name.length !== 0) errorInputs += "Необходимо ввести имя валюты\n";
			if (wordCode.length !== 0) errorInputs += "Необходимо ввести буквенный код валюты\n";
		}

	};

	const formProps: FormProps = {
		inputs: inputsFormProps,
		submitTextButton: "Создать валюту",
		submitOnPress: formHeadSubmitCallback
	};

	const updateCurrencies = async () => {
		const head = await money.currencies.getHeadCurrency();
		const all = await money.currencies.getAllCurrencies();
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

	return (
		<View>
			<Text>Валюты</Text>
			{loading ? (
				<View>
					<Text>Загрузка...</Text>
				</View>
			) : (
				<View>
					{headCurrency == null ? (
						<View>
							<Text>Необходимо создать основную валюту</Text>
							<Text>{errorText}</Text>
							<Form {...formProps} />
						</View>
					) : (
						<View>
							<Text>Основная валюта</Text>
							<Text>
								<Text>{headCurrency.name}</Text>{" "}
								<Text>{headCurrency.shortName}</Text>
							</Text>
							<Text>Дополнительные валюты</Text>
							<View>
								{currencies.length == 0 ? (
									<Text>У вас нет дополнительных валют</Text>
								) : (
									currencies.map((currency) => (
										<CurrecyCourse
											currency={currency}
											headCurrency={headCurrency}
										/>
									))
								)}
							</View>
						</View>
					)}
				</View>
			)}
		</View>
	);
}
