import { useEffect, useRef, useState } from "react";
import { View, Button, TouchableOpacity, Text, TextInput, ScrollView, KeyboardAvoidingView, Keyboard } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { recognizeText } from "@infinitered/react-native-mlkit-text-recognition";
import { pageStyles } from "../Styles/page";
import CheckBox from "@react-native-community/checkbox";
import { Currency, MoneyMoovmentType, MoneyType, WalletType } from "../storage/StorageHandle";
import { Money } from "../models/Money";
import Selector, { SelectorProps } from "../components/Selector";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

type TextBlock = {
	text: string;
};

type OCRResult = {
	blocks: TextBlock[];
};

type PriceItem = {
	price: string;
	checked: boolean;
};

type ReceiptScannerProps = {
	money: Money;
};

export default function ReceiptScanner({ money }: ReceiptScannerProps) {
	const [permission, requestPermission] = useCameraPermissions();
	const cameraRef = useRef<CameraView | null>(null);
	const [parsedText, setParsedText] = useState<PriceItem[]>([]);
	const [incomeTypes, setIncomeTypes] = useState<MoneyMoovmentType[]>([]);
	const [expenceTypes, setExpenceTypes] = useState<MoneyMoovmentType[]>([]);
	const [sum, setSum] = useState<number>(0);
	const [selectMoneyMoovmentType, setSelectMoneyMoovmentType] = useState<"income" | "expences">("income");
	const [selectMoneyMoovment, setSelectMoneyMoovment] = useState<string>();
	const [selectorMoneyMoovmentProps, setSelectorMoneyMoovmentProps] = useState<SelectorProps<string>>({
		title: "Выбор типа",
		titleDontHave: "Нет типов",
		items: incomeTypes,
		onChange: function (value: string): void {
			setSelectMoneyMoovment(value);
		},
	});
	const [wallets, setWallets] = useState<WalletType[]>([]);
	const [selectWallet, setSelectWallet] = useState<WalletType>();
	const [selectCurrency, setSelectCurrency] = useState<Currency | null>(null);
	const [currencies, setCurrencies] = useState<Currency[]>([]);
	const [comment, onChangeComment] = useState("");

	const loadIncomeTypes = async () => {
		const data = await money.income.getIncomesTypes();
		setIncomeTypes(data);

		setSelectorMoneyMoovmentProps({
			title: "Выбор типа",
			titleDontHave: "Нет типов",
			items: data,
			onChange: function (value: string): void {
				setSelectMoneyMoovment(value);
			},
		});
	};

	const loadExpenceTypes = async () => {
		const data = await money.expence.getExpencesTypes();
		setExpenceTypes(data);
	};

	const loadWallets = async () => {
		const data = await money.wallet.getAllWallets();
		setWallets(data.value as WalletType[]);
	};

	const loadCurrencies = async () => {
		const all = await money.currencies.getAllCurrencies();
		setCurrencies(all);
	};

	useEffect(() => {
		loadIncomeTypes();
		loadExpenceTypes();
		loadWallets();
		loadCurrencies();
	}, []);

	if (!permission) return <View />;

	if (!permission.granted) {
		return (
			<View>
				<Button title="Разрешить камеру" onPress={requestPermission} />
			</View>
		);
	}

	const extractPrices = (text: string): string[] => {
		const matches = text.match(/\d+[.,]\d{2}/g);
		return matches ?? [];
	};

	const takePhoto = async (): Promise<void> => {
		if (!cameraRef.current) return;

		const result = await cameraRef.current.takePictureAsync();
		if (!result?.uri) return;

		const ocr = (await recognizeText(result.uri)) as OCRResult;

		const text = ocr.blocks.map((b: TextBlock) => b.text).join("\n");

		const prices = extractPrices(text).filter((price) => {
			if (price != "0.00") {
				return true;
			}
		});

		const tempObjectPrices: PriceItem[] = prices.map((price) => ({
			price,
			checked: false,
		}));

		setParsedText(tempObjectPrices);
		console.log("PRICES:", prices);
	};

	const selectorMoomventIntems = ["Доход", "Расход"];
	const selectorMoovmentTypeProps: SelectorProps<string> = {
		title: "",
		titleDontHave: "",
		items: selectorMoomventIntems,
		onChange: function (value: string): void {
			if (!selectorMoomventIntems || !value) return;
			if (selectorMoomventIntems.indexOf(value) == 0) {
				setSelectMoneyMoovmentType("income");
				setSelectorMoneyMoovmentProps({
					title: "Выбор типа",
					titleDontHave: "Нет типов",
					items: incomeTypes,
					onChange: function (value: string): void {
						setSelectMoneyMoovment(value);
					},
				});
			} else {
				setSelectMoneyMoovmentType("expences");
				setSelectorMoneyMoovmentProps({
					title: "Выбор типа",
					titleDontHave: "Нет типов",
					items: expenceTypes,
					onChange: function (value: string): void {
						setSelectMoneyMoovment(value);
					},
				});
			}
		},
	};

	const selectorWalletsProps: SelectorProps<WalletType> = {
		title: "Выбор кошелька",
		titleDontHave: "Отсутствуют кошельки",
		items: wallets,
		onChange: setSelectWallet,
	};

	const selectorCurrencyProps: SelectorProps<Currency> = {
		title: "Выбор валюты",
		titleDontHave: "Отсутствуют валюты",
		items: currencies,
		onChange: setSelectCurrency,
	};

	const addToSum = (index: number, addingSum: number) => {
		setSum(sum + addingSum);
		setParsedText(parsedText.filter((_, i) => i !== index));
	};

	const submitOnPress = async () => {
		if (sum == 0) return;
		if (selectMoneyMoovment == null) return;
		if (selectWallet == null) return;
		if (selectWallet.id == null) return;
		if (selectCurrency == null) return;
		if (selectCurrency.id == null) return;

		const newMoneyMoovment: MoneyType = {
			money: sum,
			time_data: new Date().toString(),
			comment: "",
			type: 0,
			wallet_id: selectWallet.id,
			moneyMovmentType: selectMoneyMoovmentType,
			currency_id: selectCurrency.id,
		};

		try {
			let result = null;
			if (selectMoneyMoovmentType == "income") {
				result = await money.addIncome(newMoneyMoovment);
			} else {
				result = await money.addExpences(newMoneyMoovment);
			}
			if (!result.result) {
				console.error(result.message);
			} else {
				console.log(result.message);
			}
		} catch (error) {
			console.error(error);
		}
	};

	return parsedText.length > 0 ? (
		<KeyboardAwareScrollView
			style={pageStyles.headContainer}
			contentContainerStyle={{ paddingBottom: 0 }}
			enableOnAndroid={true}
			extraScrollHeight={320}
			keyboardShouldPersistTaps="handled"
		>
			{parsedText.map((line, index) => (
				<View key={index} style={[pageStyles.blockAtRow, { justifyContent: "space-between", margin: 10 }]}>
					<Text style={[pageStyles.text, { fontSize: 20 }]}>Сумма: {line.price}</Text>
					<TouchableOpacity
						style={[pageStyles.button, { marginLeft: 10 }]}
						onPress={() => {
							addToSum(index, parseFloat(line.price));
						}}
					>
						<Text style={pageStyles.buttonText}>Добавить</Text>
					</TouchableOpacity>
				</View>
			))}

			<View style={[pageStyles.block, { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.25)" }]}>
				<Text style={[pageStyles.text, { textAlign: "left", fontSize: 20 }]}>Сумма: {sum}</Text>
				<Selector {...selectorMoovmentTypeProps} />
				<Selector {...selectorMoneyMoovmentProps} />
				<Selector {...selectorWalletsProps} />
				<Selector {...selectorCurrencyProps} />
				<View style={pageStyles.blockAtRow}>
					<Text style={[pageStyles.text, { fontSize: 20, marginRight: 5 }]}>Комментарий</Text>
					<TextInput style={[pageStyles.inputText, { width: 200 }]} value={comment} onChangeText={onChangeComment}/>
				</View>
				<TouchableOpacity style={[pageStyles.button, {marginBottom: 10, marginTop: 10}]} onPress={submitOnPress}>
				<Text style={pageStyles.buttonText}>Добавить денежный поток</Text>
			</TouchableOpacity>
			</View>
		</KeyboardAwareScrollView>
	) : (
		<View style={pageStyles.headContainer}>
			<CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />
			<TouchableOpacity style={[pageStyles.button, { marginBottom: 20, borderRadius: 0 }]} onPress={takePhoto}>
				<Text style={pageStyles.buttonText}>Сделать фото</Text>
			</TouchableOpacity>
		</View>
	);
}
