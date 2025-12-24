import { View, Text, Button, TouchableOpacity } from "react-native";
import { Money } from "../models/Money";
import { MoneyMoovmentType } from "../storage/StorageHandle";
import { pageStyles } from "../Styles/page";

type IncomesProps = {
    money: Money,
    incomes: MoneyMoovmentType[],
    setIncomeTypes: React.Dispatch<React.SetStateAction<MoneyMoovmentType[]>>;
    showButton: boolean
}

export const IncomeTypes: React.FC<IncomesProps> = ({ money, incomes, setIncomeTypes, showButton }) => {
    return (
        <View>
            <Text style={pageStyles.text} >
                Типы доходов
            </Text>
            {incomes.length === 0 ? (
                <Text style={pageStyles.text}>У вас нет типов доходоа</Text>
            ) : (
                incomes.map((w, index) => (
                    <View key={index}>
                        <Text style={pageStyles.text} >
                            Название типа: {w.name}
                        </Text>
                        {showButton && (
                            <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                <TouchableOpacity
                                    style={[pageStyles.button, { width: 160, marginTop: 10 }]}
                                    onPress={async () => {
                                        await money.income.deleteIncomeType(w.id);
                                        const newIncomes = await money.income.getIncomesTypes();
                                        setIncomeTypes(newIncomes);
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