import React, {Component, Fragment, useEffect, useState} from 'react'
import {ListGroup, ListGroupItem, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'
import {getConsumer, updateNickname} from '~/lib/shopApi'
import {doLogout, doLogoutChannOut, getLoginUserType} from '~/lib/loginApi'
import {ShopXButtonNav, ModalConfirm, B2cGoodsSelSearch, SingleImageUploader} from '../../../common'
import {Span, Div, Right, Flex, Hr, Img, Button, Input, Space} from "~/styledComponents/shared";

import { Server } from '~/components/Properties'
import {Redirect, useHistory} from 'react-router-dom'
import icMail from '~/images/icons/renewal/mypage/mail.png'
import icUser from '~/images/icons/renewal/mypage/user.png'
import icPhone from '~/images/icons/renewal/mypage/phone.png'
import icMoreArrow from "~/images/icons/ic_more_arrow_n.svg";
import icPencil from '~/images/icons/renewal/mypage/pencil.png'
import imgNoProfile from '~/images/icons/renewal/mypage/no_profile.png'
import {useRecoilState} from "recoil";
import {consumerState, noticeState} from "~/recoilState";
import {useModal} from "~/util/useModal";
import useLogin from "~/hooks/useLogin";
import BackNavigation from "~/components/common/navs/BackNavigation";
import {IoIosArrowForward} from 'react-icons/io'
import {BsPinAngle} from "react-icons/bs";
import ComUtil from "~/util/ComUtil";


const LogoutButton = () => {
    const [redirectUrl, setRedirectUrl] = useState()

    const history = useHistory()

    const logout = async () => {
        if (window.confirm('로그아웃 하시겠습니까?')) {
            //back-end logout
            await doLogout();

            //front-end logout : consumer 가 날라가기 때문에 현재 페이지가 PrivateRoute 여서 로그인 창이 자동으로 보이게 됨
            //setConsumer(null)

            //현재 페이지에 그대로 로그인 창이 보이도록 아래 내용 주석처리함(주석 해제시 버그발생위험 증가)
            // setTimeout(() => {
            history.replace('/mypage'); //sessionStorage.setItem('logined', 0);
            // }, 200)
        }
    }

    if (redirectUrl) return <Redirect to={redirectUrl} />

    return (
        <Button p={5} bc={'green'} fg={'green'} onClick={logout}>로그아웃</Button>
    )
}

const InfoManagementMenu = (props) => {
    const login = useLogin();
    const [state, setState] = useState({
        consumerNo: 0,
        loginUser: {},
        redirect: null,
        nickname: '',
        profileImages: [],
        producerFlag: false
    })
    const [modalOpen, , selected, setSelected, setModalState] = useModal()

    useEffect(()=>{
        search();
    }, [])

    const search = async () => {
        let {data:loginUser} = await getConsumer();
        if(!loginUser) {
            props.history.replace('/mypage');
            return;
        }
        setState({
            ...state,
            consumerNo: loginUser.consumerNo,
            loginUser: loginUser,
            nickname: loginUser.nickname,
            profileImages: (loginUser) ? loginUser.profileImages : [],
            producerFlag: loginUser.producerFlag
        })
    }

    // 비밀번호 변경 클릭
    const onClickValwordModify = () => {
        const loginUser = Object.assign({}, state.loginUser)
        props.history.push('/mypage/checkCurrentValword?flag=1')
    }

    // 회원정보 수정 클릭
    const onClickInfoModify = () => {
        if(localStorage.getItem('authType') == 1){
            props.history.push('/modifyConsumerInfo')
        }else{
            props.history.push('/mypage/checkCurrentValword?flag=2')
        }
    }

    // 배송지 관리
    const onClickAddressModify = () => {
        props.history.push('/mypage/addressManagement')
    }

    // 결제비밀번호 관리
    const onClickHintPassPhrase = () => {
        const loginUser = Object.assign({}, state.loginUser)
        if(localStorage.getItem('authType') == 1){
            props.history.push('/mypage/hintPassPhrase')
        }else{
            props.history.push('/mypage/checkCurrentValword?flag=3')
        }
    }

    // 로그아웃 (카카오채널 연결 끊기 테스트 용)
    const onClickLogoutKakaoChannOut = async (isConfirmed) => {
        console.log(isConfirmed)
        if (isConfirmed) {
            await doLogoutChannOut();
            // this.props.history.push('/mypage')
            setState({
                ...state,
                redirect: Server.getShopMainUrl()
            })
        }
    }

    const toggle = () => {
        setModalState(!modalOpen)
    }

    const onUpdateProfile = async ({profileImages, nickname}) => {
        let params = {profileImages, nickname};
        const {data:res} = await updateNickname(params);

        if(res === 1) {
            alert('프로필 변경이 완료되었습니다.')
            toggle();
            login.reFetch();
            await search();
        } else {
            alert('오류가 발생했습니다. 다시 시도해주세요.')
            return;
        }
    }

    const onProfileImageChange = (images) => {
        setState({
            ...state,
            profileImages: images
        })
    }

    if(state.redirect){
        return <Redirect to={state.redirect} />
    }

    const onWithdraw = () => {
        props.history.push('/applySecession')
    }

    return(
        <Fragment>
            <BackNavigation>내 정보</BackNavigation>
            <Div p={15} m={15} bg={'green'} textAlign={'center'} onClick={toggle}>
                <Img cover width={109} height={109} rounded={'50%'} my={19}
                     src={state.profileImages.length <= 0 ? imgNoProfile
                         : Server.getThumbnailURL() + state.profileImages[0].imageUrl}
                />
                <Div cursor={1} fg={'white'} mb={16}>
                    {state.loginUser.nickname ? state.loginUser.nickname : '닉네임을 입력해주세요'}
                    <Span ml={10}><Img cover width={14} height={16} src={icPencil} alt={'pencil'} /></Span>
                </Div>
            </Div>

            <Div bg={'background'}>
                <Div p={15} fontSize={13} bold>기본 정보</Div>
            </Div>
            <Div p={15} fontSize={14}>
                <Flex>
                    <Div mr={7}><Img src={icUser} alt={"user"} /></Div>
                    <Div>이름</Div>
                    <Right fg={'dark'}>{state.loginUser.name}</Right>
                </Flex>
            </Div>
            <Hr />
            <Div p={15} fontSize={14}>
                <Flex>
                    <Div mr={7}><Img src={icPhone} alt={"phone"} /></Div>
                    <Div>휴대전화번호</Div>
                    <Right fg={'dark'}>{state.loginUser.phone}</Right>
                </Flex>
            </Div>
            <Hr />
            <Div p={15} fontSize={14}>
                <Flex>
                    <Div mr={7}><Img src={icMail} alt={"mail"} /></Div>
                    <Div>이메일</Div>
                    <Right fg={'dark'}>{state.loginUser.email}</Right>
                </Flex>
            </Div>
            <Hr />
            <Div p={15} fontSize={14}>
                <Flex>
                    <Div>{state.loginUser.authType === 1 ? '카카오로' : '일반계정으로'} 가입/로그인 되었습니다.</Div>
                    <Right>
                        <LogoutButton />
                    </Right>
                </Flex>
            </Div>

            <Div bg={'background'}>
                <Div p={15} fontSize={13} bold>정보 관리</Div>
            </Div>
            <Div p={15} fontSize={14}>
                <Flex onClick={onClickAddressModify}>
                    <Div>배송지 관리</Div>
                    <Right><img src={icMoreArrow} alt={'more'}/></Right>
                </Flex>
            </Div>

            {
                state.loginUser.authType === 0 &&
                <>
                    <Hr />
                    <Div p={15} fontSize={14}>
                        <Flex onClick={onClickValwordModify}>
                            <Div>비밀번호 변경</Div>
                            <Right><img src={icMoreArrow} alt={'more'}/></Right>
                        </Flex>
                    </Div>
                </>
            }

            <Hr />

            {  !state.loginUser.noBlockchain &&
            <>
                <Div p={15} fontSize={14}>
                    <Flex onClick={onClickHintPassPhrase}>
                        <Div>결제 비밀번호 관리</Div>
                        <Right><img src={icMoreArrow} alt={'more'}/></Right>
                    </Flex>
                </Div>
            </>
            }

            <Hr />

            <Flex p={15} pb={60}>
                {
                    state.loginUser &&
                    <Div fg={'secondary'} fontSize={13}>
                        가입일 {state.loginUser && ComUtil.utcToString(state.loginUser.timestamp,'YYYY.MM.DD')}
                    </Div>
                }
                {
                    !state.loginUser.producerFlag &&
                    <Right fg={'secondary'} fontSize={13} onClick={onWithdraw}>
                        탈퇴 신청 <IoIosArrowForward />
                    </Right>
                }
            </Flex>
            {
                modalOpen &&
                <Modal size="lg" isOpen={modalOpen} toggle={toggle} >
                    <ModalHeader toggle={toggle}>
                        프로필 변경
                    </ModalHeader>
                    <ModalBody>
                        <ProfileUpdateModalContent profileImages={state.profileImages} nickname={state.nickname} onSave={onUpdateProfile} onClose={toggle} />
                    </ModalBody>
                </Modal>
            }

        </Fragment>
    )
}
export  default InfoManagementMenu

const ProfileUpdateModalContent = (props) => {
    const [profileImages, setProfileImages] = useState(props.profileImages)
    const [nickname, setNickname] = useState(props.nickname)

    const onProfileImageChange = (images) => {
        setProfileImages(images)
    }

    const handleChange = (e) => {
        setNickname(e.target.value)
    }

    const onSaveClick = () => {
        props.onSave({profileImages, nickname})
    }

    return (
        <Div textAlign={'center'} alignItems={'center'}>
            <SingleImageUploader images={profileImages} defaultCount={1} isShownMainText={false} onChange={onProfileImageChange} />
            <Input name={'nickname'} width={'100%'} placeholder={'닉네임을 입력해주세요'} value={nickname} maxLength="20" onChange={handleChange} />
            <Space px={16} py={8} fontSize={12} spaceGap={8}>
                <div>
                    {'타인사진도용, 불쾌감있는사진 등 기타 저작권에 위배되는 내용 포함등 UGC 정책에 의거해 관리자 검토 후 내부 정책에 의거 조치가 될 수 있습니다.'}
                </div>
            </Space>
            <Flex mt={10} justifyContent={'center'} alignItems={'center'}>
                <Button bg={'green'} fg={'white'} onClick={onSaveClick} mr={5}>확인</Button>
                <Button bg={'secondary'} fg={'white'} onClick={props.onClose}>취소</Button>
            </Flex>
        </Div>
    )
}
