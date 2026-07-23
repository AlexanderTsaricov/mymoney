import { Dimensions, StyleSheet } from "react-native";
export const pageStyles = StyleSheet.create({
	headContainer: {
		flex: 1,
		backgroundColor: "#a68ebf"
	},

	text: {
		color: "#ffffff",
		fontSize: 17,
		fontWeight: "600",
		letterSpacing: 0.3,
		textShadowColor: "rgba(0,0,0,0.15)",
		textShadowOffset: { width: 0, height: 1 },
		textShadowRadius: 1,
	},

	redText: {
		color: "#f07474"
	},

	greenText: {
		color: "#6df37a"
	},

	block: {
		width: "100%",
		paddingVertical: 14,
		paddingHorizontal: 10,
		alignItems: "center",
		justifyContent: "center",
		borderBottomWidth: 1,
		borderBottomColor: "rgba(255,255,255,0.25)",
	},

	button: {
		borderRadius: 10,
		paddingVertical: 10,
		paddingHorizontal: 18,
		backgroundColor: "#6d3fa8",

		// лёгкая, аккуратная тень
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.15,
		shadowRadius: 2,
		elevation: 2,
	},

	buttonText: {
		color: "#ffffff",
		fontSize: 16,
		fontWeight: "600",
		textAlign: "center",
	},

	inputText: {
		borderWidth: 1,
		borderColor: "#cbb7e6",
		borderRadius: 8,
		paddingVertical: 8,
		paddingHorizontal: 12,
		fontSize: 15,
		backgroundColor: "#ffffff",
		width: "100%",
		marginVertical: 6,

		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.08,
		shadowRadius: 1,
		elevation: 1,
	},

	inputTextFocus: {
		borderColor: "#7e57c2",
	},

	selectorContainer: {
		width: "100%",
		marginVertical: 8,
	},

	selectorTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#ffffff",
		marginBottom: 4,
		textShadowColor: "rgba(0,0,0,0.2)",
		textShadowOffset: { width: 0, height: 1 },
		textShadowRadius: 1,
	},

	selectorWrapper: {
		borderRadius: 8,
		backgroundColor: "#6d3fa8",
		borderWidth: 1,
		borderColor: "#8c6ccf",

		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.15,
		shadowRadius: 1,
		elevation: 2,
	},

	selectorInputInner: {
		color: "#fff",
	},

	selectorPlaceholder: {
		color: "#e0d4f5",
	},

	listWithButton: {
		flexDirection: "row",
		gap: 10,
		alignItems: "center",
		justifyContent: "center",
	},

	blockAtRow: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
	},

	flexChild: {
		flex: 1,
	},

	inputError: {
		borderColor: "#d66",
	},

	calendarContainer: {
		width: "100%",
		alignItems: "center",
		marginTop: 10,
	},

	gridCalendar: {
		maxWidth: 260,
		flexDirection: "row",
		gap: 10,
		flexWrap: "wrap",
		alignItems: "center",
		justifyContent: "center",
	},

	calendarDay: {
		width: 35,
	},

	inputTextShort: {
		maxWidth: 45,
		padding: 3,
	},
	calendarWeekdayBox: {
		flexDirection: "column",
		justifyContent: "flex-start",
		alignItems: "center",
	},

	debugMod: {
		borderColor: "red",
		borderWidth: 2
	},

	messageModal: {
		backgroundColor: "#a68ebf",
		padding: 10,
		borderRadius: 5,
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		alignContent: "center",
		alignItems: "center",
		gap: 10
	}
});
