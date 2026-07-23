export function floatMoneyInterpretator(money: number) {
	return Number(money.toFixed(2));
}

export function moneyToStingIntepretator(money: number) {
	let moneyString = money.toString();

	if (moneyString[moneyString.length - 3] != ".") {
		moneyString += ".00";
	}

	return moneyString;
}

export function moneyInterpretator(money: number) {
	let resultMoney: number | string = floatMoneyInterpretator(money);
	resultMoney = moneyToStingIntepretator(resultMoney);

	for (let index = resultMoney.length - 3; index > 0; index -= 3) {
		resultMoney = resultMoney.slice(0, index) + " " + resultMoney.slice(index);
	}

	return resultMoney;
}
