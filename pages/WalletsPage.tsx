import * as React from 'react';
import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import { Money } from '../models/Money';
import { pageStyles } from '../Styles/page';
import { MoneyType, returnOjb } from '../storage/StorageHandle';
import { Wallets } from '../components/Wallets';
import { WalletType } from '../storage/StorageHandle';

type WalletsPageProps = {
    money: Money
}

export default function WalletsPage({ money }: WalletsPageProps) {
    const [newWalletName, onChangeNewWalletName] = React.useState('');
    const [startSum, onChangeStartSum] = React.useState('');
    const [isNameFocused, setNameIsFocused] = React.useState(false);
    const [isSumFocused, setSumIsFocused] = React.useState(false);
    const [wallets, setWallets] = useState<WalletType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadWallets = async () => {
            const data = await money.wallet.getAllWallets();
            console.log(data.message);
            setWallets(data.value as WalletType[]);
            setLoading(false);
        };

        loadWallets();
    }, [money]);

    const addNewWallet = async (name: string, sum: number) => {
        try {
            await money.wallet.addWallet(name);
            const returnRequest = await money.wallet.getWalletByName(name) as unknown as returnOjb;
            if (returnRequest.value != null) {
                const newWallet = (returnRequest.value as WalletType[])[0];
                if (sum != 0 && newWallet.id != undefined) {
                    await money.wallet.changeMoney(newWallet.id, sum);
                }
            }

        } catch (error) {
            console.error(error);
        }

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

                        const result = await money.wallet.getAllWallets();
                        console.log(result.value);
                        setWallets(result.value as WalletType[]);
                    }}
                >
                    <Text style={pageStyles.buttonText}>Создать кошелёк</Text>
                </TouchableOpacity>
            </View>
            <View style={pageStyles.block}>
                <Text style={pageStyles.text}>Кошельки</Text>
                <Wallets money={money} wallets={wallets} setWallets={setWallets} showButton={true} />
            </View>
        </View>
    )
}