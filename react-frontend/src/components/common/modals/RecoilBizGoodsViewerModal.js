import React from 'react';
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import {useRecoilState} from "recoil";
import BizGoodsViewer from "~/components/common/contents/BizGoodsViewer";
import {bizGoodsViewerModalState} from '~/recoilState'
const RecoilBizGoodsViewerModal = (props) => {

    const [state, setState] = useRecoilState(bizGoodsViewerModalState)

    const toggle = (refresh) => {

        const newState = {...state}

        if (refresh) {
            newState.timestamp = new Date();
        }

        if (state.isOpen) {
            setState({
                ...newState,
                isOpen: false,
                hashTagGroup: null,
                goodsNo: null,
            })
        }else{
            setState({
                ...newState,
                isOpen: true,
            })
        }
    }

    return (
        <div>
            <Modal isOpen={state.isOpen} toggle={toggle} centered size={'lg'}>
                <ModalHeader toggle={toggle}>상품상세보기</ModalHeader>
                <ModalBody style={{padding: 0}}>
                    <BizGoodsViewer
                        hashTagGroup={state.hashTagGroup}
                        goodsNo={state.goodsNo}
                        onClose={toggle.bind(this, true)}
                    />
                </ModalBody>
            </Modal>
        </div>
    );
};

export default RecoilBizGoodsViewerModal