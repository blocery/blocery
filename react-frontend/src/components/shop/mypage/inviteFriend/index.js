import React, {Component, Fragment, lazy, Suspense, useState, useEffect} from 'react'
import { ToastContainer, toast } from 'react-toastify'
import { ShopXButtonNav, Sticky } from '~/components/common/index'
import ComUtil from '~/util/ComUtil'
import {getConsumer, getRecommenderInfo, updateConsumerRecommenderNo} from '~/lib/shopApi'
import { Webview } from "~/lib/webviewApi";
import {Server} from '~/components/Properties'
import { Button, Div, Span, Flex, Hr, Right, Input } from '~/styledComponents/shared'
import {Modal, ModalBody, ModalFooter, ModalHeader, Row, Col, CardGroup, Card, CardBody, CardTitle, CardText} from "reactstrap";
import styled from "styled-components";
import {color} from '~/styledComponents/Properties'
import HeaderBox from "~/components/shop/goodsReviewList/HeaderBox";

import {IoIosCopy} from 'react-icons/io'
import {getValue} from "~/styledComponents/Util";
import loadable from "@loadable/component";
import CollapseItem from '~/components/common/items/CollapseItem'
import BackNavigation from "~/components/common/navs/BackNavigation";
import { BLCT_TO_WON } from "~/lib/exchangeApi"
import moment from "moment-timezone";

const GradeTable = loadable(() => import('./layout/GradeTable'))
const DetailBox = loadable(() => import('./layout/DetailBox'))

const InviteRanking = loadable(() => import('./InviteRanking'))
const BuyingRanking = loadable(() => import('./BuyingRanking'))

const RoundedContainer = styled(Flex)`
    // justify-content: space-between;
    // border: 1px solid ${color.light};
    border-radius: ${getValue(5)};
    background-color: ${color.background};
    & > div {
        border-right: 1px solid ${color.white};
        flex: 0.5 1 0; //flex-grow, flex-shrink, flex-basis
        padding: ${getValue(10)};
    }
    
    & > div:last-child {
        border: 0;
        flex: 1;
    }
`;


export default class InviteFriend extends Component {
    constructor(props){
        super(props)
        this.state = {
            recommenderNo: 0,       // 추천인 소비자 번호
            inviteCode : '',        // 로그인한 소비자의 친구초대코드
            consumerNo: 0,
            name: '',
            receivePush: false,
            isOpen: false,       // 추천인코드입력 모달
            recommenderCode : '',    // 입력한 추천인 코드
            recommendInfo: {},
            tabId: '1',
            rankingData: {}
        }
    }

    async componentDidMount() {
        await this.search(); //inviteCode 저장 대기.
        this.linkKakaoInvite();
        // alert(`친구 초대 서비스는 일시중단 되었습니다.(불법 이용 감지) ※ 신규 회원가입 쿠폰 지급 이벤트는 계속 진행중입니다.
        // 친구초대 리워드 서비스 관련해서
        // 악의적이고 불법적인 방법으로 이용하시는 분들이 확인되어
        // 기존 회원분들과 타 고객의 피해를 줄이고자
        // 친구초대 리워드 지급이 잠정 중단되었습니다.
        // 자세한 내용은 공지사항을 참고해 주세요.`)
    }

    search = async () => {
        const {data:loginUser} = await getConsumer();

        const inviteCode = ComUtil.encodeInviteCode(loginUser.consumerNo)

        const {data: recommendInfo} = await getRecommenderInfo();

        const {data:blctToWon} = await BLCT_TO_WON();

        this.setState({
            inviteCode: inviteCode,
            consumerNo: loginUser.consumerNo,
            // name: loginUser.name,
            // receivePush: loginUser.receivePush,
            recommenderNo: loginUser.recommenderNo,
            recommendInfo: recommendInfo,
            blctToWon: blctToWon
        });
    }

