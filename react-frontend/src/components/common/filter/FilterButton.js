import React from "react";
import FilterHookButton from "./hookComponents/FilterHookButton";
import {KEY} from './FilterStore'
import {RiSearchLine} from "react-icons/ri";
import {BiCategoryAlt} from 'react-icons/bi'
import uniqueGoodsCam from '~/images/icons/uniqueGoodsCam.svg'


//키워드 검색
const Keyword = (props) => {
    return (
        <FilterHookButton.ToggleButton filterKey={KEY.KEYWORD}>
            <RiSearchLine style={{marginRight:4}} size={16}/>검색
        </FilterHookButton.ToggleButton>
    )
}

//무료배송 필터 버튼
const FreeShipping = (props) => {
    return(
        <FilterHookButton.NoToggleButton filterKey={KEY.FREE_SHIPPING}>
            무료배송
        </FilterHookButton.NoToggleButton>
    )
}

//실물확인 버튼
const ObjectUniqueFlag = (props) => {
    return (
        <FilterHookButton.NoToggleButton filterKey={KEY.OBJECT_UNIQUE_FLAG}>
            <img src={uniqueGoodsCam} al={'실물확인 상품필터'} height={18} style={{marginRight: 2}} /> 실물확인
        </FilterHookButton.NoToggleButton>
    )
}

//가격 버튼
const GoodsPrice = (props) => {
    return (
        <FilterHookButton.ToggleButton filterKey={KEY.GOODS_PRICE}>
            가격
        </FilterHookButton.ToggleButton>
    )
}

//묶음배송 필터 버튼
const ProducerWrapDelivered = (props) => {
    return(
        <FilterHookButton.NoToggleButton filterKey={KEY.PRODUCER_WRAP_DELIVERED}>
            묶음배송
        </FilterHookButton.NoToggleButton>
    )
}

//해시태그 버튼
const Hashtag = (props) => {
    return (
        <FilterHookButton.ToggleButton filterKey={KEY.HASHTAG}>
            #추천
        </FilterHookButton.ToggleButton>
    )
}

//테마 버튼
const ThemeHashtag = (props) => {
    return (
        <FilterHookButton.ToggleButton filterKey={KEY.THEME_HASHTAG}>
            #테마
        </FilterHookButton.ToggleButton>
    )
}

//카테고리 해시태그 버튼
const CategoryHashtag = (props) => {
    return (
        <FilterHookButton.ToggleButton filterKey={KEY.CATEGORY}>
            <BiCategoryAlt size={16} /> 카테고리
        </FilterHookButton.ToggleButton>
    )
}


//상품종류
const GoodsType = (props) => {
    return (
        <FilterHookButton.ToggleButton filterKey={KEY.GOODS_TYPE}>
            종류
        </FilterHookButton.ToggleButton>
    )
}

//품정제외 필터 버튼
const NotSoldOut = (props) => {
    return(
        <FilterHookButton.NoToggleButton filterKey={KEY.NOT_SOLD_OUT}>
            품절제외
        </FilterHookButton.NoToggleButton>
    )
}

export default {
    Keyword,
    FreeShipping,
    ObjectUniqueFlag,
    GoodsPrice,
    ProducerWrapDelivered,
    Hashtag,
    ThemeHashtag,
    CategoryHashtag,
    GoodsType,
    NotSoldOut
}