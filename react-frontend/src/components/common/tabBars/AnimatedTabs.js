import styled from "styled-components";
import {color} from "~/styledComponents/Properties";
import {getValue} from "~/styledComponents/Util";
import {GridColumns} from "~/styledComponents/shared";
import React from "react";

const Tab = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    ${props => props.active && `color:${color.green}`};        
`
const Line = styled.div`
    position: absolute;
    transition: all 0.5s ease 0s;
    z-index: 0;
    height: ${getValue(3)};
    bottom: 0;
    background: ${color.green};    
    left: ${props => props.left};
    width: ${props => props.width};
`

const AnimatedTabs = ({
                          data = [
                              {label: '상세정보', value: 'GOODS_DETAIL'},
                              {label: '리뷰', value: 'GOODS_REVIEW'},
                              {label: '문의', value: 'GOODS_QNA'},
                          ], value,
                          onChange}
) => {
    return (
        <GridColumns repeat={data.length} colGap={0} rowGap={0} height={50} bg={'white'} relative>
            <Line width={`${100/data.length}%`} left={`${data.findIndex(item => item.value === value) * 100/data.length}%`}/>
            {
                data.map(item =>
                    <Tab
                        active={item.value === value}
                        onClick={onChange.bind(this, item.value)}>
                        {item.label}
                    </Tab>
                )
            }
        </GridColumns>
    )
}

export default AnimatedTabs