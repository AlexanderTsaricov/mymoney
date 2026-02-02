import { View, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { pageStyles } from "../Styles/page";
import { Dataset } from "react-native-chart-kit/dist/HelperTypes";

type GraphicProps = {
    labels: string[],
    data: Dataset[]
}

export default function Graphic({labels, data}: GraphicProps) {
	return (
		<View style={pageStyles.headContainer}>
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
