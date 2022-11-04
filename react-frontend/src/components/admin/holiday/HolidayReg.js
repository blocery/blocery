import React, {useState, useEffect, Fragment} from 'react';
import {Alert, Container, Input, Row, Col, Label, Button, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap'
import {regHoliday, regNotice} from '~/lib/adminApi'
import { SingleDatePicker } from 'react-dates';
import moment from 'moment-timezone'
import Select from 'react-select'
import ComUtil from '~/util/ComUtil'
import {Button as StButton, Div, Flex, Input as StInput} from "~/styledComponents/shared";
import {MenuButton} from "~/styledComponents/shared/AdminLayouts";
import {FaSearchPlus} from "react-icons/fa";
import ProducerList from "~/components/common/modalContents/producerList";

const HoliDayReg = (props) => { // props에 수정할 공지사항 key를 넘겨서 db 조회해서 보여줘야함

    const [producerModalOpen, setProducerModalOpen] = useState(false);

    const [key, setKey] = useState(props.data.key || null)
    const [producerNo, setProducerNo] = useState(props.data.producerNo || 0)
    const [producerName, setProducerName] = useState((props.data.producerInfo && props.data.producerInfo.farmName) || '')
    const [yyyymmdd, setYyyymmdd] = useState(props.data.yyyymmdd || '')
    const [desc, setDesc] = useState(props.data.desc || '')

    const [yyyymmddFocused, setYyyymmddFocused] = useState(false)

    useEffect(() => {
        // console.log('props : ' , props);

        if(!props.data.key) {
            let now = ComUtil.getNow();
            let v_nowDate = moment(now).format('YYYYMMDD');
            setYyyymmdd(v_nowDate);
        } else {

        }
    }, []);

    const onSaveHoliday= async () => {
        const holiday = {
            key: key,
            producerNo: producerNo,
            yyyymmdd: yyyymmdd,
            desc: desc
        }
        const { status, data } = await regHoliday(holiday);
        if (status === 200 && data) {
            if (data.resCode) {
                alert(data.errMsg);
                return;
            }else{
                alert('저장 처리되였습니다.')
                props.onClose();
            }
        }
    }

    //오늘의 생산자 클릭
    const onProducerClick = () => {
        toggleProducerModal();
    }

    const onProducerClearClick = () => {
        setProducerNo(0);
        setProducerName("");
    }

    const onProducerModalClosed = async (data) => {
        if (data) {
            setProducerNo(data.producerNo);
            setProducerName(data.farmName)
        }
        toggleProducerModal();
    }

    const toggleProducerModal = () => {
        setProducerModalOpen(!producerModalOpen);
    }


    const onChangeDesc = (e) => {
        setDesc(e.target.value);
    }

    //일자 달력
    const onCalendarDatesChange = (date) => {
        let v_date = date.endOf('day').format('YYYYMMDD');
        setYyyymmdd(v_date);
    }

    const renderStartCalendarInfo = () => <Alert className='m-1'>날짜를 선택해 주세요</Alert>;


    return(
        <Container>
            <Div mb={5}>
                <Label className={'text-secondary'}><b>공휴일 대상 (생산자 0번은 전체로컬적용 공통 공휴일)</b></Label>
                <div>
                    <Flex bc={'secondary'}>
                        <StInput readOnly={true} width={70} value={producerNo} mr={5} />
                        <StInput readOnly={true} width={200} value={producerName} mr={5} />
                        {
                            key == null && <>
                                <MenuButton bg={'green'} fg={'white'} onClick={onProducerClick} px={10} mr={5}><FaSearchPlus/>{' 생산자검색'}</MenuButton>
                                <MenuButton bg={'green'} fg={'white'} onClick={onProducerClearClick} px={10}>{'초기화'}</MenuButton>
                            </>
                        }
                    </Flex>
                </div>
            </Div>
            <Div mb={5}>
                <Label className={'text-secondary'}><b>날짜</b></Label>
                <div>
                    {
                        key == null ?
                            <SingleDatePicker
                                placeholder="날짜"
                                date={yyyymmdd ? moment(yyyymmdd,'YYYYMMDD') : null}
                                onDateChange={onCalendarDatesChange.bind(this)}
                                focused={yyyymmddFocused}
                                onFocusChange={({ focused }) => {
                                    setYyyymmddFocused(focused)
                                    console.log({focused})
                                }}
                                id={"yyyymmdd"}
                                numberOfMonths={1}
                                withPortal
                                isOutsideRange={()=>false}
                                small
                                readOnly
                                calendarInfoPosition="top"
                                enableOutsideDays
                                // daySize={45}
                                verticalHeight={700}
                                renderCalendarInfo={renderStartCalendarInfo.bind(this)}
                            />
                            :
                            moment(yyyymmdd,"YYYYMMDD").format("YYYY-MM-DD")
                    }
                </div>
            </Div>

            <Div mb={5}>
                <Label className={'text-secondary'}><b>비고</b></Label>
                <Input type='text' value={desc} placeholder={'추석,추석전날,설날,설날전날,휴무 등'} onChange={onChangeDesc}/>
            </Div>

            <div className={'text-right'}>
                <Button className={'rounded-2 '} style={{width:"100px"}} onClick={onSaveHoliday}>
                    {
                        key == null ? "등 록":"수 정"
                    }
                </Button>
            </div>

            {/*생산자 모달 */}
            <Modal size="lg" isOpen={producerModalOpen}
                   toggle={toggleProducerModal} >
                <ModalHeader toggle={toggleProducerModal}>
                    생산자 검색
                </ModalHeader>
                <ModalBody>
                    <ProducerList onClose={onProducerModalClosed}/>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={toggleProducerModal}>취소</Button>
                </ModalFooter>
            </Modal>
        </Container>
    )
}

export default HoliDayReg