import React from 'react';
import {Div, Fixed} from "~/styledComponents/shared";
import useScroll from "~/hooks/useScroll";
import {BsArrowUp} from 'react-icons/bs'
import styled from 'styled-components'
import {getValue} from "~/styledComponents/Util";
import {color} from "~/styledComponents/Properties";
import {FixedTabBarLine} from '~/styledComponents/ShopBlyLayouts'

const StyledButton = styled.div`
    width: ${getValue(50)};
    height: ${getValue(50)};    
    background-color: rgba(255, 255, 255, .5);
    border: 1px solid ${color.light};
    border-radius: 50%;
    
    display: flex;
    align-items: center;
    justify-content: center;    
    transition: 0.1s;
    cursor: pointer;
    
    &:active {
        background-color: ${color.white};
    }
`
//bottom은 토크의 글쓰기 버튼 위치를 생각해야함
const FixedButton = styled(Fixed)`
    position: absolute;
    // bottom:  ${getValue(134-52)};
    // right: ${getValue(16)};
`


export const ScrollUpButton = (props) => {
    const {y} = useScroll()
    const onClick = () => {
        window.scrollTo({top:0
            // , behavior: 'smooth'
        })
    }
    if (y <= 0) return null
    return (
        <StyledButton onClick={onClick}>
            <BsArrowUp size={20}/>
        </StyledButton>
    );
};


export const FixedScrollUpButton = ({bottom, children}) => {
    const {y} = useScroll()
    if (y <= 1000) return null
    return (
        <FixedTabBarLine>
            <Div absolute bottom={bottom || 16} right={16}>
                {children}
                <ScrollUpButton/>
            </Div>
        </FixedTabBarLine>
    );
};

export default {
    ScrollUpButton,
    FixedScrollUpButton
}
