import { useState } from "react";
import { Text, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import { pageStyles } from "../Styles/page";

type ModalMessageProp = {
    message: string;
    show: boolean;
    callbackIfOk?: () => void;
}

export default function ModalMessage (prop: ModalMessageProp) {
    const [show, setShow] = useState<boolean>(prop.show)
    return (
        <Modal isVisible={show}>
            <Text style={pageStyles.text}>{prop.message}</Text>
            <TouchableOpacity style={pageStyles.button} onPress={() => {
                if (prop.callbackIfOk) {
                    prop.callbackIfOk();
                }
                setShow(false);
            }}>
                <Text style={pageStyles.buttonText}>OK</Text>
            </TouchableOpacity>
        </Modal>
    )
}