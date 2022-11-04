import React, { Fragment, Component } from 'react'
import { Label, Container } from 'reactstrap'
import {getConsumer} from "~/lib/shopApi";
import { ShopXButtonNav } from '../../../common/index'
import BackNavigation from "~/components/common/navs/BackNavigation";

export default class HintPassPhrase extends Component {
    constructor(props){
        super(props)
        this.state = {
            consumerNo: 0,
            hintFront: ''
        }
    }

    async componentDidMount() {
        let loginUser = await getConsumer();
        if(!loginUser || !loginUser.data){
            this.props.history.replace('/mypage');
            return;
        }
        this.search()
    }

    search = async() => {
        const {data:consumerInfo} = await getConsumer();

        this.setState({
            hintFront: consumerInfo.hintFront
        })
    }

    render() {
        return(
            <Fragment>
                {/*<ShopXButtonNav underline historyBack >결제 비밀번호 관리</ShopXButtonNav>*/}
                <BackNavigation>결제 비밀번호 관리</BackNavigation>
                <Container fluid>
                <p></p>
                    <div>
                        <Label>결제 비밀번호 앞 두자리 확인</Label>
                        <div style={{outline:'black solid thin', fontSize:'50px'}} className={'text-center mt-3'}>{this.state.hintFront}****</div>
                        <br/>
                        <div className={'text-center m-2'}>
                            고객센터로 문의하시면 비밀번호의 일부를 추가로 안내해 드리겠습니다.
                        </div>
                        <div className={'text-center m-2'}>
                            단, 고유번호 전체 확인 또는 비밀번호 변경이 불가능하니 이 점 참고 부탁드립니다.
                            {/*<span style={{color:'#007bff'}}>cs@blocery.io</span>로 추가문의해 주시기 바랍니다.*/}
                        </div>
                    </div>

                </Container>

            </Fragment>
        )
    }
}