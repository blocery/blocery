import React, {Fragment, Component } from 'react';
import {Col, Label, Input, Container, Row, Modal, InputGroup, InputGroupAddon } from 'reactstrap'
import {Button} from '~/styledComponents/shared/Buttons'
import {getConsumer, putAddress} from "~/lib/shopApi";
import { JusoSearch, ShopXButtonNav } from '~/components/common'
import ComUtil from '~/util/ComUtil'
import { setMissionClear } from "~/lib/eventApi"
import TextCss from "~/styles/Text.module.scss"

import DaumPostcode from 'react-daum-postcode';
export default class AddressModify extends Component {
    constructor(props){
        super(props);
        this.state = {
            consumerNo: 0,
            addresses: [],
            addrName: '',
            receiverName: '',
            phone: '',
            addr: '',
            addrDetail: '',
            zipNo: '',
            modal: false,
            isCheckedDefault: false,            // 기본배송지로 저장 체크 유무
            addressIndex: null,          // null이면 신규추가, 값이 있으면 수정
            flag: ''
        }
    }

    async componentDidMount() {
        let index, flag

        const loginUser = await getConsumer();
        if(!loginUser || !loginUser.data){
            this.props.history.replace('/mypage');
            return;
        }

        if(this.props.location){
            const params = new URLSearchParams(this.props.location.search)
            index = params.get('index')
            flag = params.get('flag')
        }else{
            index = this.props.index
            flag = this.props.flag
        }

        this.setState({ flag: flag })
        this.setState({
            addressIndex: index
        })

        this.search();
    }

    search = async () => {
        const {data:loginUser} = await getConsumer();

        console.log(loginUser)

        this.setState({
            consumerNo: loginUser.consumerNo,
            addresses: loginUser.consumerAddresses
        })

        if(this.state.addressIndex !== null) {      // index 있으면 수정모드
            const modifyAddress = loginUser.consumerAddresses[this.state.addressIndex]
            this.setState({
                addrName: modifyAddress.addrName,
                receiverName: modifyAddress.receiverName,
                phone: modifyAddress.phone,
                addr: modifyAddress.addr,
                addrDetail: modifyAddress.addrDetail,
                zipNo: modifyAddress.zipNo
            })
            if(modifyAddress.basicAddress === 1) {
                this.setState({ isCheckedDefault: true })
            }
        }

    }

    // element값 변경시
    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    // 전화번호 정규식 체크
    checkPhoneRegex = (e) => {
        this.setState({
            [e.target.name]: ComUtil.phoneRegexChange(e.target.value)
        })
    }

    // 주소검색 클릭
    addressModalPopup = () => {
        this.setState({ modal: true })
    }

    modalToggle = () => {
        this.setState(prevState => ({
            modal: !prevState.modal
        }));
    }

    jusoModalOnChange = (data) => {

        let zipNo = data.zonecode;
        let fullAddress = data.address;
        let extraAddress = '';

        if (data.userSelectedType === 'R') { // 사용자가 도로명 주소를 선택했을 경우
            fullAddress = data.roadAddress;
        } else { // 사용자가 지번 주소를 선택했을 경우(J)
            fullAddress = data.jibunAddress;
        }

        if (data.addressType === 'R') {
            if (data.bname !== '') {
                extraAddress += data.bname;
            }
            if (data.buildingName !== '') {
                extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
            }
            fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
        }
        let v_address = fullAddress;

        this.setState({
            addr: fullAddress,
            zipNo: zipNo
        });

        this.modalToggle();
    }

    // 기본배송지 저장 체크 유무
    // true면 order, consumer 테이블의 addr, phone 필드값 수정. false면 order 테이블의 addr에만 저장
    onCheckDefaultDeliver = (e) => {
        this.setState({
            isCheckedDefault: e.target.checked
        })
    }

