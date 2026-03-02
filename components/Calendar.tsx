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

function zellerToIsoDay(x: number): number {
	// x в диапазоне 0..6
	return (x + 5) % 7;
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

	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0).getTime();

	const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime();

	const start = Math.max(startOfMonth, minTime);
	const end = Math.min(endOfMonth, maxTime);

	return [start, end];
}

function isBetweenTimes(today: Date, minTime: number, maxTime: number) {
	return today <= new Date(maxTime) && today >= new Date(minTime);
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
	const [resultData, setResultData] = useState<number[]>(getCurrentMonthRange(minTime, maxTime));

	// Стейты выбранного времени и даты
	const today = new Date();
	const startSelectMonth = isBetweenTimes(today, minTime, maxTime) ? new Date().getMonth() : new Date(minTime).getMonth();
	const startSelectYear = isBetweenTimes(today, minTime, maxTime) ? new Date().getFullYear() : new Date(minTime).getFullYear();

	const [selectStartDay, setSelectStartDay] = useState<number | null>(new Date(resultData[0]).getDate());
	const [selectEndDay, setSelectEndDay] = useState<number | null>(new Date(resultData[1]).getDate());
	const [selectMonth, setSelectMonth] = useState<number>(new Date().getMonth());
	const [selectYear, setSelectYear] = useState<number>(new Date().getFullYear());
	const [selectStartMinutes, setSelectStartMinutes] = useState<number>(new Date(resultData[0]).getMinutes());
	const [selectStartHour, setSelectStartHour] = useState<number>(new Date(resultData[0]).getHours());
	const [selectEndMinutes, setSelectEndMinutes] = useState<number>(new Date(resultData[1]).getMinutes());
	const [selectEndHours, setSelectEndHours] = useState<number>(new Date(resultData[1]).getHours());

	// Стейты максимальной и минимальной даты календаря
	const [minDate, setMinDate] = useState<Date>(new Date(maxTime));
	const [maxDate, setMaxDate] = useState<Date>(new Date(maxTime));

	// Стейт данных для рендера календаря
	const [timeData, setTimeData] = useState<TimeData | null>(null);
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

	// Объект из двух булевных значений, обозначающих что выбран диапазон дней
	const [isSelectedDays, setIsSelectedDays] = useState<IsSelectedDays>({ startDay: true, endDay: true });

	const weekdays: Weekday[] = [
		{ rus: "ПН", en: "monday" },
		{ rus: "ВТ", en: "tuesday" },
		{ rus: "СР", en: "wednesday" },
		{ rus: "ЧТ", en: "thursday" },
		{ rus: "ПТ", en: "friday" },
		{ rus: "СБ", en: "saturday" },
		{ rus: "ВС", en: "sunday" },
	];

	// Рассчитываем максимальное и минимальное время календаря
	useEffect(() => {
		const minDate = new Date(minTime);
		const maxDate = new Date(maxTime);

		const yearsRange = getRangeTime(minDate.getFullYear(), maxDate.getFullYear());

		setTimeData({
			yearsRange: yearsRange,
			minDate: minDate,
			maxDate: maxDate,
		});
	}, [minTime, maxTime]);

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
				// console.log("case 0");
				// console.log(back);
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
	}

	const  isAfterStartWallet = (day: number) => {
		const time = new Date(selectYear, selectMonth, day);

		if (time.getTime() >= minTime) {
			return true;
		} else {
			return false;
		}
	} 

	const selectingData = (day: number) => {
		if (selectStartDay && selectEndDay) {
			setSelectEndDay(null);
			setSelectStartDay(day);
			setSelectStartDate(new Date(selectYear, selectMonth, day));
		}

		if (selectStartDay && !selectEndDay) {
			setSelectEndDay(day);
			setSelectEndDate(new Date(selectYear, selectMonth, day));
		}
	};

	useEffect(() => {
		if (selectEndDay) {
			const endDate = new Date(selectYear, selectMonth, selectEndDay);
			if (selectStartDate) {
				callbackSelect([selectStartDate.getTime(), endDate.getTime()]);
			}
		}
	}, [selectEndDay]);

	return (
		<Modal
			isVisible={showCalendar}
			swipeDirection="down"
			onSwipeComplete={() => setShowCalendar(false)}
			style={{ maxHeight: 350, borderRadius: 15, borderWidth: 1 }}
		>
			<View style={pageStyles.headContainer}>
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
										<Text style={[pageStyles.text, { textAlign: "center" }, isAfterStartWallet(day) ? ((isInSelectedDays(day) || isInSelectStartDay(day)) ? { color: "#b4d302" } : {}) : {color: "#616161"}]}>
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
							value={getStringHours(selectStartHour)}
							onChangeText={(value) => setSelectStartHour(parseInt(value))}
							keyboardType="number-pad"
							style={[pageStyles.inputText, pageStyles.inputTextShort]}
						/>
						<Text>:</Text>
						<TextInput
							value={getStringMinutes(selectStartMinutes)}
							onChangeText={(value) => setSelectStartMinutes(parseInt(value))}
							keyboardType="number-pad"
							style={[pageStyles.inputText, pageStyles.inputTextShort]}
						/>
					</View>
					<View style={pageStyles.blockAtRow}>
						<Text style={pageStyles.text}>Время до (Ч/М): </Text>
						<TextInput
							value={getStringHours(selectEndHours)}
							onChangeText={(value) => setSelectEndHours(parseInt(value))}
							keyboardType="number-pad"
							style={[pageStyles.inputText, pageStyles.inputTextShort]}
						/>
						<Text>:</Text>
						<TextInput
							value={getStringMinutes(selectEndMinutes)}
							onChangeText={(value) => setSelectEndMinutes(parseInt(value))}
							keyboardType="number-pad"
							style={[pageStyles.inputText, pageStyles.inputTextShort]}
						/>
					</View>
				</View>
			</View>
		</Modal>
	);
}
