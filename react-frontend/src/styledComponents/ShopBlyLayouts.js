import React from 'react';
import styled, {css, keyframes} from 'styled-components';
import {getValue, hasValue} from "~/styledComponents/Util";
import {Div, Fixed, GridColumns, Span} from "~/styledComponents/shared";
import {color, gradeColor, hoverColor} from "~/styledComponents/Properties";
import {IoMdHeart, IoMdThumbsUp} from "react-icons/io";
import {margin, padding, scaleUp} from "~/styledComponents/CoreStyles";
import LeafIcon from "~/images/icons/renewal/leaf.svg";
import aniKey from "~/styledComponents/Keyframes";
import {pseudo} from "~/styledComponents/CoreStyles";


export const GrandTitle = styled(Div)`
    font-size: ${getValue(17)};
    font-weight: bold;
`

export const Title20 = styled(Div)`
    font-size: ${getValue(20)};
    font-weight: bold;
`

export const Bold = styled(Span)`
    font-family: Montserrat;
`

export const GridList = styled(Div)`
    display: grid;
    grid-template-columns: ${props => `repeat(${props.repeat || 2}, 1fr)`} ;
    grid-column-gap: ${getValue(16)};
    grid-row-gap: ${getValue(32)};    
`

export const VerticalGoodsGridList = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-column-gap: ${getValue(10)};
    grid-row-gap: ${getValue(32)};
    padding: ${getValue(16)};
    padding-bottom: ${getValue(100)};
    
    ${({theme}) => theme.desktop`
        grid-template-columns: repeat(4, 1fr);
    `}
    
    ${({theme}) => theme.laptop`
        grid-template-columns: repeat(4, 1fr);
    `}
    
    ${({theme}) => theme.tablet`
        grid-template-columns: repeat(3, 1fr);
    `}
    
    ${({theme}) => theme.mobile`
        grid-template-columns: repeat(2, 1fr);
    `}
    
    ${padding};
    ${margin};
    
`

// 『 포인트 선이있는 라벨 』
export const TargetStrokeLabel = styled(Div)`
    position: relative;    
    display: inline-block;    
    
    &:before {
        content: "";
        position: absolute;          
        width: ${p => hasValue(p.strokeWidth) ? getValue(p.strokeWidth) : getValue(10)};
        height: ${p => hasValue(p.strokeHeight) ? getValue(p.strokeHeight) : getValue(10)};
        top: 0;
        left: 0;
        
        ${p => `
            box-shadow: 
            -${hasValue(p.stroke) ? getValue(p.stroke) : getValue(2)} 
            -${hasValue(p.stroke) ? getValue(p.stroke) : getValue(2)} 
            0
            ${hasValue(p.stroke) ? getValue(p.stroke) : getValue(2)}
            ${hasValue(p.strokeColor) ? (color[p.strokeColor] || p.strokeColor) : color['green']};               
        `}
    }
    &:after {
        content: "";
        position: absolute;          
        width: ${p => hasValue(p.strokeWidth) ? getValue(p.strokeWidth) : getValue(10)};
        height: ${p => hasValue(p.strokeHeight) ? getValue(p.strokeHeight) : getValue(10)};
        bottom: 0;
        right: 0;
        ${p => `
            box-shadow: 
            ${hasValue(p.stroke) ? getValue(p.stroke) : getValue(2)} 
            ${hasValue(p.stroke) ? getValue(p.stroke) : getValue(2)} 
            0
            ${hasValue(p.stroke) ? getValue(p.stroke) : getValue(2)}
            ${hasValue(p.strokeColor) ? (color[p.strokeColor] || p.strokeColor) : color['green']};               
        `}
        
    }
`

//검색결과 비어있는 항목에 사용
export const EmptyBox = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: ${getValue(100)};
    color: ${color.dark};
    ${padding};
    ${margin};
    
`


//가로 날카로운 선이있는 배지
export const BadgeSharp = styled.div`
    ${p => p.size === 'sm' ? `
        font-size: 10px;
        line-height: 10px;
        padding: 5px 5px;
    ` : `
        font-size: 12px;
        line-height: 12px;
        padding: 6px 7px;
    `}
    
    display: inline-block;
    ${props => props.bg && `
        background: ${color[props.bg] || props.bg}
    `}; 
    // ${props => props.fg && `
    //     color: ${color[props.fg] || props.fg}
    // `};
    
    color: ${props => color[props.fg || 'white'] || props.fg };
    
    border-radius: 2px;
    text-align: center;
    position: relative;
    cursor: pointer;
    
    &:after {
        content: "";
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        position: absolute;
        clip-path: polygon(100% 35%, 100% 100%, 0% 100%, 0% 65%);
        background: rgba(0, 0, 0, 0.1);
    }    
    
    &:active {
        filter: brightness(110%);        
    }
