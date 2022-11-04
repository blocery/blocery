import React, {useEffect, useRef, useState} from 'react'
import {Button, Div, Divider, Flex, Hr, Right, Space, Span} from "~/styledComponents/shared";
// import {MdLocationOn, MdSettings} from "react-icons/md";
// import {GrLocation} from "react-icons/gr";
import {HiOutlineLocationMarker} from 'react-icons/hi'
import {MdLocationPin} from 'react-icons/md'

import {useHistory} from 'react-router-dom'
import useLogin from "~/hooks/useLogin";
import {getConsumer} from "~/lib/shopApi";
import {getLocalfoodDeliveryText, getLocalfoodProducer} from "~/lib/localfoodApi";
import ComUtil from "~/util/ComUtil";
import {getValue} from "~/styledComponents/Util";
import {color} from "~/styledComponents/Properties";
import {IoIosArrowForward} from 'react-icons/io'
import {Spinner} from "reactstrap";
import {useRecoilState} from "recoil";
// import {localDeliveryState} from "~/recoilState";

const NO_BASIC_ADDRESS_MSG = "배송지를 설정해 주세요"

const LocalAddressCard = ({producerNo, style = {}}) => {

    const history = useHistory()
    const {consumer, isServerLoggedIn} = useLogin() //login정보
    const [basicAddress, setBasicAddress] = useState() //consumer정보.
    //배송가능 여부
    // const [isLocalDelivery, setLocalDelivery] = useRecoilState(localDeliveryState)

    //localStore 에서 진입시 값이 들어옴. 옥천=157
    const [deliveryStatusInfo, setDeliveryStatusInfo] = useState() //ErrorRes 리턴 배송불가지역(옥천, 대전 가능), 지금주문하면 오늘도착 등.

    const onLinkClick = async (to) => {
        if (await isServerLoggedIn()) {
            //앱처럼 부드럽게
            await ComUtil.delay(100)
            history.push('/local/addressList')
        }
    }

    useEffect(() => {
        async function fetch(){

            if (consumer) {
                let {data: consumerInfo} = await getConsumer();
                // setConsumerInfo(data)

                setBasicAddress(getBasicAddr(consumerInfo))

                // }
            }else{
                setBasicAddress(NO_BASIC_ADDRESS_MSG)
            }



            // 로그인 X : 0, "배송지를 설정해 주세요"
            // 로그인 O 배송지 없으면 : 0, "배송지를 설정해 주세요"
            // 로그인 O producerNo X : 1, ""
            // 로그인 O producerNo O 배송가능지역 : 2, "x시 이내 배송가능"
            // 로그인 O producerNo X 배송불가능지역 : 3, "배송 불가능한 지역"
            // if (producerNo) { //localStore 에서 진입시에만 호출됨. => 무조건 진입으로 변경
            let {data: errorRes} = await getLocalfoodDeliveryText(producerNo);
            console.log({errorRes: errorRes})
            setDeliveryStatusInfo(errorRes)

            // if (!readOnly) {
            //     //전역 변수에 배송가능 여부 추가
            //     if (!consumer)
            //         setLocalDelivery(null)
            //     else
            //         setLocalDelivery(errorRes.resCode === 2 ? true : false)
            // }

        }
        fetch()
    }, [consumer])

    //주소 array(>0) 로 기본배송지 찾기. 기본배송지 없으면 0번리턴 : localStore의 경우 백엔드에 getLocalfoodDeliveryText에도 동일로직 존재.
    const getBasicAddr = (consumerInfo) => {
        try {
            if (consumerInfo && consumerInfo.consumerAddresses.length > 0) {
                const consumerAddresses = consumerInfo.consumerAddresses

                const addressInfo = consumerAddresses.find(addr => addr.basicAddress)
                //기본 배송지가 있을때
                if (addressInfo) {
                    return addressInfo.addr
                }else{ //0번째 배송지
                    return consumerAddresses[0].addr
                }
            }
        }catch (e){
            return NO_BASIC_ADDRESS_MSG
        }

        return NO_BASIC_ADDRESS_MSG
    }

    if (!deliveryStatusInfo) return <Flex cursor minHeight={67} justifyContent={'center'}><Spinner color={'success'}/></Flex>

    return (

        <Flex cursor px={14} py={10} bg={'veryLight'} doActive onClick={onLinkClick} {...style}>
            <Div flexShrink={0} pr={6}>
                <MdLocationPin color={color.danger} size={20} />
            </Div>
            <div>
                <Div fontSize={14} lineHeight={'normal'} lineClamp={1}>
                    {basicAddress}
                </Div>
                {
                    //배송가능, 배송불가 같은 이슈가 있는 경우
                    [2,3].includes(deliveryStatusInfo.resCode) && (
                        <Div fontSize={14} lineHeight={'normal'} fg={deliveryStatusInfo.resCode === 2 ? 'green' : 'danger'} mt={4}>
                            {deliveryStatusInfo.retData}
                        </Div>
                    )
                }
            </div>

            <Right pl={6} flexShrink={0}>
                <IoIosArrowForward/>
            </Right>
        </Flex>
    )
}
export default LocalAddressCard