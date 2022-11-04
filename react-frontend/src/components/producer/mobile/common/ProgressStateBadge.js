import React, {useEffect, useState} from 'react';
import useInterval from "~/hooks/useInterval";
import {getOrderSubGroupListByOrderSubGroupNos} from "~/lib/producerApi";
import {Div} from "~/styledComponents/shared";

// int progressState;          //default:0 '-', 1 피킹중, 2 피킹완료, 3 배송완료, 4 배송시작, 99 전체취소된 건
const PROGRESS_STATE = {
    0:'미확인',
    1: '피킹중',
    2: '피킹완료',
    3: '배송완료',
    4: '배송시작',
    99: '전체취소'
}

const STATE_COLOR = {
    0: 'danger',
    1: 'green',
    2: 'green',
    3: 'primary',
    4: 'primary',
    99: 'danger',
}

const DELAY = 1000 * 10

const ProgressStateBadge = ({orderSubGroupNo, progressState: ps}) => {
    const [delay, setDelay] = useState(null)
    const [progressState, setProgressState] = useState(ps)
    useEffect(() => {
        if (progressState !== ps) {
            setProgressState(ps)
        }
        //미확인, 피킹중일 경우 인터벌
        if ([0, 1].includes(ps)) {
            setDelay(DELAY)
        }
    }, [ps])

    useInterval(() => {
        getOrderSubGroup()
    }, delay)

    const getOrderSubGroup = async () => {

        console.log(orderSubGroupNo+"상태값 인터벌 조회")

        const {status, data} = await getOrderSubGroupListByOrderSubGroupNos([orderSubGroupNo])
        const orderSubGroup = data[0]
        if (orderSubGroup.progressState !== progressState) {
            console.log("상태 달라서 setProgressState")
            setProgressState(orderSubGroup.progressState)
            if (![0,1].includes(orderSubGroup.progressState)) {

                console.log(orderSubGroupNo+"딜레이 클리어")
                setDelay(null)
            }
        }
    }

    return (
        <Div fg={'white'} bg={STATE_COLOR[progressState]} px={4} rounded={3}>
            {PROGRESS_STATE[progressState]}
        </Div>
    );
};

export default ProgressStateBadge;
