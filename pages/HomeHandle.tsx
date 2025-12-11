import React from 'react';
import { View, Text, Button } from 'react-native';
import type { ComponentType } from 'react';
import Page from '../models/Page';

export default class Home extends Page {
    constructor() {
        super('Главная', 'Home', Home.Screen);
    }

    static Screen: ComponentType<any> = () => (
        <View>
            <Text>Главная страница</Text>
            <Button
                title='Добавить расход'
            />
            <Button
                title='Добавить доход'
            />
        </View>
    );
}
