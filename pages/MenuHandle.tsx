import React from 'react';
import { View, Button } from 'react-native';
import Page from '../models/Page';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
	[key: string]: undefined;
};

export default class Menu extends Page {
	static pages: Page[] = [];

	constructor() {
		super('Меню', 'Menu', Menu.Screen);
	}

	static addPages(pages: Page[]) {
		Menu.pages = pages;
	}

	static Screen: React.FC = () => {
		const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

		return (
			<View>
				{Menu.pages.map((page) =>
					page.name !== 'Menu' ? (
						<Button
							key={page.name}
							title={page.title}
							onPress={() => navigation.navigate(page.name)}
						/>
					) : null
				)}
			</View>
		);
	};
}
