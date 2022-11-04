import React, {useContext, useEffect, useRef} from "react";
import {Button, Flex, Space} from "~/styledComponents/shared";
import {FiRefreshCcw, VscClose} from "react-icons/all";
import styled from "styled-components";
import {activeColor, color, hoverColor} from "~/styledComponents/Properties";
import {getValue} from "~/styledComponents/Util";
import {FilterContext} from "~/components/common/filter/FilterContext";
import {keyframes} from "styled-components";

import {MAIN_COLOR_NAME, appliedButtonStyle} from './FilterStore'
import {pseudo} from "~/styledComponents/CoreStyles";

const fadeIn = keyframes`
    0% {
      opacity: 0;          
    }
    100% {
      opacity: 1;  
    }
`

const AppliedButton = styled.button`
    background: ${color[MAIN_COLOR_NAME]};
    color: ${color.white};
    font-size: ${getValue(13)};
    padding: ${getValue(6)} ${getValue(10)};
    line-height: normal;
    flex-shrink: 0;
    border: 0;
    border-radius: ${getValue(2)};
    
    animation: ${fadeIn} 0.2s ease-in-out forwards;
    
    //커스텀 css
    ${props => props.custom && props.custom}
`

const ScrollBox = styled.div`
    display: flex;
    overflow: auto;
    scroll-behavior: smooth;
    &::-webkit-scrollbar {
        display: none;
    }
    
    padding: 0 ${getValue(16)};
    
    & > * {
        margin-right: ${getValue(8)};
    }
    & > *:last-child {        
        margin-right: ${getValue(54)};
    }
`

//absolute top={0} bottom={0} right={0} cursor={1} bg={'white'} doActive ml={'auto'} justifyContent={'center'} flexShrink={0} width={54} height={'100%'}
const ClearBox = styled.div`
    position: absolute;
    display: flex;
    top: 0;
    right: 0;
    width: ${getValue(54)};
    height: 100%;
    cursor: pointer;    
    
    margin-left: auto;
    align-items: center;
    justify-content: center;
    // flex-shrink: 0;
    
    border-left: 1px solid ${color.light};
    background: rgba(255,255,255,0.9);
    
    &:active {
        background: ${activeColor.white};
    }
        
`

//최상단 필터가 적용된 버튼 리스트
const AppliedFilterButtonList = (props) => {
    const {filterInfo, toggleFilterContent, onChange, onRemove, clearAll, scrollToEndDate} = useContext(FilterContext)

    const elRef = useRef()
    useEffect(() => {
        //스크롤 오른쪽으로 끝으로 이동
        elRef.current.scrollLeft = elRef.current.scrollWidth;
        console.log("scroll useEffect!!!", elRef.current.scrollLeft, elRef.current.scrollWidth)
    }, [scrollToEndDate])

    return (
        <Flex minHeight={54} bg={'white'} relative>
            <ScrollBox ref={elRef}
                //            spaceGap={8} overflow={'auto'} px={16} custom={`
                //     &::-webkit-scrollbar {
                //         display: none;
                //     }
                //     transition: 0.3s all;
                //     scroll-behavior: smooth;
                // `}
            >
                {
                    Object.keys(filterInfo).map(key => {
                        const filter = filterInfo[key]

                        if (!filter.value) return null

                        return(
                            <AppliedButton key={key} onClick={onRemove.bind(this, key)} custom={appliedButtonStyle[key] || null} >
                                {filter.label} <VscClose />
                            </AppliedButton>
                        )
                    })
                }
            </ScrollBox>
            <ClearBox onClick={clearAll}>
                <FiRefreshCcw />
            </ClearBox>
            {/*<Flex absolute top={0} bottom={0} right={0} cursor={1} bg={'white'} doActive ml={'auto'} justifyContent={'center'} flexShrink={0} width={54} height={'100%'} onClick={clearAll}*/}
            {/*custom={`*/}
            {/*    border-left: 1px solid ${color.light};*/}
            {/*    background: rgba(255,255,255,0.9)*/}
            {/*`}*/}
            {/*>*/}
            {/*    <FiRefreshCcw />*/}
            {/*</Flex>*/}
        </Flex>
    )
}

export default AppliedFilterButtonList