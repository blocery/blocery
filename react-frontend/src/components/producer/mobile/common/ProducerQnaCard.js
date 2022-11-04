import React, {useEffect, useState} from 'react';
import {useHistory, withRouter} from 'react-router-dom'
import {Div, Span, Flex, Img, WhiteSpace, Right} from "~/styledComponents/shared";
import {color} from "~/styledComponents/Properties";
import {Server} from '~/components/Properties'
import ComUtil from "~/util/ComUtil";
import styled from "styled-components";
import {getValue} from "~/styledComponents/Util";

import {IconReload} from '~/components/common/icons'
import { Badge, HrThin } from '~/styledComponents/mixedIn'
import Textarea from 'react-textarea-autosize'
import {getOrderDetailByOrderSeq, setGoodsQnaAnswerByGoodsQnaNo} from '~/lib/producerApi'

import {Button} from "~/styledComponents/shared";
import BasicSwiper from "~/components/common/swipers/BasicSwiper";
import useImageViewer from "~/hooks/useImageViewer";
import {toast} from "react-toastify";

const Answer = styled(Div)`
    font-size: ${getValue(12)};
    line-height: ${getValue(18)};
    // background-color: ${color.light};
    padding: ${getValue(10)}};
`;
const options = {
    lazy: true,
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
        dynamicBullets: true
    },
}
const ProducerQnaCard = ({
                             qaType, qaKind, qaClaimKind, qaClaimMethod, qaClaimProcStat,
                             bankName, bankAccount, bankAccountHolder, refundAmt = 0,
                             goodsQnaNo, goodsNo, goodsName, goodsQue, goodsAns, goodsQueDate, orderSeq,
                             qaImages,
                             producerNo, producerName, farmName, answerName,
                             goodsImages, goodsQnaStat, refreshCallback = () => null}) => {

    const {openImageViewer} = useImageViewer();

    const [order, setOrder] = useState(null)
    const [myAnswer, setMyAnswer] = useState('')
    const [goodsQnaProcess, setGoodsQnaProcess] = useState('')

    const history = useHistory()

    useEffect(() => {
        async function fetch(){
            await search();
        }

        fetch()

    }, []);

    const search = async () => {
        if(orderSeq > 0) {
            const {data: orderData} = await getOrderDetailByOrderSeq(orderSeq)
            setOrder(orderData)
        }
    }

    const onImageClick = (index) => {
        openImageViewer(qaImages, index)
    }

    const moveToGoodsDetail = (goodsNo) => {
        history.push(`/goods?goodsNo=${goodsNo}`)
    }

    const onAnswerChange = (e) => {
        setMyAnswer(e.target.value);
        setGoodsQnaProcess('processing');

        if (!e.target.value) { //빈 답변
            setGoodsQnaProcess('ready');
        }

    }

    const saveAnswer = async () => {

        if (myAnswer.replace(/\s/gi, '').length <= 0){
            alert('내용을 입력해 주세요');
            return false;
        }
        const myAnswerName = producerName+"("+farmName+")";

        let goodsQna = {
            goodsQnaNo:goodsQnaNo,
            goodsAns: myAnswer,
            goodsQnaStat: 'success',
            answerName : myAnswerName
        }

        // 미처리일경우 생산자가 답변을 달면 request
        if(qaClaimKind === "환불"){
            if(qaClaimMethod === "부분 환불"){
                if(qaClaimProcStat === null || qaClaimProcStat === "" || qaClaimProcStat === "request"){
                    goodsQna.qaClaimProcStat = "request";
                    goodsQna.goodsQnaStat = "processing";
                }
            }
        }

        //backend 저장.
        let {data} = await setGoodsQnaAnswerByGoodsQnaNo(goodsQna);
        if(data === -2){
            alert('소비자가 문의 취소하여 삭제한 문의내용입니다.');
            return
        }
        if (data != -1) {

            //list refresh
            refreshCallback()
        }

    }

    return (

        //goodsQna/index.js 에서 복사해서 사용중. (같이 고쳐야함)
        <Div m={16}>
            <div className={'p-2 small'}>
                {qaType === 0 && "[상품문의]"}{qaType === 1 && "[판매자문의]"}{qaType === 9 && "[고객센터문의]"}
            </div>
            <div className={'pl-2 pr-2 pb-2 small'}>
                {qaKind && <>{`${qaKind}`}</>} {qaClaimKind && <>{`> ${qaClaimKind}`}</>} {qaClaimMethod && <>{`> ${qaClaimMethod}`}</>}
            </div>
            {
                (qaClaimKind) &&
                <div className={'pl-2 pr-2 pb-2 small'}>
                    클레임 상태 : {qaClaimProcStat === null && "미처리"}{qaClaimProcStat === "" && "미처리"}{qaClaimProcStat === "request" && "생산자요청"}{qaClaimProcStat === "reject" && "반려"}{qaClaimProcStat === "confirm" && "승인"}
                </div>
            }
            {
                (qaClaimKind) && <>
                    <div className={'pl-2 pr-2 pb-2 small'}>
                        {
                            ( (qaClaimMethod) && qaClaimMethod === '부분 환불') &&
                            <>
                                <Div p={2}>
                                   환불정보 : 은행 {bankName} / 계좌번호 {bankAccount} / 예금주 {bankAccountHolder}
                                </Div>
                                {
                                    refundAmt > 0 &&
                                    <Div p={2}>환불금액 : {ComUtil.addCommas(refundAmt)}</Div>
                                }
                            </>
                        }
                    </div>
                </>
            }

            {
                goodsNo > 0 &&
                <Flex bg={'white'} cursor={1} onClick={moveToGoodsDetail.bind(this,goodsNo)}>
                    {goodsImages.length > 0 &&
                    <Div m={10} width={36} flexShrink={0} height={36} flexShrink={0}>
                        <Img src={Server.getThumbnailURL() + goodsImages[0].imageUrl} alt={'사진'}/>
                    </Div>
                    }
                    <Div>
                        <Div fg={'dark'} fontSize={12} lineClamp={1}>{goodsName}</Div>
                    </Div>
                </Flex>
            }
            <Div p={5} bg={'white'} fg={'secondary'} fontSize={12} >
                {orderSeq > 0 && '주문번호:'+orderSeq} {order && <> / 주문금액: {ComUtil.addCommas(order.adminOrderPrice)} </>}
            </Div>
            <Div cursor={1}>
                <WhiteSpace fontSize={14} mb={8} mt={8} >{goodsQue}</WhiteSpace>
                <Div p={2} >
                    {
                        qaImages && qaImages.length > 0 &&
                        <BasicSwiper options={options}>
                            {
                                qaImages.map((image, index) =>
                                    <Img key={'qaImage'+index+'_'+image.imageUrl}
                                         maxWidth={150}
                                         maxHeight={150}
                                         cover
                                         src={Server.getThumbnailURL() + image.imageUrl}
                                         onClick={openImageViewer.bind(this, qaImages, index)}
                                    />
                                )
                            }
                        </BasicSwiper>
                    }
                </Div>
                <Flex mt={8}>
                    <Div fontSize={12} fg={'dark'}>{ComUtil.utcToString(goodsQueDate, 'YYYY.MM.DD HH:mm')}</Div>
                    <Right>
                        {(goodsQnaProcess) === 'processing' ?
                            <Button fg={'white'} bg={'green'} fontSize={13} onClick={ saveAnswer }>답변</Button>
                            :
                            (goodsQnaStat) === 'ready' && <Button disabled fontSize={13} >대기</Button>
                        }
                    </Right>
                </Flex>
            </Div>

            <Answer mt={16}>
                <Flex>
                    <IconReload />
                    <Div mb={4} fg='adjust'>내 답변</Div>
                </Flex>

                <Div mb={7} ml={18}>
                    {(goodsQnaStat) === 'success'?
                        <Div> {goodsAns} </Div>
                        :
                        <Textarea
                            name="goodsAns"
                            style={{width: '100%', minHeight: 50, borderRadius: 1, border: '1px solid rgba(0,0,0,.125)'}}
                            className={'border-info'}
                            rows={3}
                            maxRows={3}
                            onChange={onAnswerChange}
                        />
                    }
                </Div>
            </Answer>


            <HrThin mt={15} />
        </Div>
    );
};

export default React.memo(withRouter(ProducerQnaCard));
