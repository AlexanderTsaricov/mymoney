import { GestureResponderEvent, KeyboardTypeOptions, View, TextInput, Text, TouchableOpacity } from "react-native";
import Selector, { SelectorProps } from "./Selector";
import { pageStyles } from "../Styles/page";
import { useEffect, useState } from "react";

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
	onChangeText: React.Dispatch<React.SetStateAction<string>>;
	required?: boolean;
	textError?: string;
};

/**
 * Поле-селектор.
 *
 * Используется для рендера компонента Selector.
 */
export type InputBySelector = {
	labelText: string;
	selectorProps: SelectorProps<any>;
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
function isSelector(item: InputByText | InputBySelector): item is InputBySelector {
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
	const [errors, setErrors] = useState<boolean[]>([]);
	const [textInputsFocus, setInputsFocus] = useState<boolean[]>([]);

	const changeFocuse = (index: number, val: boolean) => {
		setInputsFocus((prev) => {
			const newFocus = [...prev];
			newFocus[index] = val;
			return newFocus;
		});
	};

	useEffect(() => {
		const inputsError = [];
		const focusArr = [];
		for (let index = 0; index < formProps.inputs.length; index++) {
			const input = formProps.inputs[index];

			if (!isSelector(input)) {
				inputsError.push(false);
				focusArr.push(false);
			}
		}
		setErrors(inputsError);
		setInputsFocus(focusArr);
	}, []);

	return (
		<View style={{ width: "100%" }}>
			{formProps.inputs.map((input, index) =>
				isSelector(input) ? (
					<View key={index} style={[{ width: "100%" }]}>
						{input.labelText != '' && (<Text style={pageStyles.text}>{input.labelText}</Text>)}
						<Selector {...input.selectorProps} />
					</View>
				) : (
					<View key={index} style={[{ width: "100%" }]}>
						{input.labelText != '' && (<Text style={pageStyles.text}>{input.labelText}</Text>)}
						<TextInput
							placeholder={input.placeholder}
							keyboardType={input.keyboardType}
							value={input.value}
							onChangeText={input.onChangeText}
							style={[
								pageStyles.inputText,
								errors[index] ? pageStyles.inputError : {},
								textInputsFocus[index] ? pageStyles.inputTextFocus : {},
							]}
							placeholderTextColor={"#a68ebf"}
							onFocus={() => {
								changeFocuse(index, true);
							}}
							onBlur={() => {
								changeFocuse(index, false);
							}}
						/>
						{errors[index] && (
							<Text style={{ color: "#8B0000", marginTop: -7, paddingLeft: 12 }}>
								{input.textError ? input.textError : "Поле не должно быть пустым"}
							</Text>
						)}
					</View>
				),
			)}

			<TouchableOpacity
				style={pageStyles.button}
				onPress={(event) => {
					let emptyError = false;
					const inputErrors: boolean[] = [];

					for (let index = 0; index < formProps.inputs.length; index++) {
						const input = formProps.inputs[index];

						if (!isSelector(input)) {
							if (input.value.length == 0 && input.required) {
								emptyError = true;
								inputErrors.push(true);
							} else {
								inputErrors.push(false);
							}
						}
					}

					setErrors(inputErrors);

					if (!emptyError) {
						formProps.submitOnPress(event);
					}
				}}
			>
				<Text style={pageStyles.buttonText}>{formProps.submitTextButton}</Text>
			</TouchableOpacity>
		</View>
	);
}
