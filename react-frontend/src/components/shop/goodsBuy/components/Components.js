//선물하기
import {deliveryMsgStore, giftMsgStore} from "~/store";
import React, {useEffect, useRef, useState} from "react";
import {
    Button,
    Div,
    Fixed,
    Flex,
    Hr,
    Img,
    Input,
    JustListSpace,
    ListBorder, ListSpace,
    Right,
    Space,
    Span
} from "~/styledComponents/shared";
import Checkbox from "~/components/common/checkboxes/Checkbox";
import {FaGift} from "react-icons/fa";
import {Collapse, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import BasicSelect from "~/components/common/selectBoxes/BasicSelect";
import {RiKakaoTalkFill} from "react-icons/ri";
import {color} from "~/styledComponents/Properties";

import Atoms from './Atoms'
import {getConsumer} from "~/lib/shopApi";
import {useModal} from "~/util/useModal";
import Skeleton from "~/components/common/cards/Skeleton";
import loadable from "@loadable/component";
import {GiSpeaker} from "react-icons/gi";
import ComUtil from "~/util/ComUtil";
import styled, {css} from "styled-components";
// import ReactSlider from "react-slider";
import {getValue} from "~/styledComponents/Util";
import {checkPassPhrase} from "~/lib/loginApi";
import {PassPhrase} from "~/components/common";
import MathUtil from "~/util/MathUtil";

const AddressList = loadable(() => import('~/components/common/AddressList'))

export function Gift({giftInfo = {gift: false, senderName: '', giftMsg: giftMsgStore[0].label}, setGiftInfo }) {
    const [selectedGiftMsg, setSelectedGiftMsg] = useState(giftMsgStore[0].value)
    const onChangeGift = () => {
        // setGiftInfo({...giftInfo, gift: !giftInfo.gift})
        setStateValue('gift', !giftInfo.gift)
    }
    const onSenderNameChange = e => {
        // setGiftInfo({...giftInfo, senderName: e.target.value})
        setStateValue('senderName', e.target.value)
    }
    const onGiftMsgSelectChange = e => {
        const value = e.target.value
        const store = giftMsgStore.find(store => store.value === value)
        if (value == 'direct' || value == '') {   //직접입력 or 없음
            setStateValue('giftMsg', '')

        }else{
            setStateValue('giftMsg', store.label)
        }

        setSelectedGiftMsg(store.value)
    }
    const giftMsgInputChange = e => {
        setStateValue('giftMsg', e.target.value)
    }

    const setStateValue = (key, value) => {
        setGiftInfo({...giftInfo, [key]: value})
    }

    return(
        <Div>
            <Flex px={16} py={20}>
                <Checkbox icon={FaGift} bg={'danger'} onChange={onChangeGift} checked={giftInfo.gift} size={'md'}>선물하기</Checkbox>
            </Flex>
            <Collapse isOpen={giftInfo.gift}>
                <Div px={16} pb={16}>
                    <Atoms.ItemHeader pb={20}>
                        보내는 사람 정보
                    </Atoms.ItemHeader>
                    <Div>
                        <Flex alignItems={'flex-start'}>
                            <Div fontSize={12} fg={'darkBlack'} minWidth={100}>보내는 사람</Div>
                            <Div flexGrow={1}><Input block value={giftInfo.senderName} onChange={onSenderNameChange} /></Div>
                        </Flex>
                        <Flex alignItems={'flex-start'} mt={10}>
                            <Div fontSize={12} fg={'darkBlack'} minWidth={100}>보내는 메시지</Div>
                            <Div flexGrow={1}>
                                <BasicSelect data={giftMsgStore} onChange={onGiftMsgSelectChange}/>
                                {/*<StyledSelect onChange={onGiftMsgSelectChange}>*/}
                                {/*    {*/}
                                {/*        giftMsgStore.map(item => <option value={item.value}>{item.label}</option>)*/}
                                {/*    }*/}
                                {/*</StyledSelect>*/}
                            </Div>
                        </Flex>
                        {
                            (selectedGiftMsg === 'direct') &&
                            <Input mt={10} block placeholder='보내는 메세지를 입력해 주세요.(최대30자)' maxLength="30" value={giftInfo.giftMsg} onChange={giftMsgInputChange} />
                        }
                        <Flex mt={10} fontSize={12} lighter><RiKakaoTalkFill size={22} color={color.kakao} /><Span ml={8}>입력해 주신 정보로 카카오톡 알림 메시지가 전송됩니다.</Span></Flex>
                    </Div>
                </Div>
            </Collapse>
        </Div>
    )
}

//배송지
export function Address({selectedAddress, setSelectedAddress, children}) {
    const [consumerAddresses, setConsumerAddresses] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        searchAddressList()

    }, [])

    //배송지 조회
    const searchAddressList = async () => {
        const {data} = await getConsumer()
        const addressList = data.consumerAddresses

        setConsumerAddresses(addressList)

        console.log('address', addressList)

        //기본 배송지
        let basicAddr = addressList.find(addr => addr.basicAddress === 1)
        // onChange(basicAddr)

        //기본 배송지가 없을경우 첫번째 배송지를 선택
        if (!basicAddr) {
            if (addressList && addressList.length > 0)
                basicAddr = addressList[0]
        }

        setSelectedAddress(basicAddr)
        setLoading(false)
    }

    const onSelectChange = e => {
        const index = e.target.value
        const addr = consumerAddresses[index]
        setSelectedAddress(addr)
    }

    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal()

    const toggle = () => {
        setModalState(!modalOpen)
    }

    const onChange = (address) => {
        console.log({address})
        setSelectedAddress(address)
        toggle()
    }



    return(
        <Div>
            <Div px={16} py={20}>
                {
                    loading ? (
                        <Skeleton.List count={1} />
                    ) : (
                        selectedAddress ? (
                            <Div>
                                <Flex pb={20}>
                                    <Space>
                                        <Span fontSize={17}><b>{selectedAddress.receiverName}</b></Span>
                                        <Span fg={'green'} fontSize={13} lineClamp={1}> {selectedAddress.addrName}</Span>
                                    </Space>
                                    <Right>
                                        <Button fontSize={13} bg={'white'} bc={'light'} px={10} height={'100%'} onClick={toggle}>변경</Button>
                                    </Right>
                                </Flex>
                                <Div mb={8} style={{wordBreak: 'break-all'}}>({selectedAddress.zipNo}){selectedAddress.addr}{' '}{selectedAddress.addrDetail}</Div>
                                <Div fg={'dark'}>{selectedAddress.phone}</Div>
                            </Div>
                        ) : (
                            <Div onClick={toggle} py={16} cursor={1} fg={'green'} fontSize={13} textAlign={'center'}>등록된 배송지가 없습니다. <b><u>배송지를 등록</u></b>해 주세요</Div>
                        )
                    )
                }
                {children}
            </Div>
            {
                modalOpen && <AddressList addressIndex={selectedAddress ? selectedAddress.addressIndex : null} onChange={onChange} onClose={toggle}/>
            }
        </Div>
    )
}
//제주도 추가배송 메시지
export const JejuText = React.memo(({isJeju}) => {
    if (!isJeju) return null
    return (
        <Div mt={16}>
            <Space rounded={3} bc={'danger'} fg={'danger'} fontSize={12} px={16} py={6} >
                <GiSpeaker style={{marginRight: 8}} size={16}/>
                <span>제주도는 추가 배송비(<b>3,000원</b>)가 부과됩니다.</span>
            </Space>
        </Div>
    )
})
//배송 메세지
export function DeliveryMsg({deliveryMsg, setDeliveryMsg, setCommonEnterFlag, commonEnterPwd, setCommonEnterPwd, localNightAlarm, setLocalNightAlarm, isLocal = false}) {

    const [commonEnterPwdRadio, setCommonEnterPwdRadio] = useState(0)
    const [selectedValue, setSelectedValue] = useState(deliveryMsgStore[0].value)

    useEffect(()=>{
        if(isLocal){
            setCommonEnterPwdRadio(1);
            setCommonEnterFlag(true)
        }
    },[isLocal])

    const onSelectChange = e => {
        const value = e.target.value
        const store = deliveryMsgStore.find(store => store.value === value)
        if (value == 'direct') {   //직접입력
            setDeliveryMsg('')

        }else{
            setDeliveryMsg(store.label)
        }
        setSelectedValue(store.value)
    }

    const onInputChange = e => {
        setDeliveryMsg(e.target.value)
    }

    const onLocalNightAlarmChange = (e) => {
        console.log('onLocalNightAlarmChange', e.target.value)
        if(e.target.value === 'true')
            setLocalNightAlarm(true)
        else if(e.target.value === 'false')
            setLocalNightAlarm(false)
    }

    const onInputCommonEnterPwdChange = e => {
        setCommonEnterPwd(e.target.value)
    }

    const onInputCommonEnterPwdRadioChange = e => {
        setCommonEnterPwdRadio(e.target.value)
        if(e.target.value == 0){
            setCommonEnterPwd("")
        }
        setCommonEnterFlag(e.target.value == 1 ? true:false)    //1일경우 벨리데이션 용도
    }

    return(
        <Div mt={16}>

            <Div p={16} bc={'light'} mb={10}>
                <Div fontSize={15} mb={5}>공동현관 출입번호</Div>
                <Div>
                    <Flex ml={10} mb={10}>
                        <Space>
                            <input type="radio" id="commonEnterPwdType1" name="commonEnterPwdRadio"
                                   onChange={onInputCommonEnterPwdRadioChange} value={1}
                                   checked={commonEnterPwdRadio == 1}
                            />
                            <Input block placeholder='예:#1234' maxLength="30" value={commonEnterPwd}
                                   onChange={onInputCommonEnterPwdChange} />
                        </Space>
                    </Flex>
                    <Flex ml={10}>
                        <Space>
                            <input type="radio" id="commonEnterPwdType0" name="commonEnterPwdRadio"
                                   onChange={onInputCommonEnterPwdRadioChange} value={0}
                                   checked={commonEnterPwdRadio == 0}
                            />
                            <Span>비밀번호없이 출입이 가능해요</Span>
                        </Space>
                    </Flex>
                    {/*<Div fg={'secondary'} mt={10}>*/}
                    {/*    입력된 공동현관 출입번호는 샵블리가 배송을 위해 필요한 정보로, 향후 배송을 위해 필요한 기간 동안 보관하는데 동의합니다.*/}
                    {/*</Div>*/}
                </Div>
            </Div>

            <Div fontSize={15} mt={10} mb={5}>배송 요청사항 {(selectedValue === 'direct') && deliveryMsg.length < 30 && `(${deliveryMsg.length}/30)`}</Div>
            <BasicSelect data={deliveryMsgStore} onChange={onSelectChange}/>
            {
                (selectedValue === 'direct') &&
                <Input mt={10} block placeholder='배송요청사항을 입력해 주세요.' maxLength="30" value={deliveryMsg} onChange={onInputChange} />
            }
            {/*<Div fg={'danger'} fontSize={12} mt={10}>공동현관 비밀번호가 있는 경우 꼭 입력해주세요.(예 : #1234, 종1234*, 열쇠0012@ 등)</Div>*/}

            {isLocal &&
                <Div>
                    <Div fontSize={15} mt={10} mb={5}>배송완료 메시지 전송</Div>
                    <Div ml={10}>
                        <Space>
                            <input defaultChecked type="radio" id="state1" name="state" onChange={onLocalNightAlarmChange} value={'false'}/>
                            <label>오전 7시</label>
                        </Space>
                        <Space>
                            <input type="radio" id="state2" name="state" onChange={onLocalNightAlarmChange} value={'true'}/>
                            <label>배송 직후</label>
                        </Space>
                    </Div>
                </Div>
            }
        </Div>
    )
}


