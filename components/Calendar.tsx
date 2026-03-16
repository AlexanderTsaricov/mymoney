import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { TextInput, TouchableOpacity, View, Text } from "react-native";
import Modal from "react-native-modal";
import { pageStyles } from "../Styles/page";
import Logger from "../logger/Logger";

export interface CalendarProps<T> {
	callbackSelect: (value: number[]) => void;
	showCalendar: boolean;
	setShowCalendar: Dispatch<SetStateAction<boolean>>;
	minTime: number;
	maxTime: number;
}

type TimeData = {
	yearsRange: number[];
	minDate: Date;
	maxDate: Date;
};

type Month = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

type IsSelectedDays = {
	startDay: boolean;
	endDay: boolean;
};

type DaysByWeekdays = {
	monday: number[];
	tuesday: number[];
	wednesday: number[];
	thursday: number[];
	friday: number[];
	saturday: number[];
	sunday: number[];
};

type Weekday = {
	rus: string;
	en: keyof DaysByWeekdays;
};

/**
 * Возвращает массив с годами между минимальной и максимальной датой
 * @param minTime максимальная дата (Date)
 * @param maxTime минимальная даат (Date)
 * @returns number[] массив годов от minTime до maxTime
 */
function getRangeTime(minTime: number, maxTime: number): number[] {
	const timeRange: number[] = [];

	for (let index = minTime; index < maxTime; index++) {
		timeRange.push(index);
	}

	return timeRange;
}

/**
 * Вычисляет явлется ли год високостным
 * @param year год
 * @returns true если год високостный
 */
