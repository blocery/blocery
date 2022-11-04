import React, {useState} from 'react';
import {Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import Textarea from "react-textarea-autosize";
import GoodsCard from "~/components/common/cards/GoodsCard";
import {Div, Button, Flex, Space, Hr} from "~/styledComponents/shared";
import useInput from "~/hooks/useInput";
import useLogin from "~/hooks/useLogin";
import Checkbox from "~/components/common/checkboxes/Checkbox";



const GoodsQueModal = ({goods, onClose}) => {

    const {consumer, isServerLoggedIn} = useLogin()
    const [isOpen, setIsOpen] = useState()
    const toggle = () => setIsOpen(!isOpen)

    const goodsQue = useInput()
    const [privateFlag, setPrivateFlag] = useState(false)

    const onDummyClick = e => {
        e.stopPropagation()
        e.preventDefault()
        return
    }

    const onQueClick = async () => {
        if (await isServerLoggedIn()) {
            toggle()
        }
    }

    async function save() {

        if(!goodsQue.value || goodsQue.value.length <= 0){
            alert('문의내용을 작성해 주세요')
            return
        }

        const params = {
            goodsQnaNo: null,
            goodsNo: goods.goodsNo,
            goodsName: null,
            consumerNo: null,
            consumerEmail: null,
            consumerName: null,
            goodsQue: goodsQue.value,
            goodsQueDate: null,
            producerNo: null,
            producerName: null,
            farmName: null,
            goodsAns: null,
            goodsAnsDate: null,
            goodsQnaStat: null,
            privateFlag: privateFlag
        }

        const {addGoodsQnA} = await import("~/lib/shopApi");

        //1. db 저장
        const {status, data} = await addGoodsQnA(params)

        if (status === 200) {
            //작성 성공
            if (data === 1) {
                goodsQue.setValue('')
                setPrivateFlag(false)
                toggle()
                //부모 콜백
                onClose()
            }else {
                //로그인 필요
            }
        }
    }

    const onPrivateFlagChange = e => {
        setPrivateFlag(e.target.checked)
    }

    return (
        <>
            <Button bg={'green'} fg={'white'} rounded={4} onClick={onQueClick} fontSize={14}>상품 문의하기</Button>
            <Modal size="lg" isOpen={isOpen}
                   toggle={toggle}>
                <ModalHeader toggle={toggle} >
                    상품문의
                </ModalHeader>
                <ModalBody style={{padding: 0}}>
                    {
                        consumer && (
                            <>
                                <Div relative>
                                    <Div absolute width={'100%'} height={'100%'} onClick={onDummyClick} zIndex={1}></Div>
                                    <GoodsCard goods={goods}/>
                                </Div>
                                <Div p={16}>
                                    <Div fontSize={13} lighter mb={10}>작성자 : {consumer.nickname}</Div>
                                    <Textarea
                                        style={{
                                            width: '100%',
                                            minHeight: 100,
                                            borderRadius: 4,
                                            border: '1px solid rgba(0,0,0,.125)'
                                        }}
                                        className={'border'}
                                        rows={3}
                                        maxRows={3}
                                        placeholder='상품에 대해 문의해 주세요'
                                        {...goodsQue}
                                    />
                                </Div>
                                <Div px={16}>
                                    <Checkbox bg={'green'} onChange={onPrivateFlagChange} checked={privateFlag} >비공개 문의</Checkbox>
                                </Div>
                                <Space justifyContent={'center'} p={16}>
                                    <Button bc={'green'} fg={'green'} px={10} onClick={save}>등록</Button>
                                    <Button bc={'dark'} fg={'dark'} px={10} onClick={toggle}>닫기</Button>
                                </Space>
                            </>
                        )
                    }


                </ModalBody>
            </Modal>
        </>
    );
};

export default GoodsQueModal;