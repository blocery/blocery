import React, { useState, useEffect } from 'react';
import {Div, Span, Button, Flex, Hr, Right, Input} from '~/styledComponents/shared'
import {Modal, ModalBody, ModalHeader} from "reactstrap";
import BlySise from "~/components/common/blySise";
import { BLCT_TO_WON } from "~/lib/exchangeApi"
import { exchangePointToBly } from '~/lib/pointApi'
import ComUtil from "~/util/ComUtil";
import useInput from "~/hooks/useInput";
import useLogin from "~/hooks/useLogin";
import BlocerySpinner from "~/components/common/Spinner/BlocerySpinner";
import { throttle } from "lodash";

function PointToBlyContent({onSuccess = () => null}) {

    const {consumer, isServerLoggedIn, reFetch} = useLogin()
    const exchangePoint = useInput()
    const [blySiseModal, setBlySiseModal] = useState(false)
    const [blctToWon, setBlctToWon] = useState(sessionStorage.getItem('blctToWon'))
    const [buttonDisabled, setButtonDisabled] = useState(false)
    const [loading, setLoading] = useState(false)

    //하루한번 5000p로 하면서 막음. max버튼도 같이 막음.
    // useEffect(() => {
    //
    //     //포인트 변경시 전환가능여부 체크
    //     if (!exchangePoint.value) {
    //         setButtonDisabled(false)
    //     }
    //     else if (exchangePoint.value >= 5000 && exchangePoint.value <= consumer.point) {
    //         setButtonDisabled(false)
    //     }else{
    //         setButtonDisabled(true)
    //     }
    // }, [exchangePoint.value])

    useEffect(() => {
        exchangePoint.setValue(5000)

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

    // const setMaxPoint = () => {
    //     if(consumer.point < 5000) {
    //         alert("전환하기엔 포인트가 부족합니다.")
    //         return;
    //     }
    //     exchangePoint.setValue(consumer.point)
    // }

    const onPointToBlyClickThrottled = throttle(() => {
        onPointToBly();
    }, 1000);

    //전환하기
    const onPointToBly = async () => {

        // 어뷰저 체크
        if (await ComUtil.isBlockedAbuser()) {
            return
        }

        if(consumer.point < 5000) {
            alert("전환하기엔 포인트가 부족합니다.")
            return;
        }
        // if (!exchangePoint.value) {
        //     //alert('전환 포인트를 입력해주세요.')
        //     alert('하루에 한번만 가능합니다. 내일 다시 전환해 주세요.')
        //     return
        // }

        if (await isServerLoggedIn(true)) {

            setLoading(true)

            const {data:res} = await exchangePointToBly(ComUtil.toNum(exchangePoint.value));

            if(res === 200) {
                reFetch()
                onSuccess()
                alert('전환이 완료되었습니다.')
            } else if (res === 101) {
                alert('전환포인트가 현재포인트보다 많습니다. 포인트를 확인해주세요.')
            } else if (res === 102) {
                alert('하루에 한번만 가능합니다. 내일 다시 전환해 주세요.')
            } else if (res === 103) {
                alert('인증을 해주셔야 포인트를 블리로 전환이 가능합니다.')
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

                    {consumer.point < 5000 &&
                        <Flex justifyContent={'flex-end'} mt={8}>
                            <Div fontSize={12} fg={'red'}> * 포인트 부족 </Div>
                        </Flex>
                    }

                </Div>
                <Hr />
                {/*<Hr mb={20} />*/}
                <Div mt={30} alignItems={'flex-start'}>
                    <Flex>
                        <Div>
                            전환 포인트
                        </Div>
                        <Div fg={'darkBlack'} ml={5}>
                            <small>
                                {/*{`( 100P = ${ComUtil.roundDown(100 / blctToWon, 2)} BLY )`}*/}
                                (1p = 1원)
                            </small>
                        </Div>
                    </Flex>

                    <Flex mt={20}>
                        {/*<Button bg={'green'} fg={'white'} rounded={2} height={38} width={70} onClick={setMaxPoint}>최대</Button>*/}
                        <Div flexGrow={1} pl={8}>
                            <Input block hidden type='number' underline name={'exchangePoint'} style={{textAlign: 'right'}} placeholder={'0 P'} {...exchangePoint} />
                        </Div>
                        <Div> 5,000 P</Div>
                    </Flex>
                    <Flex justifyContent={'flex-end'} mt={8}>
                        <Div fontSize={12} fg={'secondary'}> *계정당 일 1회/5,000p 한정 </Div>
                    </Flex>
                </Div>

                <Div mt={40}>
                    <Div>남은 포인트</Div>
                    <Flex justifyContent={'flex-end'} fontSize={15} >{consumer.point - exchangePoint.value < 0 ? 0 : ComUtil.addCommas(consumer.point - exchangePoint.value)} P</Flex>
                </Div>

                <Hr my={10}/>

                <Flex mt={26}>
                    <Div>
                        획득 적립금
                    </Div>

                    <Button size={'sm'} px={8} py={0} ml={10} fontSize={9} bg={'green'} fg={'white'} rounded={10}
                            height={20} onClick={onBlySiseModalToggle}>BLY 시세확인</Button>

                </Flex>
                <Flex mt={10} justifyContent={'flex-end'} fontSize={20} fg={'bly'} bold>
                    { consumer.point >= 5000 ? `${ComUtil.roundDown(exchangePoint.value / blctToWon, 2)}` : '0' } BLY
                </Flex>
                <Hr my={10}/>
                {
                    (consumer.point - exchangePoint.value < 0) ?
                        <Button mt={20} block bg={'green'} fg={'white'} py={15} rounded={3} disabled={true}>전환하기</Button>
                        :
                        <Button mt={20} block bg={'green'} fg={'white'} py={15}  rounded={3} disabled={loading} onClick={onPointToBlyClickThrottled}>전환하기</Button>

                }
            </Div>
            <Div px={16} pb={20}>
                <Div fontSize={12} lineHeight={22}>
                    <Flex dot alignItems={'flex-start'}><Div>적립금 전환은 <Span fg={'green'}> 계정당 일 1회/5,000p 한정</Span></Div></Flex>
                    <Flex dot alignItems={'flex-start'}><Div><Span bold>포인트는 적립금(BLY)으로 전환하여 결제 시 사용</Span>할 수 있습니다.</Div></Flex>
                    <Flex dot alignItems={'flex-start'}><Div>포인트는 적립금인 BLY 토큰 시세로 계산되어 전환됩니다.</Div></Flex>
                    <Flex dot alignItems={'flex-start'}><Div>전환된 적립금(BLY)은 토큰 시세에 따라 매일 가격이 변동됩니다.</Div></Flex>
                    <Flex dot alignItems={'flex-start'}><Div>포인트로 전환하여 획득한 적립금은 '마이페이지 > 적립금' 에서 확인이 가능합니다.</Div></Flex>
                    <Flex dot alignItems={'flex-start'}><Div>적립금으로 전환된 포인트는 다시 전환할 수 없습니다.</Div></Flex>
                    <Flex dot alignItems={'flex-start'}><Div>포인트는 회원 등급과 연계되어 있으며, 적립금 전환 시 회원 등급이 낮아질 수 있습니다.</Div></Flex>
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
export default PointToBlyContent