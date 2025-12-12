import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, Image, TouchableOpacity } from 'react-native';

import { Money } from './models/Money';
import Home from './pages/Home';
import Menu from './pages/Menu'; // новая страница
import { headerStyles } from './Styles/header';
import WalletsPage from './pages/WalletsPage';
import { MoneyType } from './storage/DB';

const Stack = createNativeStackNavigator();

const screens = [
	{ name: 'Главная', component: Home },
	{ name: 'Новый кошелёк', component: WalletsPage }
];

export default function App() {
	const money = new Money('mymoney.sqlite');

	return (
		<NavigationContainer>
			<Stack.Navigator>
				{screens.map(screen => (
					<Stack.Screen
						key={screen.name}
						name={screen.name}
						options={{
							header: ({ navigation }) => (
								<View style={headerStyles.container}>
									<Text style={headerStyles.text}>MyMoney</Text>
									<TouchableOpacity
										onPress={() => navigation.navigate('Меню')}
									>
										<Image
											source={require('./storage/icons/menu.png')}
											style={{ width: 30, height: 30 }}
										/>
									</TouchableOpacity>
								</View>
							),
						}}
					>
						{() => <screen.component money={money} />}
					</Stack.Screen>
				))}

				{/* экран меню */}
				<Stack.Screen
					name="Меню"
					options={{
						header: ({ navigation }) => (
							<View style={headerStyles.container}>
								<Text style={headerStyles.text}>MyMoney</Text>
								<TouchableOpacity
									onPress={() => navigation.navigate('Меню')}
								>
									<Image
										source={require('./storage/icons/menu.png')}
										style={{ width: 30, height: 30 }}
									/>
								</TouchableOpacity>
							</View>
						),
					}}
				>
					{({ navigation }) => <Menu navigation={navigation} screens={screens} />}
				</Stack.Screen>
			</Stack.Navigator>
		</NavigationContainer>
	);
}
