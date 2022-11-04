import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {producerCancelOrderSubGroup} from "~/lib/producerApi";
import {Flex, Space, Span} from "~/styledComponents/shared";
import {Button, Input} from "reactstrap";
import AdminLayouts from "~/styledComponents/shared/AdminLayouts";

const CancelOrderSubGroupContent = ({orderSubGroupNo, onClose, onCancel}) => {
    const [cancelReason, setCancelReason] = useState('')
    const onSubGroupCancelReasonChange = (e) => {
        setCancelReason(e.target.value);
    }
    const onOrderSubGroupCancel = async () => {
        if(window.confirm("결제취소를 하시겠습니까?")) {
            // setCancelOrderSubGroupNo(cancelSelected);
            const params = {
                orderSubGroupNo: orderSubGroupNo,
                cancelReason: cancelReason,
                cancelType:2
            }
            //취소처리
            const res = await producerCancelOrderSubGroup(params)
            if (res.status !== 200) {
                alert('에러가 발생 하였습니다. 새로고침 / 로그인을 다시 시도해 주세요.');
                return
            }

            if (res.data.resCode) {
                alert(res.data.errMsg);
            } else if (res.status === 200) {
                // searchOrderGroupList();
                // toggleCancelModal();
                onClose()
            } else {
                alert('오류가 발생 하였습니다. 다시 시도해 주세요.')
            }
            // setCancelOrderSubGroupNo(0);
        }
    }
    return(
        <>
            <Flex>
                <Span width={200} mr={2}>소비자 노출용 취소사유 : </Span>
                <Input type="text" name='cancelReason'
                       placeholder={"필수입력 아닙니다."}
                       onChange={onSubGroupCancelReasonChange} value={cancelReason}/>
            </Flex>
            <Space>
                <AdminLayouts.MenuButton fg="danger" onClick={onOrderSubGroupCancel} >결제취소처리</AdminLayouts.MenuButton>
                <AdminLayouts.MenuButton onClick={onCancel}>취소</AdminLayouts.MenuButton>
            </Space>
        </>
    )
};

export default CancelOrderSubGroupContent;
