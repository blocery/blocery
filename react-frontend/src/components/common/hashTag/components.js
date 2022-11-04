import React, {useEffect, useState} from 'react';

import styled from "styled-components";
import {getValue} from "~/styledComponents/Util";
import {color} from "~/styledComponents/Properties";
import BasicSwiper from "~/components/common/swipers/BasicSwiper";
import {Link} from "~/styledComponents/shared";

export const Title = styled(Link)`
    font-size: ${getValue(20)};
    font-weight: 700;
    margin-bottom: ${getValue(16)};
`



const HashtagWrapper = styled.div`

    display: flex;
    // margin-left: ${getValue(-16)};
    // margin-right: ${getValue(-16)};
    // padding-top: ${getValue(16)};
    padding-bottom: ${getValue(16)};
    // padding-left: ${getValue(16)};
    overflow: auto;
    
    & > div:last-child {
        margin-right: ${getValue(16)};
    }
`

const HashTagButton = styled.div`
    cursor: pointer;
    margin-right: 8;
    border-radius: ${getValue(4)};
    flex-shrink: 0;
    padding: ${getValue(4)} ${getValue(10)};
    
    ${props => props.active ? `
        background-color: ${color.green};    
        color: ${color.white};
    ` : `
        background-color: ${color.white};
        color: ${color.dark};
    `}    
`

export const HashTagList = ({hashTags = [], hideTags, onInit, onChange}) => {
    const [activeIndex, setActiveIndex] = useState(-1) //전체

    useEffect(() => {
        if (hashTags.length > 0) {
            onInit(hashTags)
            setActiveIndex(-1)
        }
    }, [hashTags])

    const onHandleClick = (index) => {
        setActiveIndex(index)

        const tags = getTags(index)
        onChange(tags)
    }

    const getTags = (index) => {
        if (index === -1) {
            return hashTags
        }

        return [hashTags[index]]
    }

    if (hideTags) return null

    return(
        <HashtagWrapper>
            <HashTagButton active={activeIndex === -1} onClick={onHandleClick.bind(this, -1)}>전체</HashTagButton>
            {
                hashTags.map((tag, index) =>
                    <HashTagButton key={tag} active={activeIndex === index} onClick={onHandleClick.bind(this, index)}>#{tag}</HashTagButton>
                )
            }
        </HashtagWrapper>
    )
}