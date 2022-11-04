import React, {useEffect, useState} from 'react';
import {
    updateOrderTrackingInfoByOrderSubGroupNo,
    getOrderSubGroupListByOrderSubGroupNos,
    updateOrderSubGroupProgressStateByOrderSubGroupNos
} from "~/lib/producerApi";
import {Spinner, Table} from "reactstrap";
import AdminLayouts from "~/styledComponents/shared/AdminLayouts";
import {Div, Flex, Space, Span, Strong} from "~/styledComponents/shared";
import {color} from "~/styledComponents/Properties";
import ComUtil from "~/util/ComUtil";

const PROGRESS_STATE = {0: '미확인', 1: '피킹중 🛒', 2: '피킹완료 📦', 3: '배송완료 🚛', 4: '배송시작 🏇', 99: '전체취소'}
const DESC = {0: '미확인 상태는 배송상태변경 불가', 1: '피킹중 상태는 배송상태변경 불가', 2: '배송상태변경 가능', 3: '이미 배송완료 처리됨', 4: '배송상태변경 가능', 99: '전체취소되어 배송상태변경 불가'}

const UpdateProgressStateModalContent = ({orderSubGroupNoList}) => {
    const [pinckingCompletedList, setPinckingCompletedList] = useState()
    const [possibleList, setPossibleList] = useState()
    const [impossibleList, setImpossibleList] = useState()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        search()
    }, [])

    const search = async () => {
        const {status, data} = await getOrderSubGroupListByOrderSubGroupNos(orderSubGroupNoList)
        if (status !== 200) {
            alert('네트워크 오류가 발생 하였습니다. 다시 시도 해 주세요.')
            return
        }

        let pinckingCompletedList = [] //피킹완료 리스트
        let possibleList = []          //피킹완료 및 배송시작 리스트
        let impossibleList = []

        data.map(orderSubGroup => {
            if ([2].includes(orderSubGroup.progressState)) {
                //피킹완료 : 배송시작 처리 가능
                pinckingCompletedList.push(orderSubGroup)
            }
            if ([2,4].includes(orderSubGroup.progressState)) {
                //피킹완료, 배송시작 : 배송완료 처리 가능
                possibleList.push(orderSubGroup)
            }else{
                impossibleList.push(orderSubGroup)
            }
        })

        setPinckingCompletedList(pinckingCompletedList)
        setPossibleList(possibleList)
        setImpossibleList(impossibleList)
        setLoading(false)

        console.log({data, possibleList, impossibleList})
    }

    //배송시작
    const onUpdateToShippingClick = async () => {
        if(!window.confirm(`${pinckingCompletedList.length}건을 배송시작으로 처리 하시겠습니까? 소비자 에게 "상품발송 시작 안내문구" 푸쉬가 전송 됩니다.`))
            return

        const orderSubGroupNos = pinckingCompletedList.map(item => item.orderSubGroupNo)

        const {status, data} = await updateOrderSubGroupProgressStateByOrderSubGroupNos({orderSubGroupNos, progressState: 4})

        if (status === 200) {
            if (!data.resCode) {
                alert(data.errMsg);
                return
            }

            alert(data.retData)
            search()
        }

    }

    //배송완료
    const onHandleClick = async () => {

        if(!window.confirm(`위 주의 사항을 읽었으며, ${possibleList.length}건을 배송완료 처리 하시겠습니까?`))
            return

        const promises = possibleList.map(item => updateOrderTrackingInfoByOrderSubGroupNo(item.orderSubGroupNo))

        const res = await Promise.all(promises)

        console.log({res})

        let failedCount = 0;

        res.map(({data}) => {
            if (!data) {
                failedCount++
            }
        })

        if (failedCount === 0) {
            alert(`${possibleList.length}건이 배송완료🚛 처리 되었습니다.`)
        }else{
            alert(`성공 ${possibleList.length - failedCount}건, ${failedCount}건 실패`)
        }

        search()
    }

    if (loading) return <Flex height={300} justifyContent={'center'}><Spinner color={'info'} /></Flex>

    return(
        <>
            {
                impossibleList.length > 0 && (
                    <Div mb={20} p={16} bc={'light'} rounded={4}>
                        <h6>배송상태 변경 불가 ({impossibleList.length}건)</h6>
                        <TableList data={impossibleList} />
                    </Div>
                )
            }

            {
                pinckingCompletedList.length > 0 && (
                    <Div mb={20} p={16} bc={'light'} rounded={4}>
                        <h6>[배송시작] 변경 가능
                            <Span ml={16}>
                                <u style={{cursor: 'pointer'}} onClick={onUpdateToShippingClick}>
                                    <Strong fg={'green'}>{pinckingCompletedList.length}건 배송시작 처리하기</Strong>
                                </u>
                            </Span>
                        </h6>
                        <TableList data={pinckingCompletedList} desc={'배송시작 가능'} />
                    </Div>
                )
            }

            {
                possibleList.length > 0 && (
                    <Div mb={16} p={16} bg={'veryLight'} bc={'light'} rounded={4}>
                        배송완료는 신중히 결정 해 주세요! <br/>
                        피킹완료 된 건만 배송완료 처리 가능 합니다.<br/>
                        배송완료는 배송기사가 배송 직후 <Strong fg={'green'}>QR 코드를 통해 배송완료를 누르는게 안전</Strong> 합니다.<br/>
                        배송완료 처리시 <Strong fg={'danger'}>사용자에게 핸드폰 푸쉬 알림이 전송 되며 되돌릴 수 없습니다!</Strong>
                    </Div>
                )
            }
            {
                possibleList.length > 0 && (
                    <Div mb={20} p={16} bc={'light'} rounded={4}>
                        <h6>[배송완료] 변경 가능
                            <Span ml={16}>
                                <u style={{cursor: 'pointer'}} onClick={onHandleClick}>
                                    <Strong fg={'green'}>{possibleList.length}건 배송완료 처리하기</Strong>
                                </u>
                            </Span>
                        </h6>
                        <TableList data={possibleList} desc={'배송완료 가능'} />
                    </Div>
                )
            }
            {
                (pinckingCompletedList.length === 0 && possibleList.length === 0) && <Flex justifyContent={'center'}><h4>배송상태 변경 할 수 있는 건이 없습니다.</h4></Flex>
            }
            {/*<AdminLayouts.MenuButton onClick={onHandleClick} disabled={possibleList.length === 0}>*/}
            {/*    {*/}
            {/*        possibleList.length === 0 ? '배송완료 불가능' : `${possibleList.length} 건 배송완료 처리`*/}
            {/*    }*/}
            {/*</AdminLayouts.MenuButton>*/}
        </>
    )
};

