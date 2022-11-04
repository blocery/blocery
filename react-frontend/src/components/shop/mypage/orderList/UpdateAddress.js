import React, { Fragment, Component } from 'react'
import { Container, Label, Row, Col, Input, InputGroup, FormGroup, Button,Modal } from 'reactstrap'
import { updateReceiverInfo } from '~/lib/shopApi'
import ComUtil from '~/util/ComUtil'
import DaumPostcode from 'react-daum-postcode';
import loadable from "@loadable/component";
import {Flex, Right} from "~/styledComponents/shared";
const AddressList = loadable(() => import('~/components/common/AddressList'))
export default class UpdateAddress extends Component {
    constructor(props) {
        super(props);

        this.state = {
            order: {
                orderSeq: this.props.orderSeq,
                orderSubGroupNo: this.props.orderSubGroupNo,
                receiverName: this.props.receiverName,
                receiverPhone: this.props.receiverPhone,
                receiverZipNo: this.props.receiverZipNo,
                receiverAddr: this.props.receiverAddr,
                receiverRoadAddr: this.props.receiverRoadAddr,
                receiverAddrDetail: this.props.receiverAddrDetail,
                deliveryMsg: this.props.deliveryMsg,
                commonEnterPwd: this.props.commonEnterPwd
            },

            modal: false,
            addressModal: false
        }
    }

    // phone regex 체크
    checkPhoneRegex = (e) => {
        const order = Object.assign({}, this.state.order);
        order[e.target.name] = ComUtil.phoneRegexChange(e.target.value);
        this.setState({order})
    }

    // element 값 체인지될 때
    handleChange = (e) => {
        const order = Object.assign({}, this.state.order);
        order[e.target.name] = e.target.value;
        this.setState({order})
    }

    // 우편번호검색 팝업
    addressModalPopup = () => {
        this.setState({
            modal: true
        });
    }

    modalToggle = () => {
        this.setState(prevState => ({
            modal: !prevState.modal
        }));
    }

    jusoModalOnChange = (data) => {

        let zipNo = data.zonecode;
        let fullAddress = data.address;
        let roadFullAddress = data.roadAddress;
        let extraAddress = '';

        if (data.userSelectedType === 'R') { // 사용자가 도로명 주소를 선택했을 경우
            fullAddress = data.roadAddress;
        } else { // 사용자가 지번 주소를 선택했을 경우(J)
            fullAddress = data.jibunAddress;
        }

        if (data.bname !== '') {
            extraAddress += data.bname;
        }
        if (data.buildingName !== '') {
            extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
        }

        if (data.addressType === 'R') {
            fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
        }
        roadFullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');

        const order = Object.assign({}, this.state.order);
        order.receiverZipNo = zipNo;
        order.receiverAddr = fullAddress;
        order.receiverRoadAddr = roadFullAddress;

        this.setState({
            order
        });

        this.modalToggle();
    }

    onAddressChange = (address) => {
        console.log({address})
        const order = Object.assign({}, this.state.order);
        order.receiverZipNo = address.zipNo;
        order.receiverAddr = address.addr;
        order.receiverRoadAddr = address.roadAddr;
        order.receiverAddrDetail = address.addrDetail;
        order.receiverName = address.receiverName;
        order.receiverPhone = address.phone;
        this.setState({
            order
        });
        this.addressModalToggle()
    }
    addressModalToggle = () => {
        this.setState(prevState => ({
            addressModal: !prevState.addressModal
        }));
    }

    // 저장버튼 클릭
    saveAddress = async () => {
        const order = Object.assign({}, this.state.order);
        let {data:errRes} = await updateReceiverInfo(order);

        console.log(errRes)
        if (errRes.resCode) {
            alert(errRes.errMsg) //update 실패.

        }else { //성공
            this.props.onClose({
                ...order,
            })
        }

    }

    render() {
        const order = this.state.order;

        if(!this.state.order)
            return null;

        return(
            <Fragment>
                <Container>
                    <Row>
                        <Col xs={12}>
                            <Flex mt={5}>
                                <Right>
                                    <Button outline color="secondary" onClick={this.addressModalToggle}>배송지목록</Button>
                                </Right>
                            </Flex>
                            {/*<FormGroup>*/}
                            {/*    <Label>배송지목록</Label>*/}
                            {/*    <InputGroup>*/}
                            {/*        */}
                            {/*    </InputGroup>*/}
                            {/*</FormGroup>*/}
                        </Col>
                        <Col xs={12}>
                            <FormGroup>
                                <Label>받는 사람</Label>
                                <InputGroup>
                                    <Input name="receiverName" placeholder="받는 사람" value={order.receiverName || ''} onChange={this.handleChange} />
                                </InputGroup>
                            </FormGroup>
                        </Col>
                        <Col xs={12}>
                            <FormGroup>
                                <Label>연락처(전화번호)</Label>
                                <InputGroup>
                                    <Input name="receiverPhone" placeholder="연락처" value={order.receiverPhone || ''}
                                       onChange={this.handleChange} maxLength={13}
                                       onBlur={this.checkPhoneRegex}
                                    />
                                </InputGroup>
                            </FormGroup>
                        </Col>
                        <Col xs={12}>
                            <FormGroup>
                                <Label>주소</Label>
                                <InputGroup>
                                    <Input disabled name="receiverAddr" placeholder="[주소검색]을 클릭해 주세요" value={order.receiverAddr || ''} onChange={this.handleChange} />
                                    <Button outline color="secondary" onClick={this.addressModalPopup}>주소검색</Button>
                                </InputGroup>
                            </FormGroup>
                        </Col>
                        <Col xs={12}>
                            <FormGroup>
                                <Input name="receiverAddrDetail" placeholder="상세주소" value={order.receiverAddrDetail || ''}  onChange={this.handleChange} />
                            </FormGroup>
                        </Col>
                        <Col xs={12}>
                            <FormGroup>
                                <Label>배송 메세지</Label>
                                <InputGroup>
                                    <Input name="deliveryMsg" value={order.deliveryMsg || ''} onChange={this.handleChange} />
                                </InputGroup>
                            </FormGroup>
                        </Col>
                        <Col xs={12}>
                            <FormGroup>
                                <Label>공동현관 출입번호</Label>
                                <InputGroup>
                                    <Input name="commonEnterPwd" value={order.commonEnterPwd || ''} onChange={this.handleChange} />
                                </InputGroup>
                            </FormGroup>
                        </Col>
                    </Row>
                    <br />
                    <Row>
                        <Col xs={12}>
                            <FormGroup>
                                <Button block color={'info'} onClick={this.saveAddress} disabled={order.receiverName && order.receiverPhone && order.receiverAddr && order.receiverAddrDetail ? false : true}>확인</Button>
                            </FormGroup>
                        </Col>
                    </Row>
                </Container>
                <div>
                    {/* 주소검색 모달 */}
                    <Modal isOpen={this.state.modal} toggle={this.modalToggle}>
                        <div style={{padding:0, height:'450px'}}>
                            <DaumPostcode
                                style={{height:'450px'}}
                                onComplete={this.jusoModalOnChange}
                            />
                        </div>
                    </Modal>
                </div>
                <Modal size="lg" isOpen={this.state.addressModal} toggle={this.addressModalToggle} centered>
                    <AddressList onChange={this.onAddressChange} onClose={this.addressModalToggle}/>
                </Modal>
            </Fragment>
        )
    }
}