import React from 'react';
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";

import {useRecoilState} from "recoil";
import {consumerState, loginModalState} from "~/recoilState";
import loadable from '@loadable/component'

const ConsumerLogin = loadable(() => import('~/components/shop/login/ConsumerLogin') )

const LoginModal = (props) => {
    const [modalOpen, setModalOpen] = useRecoilState(loginModalState)

    const toggle = () => {
        setModalOpen(!modalOpen)
    }

    return (
        <Modal isOpen={modalOpen} centered toggle={toggle}>
            <ModalHeader toggle={toggle}>샵블리 로그인</ModalHeader>
            <ModalBody style={{padding: 0}}>
                <ConsumerLogin callback={toggle} minHeight={'calc(100vh - 59px - 50px)'}/>
            </ModalBody>
        </Modal>
    );
};

export default LoginModal;