`



//scaleUp = true 일 경우 스케일이 커졌다 작아지는 애니매이션 되는 하트 아이콘
export const AnimatedHeart = styled(IoMdHeart)`
    font-size: ${props => props.size ? getValue(props.size) : getValue(22)};
    ${props => props.isZzim ? `
        // color: #ff6060;
        // stroke-width: 0;
    `: `
        // color: white;
        // stroke: black;
        // stroke-width: 32px;
    `}  
    
    ${props => props.scaleUp && scaleUp}  
`;

//scaleUp = true 일 경우 스케일이 커졌다 작아지는 애니매이션 되는 하트 아이콘
export const AnimatedThumsUp = styled(IoMdThumbsUp)`
    font-size: ${props => props.size ? getValue(props.size) : getValue(22)};
    ${props => props.isZzim ? `
        // color: #ff6060;
        // stroke-width: 0;
    `: `
        // color: white;
        // stroke: black;
        // stroke-width: 32px;
    `}  
    
    ${props => props.scaleUp && scaleUp}  
`;


//등급(small) 배지
export const GradeBadgeSmall = styled.div`    
    // width: max-content;
    display: inline-block;
    ${props => `background-color: ${gradeColor[props.level]};`}
    padding: 0 6px;
    padding-top: 1px;
    height: ${getValue(17)};
    // display: flex;    
    color: ${color.white};
    align-items: center;
    justify-content: center;
    border-radius: 8.5px;
    font-size: 11px;
    text-transform: uppercase;
    ${props => `
       background-color: ${gradeColor[props.level]}; 
    `}  
`

//등급(big) 배지
export const GradeBadgeBig = styled.div`    
    // width: max-content;
    display: inline-block;
    height: ${getValue(22)};
    font-size: ${getValue(12)};
    line-height: ${getValue(22)};
    color: white;
    border-radius: ${getValue(10.9)};    
    text-transform: uppercase;    
    
    padding: 0 ${getValue(8)};
    
    ${props => `
       background-color: ${gradeColor[props.level]}; 
    `}  
`
// 프로필(small) 이미지를 싸고있는 선
export const ProfileImageStrokeSmall = styled.div`
    position: relative;    
    flex-shrink: 0;
    padding: ${getValue(2)};
    border-radius: 50%;    
    background: ${color.white};
    
    ${props => props.producerFlag ? `
        border: 2px solid ${color.green};
        
        /* 나뭇잎 아이콘 */
        &::after {
            content: "";
            position: absolute;
            width: 11px;
            height: 6px;
            top: ${getValue(-7)};
            left: 50%;
            transform: translateX(-50%);
            background-image: url(${LeafIcon});
            background-repeat: no-repeat;
        }
    ` : `
        /* 등급별 색상 */
        border: 3px solid ${gradeColor[props.level]};
    `}
    
`

// 프로필(big) 이미지를 싸고있는 선
export const ProfileImageStrokeBig = styled.div`
    position: relative;    
    padding: ${getValue(2)};
    border-radius: 50%;    
    
    ${props => props.producerFlag ? `
        border: 3px solid ${color.green};
        
        /* 나뭇잎 아이콘 */
        &::after {
            content: "";
            position: absolute;
            width: 23px;
            height: 13px;
            top: ${getValue(-14)};
            left: 50%;
            transform: translateX(-50%);
            background-image: url(${LeafIcon});
            background-repeat: no-repeat;
        }
    ` : `
    
        /* 등급별 색상 */
        border: 3px solid ${gradeColor[props.level]};
    `}
    
`

//아래에 빨간 점이 찍히는 탭
export const BottomDotTab = styled.div`
    position: relative;  
    cursor: pointer;
    display: inline-block;
    font-size: 16px;
    font-weight: 800;
    height: 52px;
    padding-top: 10px;
    color: ${color.dark};
    
    ${props => props.active && `        
        
        color: ${color.black};
        
        &::after {
            position: absolute;
            content: "";
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background-color: ${color.danger};
            left: 50%;
            bottom: 11px;
            transform: translateX(-50%);
        }        
    `}
