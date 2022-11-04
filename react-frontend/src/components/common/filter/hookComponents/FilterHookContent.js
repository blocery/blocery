import React, {useContext, useState, useEffect} from "react";
import _ from 'lodash'
import Swiper from 'react-id-swiper'
import {Button, Div, Flex, Grid, GridColumns, Input} from "~/styledComponents/shared";
import {FilterContext} from "~/components/common/filter/FilterContext";
import DotLabel from '../components/DotLabel'
import {MdCloud, MdFrontHand, MdRiceBowl} from "react-icons/all";
import {KEY} from "~/components/common/filter/FilterStore";
import {MAIN_COLOR_NAME} from "~/components/common/filter/FilterStore";

const ABorderedGridContent = ({filterOptions, filterKey, columnCount, labelRenderer}) => {

    const {filterInfo, onChange} = useContext(FilterContext)

    const onHandleClick = (item, e) => {
        e.stopPropagation()

        //필터 업데이트
        onChange({
            key: filterKey,
            data: item
        })
    }

    return(
        <GridColumns repeat={columnCount} colGap={'1px'} rowGap={'1px'} bg={'background'}>
            {
                filterOptions.map(option =>
                    <Div key={option.value}
                         height={'100%'}
                         fg={option.value === filterInfo[filterKey].value && MAIN_COLOR_NAME}
                         onClick={onHandleClick.bind(this, option)}
                    >
                        {
                            !labelRenderer ? <DotLabel>{option.label}</DotLabel> : labelRenderer({option})
                        }
                    </Div>
                )
            }
        </GridColumns>
    )
}

/**
 * [공통 컨텐츠] 2단으로 나뉘어진 한장의 컨텐츠
 * @param filterKey 필터 키
 * @param columnCount 몇단으로 나눌지
 * @returns {JSX.Element}
 * @constructor
 */
const AContent = ({filterOptions, filterKey, columnCount, labelRenderer}) => {

    const {filterInfo, onChange} = useContext(FilterContext)

    const onHandleClick = (item, e) => {
        e.stopPropagation()

        //필터 업데이트
        onChange({
            key: filterKey,
            data: item
        })
    }

    return(
        <GridColumns repeat={columnCount} colGap={0} rowGap={0}>
            {
                filterOptions.map(option =>
                    <Div key={option.value}
                         height={'100%'}
                         fg={option.value === filterInfo[filterKey].value && MAIN_COLOR_NAME}
                         onClick={onHandleClick.bind(this, option)}
                    >
                        {
                            !labelRenderer ? <DotLabel>{option.label}</DotLabel> : labelRenderer({option})
                        }
                    </Div>
                )
            }
        </GridColumns>
    )
}

/**
 * [공통 컨텐츠] 2단으로 나뉘어진 스와이퍼가 내장 되어있는 컨텐츠
 * @param filterKey 필터 키
 * @param columnCount 몇단으로 나눌지
 * @param pageCount 나뉘어질 페이지 카운트
 * @returns {JSX.Element}
 * @constructor
 */
const SwiperContent = ({filterOptions, filterKey, columnCount, pageCount = 6, labelRenderer}) => {

    const {filterInfo, onChange} = useContext(FilterContext)

    const onHandleClick = (item, e) => {
        e.stopPropagation()

        //필터 업데이트
        onChange({
            key: filterKey,
            data: item
        })
    }

    //n 개씩 분할
    const chunkedOptions = _.chunk(filterOptions, pageCount)

    const params = {
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
            // dynamicBullets: true
        },
        // scrollbar: {
        //     el: '.swiper-scrollbar',
        //     hide: false
        // }
    }

    //선택된 필터의 value 와 일치되는 인덱스 조회
    let activeSlideIndex = -1;
    chunkedOptions.map((options, index) => {
        const option = options.find(option => option.value === filterInfo[filterKey].value)
        if (option) {
            activeSlideIndex = index
        }
    })

    return(

        <Swiper {...params} activeSlideKey={activeSlideIndex > -1 ? 'goodsPriceSlide'+activeSlideIndex : null}>
            {
                chunkedOptions.map((options, index) =>
                    <GridColumns key={'goodsPriceSlide'+index} repeat={columnCount} colGap={0} rowGap={0} pb={20}>
                        {
                            options.map(option =>
                                    <Div key={option.value}
                                         height={'100%'}
                                         fg={option.value === filterInfo[filterKey].value && MAIN_COLOR_NAME}
                                         onClick={onHandleClick.bind(this, option)}
                                    >
                                        {
                                            !labelRenderer ? <DotLabel>{option.label}</DotLabel> : labelRenderer({option})
                                        }
                                    </Div>


                                // <DotLabel key={option.value}
                                //           isActive={option.value === filterInfo[filterKey].value}
                                //           onClick={onHandleClick.bind(this, option)}
                                // >
                                //     {option.label}
                                // </DotLabel>

                            )
                        }
                    </GridColumns>
                )
            }
        </Swiper>
    )
}

////////////////////////// 공통 컴포넌트 END /////////////////////////////////

export default {
    ABorderedGridContent,
    AContent,
    SwiperContent,

}