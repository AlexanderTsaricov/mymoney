import { View, Dimensions, Text } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { pageStyles } from "../Styles/page";
//import { Dataset } from "react-native-chart-kit/dist/HelperTypes";
import Logger from "./logger/Logger";
import { useEffect } from "react";

type Dataset = {
	data: number[];
	color?: (opacity: number) => string;
	strokeWidth?: number;
};

export type GraphicProps = {
	labels: string[];
	data: Dataset[];
};

export default function Graphic({ labels, data }: GraphicProps) {
	useEffect(() => {
		Logger.log(labels, true, "labels");
		Logger.log(data, true, "data");
	}, []);

	if (data.length < 1 || labels.length < 1 || !data || !labels) {
		return (
			<View>
				<Text style={pageStyles.text}>Нет данных</Text>
			</View>
		);
	} else {
		return (
			<View>
				<LineChart
					data={{
						labels: labels,
						datasets: data,
					}}
					width={Dimensions.get("window").width}
					height={220}
					chartConfig={{
						backgroundGradientFrom: "#a68ebf",
						backgroundGradientTo: "#a68ebf",
						color: () => "#1b0b0b",
					}}
				/>
			</View>
		);
	}
}
