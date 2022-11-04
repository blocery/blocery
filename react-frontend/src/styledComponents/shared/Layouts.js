import React from 'react';
import styled, {css} from 'styled-components';
import {activeColor, color, responsive} from '../Properties'
import {getValue, hasValue} from '../Util'
import {position, margin, padding, border, sticky, fixed, noti, notiNew, spin} from '../CoreStyles'
import aniKey from "~/styledComponents/Keyframes";

import TextareaAutoSize from 'react-textarea-autosize';


const defaultStyle = css`
    width: ${props => props.width && getValue(props.width)};
    height: ${props => props.height && getValue(props.height)};
    font-size: ${props => getValue(props.fontSize) || 'inherit'};
    line-height: ${props => hasValue(props.lineHeight) ? getValue(props.lineHeight) : 'inherit'};
    font-weight: ${props => props.bold ? 'bold' : 'inherit'};
    ${props => props.fw && `font-weight: ${props.fw};`};
    ${props => props.bold && `font-weight: bold;`}
    
    text-align: ${props => props.textAlign};
    color: ${props => hasValue(props.fg) ? (color[props.fg] || props.fg) : 'inherit'};
    ${props => props.bg && `
        background-color: ${color[props.bg] || props.bg}
    `};    
    
    ${props => (props.bgFrom || props.bgTo) && `background: linear-gradient(${props.deg || 145}deg, ${hasValue(props.bgFrom) ? (color[props.bgFrom] || props.bgFrom) : color.white}, ${hasValue(props.bgTo) ? (color[props.bgTo] || props.bgTo) : color.white});`};
   
    ${border}; 
    ${position};
    ${margin}; 
    ${padding};
    
    ${props => props.relative && 'position: relative;'};
    ${props => props.absolute && 'position: absolute;'};
    ${props => props.fixed && 'position: fixed;'};
    ${props => props.sticky && 'position: sticky;'};
    
    ${props => props.xCenter && `transform: translateX(-50%);`};
    ${props => props.yCenter && `transform: translateY(-50%);`};
    ${props => props.center && `top: 50%; left: 50%; transform: translate(-50%, -50%);`};
    
    position: ${props => props.position};    
    display: ${props => props.display};    
    flex-grow: ${props => props.flexGrow};
    flex-basis: ${props => props.flexBasis};
    flex-shrink: ${props => props.flexShrink && props.flexShrink};
    cursor: ${props => props.cursor && 'pointer'};
    z-index: ${props => props.zIndex};
    max-width: ${props => getValue(props.maxWidth)};
    min-width: ${props => getValue(props.minWidth)};
    max-height: ${props => getValue(props.maxHeight)};
    min-height: ${props => getValue(props.minHeight)};
    border-radius: ${props => getValue(props.rounded)};
    top: ${props => getValue(props.top)};
    bottom: ${props => getValue(props.bottom)};
    left: ${props => getValue(props.left)};
    right: ${props => getValue(props.right)};
    
    overflow: ${props => props.overflow};

    ${props => props.noti && noti};
    ${props => props.notiNew && notiNew};
    
    ${props => props.shadow === 'sm' && 'box-shadow: 1px 1px 3px rgba(0,0,0,0.1);'};
    ${props => props.shadow === 'md' && 'box-shadow: 1px 1px 10px rgba(0,0,0,0.1);'};
    ${props => props.shadow === 'lg' && 'box-shadow: 1px 1px 15px rgba(0,0,0,0.1);'};
    
    ${props => props.dot && `
        &::before {
            content: "\\2022";
            color: ${color.secondary};
            display: inline-block;
            margin-right: 4px;
        }
    `}
  
    ${props => props.hoverUnderline && `
        &:hover {
            text-decoration: underline;
        }
    `}        
    
    ${props => props.lineClamp && `
        display: -webkit-box;
        overflow: hidden;                                                                
        text-overflow: ellipsis;
        -webkit-line-clamp: ${props.lineClamp || 2};
        -webkit-box-orient: vertical;
    `}
    
    //커스텀 css
    ${props => props.custom && props.custom}
    
    //이전 모바일웹뷰 지원안됨(gap은 display: grid 일 경우만 지원 되는것 같음)
    // ${props => hasValue(props.gap) && `gap: ${getValue(props.gap)}`};     
    // grid-column-gap: ${props => hasValue(props.colGap) && getValue(props.colGap)};
    // grid-row-gap: ${props => hasValue(props.rowGap) && getValue(props.rowGap)};
     
  
    //클릭시 회색
    ${props => props.doActive && `
        &:active {
            background-color: ${ activeColor[props.bg] || color.veryLight};
        }
    `}  
`;

export const Div = styled.div`
    ${defaultStyle};
`;

export const Article = styled.article`
    ${defaultStyle};
`

export const Span = styled.span`
    ${defaultStyle};
`;
export const Ul = styled.ul`
    ${defaultStyle};
`;

export const Img = styled.img`
    ${defaultStyle};
    width: ${props => hasValue(props.width) ? getValue(props.width) : '100%'};
    height: ${props => getValue(props.height) || '100%'};
    object-fit: ${props => props.cover && 'cover'};
        
    animation: ${aniKey.fadeIn} 0.3s forwards;        
    ${props => props.noLazy && `animation: unset;` }        
`;




