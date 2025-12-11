import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Pages from './Pages';
import Home from './pages/HomeHandle';
import Menu from './pages/MenuHandle';
import WalletsPage from './pages/WalletsPage';
import { Money } from './models/Money';
import IncomeTypePage from './pages/IncomeTypePage';
import ExpenceTypePage from './pages/ExpenceTypePage';
import IncomePage from './pages/IncomePage';
import ExpencePage from './pages/ExpencePage';
const Stack = createNativeStackNavigator();


export default function App() {
	const money = new Money('mymoney.sqlite');
	React.useEffect(() => {
		(async () => {
			await money.wallet.storage.updateTablesNames();
		})();
	}, []);

	const pagesPropObj = {
		pages: [
			new Home(),
			new Menu(),
			new WalletsPage(money),
			new IncomeTypePage(money),
			new ExpenceTypePage(money),
			new IncomePage(money),
			new ExpencePage(money)
		],
		money: money
	}


	const pages = new Pages(pagesPropObj);
	Menu.addPages(pages.pages);
	return (
		<NavigationContainer>
			<Stack.Navigator>
				{pages.getPages()}
			</Stack.Navigator>
		</NavigationContainer>
	);
}