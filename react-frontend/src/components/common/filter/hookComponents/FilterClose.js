import React, {useContext} from 'react';
import {IoIosArrowUp} from "react-icons/all";
import {color} from "~/styledComponents/Properties";
import {Flex} from "~/styledComponents/shared";
import {FilterContext} from "~/components/common/filter/FilterContext";

const FilterClose = (props) => {
    const {toggleFilterContent, openKey} = useContext(FilterContext)
    return (
        <Flex doActive bg={'veryLight'} height={40} justifyContent={'center'} onClick={toggleFilterContent.bind(this, openKey)} cursor={1} custom={`
            border-top: 1px solid ${color.light};
        `}>
            {/*<IoIosArrowUp color={color.dark} size={17}/>*/}
            닫기
        </Flex>
    );
};

export default FilterClose;
