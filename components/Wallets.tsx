import { View, Text, Button, TouchableOpacity } from "react-native";
import { Money } from "../models/Money";
import { MoneyType } from "../storage/DB";
import { pageStyles } from "../Styles/page";

type WalletsProps = {
    money: Money,
    wallets: MoneyType[],
    setWallets: React.Dispatch<React.SetStateAction<MoneyType[]>>;
    showButton: boolean
}

export const Wallets: React.FC<WalletsProps> = ({ money, wallets, setWallets, showButton }) => {
    console.log("walletsCount: ", wallets.length);
    return (
        <View>
            {wallets.length === 0 ? (
                <Text style={pageStyles.text}>У вас нет кошельков</Text>
            ) : (
                wallets.map((w, index) => (
                    <View key={index}>
                        <Text style={pageStyles.text} >
                            Название кошелька: {w.name}
                        </Text>
                        <Text style={pageStyles.text}>
                            Баланс: {w.money} RUB
                        </Text>
                        {showButton && (
                            <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                <TouchableOpacity
                                    style={[pageStyles.button, { width: 160, marginTop: 10 }]}
                                    onPress={async () => {
                                        await money.wallet.deleteWallet(w.name as string, w.id);
                                        const wallets = await money.wallet.getAllWallets();
                                        setWallets(wallets);
                                    }}
                                >
                                    <Text style={pageStyles.buttonText}>Удалить кошелёк</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                ))
            )}
        </View>
    );
};