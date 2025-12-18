import React, { useState } from 'react';
import { View, Text } from 'react-native';
import RNPickerSelect, { Item } from 'react-native-picker-select';
import { pageStyles } from '../Styles/page';

interface SelectorProps {
    title: string;
    titleDontHave: string;
    items: string[];
    onChange?: (value: string) => void;
}

const Selector: React.FC<SelectorProps> = ({ title, titleDontHave, items, onChange }) => {
    const initialValue = items.length > 0 ? items[0] || '' : 'none';
    const [selected, setSelected] = useState<string>(initialValue);

    const handleValueChange = (value: string) => {
        setSelected(value);
        if (onChange) onChange(value);
    };

    const pickerItems: Item[] =
        items.length > 0
            ? items.map((w) => ({
                label: w || '',
                value: w || '',
            }))
            : [{ label: titleDontHave, value: 'none' }];

    return (
        <View style={pageStyles.selectorContainer}>
            <Text style={pageStyles.selectorTitle}>{title}</Text>
            <View style={pageStyles.selectorWrapper}>
                <RNPickerSelect
                    onValueChange={handleValueChange}
                    value={selected}
                    items={pickerItems}
                    placeholder={{ label: titleDontHave, value: 'none' }}
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
