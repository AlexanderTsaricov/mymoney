import * as React from 'react';
import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import { Money } from '../models/Money';
import { pageStyles } from '../Styles/page';
import { MoneyType } from '../storage/DB';
import { Wallets } from '../components/Wallets';

type WalletsPageProps = {
    money: Money
}

export default function WalletsPage({ money }: WalletsPageProps) {
    const [newWalletName, onChangeNewWalletName] = React.useState('');
    const [startSum, onChangeStartSum] = React.useState('');
    const [isNameFocused, setNameIsFocused] = React.useState(false);
    const [isSumFocused, setSumIsFocused] = React.useState(false);
    const [wallets, setWallets] = useState<MoneyType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadWallets = async () => {
            const data = await money.wallet.getAllWallets();
            setWallets(data);
            setLoading(false);
        };

        loadWallets();
    }, [money]);

    const addNewWallet = async (name: string, sum: number) => {
        const wallet = {
            id: 1,
            name: name,
            money: sum,
            time_data: new Date().toString(),
            comment: null
        }
        await money.wallet.addWallet(wallet);
    }

    return (
        <View style={pageStyles.headContainer}>
            <View style={pageStyles.block}>
                <Text style={pageStyles.text}>Новый кошелек</Text>
                <TextInput
                    placeholder='Имя нового кошелька'
                    value={newWalletName}
                    onChangeText={onChangeNewWalletName}
                    style={[pageStyles.inputText, isNameFocused && pageStyles.inputTextFocus]}
                    onFocus={() => setNameIsFocused(true)}
                    onBlur={() => setNameIsFocused(false)}
                    placeholderTextColor={'#a68ebf'}
                />
                <TextInput
                    placeholder='Начальная сумма'
                    keyboardType='numeric'
                    value={startSum}
                    onChangeText={onChangeStartSum}
                    style={[pageStyles.inputText, isSumFocused && pageStyles.inputTextFocus]}
                    onFocus={() => setSumIsFocused(true)}
                    onBlur={() => setSumIsFocused(false)}
                    placeholderTextColor={'#a68ebf'}
                />
                <TouchableOpacity
                    style={pageStyles.button}
                    onPress={async () => {
                        await addNewWallet(newWalletName, parseFloat(startSum));

                        const list = await money.wallet.getAllWallets();
                        setWallets(list);
                    }}
                >
                    <Text style={pageStyles.buttonText}>Создать кошелёк</Text>
                </TouchableOpacity>
            </View>
            <View style={pageStyles.block}>
                <Text style={pageStyles.text}>Кошльки</Text>
                <Wallets money={money} wallets={wallets} setWallets={setWallets} showButton={true} />
            </View>
        </View>
    )
}