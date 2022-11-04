import React, {useState} from 'react';
import {Button, Div, Input} from "~/styledComponents/shared";

const defaultReason = [
    '광고/홍보',
    '음란/선정/사행/불법',
    '어뷰징(도배, 좋아요 유도 등)',
    '허위 내용',
    '인격모독/타인비방',
    '기타'
]

const ReportReasonContent = ({onReportClick, onClose, additionalReason}) => {

    const store = additionalReason ? [...additionalReason, ...defaultReason] : defaultReason

    const [selectedReason, setSelectedReason] = useState('')
    const [reason, setReason] = useState(null)


    const onRadioChange = ({target}) => {
        const {value} = target

        setSelectedReason(value)

        if (value !== '기타') {
            setReason(value)
        }else{
            setReason('')
        }
    }

    const onInputChange = ({target}) => {
        setReason(target.value)
    }

    const onHandleClick = ({target}) => {
        if (window.confirm("신고해주신 내용은 관리자 검토 후 내부정책에 의거 조치가 진행됩니다. 신고 하시겠습니까?")) {
            onReportClick(reason)
        }
    }

    return(
        <Div>

            <Div px={20}>
                {
                    store.map((word, index) =>
                        <Div mb={10} key={`radio${index}`}>
                            <input name={'reason'} id={`reason${index}`} type={'radio'} value={word} onChange={onRadioChange} />
                            <label htmlFor={`reason${index}`} style={{marginLeft: 10}} >{word}</label>
                        </Div>
                    )
                }
                {
                    (selectedReason === '기타') && <Input mb={10} underLine block placeholder={'신고사유 작성'} value={reason} onChange={onInputChange}/>
                }
            </Div>


            <Div py={8} fontSize={14} textAlign={'center'}>
                신고해주신 내용은 관리자 검토 후 내부정책에 의거 조치가 진행됩니다.
            </Div>
            <Div textAlign={'center'}>
                <Button py={5} px={10} bg={'white'} bc={'dark'} disabled={!reason} onClick={onHandleClick} >신고하기</Button>
                {/*<Button py={5} px={10} bg={'white'} bc={'dark'} onClick={onClose} >닫기</Button>*/}
            </Div>
        </Div>
    )
};

export default ReportReasonContent;


