// Menu.tsx
import * as React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import { pageStyles } from '../Styles/page';

type Screen = {
    name: string;
    component: React.ComponentType<any>;
};

type MenuProps = {
    navigation: NativeStackNavigationProp<ParamListBase>;
    screens: Screen[];
};

export default function Menu({ navigation, screens }: MenuProps) {
    return (
        <ScrollView contentContainerStyle={[{ padding: 20 }, pageStyles.headContainer]}>
            {screens.map(screen => (
                <TouchableOpacity
                    key={screen.name}
                    style={{
                        backgroundColor: '#5f348a',
                        padding: 15,
                        borderRadius: 8,
                        marginBottom: 10,
                    }}
                    onPress={() => {
                        try {
                            navigation.navigate(screen.name)
                        } catch (e) {
                            console.error(e);
                        }
                    }}
                >
                    <Text style={{ color: '#fff', fontSize: 16 }}>{screen.name}</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}
