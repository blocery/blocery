import React from 'react';
import styled, {css} from 'styled-components';
import {color, activeColor} from '../Properties'
import {Div} from './Layouts'
import {getValue, hasValue} from '../Util'
import * as core from '../CoreStyles'

//삼각형
export const TriangleUp = styled.div`        
    display: inline-block;
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    ${props =>  `border-bottom: 7px solid ${color[props.bg] || color.green}`};
    ${core.padding};
    ${core.margin};
    
`;

//역삼각형
export const TriangleDown = styled.div`
    display: inline-block;        
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    ${props =>  `border-top: 7px solid ${color[props.bg] || color.green}`};
    ${core.padding};
    ${core.margin};
    
`;

//말풍선(아래로 향하는)
export const WordBalon = styled.div`

    position:relative;
    padding:15px;
    width: ${props => getValue(props.width)};
    color: ${props => color[props.fg] || color.white};
    background-color: ${props => color[props.bg] || color.danger};
    -webkit-border-radius:10px;
    -moz-border-radius:10px;
    border-radius:10px;
    
    ${core.padding};
    ${core.margin};
    
    &::after {
        content: "";
        position: absolute;
        bottom: -13px;
        left: 50px;
        border-width: 13px 0 0px 13px;
        border-style: solid;
        border-color: ${props => color[props.bg] || color.danger} transparent;
        display: block;
        width: 0;
    }
`;

//말풍선(왼쪽 위로 향하는)
export const WordBalonLeftTop = styled.div`

    position:relative;
    padding:5px 10px;
    // width: ${props => getValue(props.width)};
    color: ${props => color[props.fg] || color.white};
    background-color: ${props => color[props.bg] || color.danger};
    -webkit-border-radius: 2px;
    -moz-border-radius: 2px;
    border-radius: 2px;    
    // width: max-content;
    display: inline-block;
    font-size: 12px;
    // padding: 5 10;    
    // margin-top: 16;
    
    
    ${core.padding};
    ${core.margin};
    
    &::after {
        content: "";
        position: absolute;
        top: -11px;
        left: ${props => hasValue(props.left) ? getValue(props.left) : '39px'};
        border-width: 0 11px 11px 0;
        border-style: solid;
        border-color: ${props => color[props.bg] || color.danger} transparent;
        display: block;
        width: 0;
    }
`;