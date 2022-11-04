import ComUtil from "~/util/ComUtil";
import moment from 'moment-timezone'
import {color} from "~/styledComponents/Properties";
import MathUtil from "~/util/MathUtil";

export default class AgGridUtil {
    // Ag-Grid Cell 스타일 기본 적용 함수
    static getCellStyle = ({cellAlign,color,textDecoration,whiteSpace}) => {
        if(cellAlign === 'left') cellAlign='flex-start';
        else if(cellAlign === 'center') cellAlign='center';
        else if(cellAlign === 'right') cellAlign='flex-end';
        else cellAlign='flex-start';
        return {
            display: "flex",
            alignItems: "center",
            justifyContent: cellAlign,
            color: color,
            textDecoration: textDecoration,
            whiteSpace: whiteSpace
        }
    }
    static valueGetterIndex = (params) => {
        if (params.node.rowPinned === 'top' || params.node.rowPinned === 'bottom') {
            return null
        }
        return MathUtil.plusBy(params.node.rowIndex,1)
    }
    static valueGetterNumber = (params) => {
        return params.data[params.colDef.field]
    }
    static valueFormatterNumber = (params) => {
        return ComUtil.addCommas(params.data[params.colDef.field])
    }
    static valueGetterDay = (params, basicFormatter = 'YYYYMMDD', formatter = 'YYYY-MM-DD') => {
        const value = params.data[params.colDef.field]
        if (params.node.rowPinned === 'top' || params.node.rowPinned === 'bottom') {
            return value
        }

        if (!value) return null

        let returnValue;

        try{
            if(typeof value === 'object'){
                if(Object.prototype.toString.call(value).slice(8, -1) === 'Date') {
                    returnValue = moment(value).format(formatter)
                }
            }else{
                returnValue = moment(value, basicFormatter).format(formatter)
            }
        }catch (error) {
            return value
        }
        return returnValue
    }
    static sum(list, col) {
        let total = 0;
        list.map(item => total = MathUtil.plusBy(total,item[col]))
        return total
    }
    static cellStyleClick(style) {
        let defaultStyle = {textDecoration: 'underline', color: color.primary}
        if (style)
            defaultStyle = {...defaultStyle, ...style}
        return defaultStyle
    }
}