import React from 'react';
 
import styled, {css} from 'styled-components';
import {color} from '../Properties'
import {getValue, hasValue} from '../Util'
import * as core from '../CoreStyles'

const BasicInput = styled.input`

    ${props => props.width && css`width: ${getValue(props.width)};`}
    height: ${props => props.height ? getValue(props.height) : getValue(45)};
    box-sizing: border-box;
    color: ${color.black};
    border-radius: ${props => hasValue(props.rounded) ? getValue(props.rounded) : getValue(3)};
    
    border: solid 1px ${color.light};
    padding: ${props => props.padding || `0 ${getValue(13)}`};        
    ${props => props.bold && `
        font-weight: bold;
    `}
    
    font-size: ${props => getValue(props.fontSize || 14)};


    ${core.margin};
    ${core.padding};
    
    ${core.border};

    &::placeholder {
        color: #b9b9b9;        
    }
    &:focus {
        outline: none;
    }
`;


//override
export const Input = styled(BasicInput)`    
    ${props => props.green && `
        border: 1px solid ${color.green};
    `}
    ${props => props.underLine && `
        border-radius: 0;
        border-top: 0;
        border-right: 0;
        border-left: 0;
    `}    
    ${props => props.readOnly && `
        background-color: ${color.background};
    `}
    ${props => props.disabled && `
        background-color: ${color.background};
    `}
    ${props => props.block && `
        width: 100%;
    `}

`;