    linkKakaoInvite = () => {
        //web Test : Web에서는 이 설정이 우선시 적용됨.
        window.Kakao.Link.createDefaultButton({
            container: '#kakao-web-btn',
            objectType: 'feed',
            content: {
                title: '샵#블리 친구추천',
                description: '추천인코드: ' + this.state.inviteCode,
                imageUrl: 'https://shopbly.shop/images/YP8BMgIo98I4.png',
                link: {
                    mobileWebUrl: Server.getShareURL() + '/?inviteCode=' + this.state.inviteCode, //home에서 inviteCode를 localStorage에 저장 함
                    webUrl: Server.getShareURL() + '/?inviteCode=' + this.state.inviteCode
                },
            },
            buttons: [
                {
                    title: '샵#블리 친구추천',
                    link: {
                        mobileWebUrl: Server.getShareURL() + '/?inviteCode=' + this.state.inviteCode,
                        webUrl: Server.getShareURL() + '/?inviteCode=' + this.state.inviteCode
                    },
                },
            ]
        });
    }

    // consumerNo로 추천코드 생성
    createCode = async () => {
        const {data:loginUser} = await getConsumer();

        const inviteCode = ComUtil.encodeInviteCode(loginUser.consumerNo)
        this.setState({inviteCode});
    }

    userAlert = () => alert('친구 초대 서비스는 일시중단 되었습니다. \n공지사항을 참고해 주세요')


    kakaoLinkClick = () => {

        //202108친추재오픈 - 중단시 아래 해
        // if (this.state.consumerNo != 21530) { //cobak유저는 추천 진행.
        //     this.userAlert()
        //     return;
        // }

        //mobileApp test.
        //if (ComUtil.isMobileApp()) {      //android + iOS적용
        if (ComUtil.isMobileAppAndroid()) {  //android만 적용시. -20200104(ios검수포기)
            let urlObject = {
                title     : '샵#블리 공유',
                desc      : '추천인코드: ' + this.state.inviteCode,
                url       : Server.getShareURL() + '/?inviteCode=' + this.state.inviteCode,  //home에서 inviteCode를 localStorage에 저장 함
                imageUrl  : Server.getShareURL()+'/images/YP8BMgIo98I4.png',
            };
            Webview.kakaoDetailLink(urlObject);
        }
        else { //ios Only -20200104(ios검수포기)  - //Web에서는 이부분 타고 설정은 componentDidMount를 이용함.
            Webview.openPopup('/mypage/iosKakaoLink?inviteCode=' + this.state.inviteCode);
        }
    }

    onCopyCode = () => {

        //202108친추재오픈.
        // if (this.state.consumerNo != 21530) { //cobak유저는 추천 진행.
        //     this.userAlert()
        //     return;
        // }

        ComUtil.copyTextToClipboard(
            this.state.inviteCode,
            '코드가 복사되었습니다',
            '코드 복사에 실패했습니다. text창에서 길게 눌러 복사해 주세요'
        )
    }

    modalEnterCode = async () => {
        this.setState({ isOpen: true })
    }

    // element값 변경시
    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    onConfirm = async () => {
        let data = {};
        data.consumerNo = this.state.consumerNo;
        data.recommenderNo = ComUtil.decodeInviteCode(this.state.recommenderCode);
        if (!(this.state.recommenderCode) || this.state.recommenderCode.length != 7 || data.recommenderNo === 0) {
            alert('추천인 코드 형식이 잘못되었습니다. 다시한번 확인 바랍니다.')
            return false;
        }
        if (data.consumerNo === data.recommenderNo) {
            alert('본인의 코드는 추천인으로 입력할 수 없습니다.')
            return false;
        }
        let modified = {};
        if(this.state.consumerNo != data.recommenderNo) {
            modified = await updateConsumerRecommenderNo(data)
        }
        if(modified.data === 1) {
            alert('친구의 추천인 코드가 정상적으로 입력되었습니다.')
            this.setState({isOpen:false})
            this.search();
        } else {
            alert('입력하신 추천코드는 사용할 수 없습니다. 친구 추천코드를 다시 한번 확인 후 입력해 주세요.')
            return false;
        }
    }

    onCancel = () => {
        this.setState({
            isOpen: false,
            recommenderCode: ''
        })
    }

    onHeaderClick = (tabId) => {
        this.setState({ tabId })
    }