`

//필수인 *
export const Required = styled.span`
    color: ${color.danger};
    margin-left: 2px;
    &:after {
        content: "*";
    }
`

// 포텐타임, 슈퍼리워드 배지
export const BadgeGoodsEventType = styled.div`
    display: inline-block;
    text-align: center;    
    padding: 0 5px;
    height: 20px;
    width: max-content;
    line-height: 20px;
    font-size: 11.5px;
    font-weight: 800;
    color: ${color.white};
    border-radius: 2px;
    background-color: ${props => {        
        if (props.goodsEventType) {
            switch (props.goodsEventType.toString().toUpperCase()) {
                case "POTENTIME" :
                    return color.warning;
                    break;
                case "SUPERREWARD" :
                    return color.danger;
                    break;
                case "DEALGOODS" :
                    return color.green;
                    break;
                case "FREE" : //무료배송
                    return color.primary;
                    break;
                case "COUPON" : //쿠폰증정
                    return color.black;
                    break;
                    
            }
        }
        
        
    }};
    
`

// 포텐타임, 슈퍼리워드 배지(big)
export const BadgeGoodsEventTypeBig = styled.div`
    display: inline-block;
    text-align: center;    
    padding: 0 5px;
    height: 28px;
    line-height: 28px;
    font-size: 13px;
    padding: 0 11px;
    font-weight: 800;
    color: ${color.white};
    border-radius: 4px;
    background-color: ${props => {
    if (props.goodsEventType) {
        switch (props.goodsEventType.toString().toUpperCase()) {
            case "POTENTIME" :
                return color.warning;
                break;
            case "SUPERREWARD" :
                return color.danger;
                break;
            case "DEALGOODS" :
                return color.green;
                break;
            case "FREE" : //무료배송
                return color.primary;
                break;
            case "COUPON" : //쿠폰증정
                return color.black;
                break;

            }
        }
    }};    
`
//<Fixed zIndex={3} bottom={52} width={'100%'} height={0}>
//스크롤 위로 버튼 처럼 위에 떠있는 기준으로 쓰일 보이지 않는 라인
export const FixedTabBarLine = styled(Fixed)`    
    width: 100%;
    height: 0; //보이지 않도록 함
    // bottom: ${getValue(52)}; //탭바 height
    bottom: 0;
    z-index: 3;
`

export const HrStrong = styled.div`
    border-top: 1px solid ${color.light};
    height: ${getValue(15)};
    background-color: ${color.background};
    ${props => props.noBorder && `border: 0;`}
`

export const TabButtonGroup = styled.div`
    display: flex;
    border-radius: ${getValue(4)};
    border: 1px solid ${color.light};
    cursor: pointer;
    overflow: hidden;
    
    ${margin};
`

export const TabButton = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: ${getValue(55)};
    width: 100%;
    flex-grow: 1;
    text-align: center;
    font-size: ${getValue(16)};
    background-color: ${props => props.active ? color.green : color.white};
    color: ${props => props.active ? color.white : color.darkBlack};
    &:active {
        background-color: ${props => props.active ? hoverColor.green : hoverColor.white};
    }
`

export const Alert = styled.div`
    background-color: ${props => color[props.color || 'veryLight']};
    padding: ${getValue(10)} ${getValue(16)};
    border-radius: ${getValue(8)};
    font-size: ${getValue(14)};
    ${padding};
    ${margin};
`

    // <Div bg={'veryLight'} px={10} py={7} rounded={8} fontSize={14} mt={16}>오프라인 재고 부족시 상품이 부분취소될 수 있습니다.</Div>

export default {
    GrandTitle, Title20, Bold, GridList, VerticalGoodsGridList, TargetStrokeLabel, EmptyBox, BadgeSharp, AnimatedHeart, AnimatedThumsUp, GradeBadgeSmall, GradeBadgeBig, ProfileImageStrokeSmall, ProfileImageStrokeBig, BottomDotTab, Required, BadgeGoodsEventType, BadgeGoodsEventTypeBig, FixedTabBarLine, HrStrong,
    TabButtonGroup, TabButton, Alert
}