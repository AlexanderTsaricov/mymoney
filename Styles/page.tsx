import { Dimensions, StyleSheet } from "react-native";
const { height } = Dimensions.get('window');
export const pageStyles = StyleSheet.create({
    text: {
        color: '#fff',                // белый цвет
        fontSize: 19,                 // размер текста
        fontWeight: '700',            // жирный
        letterSpacing: 1,           // межбуквенный интервал
        textShadowColor: '#000',      // тень текста
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },

    block: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: '#5f348a',
        borderStyle: 'dashed'
    },


    headContainer: {
        backgroundColor: '#a68ebf',
        height: height
    },

    button: {
        borderRadius: 8,
        backgroundColor: '#5f348a',
        paddingVertical: 5,
        paddingHorizontal: 10,

        // для iOS
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,

        // для Android
        elevation: 5,
    },

    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700'
    },

    inputText: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        fontSize: 16,
        backgroundColor: '#fff',
        width: '100%',
        margin: 7,

        // тень для iOS
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,

        // тень для Android
        elevation: 2,
    },

    inputTextFocus: {
        borderColor: '#5f348a'
    }

});