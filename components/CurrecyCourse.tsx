import { View, Text, TouchableOpacity } from "react-native";
import { Currency, HeadCurrency } from "../storage/StorageHandle";
import { pageStyles } from "../Styles/page";

export type CurrecyCourseProps = {
	currency: Currency;
	headCurrency: HeadCurrency;
	deleteCurrency: React.Dispatch<React.SetStateAction<any>>;
};

export function CurrecyCourse({
	currency,
	headCurrency,
	deleteCurrency,
}: CurrecyCourseProps) {
	return (
		<View
			style={{
				flexDirection: "row",
				width: "100%",
				paddingVertical: 6,
				alignItems: "center",
			}}
		>
			<Text style={[{ flex: 2 }, pageStyles.text]}>{currency.name}</Text>
			<Text style={[{ flex: 1 }, pageStyles.text, { color: "blue" }]}>
				{currency.short_name}
			</Text>
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
			<Text
				style={[
					pageStyles.text,
					{ flex: 1, textAlign: "right", color: "green" },
				]}
			>
				{headCurrency.short_name}
			</Text>

			<TouchableOpacity
				style={{ marginLeft: 8 }}
				onPress={deleteCurrency}
			>
				<View style={pageStyles.button}>
					<Text style={pageStyles.buttonText}>X</Text>
				</View>
			</TouchableOpacity>
		</View>
	);
}
