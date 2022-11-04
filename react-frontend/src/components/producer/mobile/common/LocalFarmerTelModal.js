import React, {useState} from 'react';
import {color} from "~/styledComponents/Properties";
import {Modal, ModalBody, ModalHeader} from "reactstrap";
import LocalFarmerContent from "~/components/outside/producer/dashboard/LocalFarmerContent";
import {Space, Span} from "~/styledComponents/shared";
import {useModal} from "~/util/useModal";
// <a href={`tel:${localfoodFarmer.phoneNum}`} style={{color: color.primary, textDecoration: 'underline'}}>{children}</a>
const LocalFarmerTelModal = ({localfoodFarmerNo, localFarmerName}) => {
    const [modalOpen, setModalOpen, selected, setSelected, setModalState, toggle] = useModal()
    return (
        <>
            <span style={{color: '#0032ff', cursor: 'pointer', fontWeight: 'bold'}} onClick={toggle}>
                {localFarmerName}
            </span>
            <Modal isOpen={modalOpen} toggle={toggle}>
                <ModalHeader toggle={toggle}>
                    농가
                </ModalHeader>
                <ModalBody>
                    {
                        modalOpen && <LocalFarmerContent localfoodFarmerNo={localfoodFarmerNo} />
                    }
                </ModalBody>
            </Modal>
        </>
    );
};

export default LocalFarmerTelModal;
