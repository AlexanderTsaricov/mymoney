import { useEffect, useState } from "react";
import { Modal, TextInput, TouchableOpacity, View, Text } from "react-native";
import { pageStyles } from "../Styles/page";

export interface CalendarProps<T> {
	callbackSelect: (value: T | null) => void;
	showCalendar: boolean;
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
 * Возвращает количество дней в месяце
 * @param month месяц
 * @param year год
 * @returns number количество дней в месяце
 */
function getDaysInMonths(month: Month, year: number): number {
	const thirtyOneDays = [0, 2, 4, 6, 7, 11];
	const thirtyDays = [3, 5, 8, 10];

	if (thirtyDays.includes(month)) {
		return 30;
	} else if (thirtyOneDays.includes(month)) {
		return 31;
	} else {
		if (isLeapYear(year)) {
			return 29;
		} else {
			return 28;
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
export default function Calendar<T>({ callbackSelect, showCalendar, minTime, maxTime }: CalendarProps<T>) {
	// Стейт для результата
	const [resultData, setResultData] = useState<number[]>(getCurrentMonthRange(minTime, maxTime));

	// Стейты выбранного времени и даты
	const today = new Date();
	const startSelectMonth = isBetweenTimes(today, minTime, maxTime) ? new Date().getMonth() : new Date(minTime).getMonth();
	const startSelectYear = isBetweenTimes(today, minTime, maxTime) ? new Date().getFullYear() : new Date(minTime).getFullYear();

	const [selectStartDay, setSelectStartDay] = useState<number>(new Date(resultData[0]).getDay());
	const [selectEndDay, setSelectEndDay] = useState<number>(new Date(resultData[1]).getDay());
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

	// Объект из двух булевных значений, обозначающих что выбран диапазон дней
	const [isSelectedDays, setIsSelectedDays] = useState<IsSelectedDays>({ startDay: true, endDay: true });

	// Геенерация данных для календаря
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

	const selectDay = (dayNumber: number) => {
		if (isSelectedDays.startDay && isSelectedDays.endDay) {
			setSelectStartDay(dayNumber);
			setSelectEndDay(dayNumber);
			setIsSelectedDays({ startDay: true, endDay: false });
		}

		if (isSelectedDays.startDay && !isSelectedDays.endDay) {
			setSelectEndDay(dayNumber);
			setIsSelectedDays({ startDay: true, endDay: true });
		}
	};

	return (
		<Modal visible={showCalendar}>
			<View style={pageStyles.headContainer}>
				<View style={[pageStyles.block, pageStyles.blockAtRow]}>
					<TouchableOpacity style={pageStyles.button}>
						<Text style={pageStyles.buttonText}>До</Text>
					</TouchableOpacity>
					<Text style={pageStyles.text}>{selectYear}</Text>
					<TouchableOpacity style={pageStyles.button}>
						<Text style={pageStyles.buttonText}>После</Text>
					</TouchableOpacity>
				</View>
				<View>
					<TouchableOpacity>
						<Text>{"<"}</Text>
					</TouchableOpacity>
					<Text>{selectMonth ? monthArr[selectMonth] : "????"}</Text>
					<TouchableOpacity>
						<Text>{">"}</Text>
					</TouchableOpacity>
				</View>
				<View>
					{selectMonth && selectYear
						? Array.from({ length: getDaysInMonths(selectMonth as Month, selectYear) }, (_, i) => (
								<TouchableOpacity key={i + 1} onPress={() => selectDay(i)}>
									<Text>{i + 1}</Text>
								</TouchableOpacity>
							))
						: "???"}
				</View>
				<View>
					<View>
						<TextInput
							value={getStringHours(selectStartHour)}
							onChangeText={(value) => setSelectStartHour(parseInt(value))}
							keyboardType="number-pad"
						/>
						<Text>:</Text>
						<TextInput
							value={getStringMinutes(selectStartMinutes)}
							onChangeText={(value) => setSelectStartMinutes(parseInt(value))}
							keyboardType="number-pad"
						/>
					</View>
					<View>
						<TextInput
							value={getStringHours(selectEndHours)}
							onChangeText={(value) => setSelectEndHours(parseInt(value))}
							keyboardType="number-pad"
						/>
						<Text>:</Text>
						<TextInput
							value={getStringMinutes(selectEndMinutes)}
							onChangeText={(value) => setSelectEndMinutes(parseInt(value))}
							keyboardType="number-pad"
						/>
					</View>
				</View>
			</View>
		</Modal>
	);
}
