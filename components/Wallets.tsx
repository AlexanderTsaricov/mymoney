import { View, Text, Button, TouchableOpacity } from "react-native";
import { Money } from "../models/Money";
import { pageStyles } from "../Styles/page";
import { Currency, WalletType } from "../storage/StorageHandle";
import { useEffect, useState } from "react";

type WalletsProps = {
	money: Money;
	wallets: WalletType[];
	setWallets: React.Dispatch<React.SetStateAction<WalletType[]>>;
	showButton: boolean;
};

type CurrencyByWallet = {
	[walletId: number]: Currency;
};

export const Wallets: React.FC<WalletsProps> = ({ money, wallets, setWallets, showButton }) => {
	const [loading, setLoading] = useState<boolean>(true);
	const [currenciesByWallets, setCurrenciesByWallets] = useState<CurrencyByWallet | null>(null);

	const loadCurrencies = async () => {
		const tempCurrenciesByWallet: CurrencyByWallet = {};

		for (const wallet of wallets) {
			if (wallet.id == null) continue;
			const currency = await money.currencies.getCurrecy(wallet.currency_id);
			if (currency) {
				tempCurrenciesByWallet[wallet.id] = currency;
			}
		}

		setCurrenciesByWallets(tempCurrenciesByWallet);
	};

	useEffect(() => {
		loadCurrencies();
	}, [wallets]);

	useEffect(() => {
		if (currenciesByWallets) {
			setLoading(false);
		}
	}, [currenciesByWallets]);

	if (loading) {
		return (
			<View>
				<Text style={pageStyles.text}>Загрузка...</Text>
			</View>
		);
	}

	return (
		<View style={{width: "100%"}}>
			{wallets == null || wallets.length === 0 ? (
				<Text style={[pageStyles.text]}>У вас нет кошельков</Text>
			) : (
				wallets.map((w, index) => (
					<View key={index} style={{display: "flex", flexDirection: "row"}}>
						<Text style={pageStyles.text}>
							{w.name}: {w.moneyCount}{" "} {w.id !== null && currenciesByWallets ? (currenciesByWallets as CurrencyByWallet)[w.id as number]?.short_name : ""}
						</Text>
						{showButton && (
							<View style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
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
