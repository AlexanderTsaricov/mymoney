import * as React from 'react';
import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import { Money } from '../models/Money';
import { pageStyles } from '../Styles/page';
import { MoneyMoovmentType, MoneyType, WalletType } from '../storage/StorageHandle';
import { Wallets } from '../components/Wallets';
import Selector from '../components/Selector';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { IncomeTypes } from '../components/IncomeTypes';

type IncomeProps = {
    money: Money
}

export default function IncomePage({ money }: IncomeProps) {
    const [sum, onChangeSum] = React.useState('');
    const [isCommentFocused, setNameIsFocused] = React.useState(false);
    const [isSumFocused, setSumIsFocused] = React.useState(false);
    const [wallets, setWallets] = useState<WalletType[]>([]);
    const [loading, setLoading] = useState(true);
    const [incomeTypes, setIncomeTypes] = useState<MoneyMoovmentType[]>([]);
    const [loadingIncomeTypes, setLoadingIncomeTypes] = useState(true);
    const [newIncomeName, setNewIncome] = useState('');
    const [isIncomeNameFocused, setIncomeNameIsFocused] = React.useState(false);
    const [comment, onChangeComment] = React.useState('');


    useEffect(() => {
        const loadWallets = async () => {
            const data = await money.wallet.getAllWallets();
            setWallets(data.value as WalletType[]);
            setLoading(false);
        };

        loadWallets();
    }, [money]);

    useEffect(() => {
        const loadIncomeTypes = async () => {
            const data = await money.income.getIncomesTypes();
            console.log("Loaded income types: ", data);
            setIncomeTypes(data);
            setLoadingIncomeTypes(false);
        };

        loadIncomeTypes();
    }, [money]);

    return (

        <KeyboardAwareScrollView
            style={pageStyles.headContainer}
            contentContainerStyle={{ paddingBottom: 40 }}
            extraScrollHeight={20}
            enableOnAndroid={true}
            keyboardShouldPersistTaps="handled"
        >
            <ScrollView>
                <View style={pageStyles.block}>
                    <Text style={pageStyles.text}>Доходы</Text>
                    <TextInput
                        placeholder='Сумма'
                        keyboardType='numeric'
                        value={sum}
                        onChangeText={onChangeSum}
                        style={[pageStyles.inputText, isSumFocused && pageStyles.inputTextFocus]}
                        onFocus={() => setSumIsFocused(true)}
                        onBlur={() => setSumIsFocused(false)}
                        placeholderTextColor={'#a68ebf'}
                    />
                    <TextInput
                        placeholder='Комментарий'
                        value={comment}
                        onChangeText={onChangeComment}
                        style={[pageStyles.inputText, isCommentFocused && pageStyles.inputTextFocus]}
                        onFocus={() => setNameIsFocused(true)}
                        onBlur={() => setNameIsFocused(false)}
                        placeholderTextColor={'#a68ebf'}
                    />
                    <Selector title='Тип доходов' titleDontHave='Нет типов' items={incomeTypes} />
                    <Selector title='Кошелек' titleDontHave='Нет типов' items={wallets} />
                    <TouchableOpacity
                        style={pageStyles.button}
                        onPress={async () => {
                            console.log(`Добавляется доход: ${sum} р. Коммент: ${comment}`);
                        }}
                    >
                        <Text style={pageStyles.buttonText}>Добавить доход</Text>
                    </TouchableOpacity>
                </View>
                <View style={pageStyles.block}>
                    <Text style={pageStyles.text}>Типы доходов</Text>
                    <TextInput
                        placeholder='Название типа'
                        value={newIncomeName}
                        onChangeText={setNewIncome}
                        style={[pageStyles.inputText, isIncomeNameFocused && pageStyles.inputTextFocus]}
                        onFocus={() => setIncomeNameIsFocused(true)}
                        onBlur={() => setIncomeNameIsFocused(false)}
                        placeholderTextColor={'#a68ebf'}
                    />
                    <TouchableOpacity
                        style={pageStyles.button}
                        onPress={async () => {
                            await money.income.addNewTypeIncome(newIncomeName);
                            const newIncomeTypesObj = await money.income.getIncomesTypes();
                            const newIncomeTypesArr = [];
                            for (const key in newIncomeTypesObj) {
                                console.log('key:', key);
                                newIncomeTypesArr.push({
                                    id: -1,
                                    name: key,
                                    time_data: '',
                                    money: -1,
                                    comment: ''

                                });
                            }

                            setIncomeTypes(newIncomeTypesArr);
                        }}
                    >
                        <Text style={pageStyles.buttonText}>Добавить тип дохода</Text>
                    </TouchableOpacity>
                    <IncomeTypes money={money} incomes={incomeTypes} setIncomeTypes={setIncomeTypes} showButton={true}/>
                </View>
            </ScrollView>
        </KeyboardAwareScrollView>
    )
}