export const OptionGoodsCard = ({goods, visibleDeliveryFee, children}) => {
    return(
        <Div py={3}>
            <GoodsCard imageUrl={ComUtil.getFirstImageSrc(goods.goodsImages)}
                       goodsNm={goods.goodsNm}
                       deliveryFee={goods.calculatedDeliveryFee}
                       visibleDeliveryFee={visibleDeliveryFee}
                       consumerPrice={goods.consumerPrice}
                       currentPrice={goods.currentPrice}
            >
                {children}
            </GoodsCard>
            <Div px={16} pb={16}>
                <ListSpace space={13} rounded={4} bg={'veryLight'} overflow={'hidden'} py={15}>
                    {
                        goods.options.map(({optionIndex, optionName, optionPrice, orderCnt}) =>
                            <OptionCard key={`option${optionIndex}`} optionName={optionName} optionPrice={optionPrice} orderCnt={orderCnt} />
                        )
                    }
                </ListSpace>
            </Div>
            {/*<ListBorder firstBorder={true}>*/}
            {/*    {*/}
            {/*        goods.options.map(({optionIndex, optionName, optionPrice, orderCnt}) =>*/}
            {/*            <OptionCard key={`option${optionIndex}`} optionName={optionName} optionPrice={optionPrice} orderCnt={orderCnt} />*/}
            {/*        )*/}
            {/*    }*/}
            {/*</ListBorder>*/}
        </Div>
    )
}

