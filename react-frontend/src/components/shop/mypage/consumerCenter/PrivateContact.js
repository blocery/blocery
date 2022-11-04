import React, { Component, Fragment } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import { ShopXButtonNav } from '~/components/common/index'
import ComUtil from '~/util/ComUtil'
import BackNavigation from "~/components/common/navs/BackNavigation";
import {Button} from "~/styledComponents/shared";
import {getLoginUser} from "~/lib/loginApi";

export default class PrivateContact extends Component {
    constructor(props) {
        super(props)
        this.state = {
            activeTab: 'delivery',  // FAQ 종류: delivery, token, goods, pay
            loginUser: null
        }
    }

    async componentDidMount() {
        const loginUser = await getLoginUser()
        console.log(loginUser)
        this.setState({ loginUser })
    }

    // notify = (msg, toastFunc) => {
    //     toastFunc(msg, {
    //         position: toast.POSITION.TOP_CENTER
    //     })
    // }

    // web일 때 전화문의 버튼 클릭
    callCenter = () => {
        alert('모바일 앱에서 사용해주세요')
    }

    toggle = (tab) => {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }

    onClick = () => this.props.history.push(`/myPage/myQAReg`) //문의하기 페이지로 이동

    render() {
        return(
            <Fragment>
                {/*<ShopXButtonNav underline historyBack>1:1 문의</ShopXButtonNav>*/}
                <BackNavigation>1:1 문의</BackNavigation>
                <div className='m-3'>
                    <p className='text-center font-weight-bold'>카카오톡 채널 문의</p>
                    <p className='text-center m-3'>상품, 배송, 이벤트 등 샵블리에 대한 <br/> 궁금한 사항은 [샵블리 카카오톡 채널]을 통해 <br/> 문의해 주시면 보다 빠르게 <br/> 답변 받으실 수 있습니다. </p>
                    <p className='text-center'>
                        <a href="http://pf.kakao.com/_GvBnxb" target="_blank" data-rel="external" className='text-info'><u>[샵블리 카카오톡 채널 바로가기]</u></a>
                    </p>
                </div>
                {/*<hr/>*/}
                {/*<div className='m-3'>*/}
                {/*    <p className='text-center font-weight-bold'>1:1 문의</p>*/}
                {/*    <p className='text-center m-3'>회원님들의 소중한 의견에 귀 기울여 <br/> 신속하고 정확하게 답변 드리도록 하겠습니다.</p>*/}
                {/*    <p className='text-center'>*/}
                {/*        <a href="mailto:cs@blocery.io" data-rel="external" className='text-info'><u>cs@blocery.io</u></a>*/}
                {/*    </p>*/}
                {/*</div>*/}
                <hr/>
                <div className='m-3'>
                    <p className='text-center font-weight-bold'>전화문의</p>
                    {
                        ComUtil.isPcWeb() ? <p className='text-center cursor-pointer text-info' onClick={this.callCenter}><u>031-8090-3108</u></p>
                            :
                            <p className='text-center cursor-pointer'><u><a href="tel:031-8090-3108" data-rel="external" className='text-info'>031-8090-3108</a></u></p>
                    }
                    <p className='text-center'>주중 오전 9시 ~ 오후 6시</p>
                    <p className='text-center'>점심시간 낮12시 ~ 오후 1시</p>
                </div>
                <hr/>
                <div className='m-3'>
                {
                    this.state.loginUser && <Button mb={14} fontSize={17} height={50} bg={'green'} fg={'white'} block onClick={this.onClick}>문의하기</Button>
                }
                </div>
                {/*<ToastContainer/>*/}
            </Fragment>
        )
    }
}