import {Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import React from "react";
import ModalContent from './ModalContent'
function NumPadModal({title, modalOpen, toggle, onChange, children}) {
    return(
        <Modal isOpen={modalOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>
                {title}
            </ModalHeader>
            <ModalBody style={{padding: 0}}>
                {children}
                <ModalContent onChange={onChange} />
            </ModalBody>
        </Modal>
    )
}

export default NumPadModal