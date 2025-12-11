import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import type { ComponentType } from 'react';
import { Button, Text, View } from 'react-native';
import { Money } from './models/Money';
import React from 'react';
import Page from './models/Page';

type RootStackParamList = {
	[key: string]: undefined;
};

type PagesProps = {
	pages: Page[],
	money: Money
}

const Stack = createNativeStackNavigator<RootStackParamList>();

function MenuButton() {
	const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
	return (
		<Button
			title="Меню"
			onPress={() => {
				navigation.navigate('Menu');
			}}
		/>
	);
}

class Pages extends React.Component {
	pages: Page[];
	menuOpen: boolean = false;
	money: Money;
	state = { allMoney: 0 };

	constructor(props: PagesProps) {
		super(props);
		this.pages = props.pages;
		this.money = props.money;
	}

	async componentDidMount() {
		await this.money.init();
		this.setState({ allMoney: this.money.allMoney });
	}

	getPages() {
		return this.pages.map((page) => (
			<Stack.Screen
				key={page.name}
				name={page.name}
				options={{
					headerBackVisible: false,
					headerRight: () => (
						<View>
							<Text>{this.money.allMoney}</Text>
							<MenuButton />
						</View>
					),
				}}
			>
				{() => <page.component />}
			</Stack.Screen>

		));
	}
}

export default Pages;
