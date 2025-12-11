import Selector from "../components/Selector";
import { Money } from "../models/Money";
import Page from "../models/Page";
import React from "react";
import { Text, TextInput, View, Button } from "react-native";

class IncomePage extends Page {
    incomeTypes: string[];
    wallets: string[];
    money: Money
    constructor(money: Money) {
        super('Добавить доход', 'IncomePage', () => this.Screen());
        this.money = money;
        this.money.income.storage.updateTablesNames();
        this.incomeTypes = money.income.getIncomesTypes();
        this.wallets = money.wallet.getWalletsNames();
        console.log(money.income.getIncomesTypes());
    }

    ButtonOrError = (walletSelector: Selector, incomeNameSelector: Selector, sumCount: number, comment: string) => {
        if (this.wallets.length == 0) {
            return (
                <Text>Нельзя добавить доход без кошельков</Text>
            );
        } else if (this.incomeTypes.length == 0) {
            return (
                <Text>Нельзя добавить доход без типа дохода</Text>
            );
        } else {
            return (
                <Button title='Добавить' onPress={() => {
                    const wallet = walletSelector.getSelected();
                    const incomeName = incomeNameSelector.getSelected();
                    const incomeMoneyType = {
                        id: 1,
                        name: '',
                        money: sumCount,
                        time_data: new Date().toUTCString(),
                        comment: comment
                    }
                    this.money.addIncome(wallet, incomeName, incomeMoneyType);
                }} />
            );
        }
    }

    Screen = () => {
        const [incomeTypes, setIncomeTypes] = React.useState(this.money.income.getIncomesTypes());
        const [wallets, setWallets] = React.useState(this.money.wallet.getWalletsNames());
        const [sumCount, onChangeSumCount] = React.useState('');
        const [comment, onChangeComment] = React.useState('');

        const walletSelector = new Selector('Кошелёк', 'Нет кошельков', wallets);
        const incomeTypeSelector = new Selector('Тип доходов', 'Нет типов', incomeTypes);

        const refreshData = () => {
            setIncomeTypes(this.money.income.getIncomesTypes());
            setWallets(this.money.wallet.getWalletsNames());
        };

        return (
            <View>
                {incomeTypeSelector.Screen()}
                <View>
                    <Text>Сумма</Text>
                    <TextInput
                        value={sumCount}
                        placeholder='Сумма'
                        keyboardType='numeric'
                        onChangeText={text => onChangeSumCount(text)}
                    />
                </View>
                <View>
                    <Text>Комментарий</Text>
                    <TextInput
                        value={comment}
                        placeholder=''
                        onChangeText={text => onChangeComment(text)}
                    />
                </View>
                {walletSelector.Screen()}
                {wallets.length === 0 ? (
                    <Text>Нельзя добавить доход без кошельков</Text>
                ) : incomeTypes.length === 0 ? (
                    <Text>Нельзя добавить доход без типа дохода</Text>
                ) : (
                    <Button title='Добавить' onPress={async () => {
                        const wallet = walletSelector.getSelected();
                        const incomeName = incomeTypeSelector.getSelected();
                        const incomeMoneyType = {
                            id: 1,
                            name: '',
                            money: parseFloat(sumCount),
                            time_data: new Date().toUTCString(),
                            comment: comment
                        };
                        const result = await this.money.addIncome(wallet, incomeName, incomeMoneyType);
                        if (result) {
                            refreshData(); // обновляем состояние, чтобы перерисовать Selectors
                        }
                    }} />
                )}
            </View>
        );
    };

}

export default IncomePage;