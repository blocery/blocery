import React, {useEffect, useState, useRef} from 'react';
import {Button, Div, Flex, Input, Space} from "~/styledComponents/shared";
import {IoCloseOutline} from 'react-icons/io5'
import styled, {keyframes} from 'styled-components'
import {color} from "~/styledComponents/Properties";

const scaleUp = keyframes`
    0%{opacity: 0;}
    50%{
        -webkit-transform: scale(1.1);
        -moz-transform: scale(1.1);
        -ms-transform: scale(1.1);
        -o-transform: scale(1.1);
        transform: scale(1.1);}
    100%{opacity: 1;}
`;

const StyledTag = styled(Space)`
    // &:active {
    //     background-color: ${color.light};
    // }
    animation: ${scaleUp} 0.2s forwards ease-in-out;
`

const HashTagList = ({tags, isViewer = false, wrap = true, onClick = () => null}) => {
    const onHandleClick = (params, e) => {
        e.stopPropagation()
        onClick(params)
    }
    return (
        <Space flexWrap={wrap ? 'wrap' : 'nowrap'} spaceGap={8} pt={8}>
            {
                tags.map((tag, index) =>
                    <Div key={tag} pb={8} flexShrink={0}>
                        <StyledTag spaceGap={5} cursor={1} doActive key={`tag__${tag}`} py={2} px={8} mr={!wrap && 10} rounded={20} bg={'veryLight'} fontSize={14} onClick={onHandleClick.bind(this, {index: index, tag: tag})}>
                            <Div>
                                # {tag}
                            </Div>
                            {
                                !isViewer && <IoCloseOutline />
                            }
                        </StyledTag>
                    </Div>
                )
            }
        </Space>
    );
};

export default HashTagList;
