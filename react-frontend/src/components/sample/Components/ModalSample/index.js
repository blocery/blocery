import {Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import React from "react";
import ModalContent from './ModalContent'
function ModalSample({title, keyword, filter, modalOpen, onCancel, onClose}) {
    return(
        <Modal isOpen={modalOpen} toggle={onCancel}>
            <ModalHeader>
                {title}
            </ModalHeader>
            <ModalBody style={{padding: 0}}>
                <ModalContent keyword={keyword} filter={filter} onClose={onClose} />
            </ModalBody>
            {/*<ModalFooter>*/}
            {/*    footer*/}
            {/*</ModalFooter>*/}
        </Modal>
    )
}

export default ModalSample