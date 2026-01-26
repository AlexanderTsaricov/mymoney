import {
	GestureResponderEvent,
	KeyboardTypeOptions,
	View,
	TextInput,
	Text,
	TouchableOpacity,
} from "react-native";
import Selector, { SelectorProps } from "./Selector";
import { pageStyles } from "../Styles/page";

/**
 * Универсальный компонент формы для React Native.
 *
 * Рендерит набор полей и кнопку отправки на основе конфигурации,
 * переданной через props. Состояние и бизнес-логика находятся
 * снаружи компонента.
 */

/**
 * Текстовое поле ввода.
 *
 * Используется для рендера TextInput.
 */
export type InputByText = {
	labelText: string;
	placeholder: string;
	keyboardType: KeyboardTypeOptions | undefined;
	value: any;
	onChangeText: React.Dispatch<React.SetStateAction<any>>;
};

/**
 * Поле-селектор.
 *
 * Используется для рендера компонента Selector.
 */
export type InputBySelector = {
	labelText: string;
	selectorProps: SelectorProps;
};

/**
 * Пропсы формы.
 *
 * inputs — массив описаний полей (TextInput или Selector)
 * submitTextButton — текст кнопки отправки
 * submitOnPress — обработчик нажатия на кнопку
 */
export type FormProps = {
	inputs: (InputByText | InputBySelector)[];
	submitTextButton: string;
	submitOnPress: (event: GestureResponderEvent) => void;
};

/**
 * Type guard для определения селектора.
 *
 * Если у элемента есть selectorProps — это InputBySelector.
 */
function isSelector(
	item: InputByText | InputBySelector,
): item is InputBySelector {
	return "selectorProps" in item;
}

/**
 * Form — презентационный компонент формы.
 *
 * Сам:
 * - рендерит поля по конфигурации
 * - различает типы полей через type guard
 * - вызывает submitOnPress при отправке
 *
 * Не:
 * - хранит состояние
 * - выполняет валидацию
 * - содержит бизнес-логику
 *
 * Ожидает props:
 * - inputs: массив описаний полей формы.
 *   Каждый элемент — либо текстовый инпут (InputByText),
 *   либо селектор (InputBySelector). Порядок элементов
 *   определяет порядок отображения полей.
 *
 * - submitTextButton: текст, отображаемый на кнопке отправки.
 *
 * - submitOnPress: функция, вызываемая при нажатии на кнопку
 *   отправки формы. Получает GestureResponderEvent.
 */
export default function Form(formProps: FormProps) {
	return (
		<View style={{ width: "100%" }}>
			{formProps.inputs.map((input, index) =>
				isSelector(input) ? (
					<View key={index} style={[{ width: "100%" }]}>
						<Text style={pageStyles.text}>{input.labelText}</Text>
						<Selector {...input.selectorProps} />
					</View>
				) : (
					<View key={index} style={[{ width: "100%" }]}>
						<Text style={pageStyles.text}>{input.labelText}</Text>
						<TextInput
							placeholder={input.placeholder}
							keyboardType={input.keyboardType}
							value={input.value}
							onChangeText={input.onChangeText}
							style={[pageStyles.inputText]}
							placeholderTextColor={'#a68ebf'}
						/>
					</View>
				),
			)}

			<TouchableOpacity
				style={pageStyles.button}
				onPress={formProps.submitOnPress}
			>
				<Text style={pageStyles.buttonText}>
					{formProps.submitTextButton}
				</Text>
			</TouchableOpacity>
		</View>
	);
}
