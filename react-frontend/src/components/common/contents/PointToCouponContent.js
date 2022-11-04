import React, { useState, useEffect } from 'react';
import {Div, Span, Button, Flex, Hr, Right, Input} from '~/styledComponents/shared'
import {Modal, ModalBody, ModalHeader} from "reactstrap";
import BlySise from "~/components/common/blySise";
import { BLCT_TO_WON } from "~/lib/exchangeApi"
import { exchangePointToCoupon } from '~/lib/pointApi'
import ComUtil from "~/util/ComUtil";
import useInput from "~/hooks/useInput";
import useLogin from "~/hooks/useLogin";
import BlocerySpinner from "~/components/common/Spinner/BlocerySpinner";
import { throttle } from "lodash";

function PointToCouponContent({onSuccess = () => null}) {

    const {consumer, isServerLoggedIn, reFetch} = useLogin()
    const exchangePoint = 5000
    const [blySiseModal, setBlySiseModal] = useState(false)
    const [blctToWon, setBlctToWon] = useState(sessionStorage.getItem('blctToWon'))
    const [buttonDisabled, setButtonDisabled] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {

        //포인트 변경시 전환가능여부 체크
        if (!consumer) {
            setButtonDisabled(false)
        }
        else if (consumer.point >= 5000) {
            setButtonDisabled(false)
        }else{
            setButtonDisabled(true)
        }
    }, [consumer])

    useEffect(() => {
        searchBlctToWon();
        reFetch()
    }, []);

    const searchBlctToWon = async () => {
        const {data} = await BLCT_TO_WON()
        console.log('blctToWon : ', data);
        setBlctToWon(data)
    }

    //BLY 시세 모달 toggle
    const onBlySiseModalToggle = () => {
        setBlySiseModal(prev => !prev)
    }

    const onPointToCouponClickThrottled = throttle(() => {
        onPointToCoupon();
    }, 1000);

    //전환하기
    const onPointToCoupon = async () => {

        if (await isServerLoggedIn(true)) {

            setLoading(true)

            const {data:res} = await exchangePointToCoupon(ComUtil.toNum(exchangePoint));
            console.log(res);

            if(res === 200) {
                alert('쿠폰발급이 완료되었습니다. 마이페이지 쿠폰함에서 확인해 주세요')
                reFetch()
                onSuccess()
            } else if (res === 101) {
                alert('전환포인트가 현재포인트보다 많습니다. 포인트를 확인해주세요.')
            } else if (res === 103) {
                alert('인증을 해주셔야 포인트를 쿠폰으로 전환이 가능합니다.')
            } else {
                alert('오류가 발생했습니다. 다시 시도해주세요.')
            }

            setLoading(false)
        }

    }

    return(
        <>
            {
                loading && <BlocerySpinner/>
            }

            <Div px={16} pb={20} pt={10}>
                <Div mt={20} mb={10}>
                    <Div>현재 포인트</Div>
                    <Flex justifyContent={'flex-end'} fontSize={15} >{ComUtil.addCommas(consumer.point)} P</Flex>
                </Div>
                <Hr />
                {/*<Hr mb={20} />*/}
                <Div mt={30} alignItems={'flex-start'}>
                    <Flex>
                        <Div>
                            전환 포인트
                        </Div>
                    </Flex>

                    <Flex mt={10} justifyContent={'flex-end'} fontSize={20} fg={'bly'} bold>
                        5,000P
                    </Flex>
                    <Flex justifyContent={'flex-end'} mt={8}>
                        <Div fontSize={12} fg={'secondary'}> * 5,000p 단위로 전환 </Div>
                    </Flex>
                </Div>
                {
                    (consumer.point < 5000) &&
                    <Flex mt={8}>
                        <Right fg={'danger'}>
                            <small>
                                {
                                    '보유 포인트가 부족합니다. 5,000P 보유시에 전환 가능합니다'
                                }
                            </small>
                        </Right>
                    </Flex>

                }

                {/*<Hr mb={20} />*/}
                <Div mt={40}>
                    <Div>남는 포인트</Div>
                    <Flex justifyContent={'flex-end'} fontSize={15} >{consumer.point - exchangePoint < 0 ? 0 : ComUtil.addCommas(consumer.point - exchangePoint)} P</Flex>
                </Div>
                {/*<Hr mb={20} />*/}
                <Hr my={10}/>

                <Div textAlign={'right'}>
                    <Button size={'sm'} px={8} fontSize={9} bc={'bly'} bg={'white'} fg={'bly'} height={31} onClick={onBlySiseModalToggle}>BLY 시세확인</Button>
                </Div>

                <Flex mt={26}>
                    <Div>
                        획득쿠폰 예상가치
                    </Div>
                    <Button size={'sm'} px={8} py={0} ml={10} fontSize={9} bg={'green'} fg={'white'} rounded={10} height={20} onClick={onBlySiseModalToggle}>BLY 시세확인</Button>
                </Flex>
                <Flex mt={10} justifyContent={'flex-end'} fontSize={20} fg={'bly'} bold>
                    { consumer.point > exchangePoint ? `${ComUtil.roundDown(exchangePoint / blctToWon, 2)}` : '0' } BLY
                </Flex>
                <Hr my={10}/>
                <Button mt={20} block bg={'green'} fg={'white'} py={15}  rounded={3} disabled={buttonDisabled} onClick={onPointToCouponClickThrottled}>전환하기</Button>
            </Div>
            <Div px={16} pb={20}>
                <Div fontSize={12} lineHeight={22}>
                    <Flex dot alignItems={'flex-start'}><Div>쿠폰 전환은 <Span fg={'green'}>5,000p 단위로 가능</Span>합니다.</Div></Flex>
                    <Flex dot alignItems={'flex-start'}><Div><Span bold>포인트는 쿠폰(BLY)으로 전환하여 결제 시 사용</Span>할 수 있습니다.</Div></Flex>
                    <Flex dot alignItems={'flex-start'}><Div>쿠폰의 가격은 5,000p에 해당하는 BLY 토큰 시세로 계산되어 전환됩니다.</Div></Flex>
                    <Flex dot alignItems={'flex-start'}><Div>쿠폰의 가치는 BLY 토큰 시세에 따라 매일 가격이 변동됩니다.</Div></Flex>
                    {/*<Flex dot alignItems={'flex-start'}><Div>포인트로 전환하여 획득한 쿠폰은 '마이페이지 > 쿠폰' 에서 확인이 가능합니다.</Div></Flex>*/}
                    <Flex dot alignItems={'flex-start'}><Div>쿠폰으로 전환된 포인트는 다시 전환할 수 없습니다.</Div></Flex>
                    <Flex dot alignItems={'flex-start'}><Div>포인트는 회원 등급과 연계되어 있으며, 적립금 전환 시 회원 등급이 낮아질 수 있습니다.</Div></Flex>
                    <Flex dot alignItems={'flex-start'}><Div>발급된 <Span fg={'green'}>쿠폰에는 유효기간</Span>이 있습니다. 발급 후 [마이페이지>쿠폰]에서 반드시 확인 바랍니다.</Div></Flex>
                </Div>
            </Div>

            <Modal isOpen={blySiseModal} toggle={onBlySiseModalToggle} centered>
                <ModalHeader toggle={onBlySiseModalToggle}><b>BLY 시세</b></ModalHeader>
                <ModalBody>
                    <BlySise open={blySiseModal} />
                </ModalBody>
            </Modal>

        </>
    )
}
export default PointToCouponContent
