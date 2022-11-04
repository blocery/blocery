import React, {useState} from 'react';
import Checkbox from "~/components/common/checkboxes/Checkbox";
import {Button, Div, Space} from "~/styledComponents/shared";
import {Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import {B2cTermsOfUse11} from "~/components/common/termsOfUses/index";

const TermsOfUseCheckBox = ({innerRef, checked, disabled, onChange}) => {
    // const [agree, setAgree] = useState(checked)

    // const agreeChange = e => {
    //     // setAgree(e.target.checked)
    //     onChange(e.target.checked)
    // }

    const [termsOfUseModal, setTermsOfUseModal] = useState(false)
    const toggleTermsOfUseModal = () => {
        setTermsOfUseModal(!termsOfUseModal)
    }
    return (
        <>
            <Space spaceGap={8} pb={16} cursor={1}>
                <Checkbox innerRef={innerRef}
                          checked={checked}
                          onChange={onChange}
                          disabled={disabled}
                ></Checkbox>
                <Div onClick={toggleTermsOfUseModal}><u>이용약관 동의</u></Div>
            </Space>
            <Modal isOpen={termsOfUseModal} toggle={toggleTermsOfUseModal} centered>
                <ModalHeader toggle={toggleTermsOfUseModal} >이용약관 동의</ModalHeader>
                <ModalBody className={'p-0'}>
                    <B2cTermsOfUse11/>
                </ModalBody>
                <ModalFooter>
                    <Button bg="white" bc={'light'} px={20} onClick={toggleTermsOfUseModal}>확인</Button>
                </ModalFooter>
            </Modal>
        </>
    );
};

export default TermsOfUseCheckBox;
