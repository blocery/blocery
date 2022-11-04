import React, {useContext} from "react";
import FilterBodyButton from "../components/FilterBodyButton";
import {FilterContext} from "../FilterContext";

/** [공통버튼] 토글없는 일반 버튼 **/
const NoToggleButton = ({filterKey, children}) => {

    const {filterInfo, getFilterOptions, toggleFilterContent, openKey, onChange} = useContext(FilterContext)

    const filterOptions = getFilterOptions(filterKey)

    const onHandleClick = () => {
        onChange({
            key: filterKey,
            data: filterOptions[0] //무료배송 한가지 밖에 없음 //{value: 'freeShipping', label: '무료배송'}
        })
    }

    return(
        <FilterBodyButton
            isActive={filterInfo[filterKey].value}
            isOpen={filterInfo[filterKey].value} //isOpen === true 시 색상 MAIN_COLOR_NAME 으로 변경 됨
            isToggle={false}
            onClick={onHandleClick}
        >
            {children}
        </FilterBodyButton>
    )
}

/** [공통버튼] 토글 있는 버튼(클릭 시 컨텐츠가 열림) **/
const ToggleButton = ({filterKey, children}) => {

    const {filterInfo, toggleFilterContent, openKey, onChange} = useContext(FilterContext)

    return(
        <FilterBodyButton
            isActive={filterInfo[filterKey].value}
            isOpen={openKey === filterKey}
            onClick={toggleFilterContent.bind(this, filterKey)}
        >
            {children}
        </FilterBodyButton>
    )
}

export default {
    NoToggleButton,
    ToggleButton
}