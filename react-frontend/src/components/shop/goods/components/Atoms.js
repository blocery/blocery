import React, {Fragment} from 'react';
import styled from "styled-components";
import {getValue} from "~/styledComponents/Util";
import {margin, padding} from "~/styledComponents/CoreStyles";
import {Div, Flex, WhiteSpace} from "~/styledComponents/shared";
import {color} from "~/styledComponents/Properties";

//AR뷰 스위치 토글에 들어갈 아이콘을 싸고있는 빈 박스
export const ToggleIconBox = styled.div`
    display: flex;
    height: 100%;
    color: ${color.white};
    align-items: center;
    justify-content: center;
`

export const SubTitle = styled.div`
    font-size: 17px;
    font-weight: bold;
    padding: 24px 16px 0 16px;
    line-height: normal;
    ${padding};
    ${margin};
`

export const BigTitle = styled.div`
    font-size: ${getValue(24)};
    font-weight: bold;
    padding: 0 ${getValue(16)};
    line-height: normal;
    ${padding};
    ${margin};
`


export const Section = styled.div`
    padding: ${getValue(29)} ${getValue(16)};     
`

/* 두꺼운 제목 */
export const StrongTitle = styled.strong`
    font-size: ${getValue(17)};
    line-height: ${getValue(16)};
    font-weight: 700;
    ${padding}
    ${margin}
`

export const EmptyBox = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: ${getValue(100)};
    color: ${color.dark};
`

export default {
    StrongTitle,
    EmptyBox
}

export const GoodsNm = styled.div`
    font-size: ${getValue(17)};    
    font-weight: bold;
    ${margin};
    ${padding};
`


//하단 정책 관련 컴포넌트 START
const MenuTitle = styled(Div)`
    font-size: 17px;
    color: ${color.black};
    font-weight: bold;
`

const MenuContent = styled(WhiteSpace)`
    font-size: 13px;
    color: ${color.dark};
    line-height: 20px;
    padding: 0 16px 16px 16px;
`

const MenuSectionTitle = styled(Div)`
    font-size: 14px;
    color: ${color.black};
    font-weight: bold;
    margin-top: 10px;
    margin-bottom: 10px;
`
const MenuSectionSubTitle = styled(Div)`
    font-size: 13px;
    color: ${color.black};
    font-weight: bold;
    margin-top: 10px;
    margin-bottom: 10px;
`
const GoodsProperty = styled(Div)`
    font-size: 13px;
    color: ${color.black};
`
//하단 정책 관련 컴포넌트 END





export const Policy = {
    MenuTitle,
    MenuContent,
    MenuSectionTitle,
    MenuSectionSubTitle,
    GoodsProperty,
}