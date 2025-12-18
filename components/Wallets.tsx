import { View, Text, Button, TouchableOpacity } from "react-native";
import { Money } from "../models/Money";
import { pageStyles } from "../Styles/page";
import { WalletType } from "../storage/StorageHandle";

type WalletsProps = {
    money: Money,
    wallets: WalletType[],
    setWallets: React.Dispatch<React.SetStateAction<WalletType[]>>;
    showButton: boolean
}

export const Wallets: React.FC<WalletsProps> = ({ money, wallets, setWallets, showButton }) => {
    console.log(wallets);
    return (
        <View>
            {wallets == null || wallets.length === 0 ? (
                <Text style={pageStyles.text}>У вас нет кошельков</Text>
            ) : (
                wallets.map((w, index) => (
                    <View key={index}>
                        <Text style={pageStyles.text} >
                            Название кошелька: {w.name}
                        </Text>
                        <Text style={pageStyles.text}>
                            Баланс: {w.moneyCount} RUB
                        </Text>
                        {showButton && (
                            <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                <TouchableOpacity
                                    style={[pageStyles.button, { width: 160, marginTop: 10 }]}
                                    onPress={async () => {
                                        if (w.id != undefined) {
                                            try {
                                                await money.wallet.deleteWallet(w.id);
                                            } catch (error) {
                                                console.error(error);
                                            }
                                            const wallets = await money.wallet.getAllWallets();
                                            setWallets(wallets.value as WalletType[]);
                                        }
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