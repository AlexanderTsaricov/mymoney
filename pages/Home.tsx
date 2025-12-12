import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { pageStyles } from '../Styles/page';
import { Money } from '../models/Money';
import { MoneyType } from '../storage/DB';
import { Wallets } from '../components/Wallets';

type HomeProps = {
    money: Money
};

type WalletsProps = {
    money: Money
}


const Home: React.FC<HomeProps> = ({ money }) => {
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
    return (
        <View style={pageStyles.headContainer}>
            <View style={pageStyles.block}>
                <Text style={pageStyles.text}>Баланс</Text>
                <Wallets money={money} wallets={wallets} setWallets={setWallets} showButton={false} />

                <TouchableOpacity
                    style={pageStyles.button}
                    onPress={async () => await money.deleteDatabase()}
                >
                    <Text style={pageStyles.buttonText}>Удалить данные</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, marginBottom: 20 },
    money: { fontSize: 20, marginBottom: 10 }
});

export default Home;
