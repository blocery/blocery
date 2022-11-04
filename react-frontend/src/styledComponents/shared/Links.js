import React from 'react';
import {Link as link} from 'react-router-dom'
import styled, {css} from 'styled-components';
import {color, activeColor} from '../Properties'
import {getValue, hasValue} from '../Util'
import * as core from '../CoreStyles'

const TEXT_DECORATION = {
    none: 'none',
    unset: 'unset',
    underline: 'underline',
    inherit: 'inherit'
}

const defaultStyle = css`
    text-decoration: ${props => TEXT_DECORATION[props.textDecoration || 'none']}!important;
    ${props => props.height && `height: ${getValue(props.height)};`};
    ${props => hasValue(props.fontSize) && `
        font-size: ${getValue(props.fontSize)};
    `}
    ${core.border};
`;

export const A = styled.a`
    ${defaultStyle};
    ${core.margin};
    ${core.padding};    
    display: ${props => props.display || 'inline-block'}; 
    color: ${props => color[props.fg] || color.black};   
    ${core.pseudo.hover};
    ${core.pseudo.active};
    ${props => props.noti && core.noti};
    ${props => props.notiNew && core.notiNew};
`;

export const Link = styled(link)`
    ${defaultStyle};
    ${core.margin};
    ${core.padding};    
    display: ${props => props.display || 'inline-block'};
    color: ${props => color[props.fg] || color.black};
    background-color: ${props => color[props.bg]};
    ${core.pseudo.hover};
    ${core.pseudo.active};
    ${props => props.noti && core.noti};
    ${props => props.notiNew && core.notiNew};
    //커스텀 css
    ${props => props.custom && props.custom}
`;