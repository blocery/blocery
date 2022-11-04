import React, {useState, useEffect} from 'react';
import {FlexButton} from "~/components/producer/mobile/common/Style";
import {Div, Flex, GridColumns, Input, Right, Space, Span} from "~/styledComponents/shared";
import Checkbox from "~/components/common/checkboxes/Checkbox";
import ComUtil from "~/util/ComUtil";
import {color} from "~/styledComponents/Properties";
import {HrHeavy} from "~/styledComponents/mixedIn";
import styled from 'styled-components'
import {
    AiOutlineClear,
    IoIosArrowBack,
    IoIosArrowForward,
    IoIosClose,
    IoMdAdd,
    IoMdRemove,
    MdClear
} from "react-icons/all";

const FilterGrid = styled.div`
    display: grid;
    grid-template-columns: ${props => [...Array(props.repeat)].map((num, idx) => {
        if (idx === 0) return '60px';
        else return ' 1fr';
    })};
    grid-column-gap: 1px;
    grid-row-gap: 1px;
    padding: 1px;
    background-color: ${color.veryLight};
`

const LocalKeySelector = ({initialLimit = 6, orderSubGroupList = [], selectedOrderSubGroupNoList = [], isOpen, onChange, onClose}) => {

    const [limit, setLimit] = useState(initialLimit)

    // const [orderSubGroupList, setOrderSubGroupList] = useState(initialList)
    const onBlockClick = (orderSubGroup) => {
        const orderSubGroupNo = orderSubGroup.orderSubGroupNo
        const newSubGroupNoList = [...selectedOrderSubGroupNoList]
        const idx = newSubGroupNoList.indexOf(orderSubGroupNo)
        //없으면 추가
        if (idx === -1) {
            newSubGroupNoList.push(orderSubGroupNo)
        }else{
            //있으면 삭제
            newSubGroupNoList.splice(idx, 1)
        }

        if (onChange && typeof onChange === 'function') {
            console.log({newSubGroupNoList})
            onChange(newSubGroupNoList)
        }
    }
    //한줄 선택
    const onRowSelectClick = (e) => {
        const checked = e.target.checked
        const blockIndex = ComUtil.toNum(e.target.value)
        const res = blockIndex + limit//4+4=8
        const filteredList = orderSubGroupList.filter((item, idx) => (idx >= blockIndex && idx < res))

        console.log(`${blockIndex} + ${limit} = ${res}`, filteredList)

        const newSubGroupNoList = [...selectedOrderSubGroupNoList]

        filteredList.map(item => {
            const idx = newSubGroupNoList.indexOf(item.orderSubGroupNo)

            //체크 하라고 했는데, 선택되어 있지 않으면 추가
            if (checked && idx === -1) {
                newSubGroupNoList.push(item.orderSubGroupNo)
            }
            //체크 해제 했는데, 선택되어 있으면 제거
            if (!checked && idx >= 0) {
                newSubGroupNoList.splice(idx, 1)
            }
        })

        onChange(newSubGroupNoList)
    }
    // const totalPage = blockPage + 1

    const onLimitChange = (num) => {
        setLimit(prev => prev + num)
    }

    const onClearAll = () => {
        onChange([])
    }

    return (
        <Div
            display={isOpen ? 'block' : 'none'}
            py={4}
            bg={'primary'}
            // style={{display: isOpen ? 'block' : 'none', maxHeight: '50vmax', overflow: 'auto'}}
        >
            <Div bg={'white'}>
                <Flex px={16} py={16} bg={'veryLight'}>
                    <Space>
                        <FlexButton width={40} height={40} rounded={'50%'} bg={'white'} bc={'secondary'} disabled={limit <= 1} onClick={onLimitChange.bind(this, -1)}><IoIosArrowBack size={20}/></FlexButton>
                        <Div width={50} textAlign={'center'} fontSize={17}>{limit}</Div>
                        {/*<Input value={limit} readOnly width={50} height={40} style={{textAlign:'center'}}/>*/}
                        <FlexButton width={40} height={40} rounded={'50%'} bg={'white'} bc={'secondary'} disabled={limit === orderSubGroupList.length} onClick={onLimitChange.bind(this, 1)}><IoIosArrowForward size={20}/></FlexButton>
                    </Space>
                    {
                        selectedOrderSubGroupNoList.length > 0 && (
                            <Right>
                                <FlexButton height={40} bg={'white'} bc={'secondary'} onClick={onClearAll}>
                                    <AiOutlineClear size={20}/>
                                    <Span ml={4}>{selectedOrderSubGroupNoList.length}개</Span>
                                </FlexButton>
                            </Right>
                        )
                    }
                </Flex>

                <Div maxHeight={'50vmax'} overflow={'auto'}>
                    <FilterGrid repeat={limit + 1}
                        // colGap={1}
                        // rowGap={1}
                        // bg={'veryLight'}
                        // p={1}
                    >
                        {
                            orderSubGroupList.map((subGroup, index) => {
                                const active = selectedOrderSubGroupNoList.includes(subGroup.orderSubGroupNo)
                                return (<Item key={subGroup.orderSubGroupNo} index={index} active={active} limit={limit} subGroup={subGroup} onRowSelectClick={onRowSelectClick} onBlockClick={onBlockClick.bind(this, subGroup)} />)
                            })
                        }
                    </FilterGrid>
                </Div>
                {/*<FlexButton my={4} bg={'primary'} fg={'white'} onClick={onClose} rounded={8} block>*/}
                {/*    닫기*/}
                {/*</FlexButton>*/}
                <Flex height={44} justifyContent={'center'} fontSize={14} bg={'white'} cursor doActive onClick={onClose}>
                    닫기
                </Flex>
            </Div>
        </Div>
    );
};

export default LocalKeySelector;

const Item = ({index, active, limit, subGroup, onRowSelectClick, onBlockClick}) => {
    const alphabet = subGroup.localKey.substr(0,1)
    const number = subGroup.localKey.replace(alphabet, "")
    // const bg = active ? 'primary' : 'white'
    // const fg = active ? 'white' : 'darkBlack'
    return(
        <>
            {
                (index % limit === 0) && (
                    <Flex justifyContent={'center'} bg={'white'} minHeight={50} >
                        <Checkbox value={index} size={'lg'} onChange={onRowSelectClick} />
                    </Flex>
                )
            }
            <Space spaceGap={2} justifyContent={'center'} minHeight={30}
                   cursor={1}
                   bg={active ? 'primary' : 'white'}
                // fg={active ? 'white' : 'darkBlack'}
                   onClick={onBlockClick}
            >
                <div style={{color: active ? color.white : color.dark}}>{alphabet}</div>
                <div style={{color: active ? color.white : color.black}}><b>{number}</b></div>
            </Space>
        </>
    )
}