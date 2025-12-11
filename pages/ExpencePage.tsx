import React, { useState } from 'react';
import { View, Text, Button, TextInput } from 'react-native';
import Page from '../models/Page';
import Selector from '../components/Selector';
import { Money } from '../models/Money';

class ExpencePage extends Page {
    wallets: string[];
    expences: string[];
    money: Money;

    constructor(money: Money) {
        super('Добавить расход', 'ExpencePage', () => this.Screen());
        this.money = money;
        this.wallets = money.wallet.getWalletsNames();
        this.expences = money.expence.getExpencesTypes();
    }

    async addExpenceHandle(wallet: string, expenceName: string, sumCount: number, comment: string) {
        const expenceMoneyType = {
            id: 1,
            name: '',
            money: sumCount,
            time_data: new Date().toUTCString(),
            comment: comment
        }

        return await this.money.addExpence(wallet, expenceName, expenceMoneyType)
    }

    ButtonOrError = (walletSelector: Selector, expenceNameSelector: Selector, sumCount: number, comment: string) => {
        if (this.wallets.length == 0) {
            return (
                <Text>Нельзя добавить расход без кошельков</Text>
            );
        } else if (this.expences.length == 0) {
            return (
                <Text>Нельзя добавить расход без типа расхода</Text>
            );
        } else {
            return (
                <Button title='Добавить' onPress={() => {
                    const wallet = walletSelector.getSelected();
                    const expenceName = expenceNameSelector.getSelected();
                    this.addExpenceHandle(wallet, expenceName, sumCount, comment);
                }} />
            );
        }
    }

    Screen = () => {
        const [wallets, setWallets] = React.useState(this.wallets);
        const [expences, setExpences] = React.useState(this.expences);
        const [sumCount, onChangeSumCount] = React.useState('');
        const [comment, onChangeComment] = React.useState('');

        const walletSelector = new Selector('Кошелёк', 'Нет кошельков', wallets);
        const expenceSelector = new Selector('Тип расходов', 'Нет типов', expences);

        const refreshData = async () => {
            setWallets(await this.money.wallet.getWalletsNames());
            setExpences(this.money.expence.getExpencesTypes());
        };

        return (
            <View>
                <Text>Добавить расход</Text>
                {walletSelector.Screen()}
                {expenceSelector.Screen()}
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
                        style={{ color: 'black' }}
                    />
                </View>
                {wallets.length === 0 ? (
                    <Text>Нельзя добавить расход без кошельков</Text>
                ) : expences.length === 0 ? (
                    <Text>Нельзя добавить расход без типа расходов</Text>
                ) : (
                    <Button title='Добавить' onPress={async () => {
                        const wallet = walletSelector.getSelected();
                        const expenceType = expenceSelector.getSelected();
                        const expenceMoneyType = {
                            id: 1,
                            name: '',
                            money: parseFloat(sumCount),
                            time_data: new Date().toUTCString(),
                            comment: comment
                        };
                        const result = await this.money.addExpence(wallet, expenceType, expenceMoneyType);
                        if (result) {
                            refreshData();
                        }
                    }} />
                )}
            </View>
        );
    };

}

export default ExpencePage;
