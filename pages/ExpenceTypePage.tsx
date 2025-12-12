import { Money } from "../models/Money";
import Page from "../models/Page";
import React from "react";
import { View, TextInput, Button, Alert } from 'react-native';

class ExpenceTypePage extends Page {
    expencesTypes: string[];
    money: Money;

    constructor(money: Money) {
        super('Добавить тип расходов', 'ExpenceTypePage', () => this.Screen());
        this.money = money;
        this.expencesTypes = this.money.expence.getExpencesTypes();
        this.money.income.storage.updateTablesNames();
    }

    async addExpenceType(name: string) {
        return await this.money.expence.addNewTypeExpences(name);
    }

    Screen = () => {
        const [expenceName, onChangeExpenceName] = React.useState('');
        return (
            <View>
                <TextInput
                    value={expenceName}
                    placeholder='Название'
                    onChangeText={text => onChangeExpenceName(text)}
                />
                <Button
                    title="Добавить"
                    onPress={async () => {
                        if (expenceName == '') {
                            Alert.alert('Успех', 'Тип дохода не может быть с пустым именем');
                        };
                        try {
                            const result = await this.addExpenceType(expenceName);

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

export default ExpenceTypePage;