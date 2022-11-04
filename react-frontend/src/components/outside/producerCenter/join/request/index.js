import React, {Fragment, useEffect, useState} from 'react';
import {Button, Div, Fixed, Flex, Space} from "~/styledComponents/shared";
import { Route, Switch, Redirect, withRouter } from 'react-router-dom'
import {useParams} from 'react-router-dom'
import {getBankInfoList, getProducerEmail, getProducerTemp, saveProducerTemp} from "~/lib/producerApi";
import loadable from "@loadable/component";
import {
    Alert,
    Col,
    Container,
    Fade,
    FormGroup,
    Input,
    InputGroup,
    Label,
    Modal,
    ModalBody, ModalFooter,
    ModalHeader,
    Row
} from "reactstrap";
import {AddressCard, PassPhrase, SingleImageUploader} from "~/components/common";
import styled from 'styled-components'
import {color} from "~/styledComponents/Properties";
import Textarea from "react-textarea-autosize";
import Select from "react-select";
import {Required} from "~/styledComponents/ShopBlyLayouts";
import SingleFileUploader from "~/components/common/ImageUploader/SingleFileUploader";
import ComUtil from "~/util/ComUtil";
import BackNavigation from "~/components/common/navs/BackNavigation";
import {IoIosArrowForward, IoIosArrowBack} from 'react-icons/io'
import RequestContent from "~/components/outside/producerCenter/join/requestContent";

const Title = styled.h5`
    margin-bottom: 18.75px;
`

const StyledLabel = styled(Label)`
    color: ${color.dark};
`

// IoIosArrowForward, IoIosArrowBack
const PrevButton = ({onClick}) => <Button px={20} height={40} bg={'white'} bc={'secondary'} onClick={onClick}><IoIosArrowBack/>이전</Button>
const NextButton = ({onClick, children}) => <Button px={20} height={40} bg={'green'} fg={'white'} onClick={onClick}>{children ? children : '다음'}<IoIosArrowForward/></Button>


