import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import RNPickerSelect, { Item } from "react-native-picker-select";
import { pageStyles } from "../Styles/page";
import Logger from "../logger/Logger";

export interface SelectorProps<T> {
	title: string;
	titleDontHave: string;
	items: any[];
	onChange: (value: T | null) => void;
}

function Selector<T extends { name?: string } | string>({ title, titleDontHave, items, onChange }: SelectorProps<any>) {
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

	useEffect(() => {
		if (items && items.length > 0 && selectedIndex === null) {
			setSelectedIndex(0);
			onChange(items[0]);
		} else if (!items || items.length === 0) {
			setSelectedIndex(null);
			onChange(null);
		}
	}, [items]);

	const handleValueChange = (value: number | null) => {
		if (value === null || value === undefined) {
			setSelectedIndex(null);
			onChange(null);
		} else {
			setSelectedIndex(value);
			onChange(items[value]);
		}
	};

	const pickerItems: Item[] =
		items.length > 0
			? items.map((item, idx) => ({
					label: typeof item === "string" ? item : (item.name ?? "unknown"),
					value: idx,
				}))
			: [{ label: titleDontHave, value: null }]; // появляется только если items пустой

	return (
		<View style={pageStyles.selectorContainer}>
			{title !== "" && <Text style={pageStyles.selectorTitle}>{title}</Text>}
			<View style={pageStyles.selectorWrapper}>
				<RNPickerSelect
					onValueChange={(v) => handleValueChange(v as number | null)}
					value={selectedIndex}
					items={pickerItems}
					placeholder={items.length === 0 ? { label: titleDontHave, value: null } : undefined}
					style={{
						inputIOS: pageStyles.selectorInputInner,
						inputAndroid: pageStyles.selectorInputInner,
						placeholder: pageStyles.selectorPlaceholder,
					}}
					disabled={items.length === 0}
				/>
			</View>
		</View>
	);
}

export default Selector;
