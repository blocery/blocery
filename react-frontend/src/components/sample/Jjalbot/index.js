import React from 'react';
import {Div, Button, Flex, Right, WhiteSpace, Space, Img} from "~/styledComponents/shared";
import SearchJjalbot from '~/components/common/search/SearchJjalbot'
import {Modal, ModalBody, ModalHeader} from "reactstrap";
import {useModal} from "~/util/useModal";
import poweredByGiphy from '~/images/icons/poweredBy/giphy.png'
const JjalBot = (props) => {
    const [modalOpen, setModalOpen, selected, setSelected, setModalState, toggle] = useModal()

    const onChange = (imageUrls) => {
        toggle()
        console.log({imageUrls})
    }

    return (
        <div>

            <button onClick={toggle}>짤오픈</button>

            <Modal isOpen={modalOpen} title={'짤봇'} scrollable={true} toggle={toggle}>
                <ModalHeader toggle={toggle}>
                    <div>짤검색</div>
                    <Flex ml={16}>
                        <Img src={poweredByGiphy} height={26} alt={'powered by GIPHY'}/>
                    </Flex>
                </ModalHeader>
                <ModalBody style={{padding: 0}}>
                    <SearchJjalbot onChange={onChange}/>
                </ModalBody>
            </Modal>

        </div>
    );
};

export default JjalBot;
