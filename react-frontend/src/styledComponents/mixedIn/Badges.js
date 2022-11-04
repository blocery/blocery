import React from 'react';
import styled, {css} from 'styled-components';
import {color, activeColor} from '../Properties'
import {Div} from '../shared/Layouts'
import {getValue}  from '../Util'
import {position, margin, padding, border, sticky, fixed, noti, notiNew, spin} from '../CoreStyles'

export const Badge = styled(Div)`
    font-size: ${props => getValue(props.fontSize) || getValue(10)};
    border-radius: ${props => getValue(props.rounded) || getValue(4)};
    padding: 2px 5px;
`;

export const EventBadge = styled.div`
    color: ${color.white};
    display: inline-block;
    ${margin};
    ${props => props.size === 'lg' ? 
    `
        font-size: ${getValue(18)};
        padding: ${getValue(2)} ${getValue(3)};
        border-radius: 3px;
        
    ` : props.size === 'md' ? `
        font-size: ${getValue(14)};
        padding: ${getValue(2)} ${getValue(3)};
        border-radius: 2px;
    ` : `
        font-size: ${getValue(11)};
        padding: 0 ${getValue(3)};
        border-radius: 2px;
    ` }
    
`

//슈퍼리워드 배지
export const SuperRewardBadge = styled(EventBadge)`
    background: ${color.danger};
`

//포텐타임 배지
export const PotenTimeBadge = styled(EventBadge)`
    background: ${color.warning};
`

//쑥쑥 배지
export const SsugSsugBadge = styled(EventBadge)`
    background: ${color.green};
`

//무료배송 배지
export const FreeDeliveryBadge = styled(EventBadge)`
    background: ${color.danger};
`

//비활성 용 배지
export const DisabledBadge = styled(EventBadge)`
    background: ${color.dark};
`





