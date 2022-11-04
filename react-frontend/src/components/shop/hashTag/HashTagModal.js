import React, {useState, useEffect} from 'react';
import {useRecoilState} from "recoil";
import {boardTagModalState} from "~/recoilState";
import {Modal, ModalBody, ModalHeader} from "reactstrap";
import {Span, Input, Button} from "~/styledComponents/shared";

import CombinedSwiperContent from './CombinedSwiperContent'

const TagModal = (props) => {
    const [tagModalState, setTagModalState] = useRecoilState(boardTagModalState)
    const [searchValue, setSearchValue] = useState()
    const modalToggle = () => {
        setTagModalState({
            ...tagModalState,
            isOpen: !tagModalState.isOpen
        })
    }
    useEffect(() => {
        setSearchValue(tagModalState.tag)
    }, [tagModalState.tag]);

    const onSearchClick = () => {
        if (searchValue) {
            setTagModalState(prev => ({...prev, tag: searchValue}))
        }else{
            alert('검색할 내용을 입력해 주세요')
            return
        }
    }

    const onInputChange = e => {
        setSearchValue(e.target.value)
    }

    return (
        <Modal
            // size={'lg'}
            // centered={true}
            scrollable={false}
            isOpen={tagModalState.isOpen}
            toggle={modalToggle}>
            <ModalHeader toggle={modalToggle} style={{position: 'sticky', background: 'white', zIndex:2, top: 0}}>
                <Span fg={'bly'}>#{tagModalState.tag}</Span>
                {/*#<Input value={searchValue} onChange={onInputChange} /> <Button onClick={onSearchClick}>검색</Button>*/}
            </ModalHeader>
            <ModalBody style={{padding: 0, overflow: 'auto'}}>
                {
                    tagModalState.isOpen && <CombinedSwiperContent />
                }
            </ModalBody>
        </Modal>
    )
};

export default TagModal;
