import React from 'react';
import AddressList from "~/components/common/AddressList";
import {useHistory} from 'react-router-dom'
import {upsertAddress} from "~/lib/shopApi";

const LocalAddressList = (props) => {
    const history = useHistory()

    const onChange = async (params) => {

        //기본배송지로 변경
        params.basicAddress = 1

        if (window.confirm(`[${params.receiverName}]는 기본 배송지로 변경 됩니다`)) {
            await upsertAddress('update', params)
            onClose()
        }
    }

    const onClose = (param) => {
        history.goBack();
    }

    return (
        <AddressList onChange={onChange} onClose={onClose}/>
    );
};

export default LocalAddressList;
