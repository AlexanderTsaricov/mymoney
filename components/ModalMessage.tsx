import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";
import { pageStyles } from "../Styles/page";

export type ModalMessageProp = {
	message: string;
	show: boolean;
	setShow: React.Dispatch<React.SetStateAction<boolean>>;
	callbackIfOk?: () => void;
	style?: object;
};

export default function ModalMessage(prop: ModalMessageProp) {
    const { height: screenHeight } = Dimensions.get("screen");
	return (
		<Modal isVisible={prop.show} deviceHeight={screenHeight}>
			<View style={prop.style}>
				<Text style={[pageStyles.text, {fontSize: 20}]}>{prop.message}</Text>
				<TouchableOpacity
					style={[pageStyles.button, {width: "100%"}]}
					onPress={() => {
						prop.callbackIfOk?.();
						prop.setShow(false);
					}}
				>
					<Text style={pageStyles.buttonText}>OK</Text>
				</TouchableOpacity>
			</View>
		</Modal>
	);
}