function isLeapYear(year: number): boolean {
	return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Возвращает количество дней в месяце и первый день недели месяца
 * @param month месяц
 * @param year год
 * @returns Array<number> количество дней в месяце, первый день недели месяца
 */
function getDaysInMonths(month: Month, year: number): Array<number> {
	const thirtyOneDays = [0, 2, 4, 6, 7, 11];
	const thirtyDays = [3, 5, 8, 10];

	const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;

	if (thirtyDays.includes(month)) {
		return [30, firstWeekday];
	} else if (thirtyOneDays.includes(month)) {
		return [31, firstWeekday];
	} else {
		if (isLeapYear(year)) {
			return [29, firstWeekday];
		} else {
			return [28, firstWeekday];
		}
	}
}

/**
 * возвращает массив времени (Date) где [начало текущего месяца, конец текущего месяца]
 * @param minTime - минимальное время в формате Date().getTime()
 * @param maxTime - максимальное время в формате Date().getTime()
 * @returns array [начало текущего месяца, конец текущего месяца]
 */
function getCurrentMonthRange(minTime: number, maxTime: number): [number, number] {
	const now = new Date();
	const year = now.getFullYear();
	const month = now.getMonth();

	// Создаем начало и конец месяца строго
	const startOfMonth = new Date(year, month, 1, 0, 0, 0, 0).getTime();
	const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime();

	const start = Math.max(startOfMonth, minTime);
	const end = Math.min(endOfMonth, maxTime);

	return [start, end];
}

const monthArr = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

/**
 * Возвращает минуты в строковом виде в пределах от 00 до 59
 * @param minutes - минуты в number формате
 * @returns string
 */
function getStringMinutes(minutes: number) {
	if (minutes < 10) {
		return `0${minutes}`;
	} else {
		if (minutes > 59) {
			return "59";
		} else {
			return `${minutes}`;
		}
	}
}

/**
 * Возвращает часы в строковом виде в пределах от 00 до 23
 * @param hours часы в формате number
 * @returns string
 */
function getStringHours(hours: number) {
	if (hours < 10) {
		return `0${hours}`;
	} else {
		if (hours > 23) {
			return "00";
		} else {
			return `${hours}`;
		}
	}
}

/**
 * Календарь в котором можно выбрать диапазон значений
 * @param callbackSelect - коллбэк в который передается выбранный диапазон значений в виде массива
 * @param minTime - минимальное время и дата календаря (Date)
 * @param maxTime - максимальное время и дата календаря (Date)
 */
export default function Calendar<T>({ callbackSelect, showCalendar, setShowCalendar, minTime, maxTime }: CalendarProps<T>) {
	// Стейт для результата
	const [selectStartDate, setSelectStartDate] = useState<Date | null>(null);
	const [selectEndDate, setSelectEndDate] = useState<Date | null>(null);

	// Стейты выбранного времени и даты
	const today = new Date();

	const [selectStartDay, setSelectStartDay] = useState<number | null>(null);
	const [selectEndDay, setSelectEndDay] = useState<number | null>(null);
	const [selectMonth, setSelectMonth] = useState<number>(new Date().getMonth());
	const [selectYear, setSelectYear] = useState<number>(new Date().getFullYear());
	const [selectStartMinutes, setSelectStartMinutes] = useState<number>(0);
	const [selectStartHour, setSelectStartHour] = useState<number>(0);
	const [selectEndMinutes, setSelectEndMinutes] = useState<number>(59);
	const [selectEndHours, setSelectEndHours] = useState<number>(23);
	const [monthData, setMonthData] = useState<Array<number>>([]);
	const [daysByWeekdays, setDaysByWeekdays] = useState<DaysByWeekdays>({
		monday: [],
		tuesday: [],
		wednesday: [],
		thursday: [],
		friday: [],
		saturday: [],
		sunday: [],
	});

	const weekdays: Weekday[] = [
		{ rus: "ПН", en: "monday" },
		{ rus: "ВТ", en: "tuesday" },
		{ rus: "СР", en: "wednesday" },
		{ rus: "ЧТ", en: "thursday" },
		{ rus: "ПТ", en: "friday" },
		{ rus: "СБ", en: "saturday" },
		{ rus: "ВС", en: "sunday" },
	];

	// Рассчитываем количество дней в выбранном месяце
	useEffect(() => {
		setMonthData(getDaysInMonths(selectMonth as Month, selectYear));
	}, [selectMonth, selectYear]);

	// Генерируем дни
	useEffect(() => {
		const firstWeekday = monthData[1];

		if (firstWeekday != null && firstWeekday != undefined) {
			let weekdayIndex: number = firstWeekday;

			const monthWeekdays: DaysByWeekdays = {
				monday: [],
				tuesday: [],
				wednesday: [],
				thursday: [],
				friday: [],
				saturday: [],
				sunday: [],
			};

			// Заполняем пустыми значениями дни недели до первого дня
			for (let index = 0; index < weekdays.length && index < firstWeekday; index++) {
				if (index < firstWeekday) {
					monthWeekdays[weekdays[index].en].push(0);
				}
			}

			// Заполняем днями
			for (let index = 1; index <= monthData[0]; index++) {
				if (weekdayIndex > 6 && index <= monthData[0]) {
					weekdayIndex = 0;
				}
				monthWeekdays[weekdays[weekdayIndex].en].push(index);
				weekdayIndex++;
			}

			// Заполняем пустыми значениями оставшиеся дни недели
			for (let index = weekdayIndex; index <= 6; index++) {
				monthWeekdays[weekdays[index].en].push(0);
			}

			setDaysByWeekdays(monthWeekdays);
		}
	}, [monthData]);

	const selectedMonth = (back: boolean = false) => {
		switch (selectMonth) {
			case 0:
				if (back) {
					setSelectMonth(11);
				} else {
					setSelectMonth(1);
				}
				break;
			case 11:
				if (back) {
					setSelectMonth(10);
				} else {
					setSelectMonth(0);
				}
				break;
			default:
				if (back) {
					setSelectMonth(selectMonth - 1);
				} else {
					setSelectMonth(selectMonth + 1);
				}
				break;
		}
	};

	const selectedYear = (back: boolean) => {
		if (back) {
			setSelectYear(selectYear - 1);
		} else {
			setSelectYear(selectYear + 1);
		}
	};

	const isInSelectedDays = (day: number) => {
		if (!selectStartDay || !selectEndDay) return false;
		const date = new Date(selectYear, selectMonth, day);
		if (!selectStartDate || !selectEndDate) return false;
		if (date >= selectStartDate && date <= selectEndDate) {
			return true;
		} else return false;
	};

	const isInSelectStartDay = (day: number) => {
		if (!selectStartDate) {
			return false;
		}
		const date = new Date(selectYear, selectMonth, day);
		return date.getTime() == selectStartDate.getTime();
	};

	const isAfterStartWallet = (day: number) => {
		const time = new Date(selectYear, selectMonth, day);

		if (time.getTime() >= minTime) {
			return true;
		} else {
			return false;
		}
	};

	const selectingData = (day: number) => {
		if (selectStartDay && !selectEndDay) {
			setSelectEndDay(day);
			setSelectEndDate(new Date(selectYear, selectMonth, day, selectEndHours, selectEndMinutes));
		} else if (selectStartDay && selectEndDay) {
			setSelectEndDay(null);
			setSelectEndDate(null);
			setSelectStartDay(day);
			setSelectStartDate(new Date(selectYear, selectMonth, day, selectStartHour, selectStartMinutes));
		} else {
			setSelectStartDay(day);
			setSelectStartDate(new Date(selectYear, selectMonth, day, selectStartHour, selectStartMinutes));
		}
	};

	const submitDate = () => {
		if (selectStartDate && selectEndDate) {
			const startDate = new Date(
				selectStartDate.getFullYear(),
				selectStartDate.getMonth(),
				selectStartDate.getDate(),
				selectStartHour,
				selectStartMinutes,
			);

			const endDate = new Date(
				selectEndDate.getFullYear(),
				selectEndDate.getMonth(),
				selectEndDate.getDate(),
				selectEndHours,
				selectEndMinutes,
			);

			callbackSelect([startDate.getTime(), endDate.getTime()]);
		}
	};

	const formatTimePart = (val: string, max: number): string => {
		if (val == "0") return "00";

		if (/\D/.test(val)) {
			return "00";
		}
		const s = String(val).replace(/\D/g, "");

		if (parseInt(s) > 100) return `0${parseInt(s) % 10}`;

		if (s === "" || s == "0") return "";

		if (!s || isNaN(parseInt(val))) {
			return "00";
		}

		if (parseInt(s) < 10) {
			return `0${s}`;
		}

		if (parseInt(s) > max) {
			return max.toString();
		}

		return s;
	};

	return (
		<Modal isVisible={showCalendar} swipeDirection="down" onSwipeComplete={() => setShowCalendar(false)} style={{ maxHeight: 538 }}>
			<View style={[pageStyles.headContainer, { borderRadius: 15, borderWidth: 3, marginTop: 100 }]}>
				<View style={[pageStyles.block, pageStyles.blockAtRow]}>
					<TouchableOpacity
						style={pageStyles.button}
						onPress={() => {
							selectedYear(true);
						}}
					>
						<Text style={pageStyles.buttonText}>{"<"}</Text>
					</TouchableOpacity>
					<Text style={[pageStyles.text, { marginLeft: 10, marginRight: 10 }]}>{selectYear}</Text>
					<TouchableOpacity
						style={pageStyles.button}
						onPress={() => {
							selectedYear(false);
						}}
					>
						<Text style={pageStyles.buttonText}>{">"}</Text>
					</TouchableOpacity>
				</View>
				<View style={[pageStyles.blockAtRow, { marginTop: 10 }]}>
					<TouchableOpacity
						style={pageStyles.button}
						onPress={() => {
							selectedMonth(true);
						}}
					>
						<Text style={pageStyles.buttonText}>{"<"}</Text>
					</TouchableOpacity>
					<Text style={[pageStyles.text, { marginLeft: 10, marginRight: 10 }]}>{selectMonth != null ? monthArr[selectMonth] : "????"}</Text>
					<TouchableOpacity
						style={pageStyles.button}
						onPress={() => {
							selectedMonth();
						}}
					>
						<Text style={pageStyles.buttonText}>{">"}</Text>
					</TouchableOpacity>
				</View>
				<View style={[pageStyles.calendarContainer]}>
					{selectMonth != null && selectYear != null ? (
						<View style={[pageStyles.gridCalendar]}>
							{/* Дни недели */}
							{weekdays.map((weekday, weekdayIndex) => (
								<View style={pageStyles.calendarWeekdayBox} key={weekdayIndex}>
									<Text style={[pageStyles.text, { textAlign: "center", color: "#87ff92" }]}>{weekday.rus}</Text>
									{/* Числа */}
									{daysByWeekdays[weekday.en].map((day, index) => (
										<TouchableOpacity
											key={index}
											onPress={() => {
												selectingData(day);
											}}
											disabled={!isAfterStartWallet(day)}
										>
											<Text
												style={[
													pageStyles.text,
													{ textAlign: "center", fontSize: 20 },
													isAfterStartWallet(day)
														? isInSelectedDays(day) || isInSelectStartDay(day)
															? { color: "#b4d302" }
															: {}
														: { color: "#616161" },
												]}
											>
												{day ? day : " "}
											</Text>
										</TouchableOpacity>
									))}
								</View>
							))}
						</View>
					) : (
						"???"
					)}
				</View>
				<View>
					<View style={pageStyles.blockAtRow}>
						<Text style={pageStyles.text}>Время от (Ч/М): </Text>
						<TextInput
							value={formatTimePart(selectStartHour.toString(), 24)}
							onChangeText={(value) => setSelectStartHour(parseInt(value))}
							keyboardType="number-pad"
							style={[pageStyles.inputText, pageStyles.inputTextShort]}
						/>
						<Text style={pageStyles.text}>:</Text>
						<TextInput
							value={formatTimePart(selectStartMinutes.toString(), 59)}
							onChangeText={(value) => setSelectStartMinutes(parseInt(value))}
							keyboardType="number-pad"
							style={[pageStyles.inputText, pageStyles.inputTextShort]}
						/>
					</View>
					<View style={pageStyles.blockAtRow}>
						<Text style={pageStyles.text}>Время до (Ч/М): </Text>
						<TextInput
							value={formatTimePart(selectEndHours.toString(), 24)}
							onChangeText={(value) => setSelectEndHours(parseInt(value))}
							keyboardType="number-pad"
							style={[pageStyles.inputText, pageStyles.inputTextShort]}
						/>
						<Text style={pageStyles.text}>:</Text>
						<TextInput
							value={formatTimePart(selectEndMinutes.toString(), 59)}
							onChangeText={(value) => setSelectEndMinutes(parseInt(value))}
							keyboardType="number-pad"
							style={[pageStyles.inputText, pageStyles.inputTextShort]}
						/>
					</View>
				</View>
				<TouchableOpacity
					style={pageStyles.button}
					onPress={() => {
						submitDate();
						setShowCalendar(false);
					}}
					disabled={!selectStartDay || !selectEndDay}
				>
					<Text style={pageStyles.buttonText}>Применить</Text>
				</TouchableOpacity>
			</View>
		</Modal>
	);
}
