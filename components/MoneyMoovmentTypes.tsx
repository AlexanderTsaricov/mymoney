import { View, Text, Button, TouchableOpacity } from "react-native";
import { Money } from "../models/Money";
import { MoneyMoovmentType } from "../storage/StorageHandle";
import { pageStyles } from "../Styles/page";

type MoneyMoovmentProps = {
    money: Money,
    moov: MoneyMoovmentType[],
    setMoovTypes: React.Dispatch<React.SetStateAction<MoneyMoovmentType[]>>;
    showButton: boolean,
    type: 'income' | 'expence'
}

export const MoneyMoovmentTypes: React.FC<MoneyMoovmentProps> = ({ money, moov, setMoovTypes, showButton, type }) => {
    return (
        <View>
            {moov.length === 0 ? (
                <Text style={pageStyles.text}>У вас нет типов</Text>
            ) : (
                moov.map((moneyMoovmentType, index) => (
                    <View key={moneyMoovmentType.id} style={[pageStyles.listWithButton, {display: 'flex', justifyContent: 'space-between'}]}>
                        <Text style={pageStyles.text} >
                            {moneyMoovmentType.name}
                        </Text>
                        {showButton && (
                            <View style={{ display: 'flex', alignItems: 'flex-end', flexDirection: 'column'}}>
                                <TouchableOpacity
                                    style={[pageStyles.button, { width: 160, marginTop: 10 }]}
                                    onPress={async () => {
                                        let newMoovTypes: MoneyMoovmentType[] = []
                                        if (type == 'income') {
                                            await money.income.deleteIncomeType(moneyMoovmentType.id);
                                            newMoovTypes = await money.income.getIncomesTypes();
                                        } else {
                                            await money.expence.deleteExpenceType(moneyMoovmentType.id);
                                            newMoovTypes = await money.expence.getExpencesTypes();
                                        }
                                        setMoovTypes(newMoovTypes);
                                    }}
                                >
                                    <Text style={pageStyles.buttonText}>Удалить тип</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                ))
            )}
        </View>
    );
};