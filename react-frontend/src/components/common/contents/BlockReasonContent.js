import React, {useState} from 'react';
import {Button, Div, Input} from "~/styledComponents/shared";

const defaultReason = [
    '광고/홍보',
    '음란/선정/사행/불법',
    '어뷰징(도배, 좋아요 유도 등)',
    '허위 내용',
    '인격모독/타인비방',
    '기타'
]

const BlockReasonContent = ({onBlockClick, onClose, additionalReason}) => {

    const store = additionalReason ? [...additionalReason, ...defaultReason] : defaultReason

    const [reason, setReason] = useState("사용자차단")


    const onHandleClick = ({target}) => {
        if (window.confirm("해당사용자 관련 내용이 즉시 차단됩니다. 차단을 진행하시겠습니까?")) {
            onBlockClick(reason)
        }
    }

    return(
        <Div>
            <Div py={8} fontSize={14} textAlign={'center'}>
                차단하실 경우, 해당사용자 관련 내용이 즉시 차단됩니다.
            </Div>
            <Div textAlign={'center'}>
                <Button py={5} px={10} bg={'white'} bc={'dark'} disabled={!reason} onClick={onHandleClick} >차단하기</Button>
            </Div>
        </Div>
    )
};

export default BlockReasonContent;


