import {css, keyframes} from "styled-components";

export const spin = keyframes`
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
`;

export const heartBeat = keyframes`
    0% {      
        transform: scale(1);
    }
    5% {
        transform: scale(1.1);
    }
    10% {
        transform: scale(1);
    }
    15% {
        transform: scale(1.2);
    }
    50% {
        transform: scale(1);
    }
    100% {
        transform: scale(1);
    }
`;

export const scaleUp = keyframes`
    0%{}
    50%{
        -webkit-transform: scale(1.2);
        -moz-transform: scale(1.2);
        -ms-transform: scale(1.2);
        -o-transform: scale(1.2);
        transform: scale(1.2);}
    100%{}
`;



const moveDown = keyframes`
    0%{}
    50%{
        -webkit-transform: translateY(10%);
        -moz-transform: translateY(10%);
        -ms-transform: translateY(10%);
        -o-transform: translateY(10%);
        transform: translateY(10%);}
    100%{}
`;

const moveUp = keyframes`
    0%{}
    50%{
        -webkit-transform: translateY(-20%);
        -moz-transform: translateY(-20%);
        -ms-transform: translateY(-20%);
        -o-transform: translateY(-20%);
        transform: translateY(-20%);}
    100%{}
`;

const fadeIn = keyframes`
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
`

const aniKey = {
    spin,
    heartBeat,
    scaleUp,
    moveDown,
    moveUp,
    fadeIn
}

export default aniKey