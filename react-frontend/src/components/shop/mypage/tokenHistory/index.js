import React, {Component, createRef, Fragment} from 'react';
import {Collapse, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';

import { getConsumer, getMyTokenHistory, getConsumerPK, checkAbuser } from '~/lib/shopApi'
import { scOntGetBalanceOfBlctMypage } from "~/lib/smartcontractApi";
import { BLCT_TO_WON } from "~/lib/exchangeApi"
import ComUtil from '~/util/ComUtil'

import {Button, Button as Btn} from '~/styledComponents/shared/Buttons'
import { Div, Span, Flex, Right } from '~/styledComponents/shared/Layouts'
import { HrThin, HrHeavyX2 } from '~/styledComponents/mixedIn'
import Checkbox from '~/components/common/checkboxes/Checkbox'
import { color } from "~/styledComponents/Properties";
import {PassPhrase} from '../../../common'
import { toast } from 'react-toastify'                              //토스트
// import 'react-toastify/dist/ReactToastify.css'

import {BsBoxArrowInDownLeft, BsBoxArrowUpRight} from 'react-icons/bs'

import BlySise from '~/components/common/blySise'
import { AiOutlineInfoCircle } from 'react-icons/ai'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import {checkPassPhrase} from '~/lib/loginApi'

import Skeleton from '~/components/common/cards/Skeleton'
import BackNavigation from "~/components/common/navs/BackNavigation";
import {Bold} from "~/styledComponents/ShopBlyLayouts";

const HistoryItem = ({bly, date, title, subTitle, gubun, type}) =>
    <Div>
        <Flex p={16} alignItems={'flex-start'}>
            <Div>
                <Div fontSize={16} mb={4}>{title}</Div>
                {
                    subTitle && <Div fontSize={12} fg={'dark'} mb={4}>{subTitle}</Div>
                }
                <Div fontSize={10} fg={'secondary'}>{ComUtil.utcToString(date, 'YYYY-MM-DD HH:mm')}</Div>
            </Div>
            {
                <Right bold fontSize={16} fg={'green'} flexShrink={0}>
                    {
                        gubun === -1 ?
                            (<Span fg={'danger'}>- {ComUtil.addCommas(ComUtil.toNum(bly).toFixed(2))}</Span>)
                            : (<Span fg='green'>+ {ComUtil.addCommas(ComUtil.toNum(bly).toFixed(2))}</Span>)
                    }
                </Right>
            }
        </Flex>
        <HrThin m={0} />
    </Div>

export default class TokenHistory extends Component {
    constructor(props){
        super(props)
        this.state = {
            tokenBalance: null,       //전체 BLCT
            availableBalance: null,   //가용BLCT
            lockedBlct: null,         //잠긴금액
            loginUser:'',
            account: '',
            blctList: null,
            copied: false,
            isOpen: false,
            blctToWon: '',           // BLCT 환율
            onlyIpChul: false,
            noIpChulData: false,
            blySiseModal: false,
            passPhrase: '', //비밀번호 6 자리 PIN CODE
            clearPassPhrase:false,
            modalType: '',
            modal: true,
            pk: '',
            abuser: false
        }
        this.abortController = new AbortController()
    }

    async componentDidMount() {
        try{
            const loginUser = await this.refreshCallback(); //로그인 정보 가져오기

            const {data:abuser} = await checkAbuser(this.abortController.signal);
            console.log({abuser});

            const {data:blctToWon} = await BLCT_TO_WON(this.abortController.signal);
            this.setState({
                blctToWon: blctToWon,
                abuser: abuser
            })

            const {data: tokenHistoryData} = await getMyTokenHistory(this.abortController.signal)

            // console.log({tokenHistoryData})
            const tokenHistories = tokenHistoryData.filter(item => item.bly > 0);

            // console.log('list', tokenHistories)
            ComUtil.sortDate(tokenHistories, 'date', true);

            this.setState({
                blctList: tokenHistories
            })

            // console.log('myPage-componentDidMount:', this.state.loginUser, this.state.loginUser.account);

            if(this.state.loginUser && this.state.loginUser.account) {
                /*
                * double totalBalance;      //전체 BLCT
                * double availableBalance;  //가용BLCT
                * double lockedBlct;        //잠긴금액
                * */
                let {data} = await scOntGetBalanceOfBlctMypage(this.state.loginUser.account, this.abortController.signal);

                const {totalBalance, availableBalance, lockedBlct} = data

                this.setState({
                    tokenBalance: totalBalance,
                    availableBalance: availableBalance,
                    lockedBlct: lockedBlct
                });

            }
        }catch (error) {
            if (error.message === 'canceled') {
                console.log("TokenHistory getMyTokenHistory canceled")
            }else{

            }
        }
    }

    componentWillUnmount() {
        this.abortController.abort();
    }

    refreshCallback = async() => {
        try{
            let {data: loginUser} = await getConsumer(this.abortController.signal);
            if(!loginUser){
                this.abortController.abort()
                this.props.history.replace('/mypage');
                return;
            }
            this.setState({
                loginUser: loginUser,
                account: loginUser.account
            })
            return loginUser
        }catch (error) {
            if (error.message === 'canceled') {
                console.log("PbGoodsContent refreshCallback canceled")
            } else {

            }
        }
    }

    onCopy = () => {
        this.setState({copied: true})
        this.notify('클립보드에 복사되었습니다', toast.success);

        //missionEvent 6번.
        //setMissionClear(7).then( (response) => console.log('tokenHistory:missionEvent7:' + response.data )); //지갑주소 복사.
    }

    //react-toastify usage: this.notify('메세지', toast.success/warn/error);
    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_CENTER
        })
    }

    moveToDeposit = () => {
        // alert('서버점검 및 시스템 안정화로 입/출금 기능이 일시 중단 됩니다')
        // return

        this.props.history.push('/deposit')
    }

    kakaoCertCheck = () => {

        if (this.state.loginUser.consumerNo != 3455) { //tempProducer소비자 정산용.
            // alert('서버점검 및 시스템 안정화로 입/출금 기능이 일시 중단 됩니다')
            // return
        }

        this.props.history.push('/kakaoCertCheck')
    }

    checkOnlyIpCulList = () => {
        this.setState(prevState => ({
            onlyIpChul: !prevState.onlyIpChul
        }));
    }

    //BLY 시세 모달
    onBlySiseClick = async () => {
        this.setState({
            blySiseModal: true
        })
    }

    //BLY 시세 모달 toggle
    onBlySiseModalToggle = () => {
        this.setState({
            blySiseModal: !this.state.blySiseModal
        })
    }

    onShowPK = () => {
        this.setState({
            modal:true, //결제비번창 오픈. //////////////////////////
            modalType: 'showPk'
        })
    }

    //결재처리
    modalToggleOk = async () => {
        //비밀번호 6 자리 PIN CODE
        let passPhrase = this.state.passPhrase;
        let {data: checkResult} = await checkPassPhrase(passPhrase);
        if (!checkResult) {
            this.notify('결제 비번이 틀렸습니다.', toast.warn);

            //결제 비번 초기화
            this.setState({clearPassPhrase: true});

            return; //결제 비번 오류, stop&stay
        }

        const {data:pk} = await getConsumerPK();

        this.setState({
            modal: false,
            pk: pk,
            isOpen: !this.state.isOpen
        });
    }

    //6자리 인증 비번 PassPhrase(6 CHAR PIN CODE)
    onPassPhrase = (passPhrase) => {
        //console.log(passPhrase);
        this.setState({
            passPhrase: passPhrase,
            clearPassPhrase:false
        });
    };

    // 결제 비밀번호 힌트
    findPassPhrase = () => {
        this.setState({
            modalType: 'passPhrase',
            modal: true
        })
    }

    // 마이페이지로 이동
    moveToMypage = () => {
        window.location = '/mypage'
    }

    modalToggle = () => {
        this.setState(prevState => ({
            modal: !prevState.modal
        }));
    };

    render() {
        const {
            tokenBalance,       //전체 BLCT
            availableBalance,   //가용BLCT
            lockedBlct,         //잠긴금액
            loginUser,
            account,
            blctList,
            copied,
            pk,
            blctToWon,           // BLCT 환율
            onlyIpChul,
            noIpChulData,
            blySiseModal,
            abuser
        } = this.state

        const accountHead = account.substring(0,7)
        const accountTail = account.substring(account.length-7,account.length)

        const pkHead = pk.substring(0,7)
        const pkTail = pk.substring(pk.length-7,pk.length)
        // const data = blctList

        return (
            <Fragment>
                {/*<ShopXButtonNav underline historyBack>자산(BLY)</ShopXButtonNav>*/}
                <BackNavigation>적립금(BLY)</BackNavigation>
                <Div p={30} pb={26}>

                    {
                        availableBalance === null ? <Skeleton p={0} mb={20}/> : (
                            <Div textAlign={'left'} mb={20}>
                                {
                                    (lockedBlct !== null && lockedBlct > 0) &&
                                        <Div fontSize={13} bg={'danger'} fg={'white'} rounded={4} display={'inline-block'} px={10} minHeight={23} onClick={()=> toast.info('쑥쑥-계약재배 상품의 결제예약금으로 최종 결제 시 차감됩니다.')}>
                                            <Flex>
                                                <Span pt={2} lineHeight={23} mr={5}>{`결제예약 금액 ${ComUtil.addCommas(lockedBlct.toFixed(2))} BLY`}</Span>
                                                <div>
                                                    <AiOutlineInfoCircle size={15}/>
                                                </div>
                                            </Flex>
                                        </Div>

                                }
                                <div>
                                    {
                                        availableBalance === '' ? <Skeleton.Row width={100}/> :
                                            <Bold bold fontSize={37} my={8}>{`${ComUtil.addCommas(parseFloat(availableBalance).toFixed(2))} BLY`}</Bold>
                                    }
                                </div>
                                <Div bold fg={'green'} fontSize={20} mb={3}>{
                                    availableBalance === '' ? <Skeleton.Row width={60}/> :
                                        ComUtil.addCommas(ComUtil.roundDown(availableBalance * blctToWon, 2))
                                } 원</Div>
                                <Flex>
                                    <Div fg={'adjust'} fontSize={12}>1 BLY = {ComUtil.addCommas(blctToWon)}원</Div>
                                    <Div ml={3} mb={1} onClick={this.onBlySiseClick}>
                                        <AiOutlineInfoCircle color={color.adjust}/>
                                    </Div>

                                </Flex>
                            </Div>
                        )
                    }



                    <Flex>
                        <Div width={'50%'} p={5}>
                            <Btn bg={'white'} bc={'light'} rounded={2} py={10} fontSize={13} block onClick={this.moveToDeposit}>
                                <Flex justifyContent={'center'} alignItems={'flex-start'}>
                                    <BsBoxArrowInDownLeft size={20}/>
                                    <Div ml={8}>입금</Div>
                                </Flex>
                            </Btn>
                        </Div>
                        <Div width={'50%'} p={5}>
                            <Btn bg={'white'} bc={'light'} rounded={2} py={10} fontSize={13} block onClick={this.kakaoCertCheck}>
                                <Flex justifyContent={'center'} alignItems={'flex-start'}>
                                    <BsBoxArrowUpRight size={20}/>
                                    <Div ml={8}>출금</Div>
                                </Flex>
                            </Btn>
                        </Div>
                    </Flex>

                    {abuser ? null :
                        <Div>
                            <Flex mt={15} mb={5} fontSize={12}>
                                <Div>내지갑 주소 (클릭시 복사)</Div>
                                {/*    <Div right={0} position={'absolute'} zIndex={-1} width={136} height={157}>*/}
                                {/*/!*<Img src={bgBill} cover={'contain'} m={0} />*!/*/}
                                {/*</Div>*/}
                                {/*<Right cursor onClick={this.onShowPK}>*/}
                                {/*<Div bb fg={'adjust'}>개인키 보기</Div>*/}
                                {/*</Right>*/}
                            </Flex>

                            <Div textAlign={'center'}>
                                <CopyToClipboard text={account} onCopy={this.onCopy}>
                                    <Btn bc={'light'} block fontSize={12}>{accountHead} ... {accountTail}</Btn>
                                </CopyToClipboard>
                            </Div>

                            <Flex mt={15} mb={5} fontSize={12}>
                                <Div bb fg={'adjust'} onClick={this.onShowPK}>개인키 보기 <Span
                                    display={!this.state.isOpen ? 'none' : ''}>(클릭시 복사)</Span></Div>
                            </Flex>

                            <Collapse isOpen={this.state.isOpen}>
                                <Div fontSize={12}>
                                    <Div textAlign={'center'}>
                                        <CopyToClipboard text={pk} onCopy={this.onCopy}>
                                            <Btn bc={'light'} block fontSize={12}>{pkHead} ... {pkTail}</Btn>
                                        </CopyToClipboard>
                                    </Div>
                                </Div>
                            </Collapse>
                        </Div>
                    }

                </Div>

                <Div ml={16} mb={16} mr={16}>
                    <Flex>
                        <Checkbox bg={'green'} checked={onlyIpChul} onChange={this.checkOnlyIpCulList}  size={'sm'}>
                            <Span fg={'dark'} fontSize={12} lineHeight={20}>입출금 내역만 보기</Span>
                        </Checkbox>
                        <Right fg={'dark'} fontSize={12} lineHeight={20}>
                            최근 3개월 기준
                        </Right>
                    </Flex>
                </Div>

                <HrHeavyX2 m={0} bc={'background'} />
                {
                    !blctList ? <Skeleton.List count={4}/> :
                        (blctList.length === 0) ?
                            <Div textAlign={'center'} p={16}>조회 내역이 없습니다.</Div> :
                            blctList.map((history, index)=> {
                                if (onlyIpChul) {
                                    if (history.type !== 'in' && history.type !== 'out')
                                        return null
                                }
                                return <HistoryItem key={`token_${index}`} {...history} />
                            })

                }

                {/*{*/}
                {/*    (blctList && blctList.length <= 0) && (*/}
                {/*        <Div>*/}
                {/*            <HrThin m={0} />*/}
                {/*            <Flex height={300} justifyContent={'center'}>BLY 사용내역이 없습니다.</Flex>*/}
                {/*        </Div>*/}
                {/*    )*/}
                {/*}*/}

                {
                    blySiseModal &&
                    <Modal isOpen={true} toggle={this.onBlySiseModalToggle} centered>
                        <ModalHeader toggle={this.onBlySiseModalToggle}><b>BLY 시세</b></ModalHeader>
                        <ModalBody>
                            <BlySise open={blySiseModal} />
                        </ModalBody>
                        {/*<ModalFooter>*/}
                        {/*</ModalFooter>*/}
                    </Modal>
                }
                {/* 결제비번 입력 모달 */}
                <Modal isOpen={this.state.modalType === 'showPk' && this.state.modal} toggle={this.toggle} className={this.props.className} centered>
                    <ModalHeader toggle={this.modalToggle}> 결제비밀번호 입력</ModalHeader>
                    <ModalBody className={'p-0'}>
                        {/* clearPassPhrase 초기화, onChange 결과값 세팅 */}
                        <PassPhrase clearPassPhrase={this.state.clearPassPhrase} onChange={this.onPassPhrase}></PassPhrase>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="link" onClick={this.findPassPhrase}>비밀번호를 잊으셨나요?</Button>
                        <Button color="info" onClick={this.modalToggleOk} disabled={(this.state.passPhrase.length === 6) ? false:true}>확인</Button>{' '}
                        <Button color="secondary" onClick={this.modalToggle}>취소</Button>
                    </ModalFooter>
                </Modal>
                {/* 결제비밀번호 조회 */}
                <Modal isOpen={this.state.modalType === 'passPhrase' && this.state.modal} centered>
                    <ModalHeader>결제비밀번호 안내</ModalHeader>
                    <ModalBody>
                        마이페이지에서 결제비밀번호 힌트 조회 후 이용해주세요.
                    </ModalBody>
                    <ModalFooter>
                        <Button color="info" onClick={this.moveToMypage}>마이페이지로 이동</Button>
                        <Button color="secondary" onClick={this.modalToggle}>취소</Button>
                    </ModalFooter>
                </Modal>

            </Fragment>
        )
    }


}