//상품리스트
export const GoodsList = React.memo(({goodsList, visibleDeliveryFee = true}) => {

    return(
        <div>
            <Atoms.ItemHeader px={16} pt={20} pb={4}>
                주문상품
            </Atoms.ItemHeader>
            <ListBorder spaceColor={'veryLight'}>
                {
                    goodsList.map(goods =>
                        <ListBorder key={goods.goodsNo} spaceColor={'veryLight'}>
                            <GoodsCard imageUrl={ComUtil.getFirstImageSrc(goods.goodsImages)} goodsNm={goods.goodsNm} deliveryFee={goods.calculatedDeliveryFee} visibleDeliveryFee={visibleDeliveryFee} />
                            {
                                goods.options.map(({optionIndex, optionName, optionPrice, orderCnt}) =>
                                    <OptionCard key={`option${optionIndex}`} optionName={optionName} optionPrice={optionPrice} orderCnt={orderCnt} />
                                )
                            }
                        </ListBorder>
                    )
                }
            </ListBorder>
        </div>
    )
})

//상품리스트 > 상품카드
function GoodsCard({
                       //goods
                       imageUrl, goodsNm, deliveryFee,
                       //custom
                       visibleDeliveryFee,
                       consumerPrice,
                       currentPrice,
                       children
                   }) {
    return(
        <Flex alignItems={'flex-start'} p={16}>
            <Div flexShrink={0} width={70} height={70}><Img src={imageUrl} alt={goodsNm} /></Div>
            <Div pl={16}>
                <Div>{goodsNm}</Div>
                {/*<Space spaceGap={8} fontSize={14} mt={8}>*/}
                {/*    <Span fg={'dark'}><strike>{ComUtil.addCommas(consumerPrice)}</strike></Span>*/}
                {/*    {*/}
                {/*        (currentPrice < consumerPrice) && <Span><b>{ComUtil.addCommas(currentPrice)}</b></Span>*/}
                {/*    }*/}
                {/*</Space>*/}

                {
                    visibleDeliveryFee && (<Div fg={'green'}>{!deliveryFee ? '무료배송' : `배송비 ${ComUtil.addCommas(deliveryFee)}원` }</Div>)
                }
                {children}
            </Div>
        </Flex>
    )
}

