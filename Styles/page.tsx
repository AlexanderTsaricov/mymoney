import { Dimensions, StyleSheet } from "react-native";
const { height } = Dimensions.get("window");
export const pageStyles = StyleSheet.create({
	borderRedDebug: {
		borderWidth: 1,
		borderColor: "red",
	},

	text: {
		color: "#fff", // белый цвет
		fontSize: 19, // размер текста
		fontWeight: "700", // жирный
		letterSpacing: 1, // межбуквенный интервал
		textShadowColor: "#000", // тень текста
		textShadowOffset: { width: 1, height: 1 },
		textShadowRadius: 3,
	},

	block: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		padding: 8,
		width: "100%",
		borderBottomWidth: 1,
		borderBottomColor: "#5f348a",
		borderStyle: "dashed",
	},

	headContainer: {
		backgroundColor: "#a68ebf",
		flex: 1,
	},

	button: {
		borderRadius: 8,
		backgroundColor: "#5f348a",
		paddingVertical: 5,
		paddingHorizontal: 10,

		// для iOS
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,

		// для Android
		elevation: 5,
		alignContent: "center",
		justifyContent: "center",
	},

	buttonText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "700",
		textAlign: "center",
	},

	inputText: {
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 8,
		paddingVertical: 8,
		paddingHorizontal: 12,
		fontSize: 16,
		backgroundColor: "#fff",
		width: "100%",
		padding: 7,
		marginVertical: 6,

		// тень для iOS
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,

		// тень для Android
		elevation: 2,
	},

	inputTextFocus: {
		borderColor: "#5f348a",
	},

	// Стили для селекторов
	selectorContainer: {
		width: "100%",
		marginVertical: 8,
		maxHeight: 70,
	},

	selectorTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: "#fff",
		marginBottom: 5,
		textShadowColor: "#000",
		textShadowOffset: { width: 1, height: 1 },
		textShadowRadius: 2,
	},

	selectorWrapper: {
		borderRadius: 8,
		backgroundColor: "#5f348a",
		borderWidth: 2,
		borderColor: "#7e57c2",
		overflow: "hidden",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.2,
		shadowRadius: 2,
		elevation: 3, // для Android
	},

	selectorInputInner: {
		color: "#fff",
	},

	selectorPlaceholder: {
		color: "#d1c0eb",
	},

	listWithButton: {
		display: "flex",
		gap: 10,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},

	blockAtRow: {
		display: "flex",
		flexDirection: "row",
		boxSizing: "border-box",
		justifyContent: "center",
		alignItems: "center",
	},

	flexChild: {
		flex: 1,
	},

	inputError: {
		borderColor: "#c25757ff",
	},

    debugBorder: {
        borderWidth: 2,
		borderColor: "red",
    }
});
