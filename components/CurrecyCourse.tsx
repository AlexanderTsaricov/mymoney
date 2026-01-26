import { View } from "react-native"
import { Currency, HeadCurrency } from "../storage/StorageHandle"

export type CurrecyCourseProps = {
    currency: Currency,
    headCurrency: HeadCurrency
}

export function CurrecyCourse({currency, headCurrency} : CurrecyCourseProps) {
    return (
        <View>
            <p><span>{currency.name}</span> <span>{currency.shortName}</span> <span>{currency.course_to_head}</span> <span>{headCurrency.shortName}</span></p>
        </View>
    )
}