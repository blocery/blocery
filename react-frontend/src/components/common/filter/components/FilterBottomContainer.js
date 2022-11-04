import React from 'react';
import {Div} from "~/styledComponents/shared";

//필터 하단 컨텐츠
const FilterBottomContainer = ({isOpen, children, style = {}}) => {
    if (!isOpen) return null
    return(
        <Div bg={'#F5F5F5'} fontSize={13} {...style} >
            {children}
        </Div>
    )
}

export default FilterBottomContainer;