//상품리스트 > 상품카드 > 옵션
function OptionCard({optionName, optionPrice, orderCnt}) {
    return(
        <Flex alignItems={'flex-start'} justifyContent={'space-between'} px={13} fontSize={12}>
            <Div fg={'darkBlack'}>옵션선택 : {optionName}<Span> ({orderCnt}개)</Span></Div>
            <Div flexShrink={0} pl={13}><b>{ComUtil.addCommas(MathUtil.multipliedBy(optionPrice,orderCnt))}</b>원</Div>
        </Flex>
    )
}


// const StyledSlider = styled(ReactSlider)`
//     width: 100%;
//     height: 10px;
//     z-index: 0;
// `;
//
// const StyledThumb = styled.div`
//     width: ${getValue(35)};
//     height: ${getValue(35)};
//     text-align: center;
//     background-color: ${color.green};
//     color: ${color.white};
//     border-radius: 50%;
//     cursor: grab;
//     top: 50%;
//     transform: translateY(-50%);
//     font-size: 12px;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     box-shadow: 1px 1px 3px rgba(0,0,0,0.3);
//     // border: 1px solid white;
// `;
//
// const thumbActiveClassName = css`
//     background-color: black;
// `
//
// const Thumb = (props, state) => <StyledThumb {...props}>{state.valueNow || ''}</StyledThumb>;
//
// const StyledTrack = styled.div`
//     top: 0;
//     bottom: 0;
//     background: ${props => props.index === 0 ? color.secondary : color.green};
//     border-radius: 999px;
//     height: 10px;
// `;
//
// const Track = (props, state) => <StyledTrack {...props} index={state.index} />;
// function Slider({value = 0, onChange, disabled}) {
//     // const [rate, setRate] = useState(value)
//     // const onSliderChange = (value) => {
//     //     setRate(value)
//     //     onChange(value)
//     // }
//     return(
//         <StyledSlider
//             value={value}
//             renderTrack={Track}
//             renderThumb={Thumb}
//             onChange={onChange}
//             // disabled={false}
//             // snapDragDisabled={true}
//             // thumbActiveClassName={'p-3'}
//         />
//     )
// }