const RequestProducerJoin = ({history}) => {

    const coRegistrationNo = history.location.state ? history.location.state.coRegistrationNo : null

    const [step, setStep] = useState(1)

    //0: 임시저장 1: 신청완료(검토중) 2:반려 3:가입완료
    const [state, setState] = useState({
        name: '',        //대표자명
        farmName: '',    //상호명
        coRegistrationNo: coRegistrationNo,

        businessLicenseFile: null,  //사업자등록증 파일
        payoutBankCode: '',         //정산은행
        bankbookFile: null,         //통장 사본 파일
        comSaleFile: null,          //통신판매업 파일
        estimatedGoodsFile: null,   //상품견적서 파일
        goodsMemo: '',          //관련 링크/메모
        address: '',
        profileImages: [],
        profileBackgroundImages: [],
    })
    const [bankList, setBankList] = useState([])
    const [redirect, setRedirect] = useState()
    const [confirmModalOpen, setConfirmModalOpen] = useState(false)

    const toggle = () => {
        setConfirmModalOpen(!confirmModalOpen)
    }

    useEffect(() => {
        bindBankData()
    }, [])

    useEffect(() => {
        async function fetch() {
            try {
                console.log('11111')
                await searchProducerTemp()
            }catch (err) {}
        }

        if (coRegistrationNo) {
            fetch()
        }

    }, [step])

    const searchProducerTemp = async() => {
        console.log({searchParams: coRegistrationNo})
        //producerTemp 조회
        const {data} = await getProducerTemp(coRegistrationNo)
        if (data) {
            const newState = {
                ...state,
                ...data
            }

            console.log({newState: newState})

            //병합을 해야 에러가 날 확률이 줄어 듬.
            setState(newState)
        }
    }


    //이전 클릭
    const onPrevClick = async () => {

        await save()

        //처음 스텝일 경우
        if (step === 1) {

            if (window.confirm('페이지를 나가시겠습니까?'))

                history.replace('/producerCenter/join/checkJoinStatus')
            return
        }

        //2. 스텝 변경
        setStep(step-1)
    }

    //다음 클릭
    const onNextClick = async () => {

        if (!validateStep(step)){
            return
        }

        //1. DB 저장
        await save()

        const nextStep = step+1

        //2. 스텝 변경
        setStep(nextStep)
    }

    const validateStep = (step) => {
        if (step === 1) {
            if (!state.coRegistrationNo) {
                alert(`사업자등록번호는 필수 입니다.`)
                return false
            }
            if (!state.farmName) {
                alert('상호명은 필수 입니다.')
                return false
            }
            if (!state.name) {
                alert('대표자명은 필수 입니다.')
                return false
            }
            if (!state.shopZipNo) {
                alert('사업장 주소는 필수 입니다.')
                return false
            }
            if (!state.businessLicenseFile) {
                alert('사업자등록증을 첨부해주세요.')
                return false
            }
        }
        else if (step === 2) {
            if (!state.payoutBankCode) {
                alert('은행을 선택해주세요.')
                return false
            }
            if (!state.payoutAccount) {
                alert('은행 계좌번호는 필수 입니다.')
                return false
            }
            if (!state.payoutAccountName) {
                alert('예금주명은 필수 입니다.')
                return false
            }
            if (!state.bankbookFile) {
                alert('통장사본 이미지는 필수 입니다.')
                return false
            }

            if (!state.shopPhone) {
                alert('고객센터 전화번호는 필수 입니다.')
                return false
            }
            if (!state.shopBizType) {
                alert('업종은 필수 입니다.')
                return false
            }
            if (!state.comSaleNumber) {
                alert('통신판매업 번호는 필수 입니다.')
                return false
            }
            if (!state.comSaleFile) {
                alert('통신판매등록증은 필수 입니다.')
                return false
            }

            if (!state.estimatedGoodsFile && !state.goodsMemo) {
                alert('상품견적서 혹은 관련 링크/메모 둘 중 하나는 적어 주세요.')
                return false
            }

        }
        else if (step === 3) {
            if (!state.charger) {
                alert('담당자명은 필수 입니다.')
                return false
            }
            if (!state.chargerPhone) {
                alert('담당자명 휴대폰번호는 필수 입니다.')
                return false
            }
        }


        return true
    }

    const save = async (joinStatus) => {

        try{
            const saveParams = {...state}

            if (joinStatus) {
                saveParams.joinStatus = joinStatus
            }

            const {status, data} = await saveProducerTemp(saveParams)
            if (status === 200) {
                const {resultStatus, resultMessage} = data

                //"신청완료(검토중) 상태입니다."
                //"가입완료 상태입니다."
                if ([-101, -103, -104].includes(resultStatus)) {
                    alert(resultMessage)
                    setRedirect('/producerCenter/join/checkJoinStatus')
                    return false
                }

                if ([100].includes(resultStatus))
                    return true
            }
            return false
        }catch (err) {
            return false
        }

        /*

        if (producerTempData.getJoinStatus() == 0 || producerTempData.getJoinStatus() == 2) {
                //0: 임시저장 1: 신청완료(검토중) 2:반려 3:가입완료
                mongoTemplate.save(producerTemp);
                res.setResultStatus(100);
                res.setResultMessage("신청완료되었습니다.");

            } else if (producerTempData.getJoinStatus() == 1) {
                res.setResultStatus(-101);
                res.setResultMessage("신청완료(검토중) 상태입니다.");
            } else if (producerTempData.getJoinStatus() == 3) {
                res.setResultStatus(-103);
                res.setResultMessage("가입완료 상태입니다.");
            }
        }else{
            if (producerTemp.getJoinStatus() == 0) {
                //0: 임시저장 1: 신청완료(검토중) 2:반려 3:가입완료
                mongoTemplate.save(producerTemp);
                res.setResultStatus(100);
                res.setResultMessage("신청완료되었습니다.");
            }
         */

    }

    //신청완료
    const onSubmitClick = async () => {

        await save()

        if (!validateStep(1)) {
            setStep(1)
            return
        }
        if (!validateStep(2)) {
            setStep(2)
            return
        }
        if (!validateStep(3)) {
            return
        }
        toggle()
    }

    const onModalSubmitClick = async () => {
        if (!window.confirm('신청하시겠습니까?')) {
            return
        }

        const result = await save(1)

        if (result) {
            alert('신청이 정상적으로 완료 되었습니다. 관리자 심사 후 카카오톡으로 결과를 안내 드리겠습니다.')
            setRedirect('/producerCenter/join/checkJoinStatus')
        }
    }

    const onStepClick = async (step) => {
        await save()
        setStep(step)
    }


    const onAddressChange = (address) => {

        console.log('producerJoinWeb value ',address)
        setState({
            ...state,
            shopZipNo: address.zipNo,
            shopAddress: address.address,
            shopAddressDetail: address.addressDetail
        })
    }

    // element의 값이 체인지될 때
    const handleChange = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        })
    }

    //업로드된 경로 받기
    const onFileChange = (name, file) => {
        console.log("onUploadCompleted", file);
        setState({
            ...state,
            [name]: file ? file : null
        })
    }



    //은행 데이터 바인딩 정보
    const bindBankData = async () => {
        const {data: itemsData} = await getBankInfoList();
        const bankList = itemsData.map(item => ({
            value: item.code,
            label: item.name
        }))

        setBankList(bankList)
    }

    const // 정산계좌 은행선택
        onChangeBankInfo = (data) => {
            setState({
                ...state,
                payoutBankCode:data.value
            });
        }

    const onProfileImageChange = (images) => {
        setState({
            ...state,
            profileImages:images
        })
    }
    const onProfileBackgroundImageChange = (images) => {
        setState({
            ...state,
            profileBackgroundImages:images
        })
    }

    if (!coRegistrationNo) {
        return <Redirect to={'/producerCenter/join/checkJoinStatus'} />
    }

    if (redirect) {
        return <Redirect to={redirect} />
    }

    return (
        <div>
            {
                (ComUtil.isMobileWeb() || ComUtil.isMobileApp()) && (
                    <BackNavigation>입점 신청서 작성</BackNavigation>
                )
            }
            <Flex justifyContent={'center'} my={20}>
                <Space spaceGap={10}>
                    <Div fg={step === 1 && 'green'} cursor onClick={onStepClick.bind(this, 1)}>기본정보</Div>
                    <div>{'>'}</div>
                    <Div fg={step === 2 && 'green'} cursor onClick={onStepClick.bind(this, 2)}>판매정보</Div>
                    <div>{'>'}</div>
                    <Div fg={step === 3 && 'green'} cursor onClick={onStepClick.bind(this, 3)}>신청정보</Div>
                </Space>
            </Flex>


            {
                //반려 인 경우 반려 사유 보여주기
                state.joinStatus === 2 && (
                    <Container className={'bg-white shadow-lg'}>
                        <Row>
                            <Col xs={12} className={'p-0'}>
                                <Div bg={'danger'} fg={'white'} p={16}>
                                    반려사유 : {state.reason}
                                </Div>
                            </Col>
                        </Row>
                    </Container>
                )
            }

            {
                step === 1 && (
                    <div>
                        <Container className={'bg-white shadow-lg'}>
                            <Row>
                                <Col xs={12}>
                                    <div className='my-4'>
                                        <Title>기본정보</Title>
                                        <FormGroup inline>
                                            <Row>
                                                <Col sm={3}>
                                                    <StyledLabel>사업자등록번호<Required/></StyledLabel>
                                                </Col>
                                                <Col sm={9}>
                                                    <Input name="coRegistrationNo" value={state.coRegistrationNo} placeholder="'-'제외한 숫자만 입력해주세요(10자리)"
                                                           onChange={handleChange}
                                                           readOnly
                                                        // innerRef={this.farmName}
                                                    />
                                                </Col>
                                            </Row>
                                        </FormGroup>

                                        <FormGroup inline>
                                            <Row>
                                                <Col sm={3}>
                                                    <StyledLabel>상호명<Required/></StyledLabel>
                                                </Col>
                                                <Col sm={9}>
                                                    <Input name="farmName" value={state.farmName} placeholder="상호명(농장명)"
                                                           onChange={handleChange}
                                                        // innerRef={this.farmName}
                                                    />
                                                </Col>
                                            </Row>
                                        </FormGroup>
                                        <FormGroup inline>
                                            <Row>
                                                <Col sm={3}>
                                                    <StyledLabel>대표자명<Required/></StyledLabel>
                                                </Col>
                                                <Col sm={9}>
                                                    <Input name="name" value={state.name} placeholder="대표자명" onChange={handleChange}
                                                        // innerRef={this.name}
                                                    />
                                                </Col>
                                            </Row>
                                        </FormGroup>
                                        <FormGroup inline>
                                            <Row>
                                                <Col sm={3}>
                                                    <StyledLabel>사업장 주소<Required/></StyledLabel>
                                                </Col>
                                                <Col sm={9}>
                                                    <AddressCard
                                                        zipNo={state.shopZipNo}
                                                        address={state.shopAddress}
                                                        addressDetail={state.shopAddressDetail}
                                                        onChange={onAddressChange}
                                                        //buttonRef={addressButton}
                                                    />
                                                </Col>
                                            </Row>
                                        </FormGroup>
                                        <FormGroup inline>
                                            <Row>
                                                <Col sm={3}>
                                                    <StyledLabel>사업자등록증<Required/></StyledLabel>
                                                </Col>
                                                <Col sm={9}>
                                                    <SingleFileUploader name={'businessLicenseFile'} file={state.businessLicenseFile} fileKey={coRegistrationNo} onChange={onFileChange}/>
                                                </Col>
                                            </Row>
                                        </FormGroup>
                                    </div>
                                    <Flex justifyContent={'center'} my={30}>
                                        <Space>
                                            <PrevButton onClick={onPrevClick} />
                                            <NextButton onClick={onNextClick} />
                                        </Space>
                                    </Flex>
                                </Col>
                            </Row>
                        </Container>
                    </div>
                )
            }
            {
                step === 2 && (
                    <div>
                        <Container className={'bg-white shadow-lg'}>
                            <Row>
                                <Col className='p-0'>
                                    {/* 정산계좌 정보 */}
                                    <div className='m-4'>
                                        <Title>정산계좌 정보</Title>
                                        <FormGroup inline>
                                            <div className={'p-3 border bg-light'}>
                                                <Row>
                                                    <Col sm={3} className={'pr-sm-1'}>
                                                        <StyledLabel>은행명<Required/></StyledLabel>
                                                        <Select options={bankList}
                                                                value={bankList.find(item => item.value === state.payoutBankCode)}
                                                                onChange={onChangeBankInfo}
                                                        />
                                                    </Col>
                                                    <Col sm={6} className={'pr-sm-1'}>
                                                        <StyledLabel>은행 계좌번호<Required/></StyledLabel>
                                                        <Input name="payoutAccount"
                                                               value={state.payoutAccount || ''}
                                                               onChange={handleChange}/>
                                                    </Col>
                                                    <Col sm={3} >
                                                        <StyledLabel>예금주명<Required/></StyledLabel>
                                                        <Input name="payoutAccountName"
                                                               value={state.payoutAccountName || ''}
                                                               onChange={handleChange}/>
                                                    </Col>
                                                </Row>
                                            </div>
                                            <span className={'text-danger small mt-1'} >매월 정산되는 상품판매 금액이 입금되는 계좌입니다</span>
                                        </FormGroup>
                                        <FormGroup inline>
                                            <Row>
                                                <Col sm={3}>
                                                    <StyledLabel>통장사본 이미지<Required/></StyledLabel>
                                                </Col>
                                                <Col sm={9}>
                                                    <SingleFileUploader name={'bankbookFile'} file={state.bankbookFile} fileKey={coRegistrationNo} onChange={onFileChange}/>
                                                </Col>
                                            </Row>
                                        </FormGroup>
                                    </div>
                                    <hr/>
                                    <div className='m-4'>
                                        <Title>판매/운영정보</Title>
                                        <FormGroup inline>
                                            <Row>
                                                <Col sm={3}>
                                                    <StyledLabel>고객센터 전화번호<Required/></StyledLabel>
                                                </Col>
                                                <Col sm={9}>
                                                    <Input name="shopPhone"
                                                           value={state.shopPhone}
                                                           onChange={handleChange}
                                                        // innerRef={shopPhone}
                                                    />
                                                </Col>
                                            </Row>
                                        </FormGroup>
                                        <FormGroup inline>
                                            <Row>
                                                <Col sm={3}>
                                                    <StyledLabel>업종<Required/></StyledLabel>
                                                </Col>
                                                <Col sm={9}>
                                                    <Input name="shopBizType"
                                                           value={state.shopBizType}
                                                           onChange={handleChange}
                                                        // innerRef={shopBizType}
                                                    />
                                                </Col>
                                            </Row>
                                        </FormGroup>
                                        <FormGroup inline>
                                            <Row>
                                                <Col sm={3}>
                                                    <StyledLabel>통신판매업번호<Required/></StyledLabel>
                                                </Col>
                                                <Col sm={9}>
                                                    <Input name="comSaleNumber"
                                                           value={state.comSaleNumber}
                                                           onChange={handleChange}
                                                        // innerRef={comSaleNumber}
                                                    />
                                                </Col>
                                            </Row>
                                        </FormGroup>
                                        <FormGroup inline>
                                            <Row>
                                                <Col sm={3}>
                                                    <StyledLabel>주요취급상품</StyledLabel>
                                                </Col>
                                                <Col sm={9}>
                                                    <Input name="shopMainItems" value={state.shopMainItems}
                                                           onChange={handleChange}
                                                    />
                                                </Col>
                                            </Row>
                                        </FormGroup>
                                        <FormGroup inline>
                                            <Row>
                                                <Col sm={3}>
                                                    <StyledLabel>통신판매등록증<Required/></StyledLabel>
                                                </Col>
                                                <Col sm={9}>
                                                    <SingleFileUploader name={'comSaleFile'} file={state.comSaleFile} fileKey={coRegistrationNo} onChange={onFileChange}/>
                                                </Col>
                                            </Row>
                                        </FormGroup>
                                    </div>


                                    <hr/>

                                    <div className='m-4'>
                                        <Title>상품정보</Title>
                                        {
                                            (!state.estimatedGoodsFile && !state.goodsMemo) && (
                                                <Alert color={'success'}>
                                                    상품견적서 혹은 관련 링크/메모 둘중 하나는 필수로 작성 해 주세요.
                                                </Alert>
                                            )
                                        }
                                        <FormGroup inline>
                                            <Row>
                                                <Col sm={3}>
                                                    <StyledLabel>상품견적서</StyledLabel>
                                                </Col>
                                                <Col sm={9}>
                                                    <SingleFileUploader name={'estimatedGoodsFile'} file={state.estimatedGoodsFile} fileKey={coRegistrationNo} onChange={onFileChange}/>
                                                </Col>
                                            </Row>
                                        </FormGroup>
                                        <FormGroup inline>
                                            <Row>
                                                <Col sm={3}>
                                                    <StyledLabel>관련 링크/메모</StyledLabel>
                                                </Col>
                                                <Col sm={9}>
                                                    <Input name="goodsMemo" value={state.goodsMemo}
                                                           onChange={handleChange}
                                                    />
                                                </Col>
                                            </Row>
                                        </FormGroup>
                                    </div>

                                    <hr/>

                                    <div className='m-4'>
                                        <Title>프로필 정보</Title>
                                        {/*<FormGroup inline>*/}
                                        {/*    <Row>*/}
                                        {/*        <Col sm={3}>*/}
                                        {/*            <StyledLabel>프로필 사진</StyledLabel>*/}
                                        {/*        </Col>*/}
                                        {/*        <Col sm={9}>*/}
                                        {/*            <SingleImageUploader images={state.profileImages} defaultCount={5} isShownMainText={false}*/}
                                        {/*                                 onChange={onProfileImageChange}*/}
                                        {/*            />*/}
                                        {/*        </Col>*/}
                                        {/*    </Row>*/}
                                        {/*</FormGroup>*/}
                                        {/*<FormGroup inline>*/}
                                        {/*    <Row>*/}
                                        {/*        <Col sm={3}>*/}
                                        {/*            <StyledLabel>상점 배경사진</StyledLabel>*/}
                                        {/*        </Col>*/}
                                        {/*        <Col sm={9}>*/}
                                        {/*            <SingleImageUploader images={state.profileBackgroundImages} defaultCount={5}*/}
                                        {/*                                 isShownMainText={false}*/}
                                        {/*                                 onChange={onProfileBackgroundImageChange}*/}
                                        {/*            />*/}
                                        {/*        </Col>*/}
                                        {/*    </Row>*/}
                                        {/*</FormGroup>*/}
                                        <FormGroup inline>
                                            <Row>
                                                <Col sm={3}>
                                                    <StyledLabel>한줄소개(생산자소개)</StyledLabel>
                                                </Col>
                                                <Col sm={9}>
                                                    <Textarea
                                                        name="shopIntroduce"
                                                        style={{width: '100%', minHeight: 90, borderRadius: 0}}
                                                        className={'border-secondary'}
                                                        value={state.shopIntroduce}
                                                        onChange={handleChange}
                                                        placeholder='한줄소개'
                                                    />
                                                </Col>
                                            </Row>
                                        </FormGroup>
                                    </div>
                                    <Flex justifyContent={'center'} my={30}>
                                        <Space>
                                            <PrevButton onClick={onPrevClick} />
                                            <NextButton onClick={onNextClick} />
                                        </Space>
                                    </Flex>
                                </Col>
                            </Row>
                        </Container>
                    </div>
                )
            }
            {
                step === 3 && (
                    <div>
                        <Container className={'bg-white shadow-lg'}>
                            <Row>
                                <Col className={'p-0'}>
                                    <div className='m-4'>
                                        <Title>계약담당자</Title>
                                        <Alert color={'success'}>
                                            진행확인 · 입점이후 안내를 위한 연락처를 남겨주세요.<br/>
                                            검토 후 <b><u>담당자 휴대폰 번호의 카카오톡</u></b>으로 알려 드리겠습니다.
                                        </Alert>
                                        <FormGroup inline>
                                            <Row>
                                                <Col sm={3}>
                                                    <StyledLabel>담당자명<Required/></StyledLabel>
                                                </Col>
                                                <Col sm={9}>
                                                    <Input name="charger"
                                                           value={state.charger}
                                                           onChange={handleChange}
                                                        // innerRef={this.charger}
                                                    />
                                                </Col>
                                            </Row>
                                        </FormGroup>
                                        <FormGroup inline>
                                            <Row>
                                                <Col sm={3}>
                                                    <StyledLabel>담당자 휴대폰번호<Required/></StyledLabel>
                                                </Col>
                                                <Col sm={9}>
                                                    <Input name="chargerPhone"
                                                           value={state.chargerPhone}
                                                           onChange={handleChange}
                                                        // innerRef={chargerPhone}
                                                    />
                                                </Col>
                                            </Row>
                                        </FormGroup>
                                        <FormGroup inline>
                                            <Row>
                                                <Col sm={3}>
                                                    <StyledLabel>담당자 이메일</StyledLabel>
                                                </Col>
                                                <Col sm={9}>
                                                    <Input name="chargerEmail"
                                                           value={state.chargerEmail}
                                                           onChange={handleChange}
                                                        // innerRef={chargerPhone}
                                                    />
                                                </Col>
                                            </Row>
                                        </FormGroup>
                                        <FormGroup inline>
                                            <Row>
                                                <Col sm={3}>
                                                    <StyledLabel>메모</StyledLabel>
                                                </Col>
                                                <Col sm={9}>
                                                    <Input name="memo"
                                                           value={state.memo}
                                                           onChange={handleChange}
                                                        // innerRef={this.memo}
                                                    />
                                                </Col>
                                            </Row>
                                        </FormGroup>
                                    </div>
                                    <Flex justifyContent={'center'} my={30}>
                                        <Space>
                                            <PrevButton onClick={onPrevClick} />
                                            <NextButton onClick={onSubmitClick} >신청하기</NextButton>
                                        </Space>
                                    </Flex>
                                </Col>
                            </Row>
                        </Container>
                    </div>
                )
            }

            <Modal isOpen={confirmModalOpen} centered size={'lg'}>
                <ModalHeader toggle={toggle}>신청서확인</ModalHeader>
                <ModalBody style={{padding: 0}}>
                    <RequestContent coRegistrationNo={state.coRegistrationNo} />
                    <Flex justifyContent={'center'} py={20} bg={'background'}>
                        <Button bg={'green'} fg={'white'} px={20} height={40} onClick={onModalSubmitClick}>신청완료</Button>
                    </Flex>
                </ModalBody>
            </Modal>


        </div>
    );
};

export default RequestProducerJoin;