    render() {

        let isMobileApp = ComUtil.isMobileApp();

        let rewardWon;
        const today =  moment().format('YYYYMMDD');

        // if(today >= 20220322 && today <= 20220430) {
            rewardWon = 5000;
        // } else {
        //     rewardWon = 2000;
        // }

        return(
            <Fragment>
                {/*<ShopXButtonNav underline historyBack>친구초대</ShopXButtonNav>*/}
                <BackNavigation>친구초대</BackNavigation>
                <Flex flexDirection={'column'} px={16} py={25}>
                    <Div fg={'dark'} fontSize={12}>내 친구초대 코드</Div>
                    <Flex justifyContent={'center'} fontSize={25} mb={20} >
                        <Flex cursor onClick={this.onCopyCode}>
                            <Div fw={500} mr={5}>{this.state.inviteCode}</Div>
                            <IoIosCopy fontSize={22}/>
                        </Flex>
                    </Flex>

                    {isMobileApp &&
                    <Button block bg={'#ffe812'} py={10} onClick={this.kakaoLinkClick}>카카오톡으로 친구 초대하기</Button>
                    }
                    {!isMobileApp &&
                    <Button block bg={'#ffe812'} py={10} id="kakao-web-btn" onClick={this.kakaoLinkClick}>카카오톡으로 친구 초대하기</Button>
                    }
                </Flex>

                <Hr p={0} />

                <Div px={16} py={25} >
                    <Flex mb={10}>
                        <Div fw={500}>친구초대 이벤트</Div>
                    </Flex>

                    <Div py={10}>
                        <Div fontSize={13}>친구에게 샵블리를 소개하고 함께 혜택을 즐겨요</Div>
                        <Div fontSize={13}>몇 명이든 상관없이 초대할 때 마다 무제한으로 쌓이는 적립금(BLY)</Div>
                    </Div>

                    <Div block bg={'background'} fg={'dark'} rounded={2} p={16}>
                        <Div fontSize={13}>너랑 나랑 모두 {ComUtil.addCommas(rewardWon)}원씩 쇼핑 지원!</Div>
                        <Div fontSize={13}>초대받은 친구가 상품을 구매하면? 가입 후 최대 3개월까지 상품 금액의 1% 무제한 추가 적립</Div>
                        <Div mt={13}></Div>
                        <Div fontSize={13}>Step 1.</Div>
                        <Div fontSize={13}>카카오톡으로 바로 공유하거나, 친구 추천 코드를 복사하여 친구에게 공유해주세요!</Div>
                        <Div fontSize={13}>(코드 오른쪽 종이 아이콘을 클릭하면 클립보드에 저장돼요!)</Div>
                        <Div mt={13}></Div>
                        <Div fontSize={13}>Step 2.</Div>
                        <Div fontSize={13}>초대한 친구가 회원가입을 했다면, 첫 구매를 응원해주세요!</Div>
                        <Div fontSize={13}>친구가 첫 구매 후 구매 확정하면 바로 적립금이 지급됩니다.</Div>
                        <Div fontSize={13}>친구에게는 {ComUtil.addCommas(rewardWon)}원 상당의 할인 쿠폰을 드려요 :)</Div>
                    </Div>
                </Div>

                <Div px={16} py={25} >
                    <Flex mb={10}>
                        <Div fw={500}>내 활동 집계</Div>
                        {/*<Right fontSize={12} fg={'dark'}>*/}
                            {/*/!*<Button bg='white' bc={'light'} fg={'black'} px={10} fontSize={12} onClick={this.modalEnterCode}>추천인 코드 입력</Button>*!/*/}
                            {/*{*/}
                                {/*this.state.recommenderNo != 0 && <span>추천인 코드  :  {ComUtil.encodeInviteCode(this.state.recommenderNo)}</span>*/}
                            {/*}*/}
                        {/*</Right>*/}
                    </Flex>
                    <RoundedContainer>
                        {/*<Div p={5}>*/}
                            {/*<Div fontSize={12}>내 활동 레벨</Div>*/}
                            {/*<Flex justifyContent={'center'} bold textAlign={'center'} minHeight={50}>*/}
                                {/*<Div bold mr={3} fontSize={18}>*/}
                                    {/*{this.state.recommendInfo.recommendLevelStr}*/}
                                {/*</Div>*/}
                            {/*</Flex>*/}
                        {/*</Div>*/}
                        <Div p={5}>
                            <Div textAlign={'center'} fontSize={12}>친구초대 수</Div>
                            <Flex justifyContent={'center'} minHeight={50}>
                                <Div bold mr={3} fontSize={18} >{this.state.recommendInfo.friendCount}</Div>
                                <Div fontSize={18}>명</Div>
                            </Flex>
                        </Div>
                        <Div p={5}>
                            <Div textAlign={'center'} fontSize={12}>총 누적금액</Div>
                            <Flex justifyContent={'center'} minHeight={50} fg={'bly'}>
                                <Div bold mr={3} fontSize={18} >{this.state.recommendInfo.totalReward}</Div>
                                <Div fontSize={18}>BLY
                                    <Span fontSize={12} fg={'dark'}> ({ComUtil.addCommas((this.state.recommendInfo.totalReward * this.state.blctToWon).toFixed(0))}원)</Span>
                                </Div>
                            </Flex>
                        </Div>
                    </RoundedContainer>

                    <Div mt={25}>
                        <CollapseItem title={'활동 보상 내역 안내'} >
                            <Div py={16}>
                                {/*<Div fontSize={12} mb={10}>친구초대 시 적립되는 금액은 레벨에 따라 다르게 반영됩니다.</Div>*/}
                                <GradeTable />
                                <br/>
                                <DetailBox />
                            </Div>
                        </CollapseItem>
                    </Div>

                    {/*<Div px={16} py={25} mt={20}>*/}
                        {/*<Flex mb={10}>*/}
                            {/*<Div fw={500}>친구에게 이렇게 소개해 보세요!</Div>*/}
                        {/*</Flex>*/}

                        {/*<Div py={10}>*/}
                            {/*<Div fontSize={13}>◯◯아~</Div>*/}
                            {/*<Div fontSize={13}>"지금 샵블리에 회원가입하면 바로 사용 가능한 6,000원 상당 쿠폰을 받을 수 있고, 받은 쿠폰으로 첫 구매하면 2천원 상당 쿠폰을 추가로 지급해 준데~</Div>*/}
                            {/*<Div fontSize={13}>지금 가입 ㄱㄱ"</Div>*/}
                            {/*<Div mt={13}></Div>*/}
                            {/*<Div fontSize={13}>1. 신규 회원가입 시 6천원 상당의 쿠폰 무조건 지급</Div>*/}
                            {/*<Div fontSize={13}>2. 친구초대 코드 입력 후 첫 구매확정 시 2천원 상당의 쿠폰 추가 지급</Div>*/}
                        {/*</Div>*/}
                    {/*</Div>*/}

                    <Div mt={25} bg={'background'} fg={'dark'} fontSize={12} py={6}>
                        <Div fg={'black'} px={12} fontSize={13} fw={500} > 유의사항 </Div>
                        <Flex dot alignItems={'flex-start'} py={4} px={12}>
                            <Div>본 이벤트는 당사의 사정에 의해 임의 변경 또는 조기 종료될 수 있습니다.</Div>
                        </Flex>
                        <Flex dot alignItems={'flex-start'} py={4} px={12}>
                            <Div>'친구초대 시즌3' 이벤트는 공지 시점 이후 샵블리의 모든 신규 회원 및 추천 활동한 기존 회원에게 적용됩니다.</Div>
                        </Flex>
                        <Flex dot alignItems={'flex-start'} py={4} px={12}>
                            <Div>부정한 방법으로 이벤트에 참여하거나 허위사실로 추천인 가입을 유도할 경우 ① 지급 BLY 회수, ② 혜택 지급 대상 제외, ③ 계정 이용 제한되며,
                            사안의 경중에 따라 수사 기관 의뢰 및 피해보상 청구가 진행될 수 있습니다.</Div>
                        </Flex>
                        <Flex dot alignItems={'flex-start'} py={4} px={12}>
                            <Div>보안 로직에 의한 불법 이용 감지로 이벤트 참여 계정이 어뷰저 처리 되는 경우가 발생할 수 있습니다. 샵블리 [마이페이지-1:1문의]로 문의 바랍니다.</Div>
                        </Flex>
                        <Flex dot alignItems={'flex-start'} py={4} px={12}>
                            <Div>본 이벤트 관련 혜택을 사고 파는 행위 적발 시 해당 계정은 제한되며, 지급된 혜택은 모두 회수됩니다.</Div>
                        </Flex>
                        <Flex dot alignItems={'flex-start'} py={4} px={12}>
                            <Div>샵블리는 계정 제한 해제를 위해 홍보 활동 자료를 요청할 수 있으며, 안내한 기간 내 소명이 어려울 경우 계정 제한 해제가 불가합니다.</Div>
                        </Flex>
                        <Flex dot alignItems={'flex-start'} py={4} px={12}>
                            <Div>친구추천 코드 기재는 회원가입 화면에서만 최초 1회 가능하며, 이미 등록한 추천 코드는 삭제와 변경이 불가합니다.
                            친구 초대를 통해 가입 시 친구의 추천 코드가 맞는지 반드시 확인 바랍니다. </Div>
                        </Flex>
                        <Flex dot alignItems={'flex-start'} py={4} px={12}>
                            <Div>'친구 초대' 내용을 받으시는 분의 사전 동의 없이 혹은 의사에 반하여 전송하시는 경우, '정보통신망 이용 촉진 및 정보 보호 등에 관한 법률 위반' 으로 과태료가 부과될 수 있으며, 추천에 따른 혜택이 취소 될 수 있습니다.</Div>
                        </Flex>
                    </Div>

                </Div>

                {/*<Hr />*/}
                <Flex cursor>

                    {/*<HeaderBox text={`친구초대랭킹`} tabId={this.state.tabId} active={this.state.tabId === '1'} onClick={this.onHeaderClick.bind(this, '1')}/>*/}
                    {/*<HeaderBox text={`구매랭킹`} tabId={this.state.tabId} active={this.state.tabId === '2'} onClick={this.onHeaderClick.bind(this, '2')}/>*/}

                </Flex>



                <Div>
                    {
                        // this.state.tabId === "1" ?
                        //     <InviteRanking data={this.state.rankingData} /> :
                        //     <BuyingRanking data={this.state.rankingData}  />
                    }
                </Div>

                {/*웹용 링크*/}
                {/*<p m={10} className='text-center font-weight-bold' id="kakao-web-btn" onClick={this.kakaoLinkClick}>카카오 링크 테스트(web)</p>*/}

                {/*mobileApp용 링크*/}
                {/*<Button bc={'secondary'} onClick={this.kakaoLinkClick}>카카오 링크 테스트2(phoneApp)</Button>*/}


                {/*추천인코드 입력 모달*/}
                {
                    this.state.isOpen &&
                    <Modal isOpen={true} centered>
                        <ModalHeader>추천인 코드 입력</ModalHeader>
                        <ModalBody>
                            {
                                this.state.recommenderNo !== 0 ?
                                    <Div textAlign={'center'} bg={'backgroundDark'} py={10}>
                                        추천인 코드  :  {ComUtil.encodeInviteCode(this.state.recommenderNo)}
                                    </Div>
                                    :
                                    <Div>
                                        <Input block placeholder="추천인 코드를 입력해주세요." name="recommenderCode" onChange={this.handleChange} value={this.state.recommenderCode}
                                        />
                                    </Div>
                            }
                            {/*<Div mt={10} fontSize={12}>- <Span fg={'danger'}>내가 상품 구매시 추천한 친구에게 정해진 % 만큼 적립 됩니다.</Span></Div>*/}

                            <Div mt={10} fontSize={12}>- <u>한번 등록한 추천코드는 변경이 불가능</u>합니다.</Div>
                        </ModalBody>
                        <ModalFooter>
                            {
                                this.state.recommenderNo === 0 && <Button px={10} bg={'bly'} fg={'white'} onClick={this.onConfirm}>저장</Button>
                            }
                            <Button px={10} bg={'white'} bc={'secondary'} onClick={this.onCancel}>닫기</Button>
                        </ModalFooter>
                    </Modal>
                }

            </Fragment>
        )
    }
}