export default UpdateProgressStateModalContent;


function TableList({data}) {
    return(
        <Table size="sm" style={{marginBottom: 0, fontSize: 13}} responsive>
            <thead>
            <tr>
                <th width={90}>
                    상태
                </th>
                <th width={70}>
                    출력여부
                </th>
                <th width={83}>
                    주문그룹번호
                </th>
                <th width={100}>
                    주문자
                </th>
                <th width={102}>
                    건수(주문-취소)
                </th>
                <th>
                    배송일시
                </th>
                <th>
                    주소
                </th>
                <th>
                    비고
                </th>
            </tr>
            </thead>
            <tbody>
            {
                data.map((item, index) =>
                    <tr key={index}>
                        <th style={{color: item.progressState === 99 && color.danger}}>
                            {PROGRESS_STATE[item.progressState]}
                        </th>
                        <td>
                            {item.printed ? '출력완료' : '미완료'}
                        </td>
                        <td>
                            {item.orderSubGroupNo}
                        </td>
                        <td>
                            {item.consumerName}
                        </td>
                        <td>
                            {
                                (item.listSize - (item.cancelledDirectOrderCount+item.cancelledDealOrderCount))
                                + ' (' + item.listSize + '-' + (item.cancelledDirectOrderCount + item.cancelledDealOrderCount) + ')'
                            }
                        </td>
                        <td>
                            {ComUtil.utcToString(item.deliveryDate, 'MM/DD HH:mm')}
                            {
                                item.deliveryDate && ' ' + ComUtil.timeFromNow(item.deliveryDate)//`(${ComUtil.timeFromNow(item.deliveryDate)})`
                            }
                        </td>
                        <td>
                            {item.addr}
                        </td>
                        <td>
                            {DESC[item.progressState]}
                        </td>
                    </tr>
                )
            }
            </tbody>
        </Table>
    )
}