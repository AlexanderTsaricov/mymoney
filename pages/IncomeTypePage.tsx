import { Money } from "../models/Money";
import Page from "../models/Page";
import React from "react";
import { View, TextInput, Button, Alert } from 'react-native';

class IncomeTypePage extends Page {
    incomeTypes: string[];
    money: Money;

    constructor(money: Money) {
        super('Добавить тип доходов', 'IncomeTypePage', () => this.Screen());
        this.money = money;
        this.money.income.storage.updateTablesNames();
        this.incomeTypes = this.money.income.getIncomesTypes();
    }

    async addIncomeType(name: string) {
        return await this.money.income.addNewTypeIncome(name);
    }

    Screen = () => {
        const [incomeName, onChangeIncomeName] = React.useState('');
        return (
            <View>
                <TextInput
                    value={incomeName}
                    placeholder='Название'
                    onChangeText={text => onChangeIncomeName(text)}
                />
                <Button
                    title="Добавить"
                    onPress={async () => {
                        if (incomeName == '') {
                            Alert.alert('Успех', 'Тип дохода не может быть с пустым именем');
                        };
                        try {
                            const result = await this.addIncomeType(incomeName);
                            console.log('addIncomeType result:', result);

                            if (result) {
                                await this.money.wallet.storage.updateTablesNames();
                                Alert.alert('Успех', 'Тип дохода успешно добавлен');
                            } else {
                                Alert.alert('Ошибка', 'Не удалось добавить тип дохода');
                            }
                        } catch (err) {
                            console.error('Ошибка при добавлении типа дохода:', err);
                            Alert.alert('Ошибка', 'Произошла ошибка при добавлении типа дохода');
                        }
                    }}
                />
            </View>
        );
    }
}

export default IncomeTypePage;