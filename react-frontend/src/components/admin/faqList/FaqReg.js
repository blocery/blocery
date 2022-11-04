import React, {useState, useEffect, Fragment} from 'react';
import {Col, Input, Label, Row} from "reactstrap";
import {Button, Div, Hr} from "~/styledComponents/shared"

import {regFaq, regNotice} from "~/lib/adminApi";
import SummernoteEditor from "~/components/common/summernoteEditor";
import FAQ_STORE from "~/components/shop/mypage/consumerCenter/FaqStore"

const store = Object.values(FAQ_STORE).map(faq => ({
    faqType: faq.faqType,
    name: faq.name
}))

const FaqReg = (props) => {
    console.log({props})
    const [faqNo, setFaqNo] = useState(props.faqData.faqNo || null)
    const [faqType, setFaqType] = useState(props.faqData.faqType || 'myInfo')
    const [title, setTitle] = useState(props.faqData.title || '')
    const [content, setContent] = useState(props.faqData.content || '')
    const [content1, setContent1] = useState('<p>당신</p>')
    // useEffect(() => {
    //     if (faqNo) {
    //         console.log({content})
    //         setContent(content)
    //     }
    // }, [faqNo])

    const onSelectFaqType = (e) => {
        console.log(e.target)
        setFaqType(e.target.selectedOptions[0].value);
    }

    const onChangeTitle = (e) => {
        setTitle(e.target.value);
    }

    const onChangeContent = (data) => {
        setContent(data);
    }

    const onSaveFaq = async () => {
        const faq = {
            faqNo: faqNo,
            title: title,
            content: content,
            faqType: faqType,
        }

        const { status, data } = await regFaq(faq);
        if(data) {
            alert('FAQ를 등록하였습니다.')
            props.onClose();
        } else {
            alert('FAQ 등록에 실패하였습니다.')
        }
    }

    return (
        <Fragment>
            <br/>
            <Row>
                <Col xs={'5'}> FAQ 유형 </Col>
                <Col xs={'7'}>
                    <Input type='select' name='select' id='faqType' onChange={onSelectFaqType}>

                        {
                            store.map( faq => {
                                return (
                                    <option name={'radio_'+faq.faqType } value={faq.faqType} selected={ faqType === faq.faqType }> {faq.name}</option>
                                )
                            })
                        }
                        {/*위 store.map으로 치환*/}
                        {/*<option name='radio_myInfo' value='myInfo' selected={ faqType === 'myInfo' }>나의 정보관리</option>*/}
                        {/*<option name='radio_order' value='order' selected={ faqType === 'order' }>주문/결제</option>*/}
                        {/*<option name='radio_delivery' value='delivery' selected={ faqType === 'delivery' }>배송</option>*/}
                        {/*<option name='radio_cancel' value='cancel' selected={ faqType === 'cancel' }>취소/반품/교환</option>*/}
                        {/*<option name='radio_point' value='point' selected={ faqType === 'point' }>코인/포인트</option>*/}
                        {/*<option name='radio_service' value='service' selected={ faqType === 'service' }>서비스/기타</option>*/}
                    </Input>
                </Col>
            </Row>
            <br/>
            <Hr/>
            <br/><br/>
            <Label className={'text-secondary'}><b>FAQ 제목</b></Label>
            <Input type='text' value={title} onChange={onChangeTitle}/>

            <br/>
            <Label className={'text-secondary'}><b>FAQ 내용</b></Label>
            <SummernoteEditor quality={1} onChange={onChangeContent} editorHtml={content} />
            <br/><br/>

            <div className={'text-right'}>
                <Button rounded={2} width={100} onClick={onSaveFaq} >등 록</Button>
            </div>
        </Fragment>
    )
}

export default FaqReg;