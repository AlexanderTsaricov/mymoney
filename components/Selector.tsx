import RNPickerSelect from 'react-native-picker-select';
import { View, Text } from 'react-native';
import React, { useState } from 'react';

class Selector {
    title: string;
    titleDontHave: string;
    items: string[];
    private _selected: string;

    constructor(title: string, titleDontHave: string, items: string[]) {
        this.title = title;
        this.titleDontHave = titleDontHave;
        this.items = items;
        this._selected = items.length > 0 ? items[0] : 'none';
    }

    getSelected(): string {
        return this._selected;
    }

    Screen = () => {
        const [item, setItem] = useState<string>(this._selected);

        return (
            <View>
                <Text>{this.title}</Text>
                <RNPickerSelect
                    onValueChange={(value) => setItem(value)}
                    value={item}
                    items={
                        this.items.length > 0
                            ? this.items.map((w) => ({ label: w, value: w }))
                            : [{ label: this.titleDontHave, value: 'none' }]
                    }
                    style={{
                        inputIOS: { color: 'black', padding: 10 },
                        inputAndroid: { color: 'black', padding: 10 },
                    }}
                />
            </View>
        );
    }
}

export default Selector;
