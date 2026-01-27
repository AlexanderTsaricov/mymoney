import { GestureResponderEvent, Text, View } from "react-native"
import { Money } from "../models/Money"
import { Currency } from "../storage/StorageHandle"
import { useState } from "react"
import { pageStyles } from "../Styles/page"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { ParamListBase } from "@react-navigation/native"
import Form, { FormProps, InputByText } from "./Form"

type CurrencyManageProps = {
    money: Money,
    currency: Currency,
    navigation: NativeStackNavigationProp<ParamListBase>
}

export default function CurrencyManage ({money, currency, navigation}: CurrencyManageProps) {
    const [currencyName, setCurrencyName] = useState(currency.name);
    const [currencyWordCode, setCurrencyWordCode] = useState(currency.short_name);
    const [currencyCourse, setCurrencyCourse] = useState(currency.course_to_head);

    const submitChangeCurrency = async () => {
        if (currency.id == null) throw new Error('id не может быть null');
        if (currencyName != currency.name) {
            await money.currencies.changeCurrency(currency.id, 'name', currencyName);
        }

        if (currencyWordCode != currency.short_name) {
            await money.currencies.changeCurrency(currency.id, 'short_name', currencyWordCode);
        }

        if (currencyCourse != currency.course_to_head) {
            await money.currencies.changeCurrency(currency.id, 'course_to_head', currencyCourse.toString());
        }

        navigation.navigate('Валюты');
    };

    const formInputs: InputByText[] = [
        {
            labelText: "Название валюты",
            placeholder: "Рубль",
            keyboardType: undefined,
            value: currencyName,
            onChangeText: setCurrencyName
        },
        {
            labelText: "Буквенный код",
            placeholder: "RUB",
            keyboardType: undefined,
            value: currencyWordCode,
            onChangeText: setCurrencyWordCode
        },
        {
            labelText: "Курс к основной валюте",
            placeholder: "20.00",
            keyboardType: 'number-pad',
            value: currencyCourse,
            onChangeText: setCurrencyCourse
        }
    ];
    
    const formProps: FormProps = {
        inputs: formInputs,
        submitTextButton: "Изменить валюту",
        submitOnPress: submitChangeCurrency
    }
    
    return (
        <View style={pageStyles.headContainer}>
            <Text>Изменить валюту: {currency.name}</Text>
            <Form {...formProps}/>
        </View>
    )
}