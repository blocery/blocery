import React, {useContext} from 'react';
import {ListBorder} from "~/styledComponents/shared";
import {FilterContext} from "~/components/common/filter/FilterContext";
import AppliedFilterButtonList from "~/components/common/filter/AppliedFilterButtonList";
import FilterBodyContainer from "./components/FilterBodyContainer";
import FilterBottomContainer from "./components/FilterBottomContainer";

import {filterComponent} from './FilterStore'
import FilterClose from "~/components/common/filter/hookComponents/FilterClose";

/**
 * 합쳐진 필터 컴포넌트
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
const CombinedFilter = ({style}) => {
    const {visibleFilterKeys, filterInfo, openKey, scrollToEndDate} = useContext(FilterContext)
    const hasFilter = Object.values(filterInfo).filter(f => f.value).length > 0
    const Content = openKey ? filterComponent[openKey].Content : null
    return (
        <>
            <ListBorder spaceColor={'light'} bc={'light'} bl={0} br={0} style={style}>
                {/* 필터된 버튼 리스트 */}
                {
                    hasFilter && <AppliedFilterButtonList/>
                }
                <FilterBodyContainer>
                    {
                        visibleFilterKeys.map(key => {

                            const Button = filterComponent[key].Button

                            if (Button) return <Button key={'button'+key} />
                            return null

                            // console.log(key)
                            // //무료배송 버튼
                            // if (key === KEY.FREE_SHIPPING) return <FilterButton.FreeShippingButton/>
                            // //실물확인 토글 버튼
                            // else if (key === KEY.OBJECT_UNIQUE_FLAG) return <FilterButton.ObjectUniqueFlagButton/>
                            //
                            // return null
                        })
                    }
                    {/*/!* 무료배송 버튼 *!/*/}
                    {/*{ visibleFilterKey.includes(KEY.FREE_SHIPPING) && <FilterButton.FreeShippingButton/> }*/}

                    {/*/!* 실물확인 토글 버튼 *!/*/}
                    {/*{ visibleFilterKey.includes(KEY.OBJECT_UNIQUE_FLAG) && <FilterButton.ObjectUniqueFlagButton/> }*/}

                </FilterBodyContainer>

                <FilterBottomContainer isOpen={openKey}>
                    {
                        Content ? <Content/> : null
                    }
                    {/*{*/}
                    {/*    visibleFilterKeys.find(key => key === openKey)*/}
                    {/*}*/}
                    {/*/!* 실물확인 필터 컨텐츠 *!/*/}
                    {/*{openKey === KEY.OBJECT_UNIQUE_FLAG && <FilterContent.ObjectUnique/>}*/}
                    <FilterClose />
                </FilterBottomContainer>
            </ListBorder>
        </>
    )
}

export default CombinedFilter
