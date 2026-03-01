import { LogBox } from "react-native";
LogBox.ignoreLogs([]);
import { View, Dimensions, Text } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { pageStyles } from "../Styles/page";
import { Dataset } from "react-native-chart-kit/dist/HelperTypes";
import Logger from "../logger/Logger";
import { useEffect, useState, memo } from "react";

export type GraphicProps = {
	labels: string[];
	data: Dataset[];
};

function checkData({ labels, data }: GraphicProps) {
	if (!data || !labels) {
		// console.log("checkData: data or labels falsy");
		return true;
	}

	if (data.length < 1 || labels.length < 1) {
		// console.log("checkData: empty arrays", { dataLength: data.length, labelsLength: labels.length });
		return true;
	}

	for (let i = 0; i < data.length; i++) {
		const element = data[i];

		if (!element) {
			// console.log("checkData: dataset null/undefined", i);
			return true;
		}

		if (!element.data) {
			// console.log("checkData: dataset invalid", i);
			return true;
		}

		if (element.data.length === 0) {
			// console.log("checkData: dataset empty", i);
			return true;
		}

		if (element.data.length !== labels.length) {
			// console.log("checkData: length mismatch", {
			//	datasetIndex: i,
			//	dataLength: element.data.length,
			//	labelsLength: labels.length,
			// });
			return true;
		}

		for (let j = 0; j < element.data.length; j++) {
			const value = element.data[j];

			if (value === null) {
				console.error("checkData: null value", { dataset: i, index: j });
				return true;
			}

			if (value === undefined) {
				console.error("checkData: undefined value", { dataset: i, index: j });
				return true;
			}

			if (typeof value !== "number") {
				console.error("checkData: not a number", { dataset: i, index: j, value });
				return true;
			}

			if (Number.isNaN(value)) {
				console.error("checkData: NaN value", { dataset: i, index: j });
				return true;
			}
		}
	}

	return false;
}

export default memo(function Graphic({ labels, data }: GraphicProps) {
	if (checkData({ labels, data })) {
		return (
			<View>
				<Text style={pageStyles.text}>Нет данных</Text>
			</View>
		);
	} else {
		const safeData =
			data?.map((d) => ({
				data: Array.isArray(d.data) ? d.data : [],
			})) ?? [];
		try {
			return (
				<View>
					<LineChart
						data={{ labels: labels, datasets: data }}
						width={Dimensions.get("window").width}
						height={220}
						chartConfig={{
							backgroundGradientFrom: "#a68ebf",
							backgroundGradientTo: "#a68ebf",
							color: () => "#000000",
						}}
					/>
				</View>
			);
		} catch (e) {
			console.error("LineChart render error caught:", e);
			return (
				<View>
					<Text style={pageStyles.text}>Нет данных</Text>
				</View>
			);
		}
	}
}, (prev, next) => {
	// Мемоизация: true означает что пропсы равны и рендер не нужен
	const labelsEqual = prev.labels === next.labels || (Array.isArray(prev.labels) && Array.isArray(next.labels) && prev.labels.length === next.labels.length);
	const dataEqual = prev.data === next.data || (Array.isArray(prev.data) && Array.isArray(next.data) && prev.data.length === next.data.length);
	return labelsEqual && dataEqual;
});
