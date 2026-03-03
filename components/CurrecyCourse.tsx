import { View, Text, TouchableOpacity } from "react-native";
import { Currency } from "../storage/StorageHandle";
import { pageStyles } from "../Styles/page";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type CurrecyCourseProps = {
	currency: Currency;
	deleteCurrency: React.Dispatch<React.SetStateAction<any>>;
	navigation: NativeStackNavigationProp<any>;
};

export function CurrecyCourse({ currency, deleteCurrency, navigation }: CurrecyCourseProps) {
	return (
		<View style={{ flexDirection: "row", width: "100%", alignItems: "center" }}>
			<TouchableOpacity
				style={{
					flex: 1,
					flexDirection: "row",
					paddingVertical: 6,
					alignItems: "center",
				}}
				onPress={() => navigation.navigate("Управление валютой", { currency })}
			>
				<Text style={[{ flex: 2 }, pageStyles.text]}>{currency.name}</Text>
				<Text style={[{ flex: 1 }, pageStyles.text, { color: "blue" }]}>{currency.short_name}</Text>
				<Text
					style={[
						pageStyles.text,
						{
							flex: 1,
							textAlign: "right",
							color: currency.course_to_head < 1 ? "red" : "green",
						},
					]}
				>
					{currency.course_to_head}
				</Text>
				<Text style={[pageStyles.text, { flex: 1, textAlign: "right", color: "green" }]}>{currency.short_name}</Text>
			</TouchableOpacity>

			<TouchableOpacity onPress={deleteCurrency} style={{ marginLeft: 8 }}>
				<View style={pageStyles.button}>
					<Text style={pageStyles.buttonText}>X</Text>
				</View>
			</TouchableOpacity>
		</View>
	);
}
