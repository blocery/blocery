import React, {useRef} from 'react';
import {deliveryMsgStore} from "~/store";
import {Div, Flex} from "~/styledComponents/shared";
import styled from 'styled-components'
import {getValue} from "~/styledComponents/Util";
import {IoIosArrowDown, IoIosArrowUp} from 'react-icons/io'

const StyledSelect = styled.select`
    border: 0;
    width: 100%;    
    height: 100%;
    -webkit-appearance: none;
    -moz-appearance: none;
    text-indent: 1px;
    text-overflow: '';
    padding-left: ${getValue(13)};
    padding-right: ${getValue(37)};
    background-color: #FFFFFF;
`

const BasicSelect = ({data, value,
                         // disabledValues = () => [],
                         disabledValues = [],
                         onChange, selectionText,
                         wrapperStyle = {},
                         iconStyle = {}
                     }) => {

    return (
        <Flex relative height={45} bc={'light'} rounded={4} overflow={'hidden'} {...wrapperStyle}>
            <Div absolute right={13}>{<IoIosArrowDown style={iconStyle}/>}</Div>
            <StyledSelect onChange={onChange} value={value}>
                {
                    selectionText && <option value={''}>{selectionText}</option>
                }
                {
                    data.map(({label, value}) =>
                        <option key={`msg${value}`} value={value} disabled={disabledValues.includes(value)}>{label}</option>
                    )
                }
            </StyledSelect>
        </Flex>
    );
};

export default BasicSelect;
