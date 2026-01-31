import * as React from 'react';
import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Money } from '../models/Money';
import { pageStyles } from '../Styles/page';
import { MoneyMoovmentType, MoneyType, WalletType } from '../storage/StorageHandle';
import Selector from '../components/Selector';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { MoneyMoovmentTypes } from '../components/MoneyMoovmentTypes';

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
    const [selectWallet, setSelectWallet] = useState<MoneyMoovmentType | WalletType | null>(null);
    const [selectIncomeType, setSelectIncomeType] = useState<MoneyMoovmentType | WalletType | null>(null);


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
                    <Selector title='Тип доходов' titleDontHave='Нет типов' items={incomeTypes} onChange={setSelectIncomeType} />
                    <Selector title='Кошелек' titleDontHave='Нет типов' items={wallets} onChange={setSelectWallet} />
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
                    <View style={pageStyles.blockAtRow}>
                        <TextInput
                            placeholder='Название типа'
                            value={newIncomeName}
                            onChangeText={setNewIncome}
                            style={[pageStyles.inputText, pageStyles.flexChild, isIncomeNameFocused && pageStyles.inputTextFocus]}
                            onFocus={() => setIncomeNameIsFocused(true)}
                            onBlur={() => setIncomeNameIsFocused(false)}
                            placeholderTextColor={'#a68ebf'}
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
                    <MoneyMoovmentTypes money={money} moov={incomeTypes} setMoovTypes={setIncomeTypes} showButton={true} type='income' />
                </View>
            </ScrollView>
        </KeyboardAwareScrollView>
    )
}