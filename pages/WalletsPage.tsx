import { Money } from "../models/Money";
import Page from "../models/Page";
import React from "react";
import { Text, TextInput, View, Button, ScrollView, Alert } from "react-native";

class WalletsPage extends Page {
    money: Money;

    constructor(money: Money) {
        // Конструктор не меняем
        super('Кошельки', 'Wallets', () => <WalletsPage.ScreenComponent money={money} />);
        this.money = money;
    }

    // showWallets — функциональный компонент с хуками
    static ShowWallets: React.FC<{ money: Money }> = ({ money }) => {
        const [wallets, setWallets] = React.useState<string[]>([]);
        const [walletData, setWalletData] = React.useState<Record<string, { money: number; id: number }>>({});

        const refresh = async () => {
            await money.wallet.storage.updateTablesNames();
            const names = money.wallet.getWalletsNames();
            setWallets(names);

            const data: Record<string, { money: number; id: number }> = {};

            for (const name of names) {
                const wallet = await money.wallet.getWallet(name);
                data[name] = { money: wallet.money, id: wallet.id };
            }

            setWalletData(data);
        };

        React.useEffect(() => {
            refresh();
        }, [wallets.length]);

        if (wallets.length === 0) return <Text>Нет кошельков</Text>;

        return (
            <ScrollView style={{ marginTop: 20 }}>
                {wallets.map((wallet, index) => {
                    const data = walletData[wallet];
                    if (!data) return null;

                    const key = data.id ? `${data.id}_${wallet}` : index;

                    return (
                        <View key={key} style={{ marginBottom: 10 }}>
                            <Text>{wallet}</Text>
                            <Text>{'Сумма на кошельке: ' + data.money}</Text>
                            <Button
                                title="Удалить"
                                onPress={async () => {
                                    await money.wallet.deleteWallet(wallet, data.id);
                                    refresh();
                                }}
                            />
                        </View>
                    );
                })}


            </ScrollView>
        );
    };

    // Screen — функциональный компонент с хуками
    static ScreenComponent: React.FC<{ money: Money }> = ({ money }) => {
        const [newWalletName, setNewWalletName] = React.useState('');
        const [startSumNewWallet, setStartSumNewWallet] = React.useState('');

        const refreshWallets = async () => {
            await money.wallet.storage.updateTablesNames();
        };

        return (
            <View style={{ padding: 10 }}>
                <Text>Добавить кошелёк</Text>
                <TextInput
                    placeholder="Имя кошелька"
                    value={newWalletName}
                    onChangeText={setNewWalletName}
                    style={{ borderWidth: 1, borderColor: 'black', borderRadius: 4, padding: 8, marginVertical: 5 }}
                    placeholderTextColor='grey'
                />
                <TextInput
                    placeholder="Стартовая сумма"
                    keyboardType="numeric"
                    value={startSumNewWallet}
                    onChangeText={setStartSumNewWallet}
                    style={{ borderWidth: 1, borderColor: 'black', borderRadius: 4, padding: 8, marginBottom: 10 }}
                    placeholderTextColor='grey'
                />
                <Button
                    title="Добавить"
                    onPress={async () => {
                        if (!newWalletName) return;
                        const sum = parseFloat(startSumNewWallet);
                        if (isNaN(sum)) return;
                        const moneyType = { id: 0, money: sum, time_data: new Date().toISOString(), comment: null, name: newWalletName };
                        console.log(moneyType);
                        const result = await money.wallet.addWallet(moneyType);
                        setNewWalletName('');
                        setStartSumNewWallet('');
                        refreshWallets();
                        if (!result) Alert.alert('Не удалось создать кошелек');
                    }}
                />

                <WalletsPage.ShowWallets money={money} />
            </View>
        );
    };
}

export default WalletsPage;
