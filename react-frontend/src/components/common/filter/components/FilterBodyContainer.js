//필터 바디 (토글 버튼을 감싸고 있는)
import {Space} from "~/styledComponents/shared";
import React from "react";
import ComUtil from "~/util/ComUtil";
import {getValue} from "~/styledComponents/Util";


/*

flex-wrap: wrap;
    gap: 5px;
    padding-top: 10px;
    padding-bottom: 10px;
}

 */

const FilterBodyContainer = ({children}) => {

    if (ComUtil.isPcWeb()) {
        return (
            <Space relative spaceGap={8} px={16} py={12} bg={'#FAFAFA'} overflow={'auto'} flexWrap={'wrap'} custom={`
            gap: ${getValue(10)};
            & > * {
                flex-shrink: 0; //자식 객체가 overflow 되도록
            }
        `}>
                {children}
            </Space>
        )
    }

    return(
        <Space relative spaceGap={8} px={16} minHeight={54} bg={'#FAFAFA'} overflow={'auto'} custom={`
            & > * {
                flex-shrink: 0; //자식 객체가 overflow 되도록
            }
        `}>
            {children}
        </Space>
    )
}
export default FilterBodyContainer