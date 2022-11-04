import React, {useState} from 'react';
import {Button, Flex} from "~/styledComponents/shared";
import {Col, Container, CustomInput, Row} from "reactstrap";
import {B2cPrivatePolicy11, B2cTermsOfUse11} from "~/components/common/termsOfUses";
import {Required} from "~/styledComponents/ShopBlyLayouts";
import Checkbox from "~/components/common/checkboxes/Checkbox";
import BackNavigation from "~/components/common/navs/BackNavigation";
import ComUtil from "~/util/ComUtil";


const Agree = ({history}) => {

    const coRegistrationNo = history.location.state ? history.location.state.coRegistrationNo : null

    const [agree1, setAgree1] = useState(false)
    const [agree2, setAgree2] = useState(false)

    const onClick = () => {
        if (!agree1 || !agree2) {
            alert('약관동의가 필요 합니다.')
            return
        }
        //가입화면으로 이동
        history.replace({
            pathname: '/producerCenter/join/request',
            state: {
                coRegistrationNo: coRegistrationNo
            }
        })
    }
    const toggle = e => {
        const name = e.target.name
        if (name === 'agree1') {
            setAgree1(!agree1)
        }else{
            setAgree2(!agree2)
        }
    }

    return (
        <div>

            {
                (ComUtil.isMobileWeb() || ComUtil.isMobileApp()) && (
                    <BackNavigation>이용약관 동의</BackNavigation>
                )
            }

            <Container className={'mt-4 mb-2'}>
                <Row>
                    <Col className='p-0 pl-3'>
                        <h5>이용약관 동의</h5>
                    </Col>
                </Row>
            </Container>
            <Container className={'bg-white shadow-lg'}>

                <Row>
                    <Col className='p-0 pb-3'>
                        <div className='pl-3 pr-3 p-2 f3 text-white bg-success d-flex align-items-center'>
                            약관동의
                        </div>
                        <hr className='m-0'/>
                        <div className='m-3'>
                            <p className='font-weight-bolder mb-2'>
                                이용약관<Required/>
                            </p>
                            <p className='bg-light p-3' style={{height: 200, overflow: 'auto'}}>
                                <B2cTermsOfUse11/>
                            </p>
                            <Flex justifyContent={'flex-end'} m={16}>
                                <Checkbox name={'agree1'} bg={'green'} checked={agree1} onChange={toggle} >동의합니다</Checkbox>
                                {/*<CustomInput type="checkbox" id="agree1" label="동의합니다" inline innerRef={agree1} />*/}
                            </Flex>
                        </div>
                        <hr/>
                        <div className='m-3'>
                            <p className='font-weight-bolder mb-2'>
                                개인정보 취급방침<Required/>
                            </p>
                            <p className='bg-light p-3' style={{height: 200, overflow: 'auto'}}>
                                <B2cPrivatePolicy11/>
                            </p>
                            <Flex justifyContent={'flex-end'} m={16}>
                                    <Checkbox name={'agree2'} bg={'green'} checked={agree2} onChange={toggle} >동의합니다</Checkbox>
                                {/*<CustomInput type="checkbox" id="agree2" label="동의합니다" inline innerRef={agree2} />*/}
                            </Flex>
                        </div>
                        <hr/>
                        <div className='text-center'>
                            <Button onClick={onClick} width={100} height={40} bg={'green'} fg={'white'}>확인</Button>
                        </div>
                    </Col>
                </Row>

            </Container>

        </div>
    );
};

export default Agree;
