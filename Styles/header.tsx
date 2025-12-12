import { StyleSheet } from "react-native";

export const headerStyles = StyleSheet.create({
    container: {
        height: 80,
        backgroundColor: '#905cc4',

        // IOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.7,
        shadowRadius: 10,

        // Android
        elevation: 10,

        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        padding: 10
    },
    text: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: 1.5,
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    }

});