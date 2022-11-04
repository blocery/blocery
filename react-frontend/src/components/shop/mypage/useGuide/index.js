import React, { Component, Fragment } from 'react'
import { Container, Card, CardText, CardBody, CardTitle, Row, Col } from 'reactstrap'
import { ShopXButtonNav } from '~/components/common'
import { setMissionClear } from "~/lib/eventApi"

import {Div, Button, Strong, Span} from '~/styledComponents/shared'
import { FaStore, FaBolt, FaDiaspora, FaShoppingCart, FaRegGrinBeam } from 'react-icons/fa'
import { FiHeadphones } from 'react-icons/fi'
import {RiPlantFill} from 'react-icons/ri'
import BackNavigation from "~/components/common/navs/BackNavigation";

export default class UseGuide extends Component {
    constructor(props){
        super(props);
        this.state = {

        }
    }

    // componentDidMount() {
    //     window.scrollTo(0,0)
    //     //setMissionClear(9).then( (response) => console.log('UserGuide:missionEvent9:' + response.data )); //이용안내 출력..
    // }
    // 1:1문의 이동
    moveToPrivateContact = () => {
        this.props.history.push('/mypage/privateContact')
    }

    render(){
        return (
            <Fragment>
                {/*<ShopXButtonNav underline fixed historyBack>이용안내</ShopXButtonNav>*/}
                <BackNavigation>이용안내</BackNavigation>
                <Container className={'pt-3 pb-3'}>
                    <Row>
                        <Col xs={12} sm={12} md={6} className='p-0'>

                            <Col sm={12} className={'mb-3'}>
                                <Card body>
                                    <CardTitle className='f2'><span className='d-flex align-items-center'><FaStore className='mr-2'/>샵블리 소개</span></CardTitle>
                                    <CardText>
                                        <Strong fg={'green'}>내 식탁의 모든 기록, 샵블리</Strong><br/>
                                        안전한 먹거리로 건강을 구매하세요!<br/>
                                        샵블리의 상품에는 <Span fg={'green'}>다양한 스토리와 정보가 기록</Span>이 되어 있습니다.<br/>
                                        생산에서부터 소비까지의 다양한 정보를 확인하고, 안전한 먹거리를 내 식탁에 올려보시는건 어떠세요?<br/><br/>
                                        <Strong fg={'green'}>생산자와 소비자가 함께하는 쇼핑몰</Strong><br/>
                                        샵블리는 생산자와 소비자가 함께 만들어 나가는 커뮤니티 참여형 농식품 E-Commerce 플랫폼입니다.<br/>
                                        생산자분들의 다양한 활동 기록과 소비자분들의 커뮤니티, 리뷰 등의 다양한 내용이 한 공간에 제공되어 누구나 쉽게 확인하고 소통할 수 있어요.<br/>
                                        샵블리안에서 다양한 이야기를 만들어 나가시는건 어떨까요?
                                    </CardText>
                                </Card>
                            </Col>
                            <Col sm={12} className={'mb-3'}>
                                <Card body>
                                    <CardTitle className='f2'><span className='d-flex align-items-center'><FaRegGrinBeam className='mr-2'/>회원/혜택</span></CardTitle>
                                    <CardText>
                                        샵블리에 회원가입을 하시면 가입 즉시 바로 사용할 수 있는 각종 할인쿠폰을 제공해 드리며 적립금, 이벤트 등의 혜택 및 다양한 커뮤니티에 활동을 하실 수 있는 권한을 부여해 드려요.<br/>
                                        또한 활동에 따라 등급UP 할 수 있으며 <Span fg={'green'}>등급에 따른 추가할인, 적립, 리뷰 2배 적립 등의 혜택</Span>도 받으실 수 있답니다.<br/>
                                        지금 회원가입하고 다양한 혜택을 받아보세요!
                                    </CardText>
                                </Card>
                            </Col>
                            <Col sm={12} className={'mb-3'}>
                                <Card body>
                                    <CardTitle className='f2'><span className='d-flex align-items-center'><FaShoppingCart className='mr-2'/>주문/결제</span></CardTitle>
                                    <CardText>
                                        상품 주문 시 일반적인 결제수단 뿐만 아니라 <Span fg={'green'}>쿠폰, 포인트, 적립금을 통한 결제도 가능</Span>해요.<br/>
                                        샵블리 활동을 통해 쿠폰, 포인트, 적립금 등을 획득하고 보다 저렴하게 상품을 구매해 보세요.
                                    </CardText>
                                </Card>
                            </Col>
                            <Col sm={12} className={'mb-3'}>
                                <Card body>
                                    <CardTitle className='f2'><span className='d-flex align-items-center'><FaBolt className='mr-2'/>즉시구매 상품</span></CardTitle>
                                    <CardText>
                                        즉시구매 상품은 <Span fg={'green'}>산지직송 및 일반상품 등 구매 후 빠르게 발송되는 상품</Span>을 말해요.<br/>
                                        주문 시 산지에서 직접 수확하여 배송하는 상품으로 산지의 보다 신선한 상품을 빠르게 받아보실 수 있습니다.
                                    </CardText>
                                </Card>
                            </Col>
                            <Col sm={12} className='mb-3'>
                                <Card body>
                                    <CardTitle className='f2'><span className='d-flex align-items-center'><RiPlantFill className='mr-2'/>예약구매 상품</span></CardTitle>
                                    <CardText>
                                        예약구매 상품은 <Span fg={'green'}>계약재배 등 상품을 선구매하고 지정된 날에 받아볼 수 있는 상품</Span>을 말합니다.<br/>
                                        현재 샵블리에서는 계약재배 상품을 중심으로 제공해 드리고 있는데요.<br/>
                                        쑥쑥-계약재배 상품은 내가 구매하고자 하는 상품의 다양한 이력을 확인하고 안전한 먹거리를 구매할 수 있는 서비스에요.<br/>
                                        생산농가에서 입력한 다양한 생산정보, 활동 그리고 유통과정에서 발생하는 유통정보 등을 블록체인에 기록하여 투명하고 정직한 정보를 제공하여, 농산물을 보다 믿고 안전하게 구매할 수 있습니다.<br/>
                                        슬기롭게 소비하고, 농가 및 지역사회 등 내수 살리기도 돕고, 1석 2조 효과에 참여해 보세요!<br/><br/>
                                        <Strong fg={'green'}>"흙에서 식탁까지의 모든 기록"</Strong><br/>
                                        안전한 먹거리에 대한 구매를 지금 바로 경험해 보세요<br/>
                                    </CardText>
                                </Card>
                            </Col>
                        </Col>
                        <Col sm={12} md={6} className='p-0'>
                            <Col sm={12} className={'mb-3'}>
                                <div>* 추가적인 문의사항이 있으시면 </div>
                                <div>
                                    <Button color='link' size='sm' onClick={this.moveToPrivateContact}>1:1문의 ></Button>
                                </div>

                            </Col>
                        </Col>
                    </Row>
                </Container>

            </Fragment>
        )
    }

}