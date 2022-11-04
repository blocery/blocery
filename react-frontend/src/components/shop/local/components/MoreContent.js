import React, {useState} from 'react';
import styled from 'styled-components'
import {Flex, Space} from "~/styledComponents/shared";
import {color} from "~/styledComponents/Properties";
import {IoIosArrowUp, IoIosArrowDown} from "react-icons/io";

const Wrapper = styled.div`
    position: relative;
    height: 200px;
    overflow: hidden;
    
    ${p => p.isOpen && `
        height: unset;
        
        & > div:first-child {
            display: none;
        }
        
    `}
    
    
    
`

const GradientBox = styled.div`
    
    
    
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50px;
  
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    
    // padding-right: 16px;
    
    background-image: linear-gradient(360deg,rgba(255,255,255,1),rgba(255,255,255,0.7),transparent);
`

const MoreButton = styled.div`
    font-size: 16px;
    color: ${color.green};
`

const MoreContent = ({children}) => {
    const [isOpen, setOpen] = useState(false);
    const toggle = e => setOpen(!isOpen)
    return (
        <div>
            <Wrapper isOpen={isOpen}>
                <GradientBox isOpen={isOpen}/>
                {children}
            </Wrapper>
            <Space spaceGap={4} justifyContent={'center'} fg={'green'} py={4} fontSize={16} onClick={toggle} cursor>
                <span>{isOpen ? '접기' : '펼쳐보기'} </span>{isOpen ? <IoIosArrowUp/> : <IoIosArrowDown/>}
            </Space>
        </div>
    );
};

export default MoreContent;
