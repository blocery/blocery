import React, {useEffect, useState} from 'react';
import {Button, Div, Fixed, Flex, GridColumns, Input, ListBorder, Right, Space, Span} from "~/styledComponents/shared";
import {IconBackArrow} from '~/components/common/icons'
import Sticky from "~/components/common/layouts/Sticky";
import {getConsumer, deleteAddress} from "~/lib/shopApi";
import {getValue} from "~/styledComponents/Util";

import {RiRadioButtonFill} from 'react-icons/ri'
import {AiOutlinePlus}  from 'react-icons/ai'
import ComUtil from "~/util/ComUtil";
import {color} from "~/styledComponents/Properties";
import styled from 'styled-components'
import ShopNav from "~/components/common/navs/ShopNav";
import Checkbox from "~/components/common/checkboxes/Checkbox";
import useInput from "~/hooks/useInput";
import {useModal} from "~/util/useModal";
import DaumPostcode from "react-daum-postcode";
import Skeleton from "~/components/common/cards/Skeleton";
import {upsertAddress} from '~/lib/shopApi'
import BackNavigation from "~/components/common/navs/BackNavigation";


const AddressList = ({isMng = false, addressIndex = null, onChange = () => null, onClose = () => null}) => {
    const [addressList, setAddressList] = useState()
    // const [modalOpen, setModalOpen] = useState(false)

    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal()


    useEffect(() => {
        search()

        ComUtil.noScrollBody()

        return(() => ComUtil.scrollBody())

    }, [])

    const search = async () => {
        const {data} = await getConsumer();

        //console.log({consumer:data})

        if (data.consumerAddresses) {
            setAddressList(data.consumerAddresses)
        }
    }

    const onUpdateClick = address => {
        setSelected(address)
        toggle()
    }

    const onDeleteClick = address => {
        if (window.confirm('삭제 하시겠습니까?')) {

        }
    }

    const toggle = () => {
        setModalState(!modalOpen)
    }

    const onModalClose = () => {
        toggle()
        search()
    }

    return (
        <FullModal>
            {
                isMng ? <BackNavigation><span className="notranslate">배송지 관리</span></BackNavigation> : <ShopNav onClose={onClose}><span className="notranslate">배송지 목록</span></ShopNav>
            }
            <ScrollBody>
                <Div p={16}>
                    <Button bg={'green'} fg={'white'} block height={45} p={0} onClick={toggle}>
                        <Space spaceGap={8} justifyContent={'center'} lineHeight={45}>
                            <AiOutlinePlus />
                            <Span className="notranslate">배송지추가</Span>
                        </Space>
                    </Button>
                </Div>
                {
                    !addressList ? <Skeleton.List count={3} /> : (
                        <ListBorder>
                            {
                                addressList.map(addr =>
                                    <Div key={addr.addressIndex} p={16} bg={'white'}
                                         doActive
                                         onClick={onChange.bind(this, addr)}
                                         cursor={1}>
                                        <Flex alignItems={'flex-start'}>
                                            {
                                                isMng ?
                                                    null
                                                    :
                                                    <Div flexShrink={0} pt={2}>
                                                        <RiRadioButtonFill size={24} color={addressIndex === addr.addressIndex ? color.green : color.light}/>
                                                    </Div>
                                            }
                                            <Div ml={8} flexGrow={1}>
                                                <Flex justifyContent={'space-between'}>
                                                    <Space spaceGap={8}>
                                                        <Div flexShrink={0}><b><span className="notranslate">{addr.receiverName}</span></b></Div>
                                                        <Div fg={'green'} fontSize={13} lineClamp={1}>
                                                            <span className="notranslate">
                                                                {`${addr.addrName}`}{/*{addr.basicAddress === 1 && <span>-<b>기본 배송지</b></span>}*/}
                                                            </span>
                                                        </Div>
                                                        {
                                                            addr.basicAddress === 1 &&
                                                                <Div bg={'green'} fg={'white'} fontSize={12} rounded={15} px={8} py={2}>기본배송</Div>
                                                        }
                                                    </Space>
                                                    <Space fontSize={13} flexShrink={0} fg={'darkBlack'} py={3} spaceGap={8} onClick={e => e.stopPropagation()}>
                                                        <Button bg={'white'} bc={'dark'} py={2} onClick={onUpdateClick.bind(this, addr)}><span className="notranslate">수정</span></Button>
                                                        {/*<Button bg={'white'} bc={'dark'} py={2} onClick={onDeleteClick.bind(this, addr)}>삭제</Button>*/}
                                                    </Space>
                                                </Flex>
                                                <Div fg={'dark'} fontSize={13} my={10}><span className="notranslate">{addr.phone}</span></Div>
                                                <Div fontSize={14}><span className="notranslate">{`${addr.addr} ${addr.addrDetail} [${addr.zipNo}]`}</span></Div>
                                            </Div>
                                        </Flex>
                                    </Div>
                                )
                            }
                        </ListBorder>
                    )
                }
            </ScrollBody>
            {
                modalOpen && <AddressModify consumerAddress={selected} onClose={onModalClose} onCancel={toggle}/>
            }

        </FullModal>
    );
};

