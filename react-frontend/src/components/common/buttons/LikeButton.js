import React from 'react';
import styled, {css, keyframes} from "styled-components";
import {Button, Span} from "~/styledComponents/shared";
import {color} from "~/styledComponents/Properties";
import {AiOutlineLike} from "react-icons/ai";
import ComUtil from "~/util/ComUtil";
import {IoMdHeart, IoMdThumbsUp} from 'react-icons/io'

const moveUp = (yAxis) => keyframes`
    0% {
        transform: translateY(0%);
        -webkit-filter: blur(0px);        
    }
    50% {
        transform: translateY(${yAxis}%);
        opacity: 0.4;
        -webkit-filter: blur(1px);
    }
    100% {
        transform: translateY(0%);
        -webkit-filter: blur(0px);
    }
  `


const animationMoveUp = css`
    animation: ${moveUp(-20*5)} 0.3s ease-in-out;
`

const StyledButton = styled(Button)`
    
    display: flex;
    align-items: center;
    
    ${props => props.liked ? `        
        color: ${color.danger};
        // border: 3px solid ${color.green};
    `: `
        color: ${color.dark};
        // border: 3px solid ${color.dark};
    `}
            
    
    & > span:first-child {                
        position: relative;
        display: inline-block;        
        ${props => props.up ? animationMoveUp : 'animation: unset'};
    }
     
`;


const LikeButton = ({onClick, liked, up, likesCount}) => {
    return (
        <StyledButton
            // px={12}
            // bw={3}
            rounded={19}
            onClick={onClick}
            liked={liked}
            // yAxis={yAxis}
            up={up}
        >
            <Span lineHeight={0}><IoMdThumbsUp size={25}/></Span>
            {/* 깔끔하게 숫자 보이지 않게 처리 */}
            <Span ml={8}>{ComUtil.addCommas(likesCount)}</Span>
        </StyledButton>
    );
};

export default LikeButton;
