import React from 'react';
import CombinedFilter from "~/components/common/filter/CombinedFilter";
import FilterContextComponent from "~/components/common/filter/FilterContext";

/**
 *
 * @param visibleFilterKey [] 사용할 필터 키들
 * @param initialFilterInfo {KEY: {label, value}} 필터 초기값
 * @returns {JSX.Element}
 * @constructor
 */
//pageInfo = {pageName, producerNo} //searchKeyword 에 저장될 정보. optional
const Filter = ({pageInfo, visibleFilterKeys, initialFilter, initialOption, initialOpenKey, onFilterChange, style, upsideFilter: UpsideFilter, children}) => {
    return(
        <FilterContextComponent
            visibleFilterKeys={visibleFilterKeys}
            initialFilter={initialFilter}
            initialOption={initialOption}
            initialOpenKey={initialOpenKey}
            onFilterChange={onFilterChange}
            pageInfo={pageInfo}
        >
            {
                UpsideFilter && <UpsideFilter />
            }
            {
                children
            }
            <CombinedFilter style={style}/>
        </FilterContextComponent>
    )
}

export default Filter