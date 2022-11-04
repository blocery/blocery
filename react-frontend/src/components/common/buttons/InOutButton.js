import {BsDashLg, BsPlusLg} from "react-icons/all";
import {color} from "~/styledComponents/Properties";
import {Flex} from "~/styledComponents/shared";
import React from "react";
import styled from "styled-components";
import {getValue} from "~/styledComponents/Util";

const Wrapper = styled.div`
    display: grid;
    background: ${color.light};
    align-items: center;
    border: 1px solid ${color.light};
    border-radius: ${getValue(4)};
    overflow: hidden;
    user-select: none;
    
    & > div {
        height: 100%;
    }
    
    //lg(기본)
    grid-column-gap: 1px;
    grid-template-columns: 44px 1fr 44px;
    height: 34px;
    font-size: 14px;

    & > *:nth-child(1) {
        font-size: ${getValue(14)};
    }
    & > *:nth-child(2) {
        font-size: ${getValue(13.5)};
    }
    & > *:nth-child(3) {
        font-size: ${getValue(14)};
    }

    //sm    
    ${props => props.size === 'sm' && `
        grid-column-gap: 0;
        grid-template-columns: 28px 1fr 28px;
        height: 28px;
        font-size: 12px;
    `}console.log({& > *:nth-child(1) {
        font-size: ${getValue(14)};
    }: 
`
const NumberButton = ({onClick, children, ...rest}) => <Flex justifyContent={'center'} bg={'white'} doActive cursor={1} onClick={onClick} {...rest}>{children}</Flex>


//size : lg, sm
export const InOutButton = ({onIncrease, onDecrease, value, size = 'lg', disabled, style}) => {
    return(
        <Wrapper onClick={e => e.stopPropagation()} size={size} style={style}>
            <NumberButton onClick={onDecrease}><BsDashLg color={value <= 0 ? color.light : color.black}/></NumberButton>
            <Flex bg={'white'} justifyContent={'center'} bold fg={disabled && 'light'}>{value}</Flex>
            <NumberButton onClick={onIncrease} fg={disabled && 'light'}><BsPlusLg /></NumberButton>
        </Wrapper>
    )
}


