import React, {useEffect, useState} from 'react';
import SpinnerLoading from "~/components/common/Spinner/SpinnerLoading";
import {Table} from "reactstrap";
import {color} from "~/styledComponents/Properties";
import ComUtil from "~/util/ComUtil";
import {getOrderDetailListBySeqs} from "~/lib/producerApi";
import {AbsoluteMask, Div, GridColumns, Span} from "~/styledComponents/shared";
import {requestBuyOnCredit} from '~/lib/localfoodApi'

import {ON_CREDIT} from "~/components/producer/web/orderList/WebOrderList";

const ReqCreditModalContent = (props) => {
    //외상 요청실패 리스트
    const [reqFailedList, setReqFailedList] = useState([])

    //외상 취소요청실패 리스트
    const [reqCancelFailedList, setReqCancelFailedList] = useState([])

    //요청 불가능 리스트
    const [cannotReqList, setCannotReqList] = useState([])

    const [loading, setLoading] = useState(true)
    const [isFetching, setIsFetching] = useState(false)

    useEffect(() => {
        console.log(props.data)

        searchAll()
    }, [props.data])

    const searchAll = async () => {
        console.log("==searchAll==")
        const orderSeqList = props.data.map(od => od.orderSeq)
        const {status, data} = await getOrderDetailListBySeqs(orderSeqList)
        console.log({status, data: data})
        //onCredit;             //옥천전용 외상처리 상태: -1요청실패,   1:요청OK,   2: 확인API콜완료, -91:취소요청 실패, 91:취소요청OK, 92:취소API콜확인 완료)

        //외상 요청실패 리스트
        const reqFailedList = []
        //외상 취소요청실패 리스트
        const reqCancelFailedList = []
        //외상 및 취소 불가능 리스트
        const cannotReqList = []

        data.map(od => {
            if (od.onCredit === -1) {
                reqFailedList.push(od)
            }else if (od.onCredit === -91) {
                reqCancelFailedList.push(od)
            }else{
                cannotReqList.push(od)
            }
        })

        setReqFailedList(reqFailedList)             //외상 요청실패 리스트
        setReqCancelFailedList(reqCancelFailedList) //외상 취소요청실패 리스트
        setCannotReqList(cannotReqList)             //요청 불가능 리스트

        setLoading(false)
    }

    //외상요청 하기
    const onReqClick = async () => {

        if (window.confirm(`${reqFailedList.length}건 외상요청 하시겠습니까?`)) {

            setIsFetching(true)

            await reqFailedList.reduce(async (promise, od) => {
                // 누산값 받아오기 (2)
                await promise;
                // 누산값 변경 (3)
                await requestBuyOnCredit(od.orderSeq, false)
                // 다음 Promise 리턴
            }, {}); // 초기값 (1)

            setIsFetching(false)
            await searchAll()
        }

    }
    //외상취소요청 하기
    const onReqCancelClick = async () => {
        if (window.confirm(`${reqCancelFailedList.length}건 외상취소요청 하시겠습니까?`)) {

            setIsFetching(true)

            await reqCancelFailedList.reduce(async (promise, od) => {
                // 누산값 받아오기 (2)
                await promise;
                // 누산값 변경 (3)
                await requestBuyOnCredit(od.orderSeq, true)
                // console.log({res: res})

                // 다음 Promise 리턴
            }, {}); // 초기값 (1)

            setIsFetching(false)
            await searchAll()

        }
    }
    if (!props.data) return null

    if (loading) return <SpinnerLoading isMore={false} />

    return (
        <Div relative>
            {
                isFetching && <AbsoluteMask>요청 처리중입니다.<br/>화면을 닫지 마세요.</AbsoluteMask>
            }
            <button onClick={onReqClick}>외상요청 하기</button>
            <GridColumns repeat={0} colGap={0} rowGap={20}>

                {
                    reqFailedList.length > 0 && (
                        <div>
                            <Span fg={'primary'} cursor={1} mb={10} onClick={onReqClick}>{reqFailedList.length}건 외상요청 하기</Span>
                            <TableList data={reqFailedList} />
                        </div>
                    )
                }
                {
                    reqCancelFailedList.length > 0 && (
                        <div>
                            <Span fg={'primary'} cursor={1} mb={10} onClick={onReqCancelClick}>{reqCancelFailedList.length}건 외상취소요청 하기</Span>
                            <TableList data={reqCancelFailedList} />
                        </div>
                    )
                }
                {
                    cannotReqList.length > 0 && (
                        <div>
                            <Div mb={10}>요청 및 취소 불가 <small>(이미 요청되었거나 완료된 내역 입니다.)</small></Div>
                            <TableList data={cannotReqList} />
                        </div>
                    )
                }
            </GridColumns>
        </Div>
    );
};

export default ReqCreditModalContent;

function TableList({data}) {
    return(
        <Table size="sm" style={{marginBottom: 0, fontSize: 13}} responsive>
            <thead>
            <tr>
                <th width={90}>
                    외상처리상태
                </th>
                <th width={150}>
                    고유번호(그룹번호)
                </th>
                <th width={83}>
                    주문번호
                </th>
                <th>
                    수령자명
                </th>
                <th>
                    상품명
                </th>
                <th>
                    단가 × 주문수량
                </th>
                <th>
                    결제금액
                </th>
            </tr>
            </thead>
            <tbody>
            {
                data.map((item, index) =>
                    <tr key={index}>
                        <th style={{color: ON_CREDIT[item.onCredit].color}}>
                            {ON_CREDIT[item.onCredit].label}
                        </th>
                        <td>
                            {item.localKey}({item.orderSubGroupNo})
                        </td>
                        <td>
                            {item.orderSeq}
                        </td>
                        <td>
                            {item.receiverName}
                        </td>
                        <td>
                            {item.goodsNm}[{item.optionName}]
                        </td>
                        <td style={{textAlign:'right'}}>
                            {ComUtil.addCommas(item.currentPrice)} × {item.orderCnt}
                        </td>
                        <td style={{textAlign:'right'}}>
                            {ComUtil.addCommas(item.orderPrice)}
                        </td>
                    </tr>
                )
            }
            </tbody>
        </Table>
    )
}