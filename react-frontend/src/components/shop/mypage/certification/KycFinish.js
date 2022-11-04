import React, { Fragment, Component } from 'react'
import { getConsumer } from '~/lib/shopApi'
import { Div, Img, Button, Flex } from '~/styledComponents/shared'
import kycSampleImg4 from '~/images/kyc/licence_man_finish.svg';
import styled from 'styled-components'
import BasicNavigation from "~/components/common/navs/BasicNavigation";
const KycBody = styled(Div)`
    height: calc(100vh - 56px - 54px);
    display: block;
    align-items: center;
    justify-conttent: center;
`;
export default class KycCertification extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loginUser: 'notRender'
        }
    }

    async componentDidMount() {
        const {data} = await getConsumer();
        if(!data){
            this.props.history.replace('/mypage');
            return;
        }
        this.setState({
            loginUser: (data) ? data : ''
        })
    }

    onLocation = (gubun) => {
        if(gubun === 'HOME'){
            this.props.history.replace('/');
        }
        else if(gubun === 'MYPAGE'){
            this.props.history.replace('/mypage');
        }
    }

    render() {
        return (
            <Fragment>
                <BasicNavigation><Div pl={16}>KYC 신원 확인</Div></BasicNavigation>
                {
                    this.state.loginUser === 'notRender' ? <Div></Div> :
                        <KycBody>
                            <Div textAlign={'center'}>
                                <Div my={40}><Img width={'50%'} src={kycSampleImg4}></Img></Div>
                                <Div my={20} bold fontSize={18} mt={40}>KYC 신원 확인을 위한 <br/> 서류 제출이 정상적으로 완료 되었습니다.</Div>
                                <Div my={20} fontSize={14} fg={'dark'} mt={10}>
                                    제출하신 서류는 관리자 검토 예정이며(최대 3일 이내)
                                    <Div>승인 후 KYC 신원 확인이 정상적으로 완료됩니다.</Div>
                                    <Div>승인여부는 Push 알림 및 이메일을 통해 안내될 예정입니다.</Div>
                                </Div>

                                <Flex justifyContent={'center'}>
                                    <Button mr={10} width={100} bg={'white'} bc={'light'} py={10} onClick={this.onLocation.bind(this,'HOME')}>홈화면</Button>
                                    <Button width={100} bg={'white'} bc={'light'} py={10} onClick={this.onLocation.bind(this,'MYPAGE')}>마이페이지</Button>
                                </Flex>
                            </Div>
                        </KycBody>
                }
            </Fragment>
        )
    }

}