export const Flex = styled(Div)`
    display: flex;
    align-items: ${props => props.alignItems || 'center'};
    justify-content: ${props => props.justifyContent};
    flex-direction: ${props => props.flexDirection};    //test 후 삭제(아래 props 로 대체함)
    flex-wrap: ${props => props.flexWrap};
    flex-direction: ${props => props.column && 'column'};
    margin-left: ${props => props.right && 'auto'};
    
`;

export const Right = styled(Div)`
    margin-left: auto;
`;

export const Hr = styled.hr`
    margin: 0;
    ${margin};
    ${padding};    
    border: 1px solid ${color.light};
    border-color: ${props => color[props.bc]};
    border-left: 0;
    border-right: 0;
    border-bottom: 0;
`;

export const Sticky = styled(Div)`
    ${sticky};
`;

export const Fixed = styled(Div)`
    ${fixed};

    max-width: ${responsive.maxWidth};            //디폴트 값으로 768 이상일 경우는 더이상 클수 없도록 제어
    ${props => props.noResponsive && `max-width: none;`};   //max-width 해제
    max-width: ${props => getValue(props.maxWidth)};
`;

export const Mask = styled(Fixed)`
    ${fixed};
    top: ${props => props.underNav ? '56px' : '0'};
    width: 100%;
    bottom: 0;
    background-color: rgba(0,0,0, 0.7);   
    z-index: 50;     
`;

export const AbsoluteMask = styled.div`
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0.4);
    color: white;
    font-weight: bold;
    top:0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1;
`

export const ShadowBox = styled(Div)`
    background: ${color.white};
    border-radius: ${getValue(6)};
    // margin-bottom: ${getValue(16)};
    margin-bottom: ${props => hasValue(props.mb) ? getValue(props.mb) : getValue(16)};
    ${props => (props.p !== 0 && props.p !== '') && `padding: ${getValue(25)} ${getValue(16)};`}
    box-shadow: 1px 1px 3px rgba(0,0,0,0.1);
`;

export const Coupon = styled(Div)`
    display: flex;
    color: ${color.white};
    position: relative;
    width: ${getValue(237)};
    height: ${getValue(130)};
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    padding: ${getValue(10)} ${getValue(20)};

    &::after {
        position: absolute;
        top: 50%;
        right: -26px;
        width: 42px;
        height: 42px;
        margin-top: -21px;
        border-radius: 50%;
        background-color: #ffffff;
        content: '';
    }
`

export const Spin = styled(Div)`
  ${spin};
  display: inline-block;
`;

export const GridColumns = styled(Div)`
    display: grid;
    grid-template-columns: repeat(${props => props.repeat}, 1fr);
    ${props => hasValue(props.colGap) && `
        grid-column-gap: ${getValue(props.colGap)};
    `}
    ${props => hasValue(props.rowGap) && `
        grid-row-gap: ${getValue(props.rowGap)};
    `}
`;

export const Grid = styled(Div)`
    display: grid;
    grid-template-columns: ${props => props.templateColumns};
    ${props => hasValue(props.colGap) && `grid-column-gap: ${getValue(props.colGap)};`}
    ${props => hasValue(props.colGap) && `grid-row-gap: ${getValue(props.colGap)};`}
`;

//리스트 사이에 회색 공백을 띄운다
export const JustListSpace = styled.div`
    ${margin};
    ${padding};
    
    & > * {
        margin-bottom: ${props => props.space ? getValue(props.space) : getValue(15)};        
    }
    & > *:last-child {
        margin-bottom: ${props => props.lastSpace ? getValue(props.lastSpace) : '0'};
    }
  
    ${props => props.custom && props.custom}
`



//리스트 사이에 회색 공백을 띄운다
export const ListSpace = styled(JustListSpace)`
    background-color: ${props => props.bg ? (color[props.bg] || props.bg) : color.veryLight};    
`

export const ListBorder = styled(Div)`
    & > * {
        border-bottom: 1px solid ${props => props.spaceColor ? color[props.spaceColor] || props.spaceColor :  color.light};        
    }
    
    ${props => props.firstBorder && `
        & > *:first-child {
            border-top: 1px solid ${props => props.spaceColor ? color[props.spaceColor] || props.spaceColor :  color.light};
        }    
    `}
    
    
    & > *:last-child {
        border: 0;
    }
`;

export const Divider = styled(Div)`
    height: ${props => props.height ? getValue(props.height) : getValue(10)};
    background-color: ${props => props.bg ? (color[props.bg] || props.bg) : color.veryLight};
    border-top: 1px solid ${props => hasValue(props.bc) ? color[props.bc] || props.bc : color.light};
    border-right: 0;
    border-bottom: 0;
    border-left: 0;
`

export const WhiteSpace = styled(Div)`
    white-space: pre-line;
    word-break: ${props => props.wordBreak || 'break-word'}; 
`

export const Space = styled(Flex)`
    & > * {
        margin-right: ${props => getValue(props.spaceGap || 10)};
    }
    & > *:last-child {
        margin: 0;
    }
     
    // ${props => !hasValue(props.gap) && `gap: ${getValue(10)}`} //이전 모바일웹뷰 지원안됨(gap은 display: grid 일 경우만 지원 되는것 같음)
`

export const Textarea = styled(TextareaAutoSize)`
    border-color: ${color.light}!important;    
`

//밑줄이 있는 strong 타입
export const Strong = styled.span`
    // text-decoration-line: underline;
    font-weight: bold;
    ${p => p.fg && `color: ${color[p.fg] || p.fg}`};
    ${p => hasValue(p.fontSize) && `font-size: ${getValue(p.fontSize)}`};
`
