import React, {useState, useEffect} from 'react';
import {Div} from "~/styledComponents/shared";
import {Button, Container, Input, Label} from "reactstrap";
import {DateRangePicker, SingleDatePicker} from "react-dates";
import moment from "moment-timezone";

import {saveBlockPummok, updateBlockPummok, removeBlockPummok} from '~/lib/adminApi'

const BlockPummokReg = (props) => {

    const [isNew, setIsNew] = useState(true);
    const [itemNoList, setItemNoList] = useState(null)
    const [producerNo, setProducerNo] = useState(157)

    const [pummokData, setPummokData] = useState({});

    const [dateFocused, setDateFocused] = useState(false)
    const [endDateFocused, setEndDateFocused] = useState(false)

    useEffect(() => {

        if(props.data) {
            const data = {
                itemNo: props.data.itemNo,
                desc : props.data.desc,
                itemName: props.data.itemName,
                blockStartDate: props.data.blockStartDate,
                blockEndDate: props.data.blockEndDate,
                localFarmerNoInt: props.data.localFarmerNoInt,
                itemNoDotLocalFarmerNo: props.data.itemNoDotLocalFarmerNo
            }
            setPummokData(data);
            setItemNoList(data.itemNo)
            setIsNew(false);
        }
    }, []);

    const onSaveBlockPummok = async() => {

        // 신규등록
        if(isNew) {
            if(null === itemNoList) {
                alert('품목번호는 필수입니다.');
                return;
            }
            const {data} = await saveBlockPummok(producerNo, itemNoList, pummokData);
            if(data.resCode === 0) {
                alert('저장되었습니다.');
                props.onClose();
            } else {
                alert(data.errMsg);
            }

        } else { // 수정
            const {data} = await updateBlockPummok(producerNo, pummokData);
            if(data) {
                alert('수정되었습니다.');
                props.onClose();
            } else {
                alert('로그인 확인 후 다시 시도해주세요');
            }

        }
    }

    const onDeleteBlockPummok = async() => {

        if(!window.confirm('해당 품목을 차단목록에서 삭제 하시겠습니까?')) {
            return false

        } else {

            const {data} = await removeBlockPummok(producerNo, pummokData);
            if(data) {
                alert('삭제되었습니다.');
                props.onClose();
            } else {
                alert('로그인 확인 후 다시 시도해주세요');
            }
        }
    }

    const onCalendarDatesChange =  ({ startDate, endDate })=> {

        let date1 = startDate && startDate.endOf('day').format('YYYYMMDD');
        let date2 = endDate && endDate.endOf('day').format('YYYYMMDD');
        if(null === startDate)
            date1 = 0

        if(null === endDate)
            date2 = 0

        setPummokData({
            ...pummokData,
            blockStartDate: date1,
            blockEndDate: date2
        })
    }

    const onChangeItemNoList = (e) => {
        setItemNoList(e.target.value);
    }

    const onChangeItemName = (e) => {
        setPummokData({
            ...pummokData,
            itemName: e.target.value
        })
    }

    const onChangeDesc = (e) => {
        setPummokData({
            ...pummokData,
            desc: e.target.value
        })

    }

    const onChangeLocalFarmerNo = (e) => {
        setPummokData({
            ...pummokData,
            localFarmerNoInt: e.target.value
        })
    }


    return (
        <Container>
            <Div mb={15}>
                <Label className={'text-secondary'}><b>품목코드</b></Label>
                <div>
                    <Input disabled={!isNew} type='text' value={itemNoList} placeholder={',로 여러개 입력 가능'} onChange={onChangeItemNoList}/>
                </div>
            </Div>

            <Div mb={15}>
                <Label className={'text-secondary'}><b>품목명</b></Label>
                <div>
                    <Input type='text' value={pummokData.itemName} onChange={onChangeItemName}/>
                </div>
            </Div>

            <Div mb={15}>
                <Label className={'text-secondary'}><b>사유</b></Label>
                <Input type='text' value={pummokData.desc} onChange={onChangeDesc}/>
            </Div>


            <Div mb={15}>
                <Label className={'text-secondary'}><b>차단기간</b></Label>
                <div>
                    <DateRangePicker
                        startDateId='blockStartDate'
                        endDateId='blockEndDate'
                        startDatePlaceholderText="시작일"
                        endDatePlaceholderText="종료일"
                        startDate={pummokData.blockStartDate ? moment(pummokData.blockStartDate,'YYYYMMDD') : null}
                        endDate={pummokData.blockEndDate ? moment(pummokData.blockEndDate,'YYYYMMDD') : null}
                        onDatesChange={onCalendarDatesChange}
                        focusedInput={dateFocused}
                        onFocusChange={(focused) => {setDateFocused(focused)}}
                        numberOfMonths={1}          //달력 갯수(2개로 하면 모바일에서는 옆으로 들어가버리기 때문에 orientation='vertical'로 해야함), pc 에서는 상관없음
                        orientation={'horizontal'}
                        openDirection="up"
                        isOutsideRange={()=>false}
                        withPortal
                        small
                        readOnly
                        showClearDates
                        calendarInfoPosition="top"
                    />
                </div>
            </Div>
            <Div mb={15}>
                <Label className={'text-secondary'}><b>농가바코드번호</b></Label>
                <Input disabled={!isNew} type='number' value={pummokData.localFarmerNoInt} onChange={onChangeLocalFarmerNo}/>
            </Div>

            <div className={'text-center'}>
                <Button className={'rounded-2 mr-3'} style={{width:"100px"}} onClick={onSaveBlockPummok}>
                    {
                       isNew ? "등록":"수정"
                    }
                </Button>

                {
                    !isNew && <Button className={'rounded-2 '} style={{width:"100px"}} onClick={onDeleteBlockPummok}> 삭제 </Button>
                }
            </div>

        </Container>
    )



}

export default BlockPummokReg