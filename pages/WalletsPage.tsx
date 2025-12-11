import { Money } from "../models/Money";
import Page from "../models/Page";
import React from "react";
import { Text, TextInput, View, Button, ScrollView } from "react-native";

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
        const [walletData, setWalletData] = React.useState<Record<string, number>>({});

        const refresh = async () => {
            await money.wallet.storage.updateTablesNames();
            const names = money.wallet.getWalletsNames();
            setWallets(names);

            const data: Record<string, number> = {};
            for (const name of names) {
                const wallet = await money.wallet.getWallet(name);
                data[name] = wallet.money;
            }
            setWalletData(data);
        };

        React.useEffect(() => {
            refresh();
        }, []);

        if (wallets.length === 0) return <Text>Нет кошельков</Text>;

        return (
            <ScrollView style={{ marginTop: 20 }}>
                {wallets.map(wallet => (
                    <View key={wallet} style={{ marginBottom: 10 }}>
                        <Text>{wallet}</Text>
                        <Text>{'Сумма на кошельке: ' + (walletData[wallet] ?? 0)}</Text>
                        <Button
                            title="Удалить"
                            onPress={async () => {
                                await money.wallet.deleteWallet(wallet);
                                refresh();
                            }}
                        />
                    </View>
                ))}
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

                        await money.wallet.addWallet(newWalletName, { id: 0, money: sum, time_data: new Date().toISOString(), comment: null });
                        setNewWalletName('');
                        setStartSumNewWallet('');
                        refreshWallets();
                    }}
                />

                <WalletsPage.ShowWallets money={money} />
            </View>
        );
    };
}

export default WalletsPage;