//결제수단 버튼
function PayPgGubunButton({active, onClick, children}) {
    return(
        <Flex cursor={1}
              justifyContent={'center'}
              bg={active ? 'white' : 'background'}
              bc={active ? 'green' : 'light'}
              minHeight={60}
              rounded={4}
              onClick={onClick}
              custom={`
                transition: 0.2s;
              `}
        >
            {children}
        </Flex>
    )
}

//결제하기 버튼
function PayButtonFooter({onClick, disabled, children}) {
    return(
        <>
            {/* Dummy box */}
            <Div height={100}></Div>
            <Fixed bottom={0} width={'100%'} zIndex={4}>
                <Button bg={'green'} fg={'white'} height={60} rounded={0} fontSize={20} block onClick={onClick} disabled={disabled}>
                    <b>{children}</b>
                </Button>
            </Fixed>
        </>
    )
}

//결제비번 입력 모달
function ModalPassPhrase({modalOpen, toggle, onSuccess}) {
    const [passPhrase, setPassPhrase] = useState()
    // const [isOpen, setIsOpen] = useState(modalOpen)
    // useEffect(() => {
    //     setIsOpen(modalOpen)
    // }, [modalOpen])
    // const toggle = () => setIsOpen(!isOpen)
    const onPassPhraseChange = passPhrase => {
        setPassPhrase(passPhrase)
    }
    const onConfirm = async () => {
        let {data: checkResult} = await checkPassPhrase(passPhrase);

        if (!checkResult) {
            // notify('결제 비번이 틀렸습니다.', toast.error);
            alert('결제 비밀번호가 틀렸습니다.')
            return
        }

        onSuccess()
    }
    return(
        <Modal isOpen={modalOpen} toggle={toggle} centered>
            <ModalHeader toggle={toggle}> 결제비밀번호 입력</ModalHeader>
            <ModalBody className={'p-0'}>
                {/* clearPassPhrase 초기화, onChange 결과값 세팅 */}
                {
                    modalOpen && <PassPhrase clearPassPhrase={false} onChange={onPassPhraseChange}></PassPhrase>
                }
            </ModalBody>
            <ModalFooter>
                {/*<Button color="link" onClick={this.findPassPhrase}>비밀번호를 잊으셨나요?</Button>*/}
                <Button color="info" onClick={onConfirm} disabled={(passPhrase && passPhrase.length === 6) ? false:true}>확인</Button>{' '}
                <Button color="secondary" onClick={toggle}>취소</Button>
            </ModalFooter>
        </Modal>
    )
}

function PrintJSON({data, name = ''}) {
    const [isOpen, setOpen] = useState(false)
    return (
        <div>
            <button onClick={() => setOpen(!isOpen)}>{isOpen ? '닫기' : `${name} 열기`}</button>
            <Div p={16} bc={'danger'} display={isOpen ? 'block' : 'none'}>
                <pre>{JSON.stringify(data, null, 2)}</pre>
            </Div>
        </div>
    )
}

export default {
    Gift,
    Address,
    JejuText,
    DeliveryMsg,
    OptionGoodsCard,
    GoodsList,
    // Slider,
    PayPgGubunButton,
    PayButtonFooter,
    ModalPassPhrase,
    PrintJSON
}