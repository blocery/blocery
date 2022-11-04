import styled from "styled-components";
import {activeColor, color} from "~/styledComponents/Properties";
import {Div, Flex} from "~/styledComponents/shared/Layouts";
import {Button} from '~/styledComponents/shared/Buttons'
import {getValue} from "~/styledComponents/Util";
import {hoverColor} from "~/styledComponents/Properties";

export const Copy = styled(Div)`
    background-color: ${color.background};
    
    padding: 3px 10px;
    cursor: pointer;
    border-radius: 4px;
    display: inline-block;
    position: relative;
   
    &:hover {
        &::after {
            content: 'copy';
            display: flex;
            align-items: center;
            justify-content: center;
            position: absolute;
            font-size: 9px;
            width: 30px;
            height: 15px;
            background-color: ${color.dark};
            color: white;
            top: -9px;
            right:0;
        }
    }
    
    &:active {
        color: ${color.primary};
    }
    
`;

export const FilterGroup = styled(Flex)`
    flex-wrap: wrap;
    margin: 10px 10px 0 10px;
`;

const AdminBasicButton = styled(Button)`
    min-height: ${getValue(35)};
    display: flex;
    align-items: center;
    justify-content: center;
    & > * {
        margin-right: 4px;
    }
    & > *:last-child {
        margin: 0;
    }
    ${props => !props.bg && `
        background: ${color.white};        
        border: 1px solid ${color.secondary};
        
        &:hover {
            background-color: ${hoverColor.white};
        }
        &:active {
            background-color: ${activeColor.white};
        }
        
    `}
    
    ${props => (props.bg && props.bg !== 'white') && `
        color: ${color.white};
    `}
`

//일반 버튼
export const MenuButton = styled(AdminBasicButton)`    
    padding: 0 ${getValue(10)};
    font-size: 13px;
    line-height: 13px;
`;



//그리드 속에 들어가는 작은 버튼
export const SmBasicButton = styled(Button)`
    height: 24px;
    padding: 3px 6px;        
    font-size: 12px;
    line-height: 12px;
`;
export const SmButton = styled(Button)`
    height: 24px;
    padding: 3px 6px;        
    font-size: 12px;
    line-height: 12px;
    background: ${color.white};    
    border: 1px solid ${color.secondary};
    
    ${props => !props.bg && `
        
    `}
`;

//라벨 (컴포넌트를 감싼 상태에서 사용)
export const Label = styled.div`
    ${props => props.content && `
        position: relative;
        padding-top: ${getValue(17)};
        &:after {
            position: absolute;
            content: "${props.content}";
            top: 0;
            color: ${color[props.fg||'dark']};
            left: ${getValue(6)};
            // width: max-content;
            display: inline-block;
            font-size: ${getValue(11)};
        }
    `}

    
`

export default {
    Copy,
    FilterGroup,
    MenuButton,
    SmBasicButton,
    SmButton,
    Label
}