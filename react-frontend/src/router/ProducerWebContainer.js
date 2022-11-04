import React, { Component, Fragment } from 'react'
import { ProducerWebNav } from '~/components/common'
import { ProducerWebMenuList, ProducerWebSubMenuList, Server} from '~/components/Properties'
import { doProducerLogout, getLoginProducerUser, getLoginAdminUser, tempAdminProducerLogin, tempAdminProducerList, chainProducerLogin } from '~/lib/loginApi'
import { getProducerByProducerNo } from '~/lib/producerApi'
import {Input, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'
import classNames from 'classnames'
import Error from '~/components/Error'
import { Button } from 'reactstrap'
import Css from './ProducerWeb.module.scss'
import ProducerList from '~/components/common/modalContents/producerList'
import {Button as StButton, Flex, Input as StInput} from "~/styledComponents/shared";
import {FaSearchPlus} from "react-icons/fa";

class ProducerWebContainer extends Component {
    constructor(props) {
        console.log({producerWebContainer: props})
        super(props)
        this.state = {
            producerModalOpen:false,
            loginUser: {},
            adminUser: '',
            chainProducer: false,
            producerList: [],
            selectedProducerEmail: 'producer@ezfarm.co.kr',
            localfoodFlag: false
        }
    }
    async componentDidMount(){

        //admin용 콤보
        let selectedProducerEmail = this.state.selectedProducerEmail;


        //일반 생산자 로직//////////////////////

        let loginProducer = await getLoginProducerUser();
        console.log('ProducerWebContainer loginProducer', loginProducer);
        if (loginProducer)
            selectedProducerEmail  = loginProducer.email;



        ////////// tempProducer@ezfarm.co.kr 용도///////////////////////////////////
        // => AdminProducer 로그인: adminLoginCheck -  tempProducer일 경우, producer자동로그인 수행.-20200330
        let adminUser = await getLoginAdminUser();
        //console.log('ProducerWebContainer - componentDidMount:', adminUser);

        let producerList = [];
        let chainProducer = false;
        let bLocalfoodFlag = false;

        if (adminUser && adminUser.email === 'tempProducer@ezfarm.co.kr') {

            //(WebHome에서 수행) tempProducer@ezfarm.co.kr 로그인시. 생산자 자동로그인 (우선은 producer@ezfarm.co.kr로 자동 로그인?)
            let {data:loginInfo} = await (selectedProducerEmail)? tempAdminProducerLogin({email:selectedProducerEmail}) : tempAdminProducerLogin();
            //console.log('tempAdminProducerLogin', loginInfo);

            if (loginInfo) {
                selectedProducerEmail = loginInfo.email;//producer 강제 로그인된 값을 받음.
            }


            let {data:tempProducerList} = await tempAdminProducerList();
            if (!tempProducerList) { //admin 미로그인 - 시간지나서 로그아웃 된 경우
                this.props.history.push('/admin/login')
            }

            // 싱싱블루베리농원(producerNo 78) 미노출 요청으로 필터처리
            tempProducerList = tempProducerList.filter(producer => (producer.uniqueNo !== 78));

            tempProducerList.sort(function (a, b) {
                if (a.name > b.name) {
                    return 1;
                }
                if (b.name > a.name) {
                    return -1;
                }
                return 0;
            });

            //option List 생성..
            producerList = tempProducerList.map((producer) => {
                let option =  {value: producer.email, name:producer.name};
                return option;
            })
        } else if(
            loginProducer &&
            (
                (loginProducer.uniqueNo === 106 || loginProducer.uniqueNo === 108) ||
                (loginProducer.uniqueNo === 101 || loginProducer.uniqueNo === 111)
            )
        ) {

            // todo : 생산자 그룹핑? 기능 고민해야 할듯!!

            if((loginProducer.uniqueNo === 106 || loginProducer.uniqueNo === 108)) {
                producerList = [
                    {value: "nplabs@naver.com", name: "바른먹거리연구소(면세)"},
                    {value: "junupp@daum.net", name: "바른먹거리연구소(가공)"}
                ]
            }
            else if((loginProducer.uniqueNo === 101 || loginProducer.uniqueNo === 111)) {
                producerList = [
                    {value: "c-won27@hanmail.net", name: "농업회사법인 리더스팜"},
                    {value: "thefarm0114@naver.com", name: "농업회사법인 리더스팜(가공)"}
                ]
            }

            chainProducer = true;

        } else {
            adminUser = null;   //adminUser로 생산자 로그인 방식 실패.
            if (!loginProducer && !adminUser) { //producer도 admin(tempAdmin)도 미로그인 이면
                this.props.history.push('/producer/webLogin')
            }
        }

        if(loginProducer){
            console.log("loginProducer=====",loginProducer)
            const {data: producerInfo} = await getProducerByProducerNo(loginProducer.uniqueNo);
            if (producerInfo != null) {
                if (producerInfo.localfoodFlag) {
                    bLocalfoodFlag = true;
                }
            }
        }


        this.setState({
            loginUser:loginProducer,
            adminUser:adminUser,
            chainProducer: chainProducer,
            producerList:producerList,
            selectedProducerEmail: selectedProducerEmail,
            localfoodFlag : bLocalfoodFlag,
            producerNo : loginProducer ? loginProducer.uniqueNo : 0
        })
    }

    onClickLogout = async () => {
        await doProducerLogout();

        //자기 페이지 강제 새로고침()
        //window.location = this.props.history.location.pathname
        window.location = '/producer/webLogin'
    }

    onItemChange = (e) => {
        this.onProducerChange(e.target.value);
    }

    onProducerChange = async (email) => {
        let selectedProducer = this.state.producerList.find( prodOption => (prodOption.value === email));
        //console.log('onItemChange - selectedProducer:', selectedProducer)

        //login시도
        let newLogin = {
            email:selectedProducer.value  //email
        }

        if (this.state.adminUser && this.state.adminUser.email === 'tempProducer@ezfarm.co.kr') {
            let {data: loginInfo} = await tempAdminProducerLogin(newLogin);
            //console.log('onItemChange - tempAdminProducerLogin', loginInfo.email);
        } else if(this.state.chainProducer) {
            // 로그인 변경 같은 (생산자 업체)
            let {data: loginInfo} = await chainProducerLogin(selectedProducer.value);
            console.log('onItemChange - chainProducerLogin', loginInfo);
        }

        this.setState({
            selectedProducerEmail: selectedProducer.value
        });

        window.location.reload(); //콤보 바꾸면, 전체화면 새로 고침
    }

    //오늘의 생산자 클릭
    onProducerClick = () => {
        this.toggleProducerModal();
    }

    onProducerModalClosed = async (data) => {
        this.toggleProducerModal();
        if (data) {
            let adminUser = await getLoginAdminUser();
            //login시도
            let newLogin = {
                email:data.email  //email
            }

            if (adminUser && adminUser.email === 'tempProducer@ezfarm.co.kr') {
                let {data: loginInfo} = await tempAdminProducerLogin(newLogin);
                //console.log('onItemChange - tempAdminProducerLogin', loginInfo.email);
            } else if(this.state.chainProducer) {
                // 로그인 변경 같은 (생산자 업체)
                let {data: loginInfo} = await chainProducerLogin(data.email);
                console.log('onItemChange - chainProducerLogin', loginInfo);
            }

            this.setState({
                selectedProducerEmail: data.email
            });

            window.location.reload(); //콤보 바꾸면, 전체화면 새로 고침
        }
    }

    toggleProducerModal = () => {
        this.setState({
            producerModalOpen: !this.state.producerModalOpen
        })
    }

    render() {
        const { id, subId } = this.props.match.params

        const mainMenuItem = ProducerWebMenuList.find(main => main.id === id)
        let mProducerWebSubMenuList = ProducerWebSubMenuList;
        let subMenuItem = mProducerWebSubMenuList.find(subMenu => subMenu.parentId === id && subMenu.id === subId)
        const Content = subMenuItem ? subMenuItem.page : null

        return(

            <Fragment>
                { /* header */ }
                <div className={Css.header}>
                    <div className={Css.logo}>
                        ShopBly
                    </div>
                    <div className={'p-1 font-weight-bold'}>
                        {
                            (!this.state.adminUser && !this.state.chainProducer) &&
                                <span>{this.state.loginUser.name}</span>
                        }
                        {
                            (this.state.adminUser)   &&
                                <div className='pl-3'>
                                    <Flex>
                                        <div style={{width: 250}}>
                                            <Input type='select' name='select' id='producereList' onChange={this.onItemChange}>
                                                { this.state.producerList.map((producerOption,idx) => {
                                                    console.log('on select option:', producerOption.value, this.state.selectedProducerEmail);
                                                    return <option key={idx} name='producer' value={producerOption.value} selected={(producerOption.value===this.state.selectedProducerEmail)}> {producerOption.name} </option>
                                                })}
                                            </Input>
                                        </div>
                                        <StButton ml={5} bg={'green'} fg={'white'} onClick={this.onProducerClick} px={10}><FaSearchPlus/>{' 찾기'}</StButton>
                                    </Flex>
                                </div>
                        }
                        {
                            (this.state.chainProducer) &&
                                <div className='pl-3' style={{width: 250}}>
                                    <Input type='select' name='select' id='producereList' onChange={this.onItemChange}>
                                        { this.state.producerList.map((producerOption,idx) => {
                                            console.log('on select option:', producerOption.value, this.state.selectedProducerEmail);
                                            return <option key={idx} name='producer' value={producerOption.value} selected={(producerOption.value===this.state.selectedProducerEmail)}> {producerOption.name} </option>
                                        })}
                                    </Input>
                                </div>
                        }

                    </div>
                    <div className={'ml-auto p-1'}>
                        <span className={'small text-secondary mr-2'}>고객센터 031-421-3414</span>
                        <Button size={'sm'} outline onClick={this.onClickLogout}>로그아웃</Button>
                    </div>
                </div>
                { /* body */ }
                <div className={Css.body}>
                    { /* left */ }
                    <div className={Css.left}>
                        <ProducerWebNav {...this.props} id={id} subId={subId} localfoodFlag={this.state.localfoodFlag} producerNo={this.state.producerNo}/>
                    </div>
                    { /* content */ }
                    <div className={Css.contentWrap}>
                        <div className={Css.contentHeader}>
                            {
                                `${mainMenuItem.name} > ${subMenuItem.name}`
                            }
                            <div className={Css.contentHeaderExplain}>
                                {subMenuItem.explain}
                            </div>
                        </div>
                        <div className={classNames(Css.contentBody, !subMenuItem.noPadding && Css.padding)}>
                            {
                                subMenuItem ? <Content {...this.props} /> : <Error />
                            }
                        </div>

                    </div>
                </div>
                {/*생산자 모달 */}
                <Modal size="lg" isOpen={this.state.producerModalOpen}
                       toggle={this.toggleProducerModal} >
                    <ModalHeader toggle={this.toggleProducerModal}>
                        생산자 검색
                    </ModalHeader>
                    <ModalBody>
                        <ProducerList
                            onClose={this.onProducerModalClosed}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary"
                                onClick={this.toggleProducerModal}>취소</Button>
                    </ModalFooter>
                </Modal>
            </Fragment>
        )
    }
}

export default ProducerWebContainer