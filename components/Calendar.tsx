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

type DaysByWeekdays = {
	monday: number[];
	tuesday: number[];
	wednesday: number[];
	thursday: number[];
	friday: number[];
	saturday: number[];
	sunday: number[];
};

type Weekday = keyof DaysByWeekdays;

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
 * @returns Array<number> количество дней в месяце, первый день недели месяца
 */
function getDaysInMonths(month: Month, year: number): Array<number> {
	const thirtyOneDays = [0, 2, 4, 6, 7, 11];
	const thirtyDays = [3, 5, 8, 10];
	const mathMonth = month + 1;
	const mathCentryYear = year % 100;
	const centry = year / 100;
	const firstWeekday = Math.floor(
		(1 + Math.floor((13 * mathMonth + 13) / 5) + mathCentryYear + Math.floor(mathCentryYear / 4) + Math.floor(centry / 4) + 5 * centry) % 7,
	);

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

	const weekdays: Weekday[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

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

	useEffect(() => {
		setMonthData(getDaysInMonths(selectMonth as Month, selectYear));
	}, [selectMonth, selectYear]);

	useEffect(() => {
		const firstWeekday = monthData[1];

		if (firstWeekday) {
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
			let index = 0;
			Object.keys(monthWeekdays).forEach((key) => {
				if (index != firstWeekday) {
					monthWeekdays[key as Weekday].push(0);
				}
				index++;
			});

			for (let index = 1; index <= monthData[0]; index++) {
				monthWeekdays[weekdays[weekdayIndex]].push(index);
				weekdayIndex++;
				if (weekdayIndex > 6 && index <= monthData[0]) {
					weekdayIndex = 0;
				}				
			}

			if (weekdayIndex <= 6) {
				for (let index = weekdayIndex; index <= 6; index++) {
					monthWeekdays[weekdays[weekdayIndex]].push(0);					
				}
			}

			setDaysByWeekdays(monthWeekdays);
		}
	}, [monthData]);

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
						<Text style={pageStyles.buttonText}>{"<"}</Text>
					</TouchableOpacity>
					<Text style={[pageStyles.text, { marginLeft: 10, marginRight: 10 }]}>{selectYear}</Text>
					<TouchableOpacity style={pageStyles.button}>
						<Text style={pageStyles.buttonText}>{">"}</Text>
					</TouchableOpacity>
				</View>
				<View style={[pageStyles.blockAtRow, { marginTop: 10 }]}>
					<TouchableOpacity style={pageStyles.button}>
						<Text style={pageStyles.buttonText}>{"<"}</Text>
					</TouchableOpacity>
					<Text style={[pageStyles.text, { marginLeft: 10, marginRight: 10 }]}>{selectMonth ? monthArr[selectMonth] : "????"}</Text>
					<TouchableOpacity style={pageStyles.button}>
						<Text style={pageStyles.buttonText}>{">"}</Text>
					</TouchableOpacity>
				</View>
				<View style={[pageStyles.calendarContainer]}>
					{selectMonth && selectYear ? (
						<View style={[pageStyles.gridCalendar]}>
							<View style={pageStyles.calendarWeekdayBox}>
								{daysByWeekdays.monday.map((day, index) => (
									<TouchableOpacity key={index}>
										<Text style={[pageStyles.text, {textAlign: "center"}]}>{day ? day : " "}</Text>
									</TouchableOpacity>
								))}
							</View>
							<View style={pageStyles.calendarWeekdayBox}>
								{daysByWeekdays.tuesday.map((day, index) => (
									<TouchableOpacity key={index}>
										<Text style={[pageStyles.text, {textAlign: "center"}]}>{day ? day : " "}</Text>
									</TouchableOpacity>
								))}
							</View>
							<View style={pageStyles.calendarWeekdayBox}>
								{daysByWeekdays.wednesday.map((day, index) => (
									<TouchableOpacity key={index}>
										<Text style={[pageStyles.text, {textAlign: "center"}]}>{day ? day : " "}</Text>
									</TouchableOpacity>
								))}
							</View>
							<View style={pageStyles.calendarWeekdayBox}>
								{daysByWeekdays.thursday.map((day, index) => (
									<TouchableOpacity key={index}>
										<Text style={[pageStyles.text, {textAlign: "center"}]}>{day ? day : " "}</Text>
									</TouchableOpacity>
								))}
							</View>
							<View style={pageStyles.calendarWeekdayBox}>
								{daysByWeekdays.friday.map((day, index) => (
									<TouchableOpacity key={index}>
										<Text style={[pageStyles.text, {textAlign: "center"}]}>{day ? day : " "}</Text>
									</TouchableOpacity>
								))}
							</View>
							<View style={pageStyles.calendarWeekdayBox}>
								{daysByWeekdays.saturday.map((day, index) => (
									<TouchableOpacity key={index}>
										<Text style={[pageStyles.text, {textAlign: "center"}]}>{day ? day : " "}</Text>
									</TouchableOpacity>
								))}
							</View>
							<View style={pageStyles.calendarWeekdayBox}>
								{daysByWeekdays.sunday.map((day, index) => (
									<TouchableOpacity key={index}>
										<Text style={[pageStyles.text, {textAlign: "center"}]}>{day ? day : " "}</Text>
									</TouchableOpacity>
								))}
							</View>
						</View>
					) : (
						"???"
					)}
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
