import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import RNPickerSelect, { Item } from 'react-native-picker-select';
import { pageStyles } from '../Styles/page';

export interface SelectorProps<T> {
    title: string;
    titleDontHave: string;
    items: T[];
    onChange: (value: T | null) => void;
}

function Selector<T extends { name?: string } | string>({
    title,
    titleDontHave,
    items,
    onChange,
}: SelectorProps<T>) {
    const initialValue = items.length > 0 ? items[0] : null;
    const [selected, setSelected] = useState<T | null>(initialValue);

    useEffect(() => {
        if (initialValue !== null) onChange(initialValue);
    }, [initialValue]);

    const handleValueChange = (value: T | null) => {
        setSelected(value);
        onChange(value);
    };

    const pickerItems: Item[] = items.length > 0
        ? items.map((item) => ({
            label: typeof item === 'string' ? item : item.name ?? 'unknown',
            value: item,
        }))
        : [{ label: titleDontHave, value: null }]; // появляется только если items пустой

    return (
        <View style={pageStyles.selectorContainer}>
            {title !== '' && <Text style={pageStyles.selectorTitle}>{title}</Text>}
            <View style={pageStyles.selectorWrapper}>
                <RNPickerSelect
                    onValueChange={handleValueChange}
                    value={selected}
                    items={pickerItems}
                    placeholder={items.length === 0 ? { label: titleDontHave, value: null } : {}}
                    style={{
                        inputIOS: pageStyles.selectorInputInner,
                        inputAndroid: pageStyles.selectorInputInner,
                        placeholder: pageStyles.selectorPlaceholder,
                    }}
                    disabled={items.length === 0} // можно сделать disabled, если нужно
                />
            </View>
        </View>
    );
}

export default Selector;