    // 주소 저장버튼 클릭
    onClickOk = async () => {
        const state = Object.assign({}, this.state)
        if(state.addrName == '' || state.receiverName == '' || state.addr == '' || state.addrDetail == '' || state.phone == '' || state.zipNo == '') {
            alert('필수항목 정보를 정확하게 입력해주세요.')
            return false;
        }

        let data = {};
        let modifiedAddress = {};
        const index = this.state.addressIndex
        if (index !== null) {       // 배송지 수정일
            this.state.addresses[index].addrName = this.state.addrName;
            this.state.addresses[index].receiverName = this.state.receiverName;
            this.state.addresses[index].phone = this.state.phone;
            this.state.addresses[index].addr = this.state.addr;
            this.state.addresses[index].addrDetail = this.state.addrDetail;
            this.state.addresses[index].zipNo = this.state.zipNo;

            modifiedAddress = Object.assign({
                addrName: this.state.addresses[index].addrName,
                receiverName: this.state.addresses[index].receiverName,
                phone: this.state.addresses[index].phone,
                addr: this.state.addresses[index].addr,
                addrDetail: this.state.addresses[index].addrDetail,
                zipNo: this.state.addresses[index].zipNo
            })
        } else {
            data.addrName = this.state.addrName;
            data.receiverName = this.state.receiverName;
            data.phone = this.state.phone;
            data.addr = this.state.addr;
            data.addrDetail = this.state.addrDetail;
            data.zipNo = this.state.zipNo;
            if (this.state.addresses.length === 0) {
                data.basicAddress = 1
            } else {
                data.basicAddress = 0
            }
            modifiedAddress = Object.assign(data)
        }

        if (this.state.isCheckedDefault) {                  // 기본배송지로 저장 체크O
            if (this.state.addressIndex !== null) {         // 배송지 수정일 때
                for (var i = 0; i < this.state.addresses.length; i++) {
                    this.state.addresses[i].basicAddress = 0
                }
                this.state.addresses[index].basicAddress = 1
            } else {
                for (var i = 0; i < this.state.addresses.length; i++) {
                    this.state.addresses[i].basicAddress = 0
                }
                data.basicAddress = 1
            }
        } else {                                            // 기본배송지로 저장 체크X
            if (this.state.addressIndex !== null) {         // 배송지 수정일 때
                if (this.state.addresses.length <= 0) {
                    this.state.addresses[index].basicAddress = 1
                } else {
                    this.state.addresses[index].basicAddress = 0
                }
            } else {
                if (this.state.addresses.length <= 0) {
                    data.basicAddress = 1
                } else {
                    data.basicAddress = 0
                }
            }
        }

        let addresses = Object.assign([], this.state.addresses);
        if(this.state.addressIndex === null)        // 추가일 때만 push
            addresses.push(data)

        this.setState({
            addresses: addresses
        })

        let modified = await putAddress(addresses)

        if (modified.data === 1) {
            if (this.state.isCheckedDefault) {
                //기본배송지를 저장했다면 mission8번 clear.
                //setMissionClear(8).then( (response) => console.log('base Delivery SET:missionEvent8:' + response.data )); //기본배송지를 저장
            }

            alert('배송지 정보 저장이 완료되었습니다.')
            if(this.state.flag === 'order') {
                this.props.onClose({
                    ...modifiedAddress
                })
            } else {
                this.props.history.goBack();
            }
        } else {
            alert('배송지 정보 저장 실패. 다시 시도해주세요.')
            return false;
        }
    }

    onDelete = async () => {
        const index = this.state.addressIndex

        let addresses = Object.assign([], this.state.addresses);
        addresses.splice(index, 1);

        let deleted = await putAddress(addresses)

        if(deleted.data === 1) {
            alert('배송지 정보 삭제가 완료되었습니다.')
            this.props.history.goBack();
        } else {
            alert('배송지 정보 삭제 실패. 다시 시도해주세요.')
            return false;
        }

    }


    render() {
        return (
            <Fragment>
                {
                    this.state.flag === 'mypage' && <ShopXButtonNav historyBack>배송지 추가/수정</ShopXButtonNav>
                }
                <div className={TextCss.textUnderlineWrap}>
                <Container fluid>
                    <Row>
                        <Col xs={12} className={'pt-2 pb-2'}>
                            <div className={'mb-3'}>
                                <Label className={'small'}>배송지 이름</Label>
                                <Input name="addrName" value={this.state.addrName} onChange={this.handleChange} />
                            </div>
                            <div className={'mb-3'}>
                                <Label className={'small'}>받는 사람</Label>
                                <Input name="receiverName" value={this.state.receiverName} onChange={this.handleChange} />
                            </div>
                            <div className={'mb-3'}>
                                <Label className={'small'}>연락처</Label>
                                <Input name="phone" value={this.state.phone || ''} onChange={this.handleChange} onBlur={this.checkPhoneRegex} maxLength={13} />
                            </div>

                            <div className={'mb-3'}>
                                <Label className={'small'}>주소</Label>
                                <div className={'mb-2'}>
                                    <InputGroup>
                                        <Input disabled name="addr" value={this.state.addr} placeholder=" [주소검색]을 클릭해 주세요" />
                                        <InputGroupAddon addonType="prepend">
                                            <Button bc={'black'} ml={8} onClick={this.addressModalPopup}>주소검색</Button>
                                        </InputGroupAddon>

                                    </InputGroup>
                                </div>
                                <div>
                                    <Input name="addrDetail" value={this.state.addrDetail} onChange={this.handleChange} placeholder="상세주소"/>
                                </div>
                            </div>
                            <div className='d-flex mb-2'>
                                <div className='d-flex flex-grow-1'>
                                    <label><input type="checkbox" checked={this.state.isCheckedDefault} onChange={this.onCheckDefaultDeliver} /></label>
                                    <div> 기본배송지로 저장</div>
                                </div>
                            </div>
                            <Button block bg={'green'} fg={'white'} py={16} onClick={this.onClickOk}>저 장</Button>
                            {
                                this.state.addressIndex !== null && this.state.flag === 'mypage' && <Button block color={'secondary'} size={'md'} onClick={this.onDelete}>삭 제</Button>
                            }
                        </Col>
                    </Row>
                </Container>
                </div>
                <div>
                    {/*주소검색 모달 */}
                    <Modal isOpen={this.state.modal} toggle={this.modalToggle}>
                        <div style={{padding:0, height:'450px'}}>
                            <DaumPostcode
                                style={{height:'450px'}}
                                onComplete={this.jusoModalOnChange}
                            />
                        </div>
                    </Modal>
                </div>

            </Fragment>
        )
    }

}