import styled from "styled-components";
import {getValue} from "~/styledComponents/Util";
import {color} from "~/styledComponents/Properties";

export const RoundedCountBadge = styled.div`
    display: flex;
    align-items: center;
    border: 2px solid ${props => color[props.color]};
    border-radius: ${getValue(16)};
    background: ${color.white};
    padding: 0 ${getValue(16)};
    font-size: ${getValue(14)};
    ${props => props.cursor && 'pointer'}
    min-height: ${getValue(32)};
    line-height: ${getValue(32)};
    
    & > * {
        margin-right: ${getValue(4)};    
    }
    & > *:first-child {
        color: ${props => color[props.color]};
    }
    & > *:last-child {
        color: ${props => color[props.color]};
        margin: 0;
    }
`

export const LocalFooter = styled.div`
    background: ${color.background};
    padding: ${getValue(24)} ${getValue(16)};
    line-height: 1.7;
    font-size: ${getValue(12)};
`