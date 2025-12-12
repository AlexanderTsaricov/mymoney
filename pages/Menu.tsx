// Menu.tsx
import * as React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';

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
        <ScrollView contentContainerStyle={{ padding: 20 }}>
            {screens.map(screen => (
                <TouchableOpacity
                    key={screen.name}
                    style={{
                        backgroundColor: '#5f348a',
                        padding: 15,
                        borderRadius: 8,
                        marginBottom: 10,
                    }}
                    onPress={() => navigation.navigate(screen.name)}
                >
                    <Text style={{ color: '#fff', fontSize: 16 }}>{screen.name}</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}
