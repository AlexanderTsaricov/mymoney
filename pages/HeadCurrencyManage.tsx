import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Money } from "../models/Money";
import { ParamListBase } from "@react-navigation/native";
import { GestureResponderEvent, Text, View } from "react-native";
import { pageStyles } from "../Styles/page";
import Form, { InputByText, FormProps } from "../components/Form";
import { useEffect, useState } from "react";

type HeadCurrencyManageProps = {
	money: Money;
	navigation: NativeStackNavigationProp<ParamListBase>;
};

export default function HeadCurrencyManage({ money, navigation }: HeadCurrencyManageProps) {
	
	const [loading, setLoading] = useState(false);
	const [name, setName] = useState('');
    const [short_name, set_short_name] = useState('')

    const loadCurrency = async () => {
        setLoading(true);
        const currency = await money.currencies.getHeadCurrency();
        if (currency) {
            setName(currency.name);
            set_short_name(currency.short_name);
        }
        setLoading(false);
    }
    
    useEffect(() => {
        loadCurrency();
    });
	const inputs: InputByText[] = [
        {
            labelText: "Название валюты",
            placeholder: "Руль",
            keyboardType: undefined,
            value: name,
            onChangeText: setName,
            required: true
        },
        {
            labelText: "Буквенный код",
            placeholder: "RUB",
            keyboardType: undefined,
            value: short_name,
            onChangeText: set_short_name,
            required: true
        }
    ];

    const submitHeadCurrency = async () => {
		await money.currencies.changeHeadCurrency("name", "");
		await money.currencies.changeHeadCurrency("short_name", "");
	};

    const formProps: FormProps = {
        inputs: inputs,
        submitTextButton: "Изменить валюту",
        submitOnPress: function (event: GestureResponderEvent): void {
            throw new Error("Function not implemented.");
        }
    }
	
	return loading ? (
		<View>
			<Text style={pageStyles.inputText}>Загрузка...</Text>
		</View>
	) : (
		<View style={pageStyles.headContainer}>
			<Text style={pageStyles.text}>Иззменение основной валюты</Text>
			<Form
				inputs={[]}
				submitTextButton={""}
				submitOnPress={function (event: GestureResponderEvent): void {
					throw new Error("Function not implemented.");
				}}
			/>
		</View>
	);
}
