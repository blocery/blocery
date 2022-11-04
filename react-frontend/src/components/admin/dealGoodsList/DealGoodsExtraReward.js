import React, { useState, useEffect, Fragment } from 'react';
import {Container} from "reactstrap";
import {Button, Div, Flex, Input, ShadowBox, Span} from "~/styledComponents/shared";
import styled from "styled-components";
import {modifyExtraReward} from "~/lib/dealApi";
import {FaMinusCircle, FaPlusCircle} from "react-icons/fa";
const Subject = styled(Div)`
    font-size: 16px;
    font-weight: 700;
`;

const DealGoodsExtraReward = (props) => {
    const [extraRewards, setExtraRewards] = useState(props.data || null);

    const onSave = async() => {
        console.log(props.goodsNo, extraRewards)
        const {data} = await modifyExtraReward(props.goodsNo, extraRewards);
        if(data) {
            alert('저장이 완료되었습니다.');
        }
        props.onClose()
    }

    const onDeleteClick = ({index}) => {
        const rewardList = Object.assign([], extraRewards)
        rewardList.splice(index, 1)
        setExtraRewards(rewardList)
    }

    const addExtraReward = () => {
        const rewardList = Object.assign([], extraRewards)
        rewardList.push({
            dealCount: 0, reward: 0
        })
        setExtraRewards(rewardList)
    }

    const onChangeDealCount = (index, e) => {
        const value = e.target.value;
        const rewardList = Object.assign([], extraRewards);
        rewardList[index].dealCount = value;
        setExtraRewards(rewardList)
    }

    const onChangeReward = (index, e) => {
        const value = e.target.value;
        const rewardList = Object.assign([], extraRewards);
        rewardList[index].reward = value;
        setExtraRewards(rewardList)
    }

    return(
        <Container>
            <ShadowBox>
                <Flex mb={10}>
                    <Subject>공동구매 추가 적립률 설정 </Subject>
                    <Button ml={20} onClick={addExtraReward} bg={'green'} fg={'white'} px={10}><FaPlusCircle/>{' 행추가'}</Button>
                </Flex>
                <Div fontSize={15} fg={'danger'}> 달성개수(dealMinCount) 부터 오름차순으로 입력해 주세요.</Div>

                <Div mt={20}>
                    {
                        extraRewards ? (
                            extraRewards.map((extraReward, index) =>
                                <Flex className={'mb-2'}>
                                    <Span>판매수량 시작개수</Span>
                                    <Input className={'ml-1'} type="number"
                                           value={extraReward ? extraReward.dealCount : 0}
                                           onChange={onChangeDealCount.bind(this, index)}/>
                                    <Span className={'ml-3'}>적립률</Span>
                                    <Input className={'ml-1'} type="number" width={'50%'}
                                           value={extraReward ? extraReward.reward : 0}
                                           onChange={onChangeReward.bind(this, index)}/>
                                    <Button
                                        ml={10}
                                        bg={'danger'} fg={'white'}
                                        onClick={onDeleteClick.bind(this, {index})}><FaMinusCircle/>{' 삭제'}
                                    </Button>
                                </Flex>
                            )
                        ) : null
                    }
                </Div>

                <div className={'text-right'}>
                    <Button rounded={2} bg={'darkBlack'} fg={'white'} onClick={onSave} >저장</Button>
                </div>

            </ShadowBox>
        </Container>
    )
}

export default DealGoodsExtraReward