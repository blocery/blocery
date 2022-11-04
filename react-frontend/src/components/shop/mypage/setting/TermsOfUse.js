import React, { Component, Fragment } from 'react'
import { Container, Row, Col, Input } from 'reactstrap'
import { ShopXButtonNav } from '~/components/common/index'
import { B2cTermsOfUse, B2cTermsOfUse11 } from '~/components/common/termsOfUses'
import BackNavigation from "~/components/common/navs/BackNavigation";

export default class TermsOfUse extends Component {
    constructor(props) {
        super(props)

        this.state = {
            version: '11'
        }
    }
    componentDidMount(){
        //window.scrollTo(0,0)
    }

    versionChange = (e) => {
        this.setState({
            version: e.target.value
        })
    }

    render() {
        return (
            <Fragment>
                {/*<ShopXButtonNav historyBack fixed>이용약관</ShopXButtonNav>*/}
                <BackNavigation>이용약관</BackNavigation>
                <Container>
                    <Row>
                        <Col className={'p-2'}>
                            {this.state.version === '10' &&
                                <B2cTermsOfUse/>
                            }
                            {this.state.version === '11' &&
                                <B2cTermsOfUse11/>
                            }
                        </Col>
                    </Row>

                    <Row>
                        <Col sm={3}/>
                        <Col className={'p-2'}>
                            <div> [ 이전이용 약관 보기 ] </div>
                            <Input type='select' name='select' id='version' onChange={this.versionChange}>
                                <option name='v11' value='11' selected={this.state.version==='11'?true:false} > 이용약관(Ver.1.1, 2021년 11월 11일) </option>
                                <option name='v10' value='10' selected={this.state.version==='10'?true:false} > 이용약관(최초 이용약관) </option>
                            </Input>
                        </Col>
                        <Col sm={3}/>
                    </Row>
                </Container>

            </Fragment>
        )
    }

}