export default AddressList;

function FullModal({children}) {
    return(
        <Fixed top={0} bottom={0} width={'100%'} bg={'white'} zIndex={41}>
            {children}
        </Fixed>
    )
}

function ScrollBody({hasNav = true, children}) {
    return(
        <Div height={`calc(100vh - ${getValue(hasNav ? 56 : 0)})`} overflow={'auto'}>
            {children}
        </Div>
    )
}

const Heading = styled(Div)`
    font-size: ${getValue(17)};
    font-weight: 900;
    margin-bottom: ${getValue(10)};
`

function AddressModify({
                           consumerAddress,
                           // addrName,            // 배송지 이름
                           // receiverName,        // 받는 사람
                           // addr,
                           // addrDetail,
                           // zipNo,
                           // phone,
                           // basicAddress,           // 기본배송지 여부
                           onClose, onCancel}) {

    const receiverName = useInput(consumerAddress && consumerAddress.receiverName)
    const phone = useInput(consumerAddress && consumerAddress.phone)
    const zipNo = useInput(consumerAddress && consumerAddress.zipNo)
    const roadAddr = useInput(consumerAddress && consumerAddress.roadAddr)    //도로명데이터항상들어가게
    const addr = useInput(consumerAddress && consumerAddress.addr)
    const addrDetail = useInput(consumerAddress && consumerAddress.addrDetail)
    const addrName = useInput(consumerAddress && consumerAddress.addrName)
    const [basicAddress, setBasicAddress] = useState(consumerAddress && consumerAddress.basicAddress)

    const [modalOpen, setModalOpen] = useState(false)

    const onPhoneBlur = e => {
        phone.setValue(ComUtil.phoneRegexChange(e.target.value))
    }

    const onBasicAddressChange = e => {
        setBasicAddress(e.target.checked ? 1 : 0)
    }

    //다음 주소찾기 모달
    const toggle = () => {
        setModalOpen(!modalOpen)
    }

    //다음 주소찾기 완료
    const onComplete = (data) => {
        console.log({data})

        let fullAddress = data.address;
        let roadFullAddress = data.roadAddress;
        let extraAddress = '';

        if (data.userSelectedType === 'R') { // 사용자가 도로명 주소를 선택했을 경우
            fullAddress = data.roadAddress;
        } else { // 사용자가 지번 주소를 선택했을 경우(J)
            fullAddress = data.jibunAddress;
        }

        if (data.addressType === 'R') {
            if (data.bname !== '') {
                extraAddress += data.bname;
            }
            if (data.buildingName !== '') {
                extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
            }
            fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
            roadFullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
        }

        zipNo.setValue(data.zonecode)
        addr.setValue(fullAddress)
        roadAddr.setValue(roadFullAddress)
        toggle()
    }

    const onSaveClick = async () => {

        const mode = !consumerAddress ? 'new' : 'update'
        const data = {
            addrName: addrName.value,
            receiverName: receiverName.value,
            addr: addr.value,
            roadAddr: roadAddr.value,
            addrDetail: addrDetail.value,
            phone: phone.value,
            zipNo: zipNo.value,
            basicAddress: basicAddress,
            addressIndex: consumerAddress ? consumerAddress.addressIndex : null
        }

        if(!data.addrName || !data.receiverName || !data.addr || !data.addrDetail || !data.phone || !data.zipNo) {
            alert('필수항목 정보를 정확하게 입력해주세요.')
            return false;
        }

        await upsertAddress(mode, data)

        onClose()
    }

    const onDeleteClick = async () => {
        if (window.confirm("배송지를 삭제 하시겠습니까?")) {
            if (consumerAddress) {
                console.log("============"+consumerAddress.addressIndex)

                await deleteAddress(consumerAddress.addressIndex)
                onClose()
            }
        }


    }

    return(
        <FullModal>
            <ShopNav onClose={onCancel}><span className="notranslate">배송지 작성</span></ShopNav>
            <ScrollBody>
                <Div>
                    <Div p={8}>
                        <Heading><span className="notranslate">받는사람</span><Star>*</Star></Heading>
                        <Input block {...receiverName} placeholder={'받는사람'}/>
                    </Div>
                    <Div p={8}>
                        <Heading><span className="notranslate">연락처</span><Star>*</Star></Heading>
                        <Input block {...phone} onBlur={onPhoneBlur} placeholder={'휴대폰번호 입력'}/>
                    </Div>
                    <Div p={8}>
                        <Heading><span className="notranslate">주소</span><Star>*</Star></Heading>
                        <Space>
                            <Button px={16} py={0} height={40} width={110} bg={'green'} fg={'white'} onClick={toggle}><span className="notranslate">주소찾기</span></Button>
                            <Div flexGrow={1}>
                                <Input block {...zipNo} disabled/>
                            </Div>
                        </Space>
                        <Input my={10} block {...addr} placeholder={'기본주소'} disabled/>
                        <Input block {...addrDetail} placeholder={'상세주소'}/>
                    </Div>
                    <Div p={8}>
                        <Heading><span className="notranslate">배송지 닉네임</span><Star>*</Star></Heading>
                        <Input block {...addrName} placeholder={'주소 닉네임'}/>
                    </Div>
                    <Div p={8}>
                        <Checkbox bg={'green'} checked={basicAddress === 1} onChange={onBasicAddressChange} ><span className="notranslate">기본 배송지로 설정</span></Checkbox>
                    </Div>
                    <Flex p={8}>
                        {
                            consumerAddress &&
                            <Div flexGrow={1} mr={10}>
                                <Button bg={'white'} bc={'dark'} block minHeight={45} onClick={onDeleteClick}><span className="notranslate">삭제</span></Button>
                            </Div>
                        }
                        <Div flexGrow={2} >
                            <Button bg={'green'} fg={'white'} onClick={onClose} block minHeight={45} onClick={onSaveClick}><span className="notranslate">배송지 저장</span></Button>
                        </Div>
                    </Flex>
                </Div>

            </ScrollBody>

            {
                modalOpen && <PostCode onClose={toggle} fontSize={17} onComplete={onComplete} />
            }
        </FullModal>
    )
}

const Star = styled.span`
    color: ${color.danger};
    margin-left: 2px;
`

const StyledDaumPostcode = styled(DaumPostcode)`
    #__daum__layer_1, #__daum__layer_2 {
        height: 100%!important;
    }    
`

function PostCode({onClose, onComplete}) {
    return(
        <FullModal>
            <ShopNav onClose={onClose}><span className="notranslate">주소검색</span></ShopNav>
            <StyledDaumPostcode style={{height: `calc(100% - ${getValue(56)})`}} onComplete={onComplete} />
        </FullModal>
    )
}

