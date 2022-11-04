import React, {useEffect} from 'react';
import {Div, Flex, GridColumns, Link} from "~/styledComponents/shared";
import {useRouteMatch, useHistory} from "react-router-dom";
import styled from 'styled-components'

{/* 일반, 로컬 토글 */}
//activeId
//  normal : 일반
//  local : 로컬


const Item = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  
  ${props => props.active && `
        background-color: #1db691;
        box-shadow: 0 0 0 3px #1db691, 0 0 5px 7px rgba(0,0,0, 0.1);
        color: white;
  `}
`


const StoreSelectionToggle = () => {

    const history = useHistory()
    const isLocal = useRouteMatch({
        path: '/local',
        exact: true
    })

    useEffect(() => {
        console.log("==============================================================")
    }, []);


    // const onClick = () => history.replace()

    return (
        <Div p={16}>
            <GridColumns repeat={2} bg={'#f1f1f1'} fontSize={16} colGap={0} height={39} rounded={8}>
                <Item active={!isLocal} onClick={() => history.push('/')}>#스토어</Item>
                <Item active={isLocal} onClick={() => history.push('/local')}>#로컬푸드</Item>
            </GridColumns>
        </Div>
    )

    return (
        <Flex justifyContent={'center'} overflow={'hidden'} rounded={25} bg={'veryLight'} fg={'white'}>
            <Div width={100} bg={!isLocal ? 'primary' : 'white' } fg={!isLocal ? 'white' : 'black'} onClick={() => history.push('/')}>
                일반
            </Div>
            <Div width={100} bg={isLocal ? 'primary' : 'white' } fg={isLocal ? 'white' : 'black'} onClick={() => history.push('/local')}>
                로컬
            </Div>


        </Flex>
    );
};

export default StoreSelectionToggle;
