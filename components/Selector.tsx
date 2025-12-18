import React, { useState } from 'react';
import { View, Text } from 'react-native';
import RNPickerSelect, { Item } from 'react-native-picker-select';
import { pageStyles } from '../Styles/page';
import { MoneyMoovmentType, MoneyType, WalletType } from '../storage/StorageHandle';

interface SelectorProps {
    title: string;
    titleDontHave: string;
    items: string[] | MoneyMoovmentType[] | WalletType[];
    onChange?: (value: string) => void;
}

function isStringArray(arg: unknown): arg is string[] {
    return Array.isArray(arg) && arg.every(item => typeof item === "string");
}

function isObjectArray(arg: unknown): arg is object[] {
    return Array.isArray(arg) && arg.every(item => typeof item === "object" && item !== null);
}

const Selector: React.FC<SelectorProps> = ({ title, titleDontHave, items, onChange }) => {
    const initialValue = items.length > 0 ? items[0] || '' : 'none';
    const [selected, setSelected] = useState<string | object>(initialValue);

    const handleValueChange = (value: string) => {
        setSelected(value);
        if (onChange) onChange(value);
    };

    const hasItems = items.length > 0;

    let pickerItems: Item[] = [];

    if (hasItems && isStringArray(items)) {
        pickerItems = items.map((w) => ({
            label: w,
            value: w,
        }));
    } else if (hasItems) {
        pickerItems = items.map((w: any) => ({
            label: w.name,
            value: w,
        }));
    } else {
        pickerItems = [
            { label: titleDontHave, value: 'none' }
        ];
    }


    return (
        <View style={pageStyles.selectorContainer}>
            <Text style={pageStyles.selectorTitle}>{title}</Text>
            <View style={pageStyles.selectorWrapper}>
                <RNPickerSelect
                    onValueChange={handleValueChange}
                    value={selected}
                    items={pickerItems}
                    placeholder={
                        hasItems
                            ? {}
                            : { label: titleDontHave, value: 'none' }
                    }
                    style={{
                        inputIOS: pageStyles.selectorInputInner,
                        inputAndroid: pageStyles.selectorInputInner,
                        placeholder: pageStyles.selectorPlaceholder
                    }}
                />
            </View>
        </View>
    );
};

export default Selector;
