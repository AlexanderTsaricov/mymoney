import * as React from 'react';
import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Money } from '../models/Money';
import { pageStyles } from '../Styles/page';
import { MoneyMoovmentType, MoneyType, WalletType } from '../storage/StorageHandle';
import Selector from '../components/Selector';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { MoneyMoovmentTypes } from '../components/MoneyMoovmentTypes';

type moneyMoovmentProps = {
    money: Money
}

export default function ExpencesPage({ money }: moneyMoovmentProps) {
    const [sum, onChangeSum] = React.useState('');
    const [isCommentFocused, setNameIsFocused] = React.useState(false);
    const [isSumFocused, setSumIsFocused] = React.useState(false);
    const [wallets, setWallets] = useState<WalletType[]>([]);
    const [loading, setLoading] = useState(true);
    const [expenceTypes, setExpenceTypes] = useState<MoneyMoovmentType[]>([]);
    const [loadingExpenceTypes, setLoadingExpenceTypes] = useState(true);
    const [newExpenceName, setNewExpence] = useState('');
    const [isExpenceNameFocused, setExpenceNameIsFocused] = React.useState(false);
    const [comment, onChangeComment] = React.useState('');
    const [isInputExpenceError, setInputExpenceError] = useState(false);
    const [isInputTypeError, setInputTypeError] = useState(false);
    const [selectWallet, setSelectWallet] = useState<MoneyMoovmentType | WalletType | null>(null);
    const [selectExpenceType, setSelectExpenceType] = useState<MoneyMoovmentType | WalletType | null>(null);


    useEffect(() => {
        const loadWallets = async () => {
            const data = await money.wallet.getAllWallets();
            setWallets(data.value as WalletType[]);
            setLoading(false);
        };

        loadWallets();
    }, [money]);

    useEffect(() => {
        const loadExpenceTypes = async () => {
            const data = await money.expence.getExpencesTypes();
            console.log("Loaded expence types: ", data);
            setExpenceTypes(data);
            setLoadingExpenceTypes(false);
        };

        loadExpenceTypes();
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
                    <Text style={pageStyles.text}>Расходы</Text>
                    <TextInput
                        placeholder='Сумма'
                        keyboardType='numeric'
                        value={sum}
                        onChangeText={onChangeSum}
                        style={[pageStyles.inputText, isSumFocused && pageStyles.inputTextFocus, isInputExpenceError && pageStyles.inputError]}
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
                    <Selector title='Тип расходов' titleDontHave='Нет типов' items={expenceTypes} onChange={setSelectExpenceType} />
                    <Selector title='Кошелек' titleDontHave='Нет типов' items={wallets} onChange={setSelectWallet}/>
                    <TouchableOpacity
                        style={pageStyles.button}
                        onPress={async () => {
                            if (sum == '')  {
                                setInputExpenceError(true);
                            } else {
                                setInputExpenceError(false);
                                console.log(`Добавляется расход: ${sum} р. Коммент: ${comment}, кошелек ${selectWallet?.name}, тип ${selectExpenceType?.name}`);
                            }
                        }}
                    >
                        <Text style={pageStyles.buttonText}>Добавить расход</Text>
                    </TouchableOpacity>
                </View>
                <View style={pageStyles.block}>
                    <Text style={pageStyles.text}>Типы расходов</Text>
                    <View style={pageStyles.blockAtRow}>
                        <TextInput
                            placeholder='Название типа'
                            value={newExpenceName}
                            onChangeText={setNewExpence}
                            style={[pageStyles.inputText, pageStyles.flexChild, isExpenceNameFocused && pageStyles.inputTextFocus, isInputTypeError && pageStyles.inputError]}
                            onFocus={() => setExpenceNameIsFocused(true)}
                            onBlur={() => setExpenceNameIsFocused(false)}
                            placeholderTextColor={'#a68ebf'}
                        />
                        <TouchableOpacity
                            style={[pageStyles.button, pageStyles.flexChild, { maxWidth: 50, height: 38 }]}
                            onPress={async () => {
                                if (newExpenceName == '') {
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

                    <MoneyMoovmentTypes money={money} moov={expenceTypes} setMoovTypes={setExpenceTypes} showButton={true} type='expence' />
                </View>
            </ScrollView>
        </KeyboardAwareScrollView>
    )
}