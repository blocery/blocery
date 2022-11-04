import React, { Component, Fragment } from 'react'
import { Container, Row, Col, Input } from 'reactstrap'
import { ShopXButtonNav } from '~/components/common/index'
import { B2cPrivatePolicy } from '~/components/common/termsOfUses'
import BackNavigation from "~/components/common/navs/BackNavigation";
import { B2cPrivatePolicy11 } from '~/components/common/termsOfUses'

export default class PrivacyPolicy extends Component {
    constructor(props) {
        super(props)

        this.state = {
            version: '11'
        }
    }

    // componentDidMount(){
    //     window.scrollTo(0,0)
    // }

    versionChange = (e) => {
        this.setState({
            version: e.target.value
        })
    }

    render() {
        return (
            <Fragment>
                {/*<ShopXButtonNav historyBack fixed>개인정보 취급 방침</ShopXButtonNav>*/}
                <BackNavigation>개인정보 취급 방침</BackNavigation>
                <Container>
                    <Row>
                        <Col className={'p-2'}>
                            {this.state.version === '10' &&
                                <B2cPrivatePolicy/>
                            }
                            {this.state.version === '11' &&
                                <B2cPrivatePolicy11/>
                            }

                        </Col>
                    </Row>

                    <Row>
                        <Col sm={3}/>
                        <Col className={'p-2'}>
                            <div> [ 이전 개인정보처리방침 보기 ] </div>
                            <Input type='select' name='select' id='version' onChange={this.versionChange}>
                                <option name='v11' value='11' selected={this.state.version==='11'?true:false} > 개인정보처리방침(Ver.1.1, 2021년 11월 11일) </option>
                                <option name='v10' value='10' selected={this.state.version==='10'?true:false} > 개인정보처리방침(최초 개인정보처리방침) </option>
                            </Input>
                        </Col>
                        <Col sm={3}/>
                    </Row>

                </Container>
            </Fragment>
        )


    }

}