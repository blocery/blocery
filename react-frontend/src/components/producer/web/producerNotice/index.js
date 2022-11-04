import React, {Component, Fragment} from 'react'
import {Div, Flex, Button} from '~/styledComponents/shared'
import {Alert, FormGroup, Label} from "reactstrap";
import {DateRangePicker} from "react-dates";
import moment from "moment-timezone";
import {ModalConfirm, SingleImageUploader} from "~/components/common";
import {setGoodsBannerSave} from "~/lib/adminApi";
import {getProducer, setProducerNotice, setProducerNoticeNormalImages, setProducerNoticeObjectUniqueImages} from '~/lib/producerApi'

export default class ProducerNotice extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isDidMounted: false,
            focusedInput: null,
            producer: {},

            producerNotice: {
                noticeStartDate:'',                 // 상품상세 배너 시작일
                noticeEndDate:'',                   // 상품상세 배너 종료일
                noticeImages:[],	                // 상품상세 배너 공지 이미지
                noticeNormalImages:[],              // 상품상세 배너 일반 이미지
                noticeObjectUniqueImages:[],        // 상품상세 배너 개체인식 이미지
            },
        }
    }

    async componentDidMount() {
        const {data:producer} = await getProducer();

        const producerNotice = {
            noticeStartDate: producer.noticeStartDate,
            noticeEndDate: producer.noticeEndDate,
            noticeImages: producer.noticeImages,
            noticeNormalImages: producer.noticeNormalImages,
            noticeObjectUniqueImages: producer.noticeObjectUniqueImages
        }
        this.setState({producer, producerNotice})
    }

    onNoticeDatesChange = ({ startDate, endDate }) => {
        const producerNotice = Object.assign({}, this.state.producerNotice);
        producerNotice.noticeStartDate = startDate && startDate.startOf('day');
        producerNotice.noticeEndDate = endDate && endDate.endOf('day');
        this.setState({producerNotice})
    }

    renderProducerNoticeCalendarInfo = () => <Alert className='m-1'>상품공지 배너 노출 시작일 ~ 종료일을 선택해 주세요</Alert>;

    onNoticeImagesChange = (images) => {
        const producerNotice = Object.assign({}, this.state.producerNotice);
        producerNotice.noticeImages = images;
        this.setState({producerNotice})
    }

    onNoticeNormalImagesChange = (images) => {
        const producerNotice = Object.assign({}, this.state.producerNotice);
        producerNotice.noticeNormalImages = images;
        this.setState({producerNotice})
    }

    onNoticeObjectUniqueImagesChange = (images) => {
        const producerNotice = Object.assign({}, this.state.producerNotice);
        producerNotice.noticeObjectUniqueImages = images;
        this.setState({producerNotice})
    }

    //밸리데이션 체크
    setValidatedObj = (producerNotice) => {
        if(!producerNotice.noticeStartDate) {
            alert("시작일은 필수 입니다.");
            return false;
        }
        if(!producerNotice.noticeEndDate) {
            alert("종료일은 필수 입니다.");
            return false;
        }
        if(producerNotice.noticeImages.length == 0) {
            alert("공지사항 배너 이미지는 필수 입니다.");
            return false;
        }
        return true;
    };

    // 등록버튼
    onConfirmClick = async () => {
        const producerNotice = Object.assign({}, this.state.producerNotice);

        if(!this.setValidatedObj(producerNotice)) {
            return;
        }

        let params = producerNotice;

        const { status, data } = await setProducerNotice(params);
        if(status !== 200){
            alert('판매자 공지 저장이 실패 하였습니다. 다시 시도해주세요.');
            return
        }
        if(status === 200) {
            alert('등록이 완료되었습니다.')
        }
    }

    // 삭제
    onDeleteClick = async (isConfirmed) => {
        let params = {
            noticeStartDate: '',
            noticeEndDate: '',
            noticeImages: []
        }

        if(isConfirmed) {
            this.setState({ producerNotice: params })
        }

        const { status, data } = await setProducerNotice(params);
        if(status === -1){
            alert('판매자 공지 저장이 실패 하였습니다. 다시 시도해주세요.');
            return
        }
        if(status === 200) {
            alert('삭제가 완료되었습니다.')
        }
    }

    onConfirmNormal = async () => {
        const producerNotice = Object.assign({}, this.state.producerNotice);

        if(producerNotice.noticeNormalImages.length == 0) {
            alert("일반 배너 이미지는 필수 입니다.");
            return false;
        }

        const params = {noticeNormalImages:producerNotice.noticeNormalImages};
        const { status, data } = await setProducerNoticeNormalImages(params);
        if(status !== 200){
            alert('판매자 일반 배너 이미지 저장이 실패 하였습니다. 다시 시도해주세요.');
            return
        }
        if(status === 200) {
            alert('판매자 일반 배너 이미지 저장이 완료되었습니다.')
        }
    }
    // 삭제
    onDeleteNormalClick = async (isConfirmed) => {

        const producerNotice = Object.assign({}, this.state.producerNotice);
        producerNotice.noticeNormalImages = [];
        let params = {
            noticeNormalImages: []
        }

        if(isConfirmed) {
            this.setState({ producerNotice: producerNotice })
        }

        const { status, data } = await setProducerNoticeNormalImages(params);
        if(status === -1){
            alert('판매자 일반 배너 이미지 삭제가 실패 하였습니다. 다시 시도해주세요.');
            return
        }
        if(status === 200) {
            alert('판매자 일반 배너 이미지 삭제가 완료되었습니다.')
        }
    }

    onConfirmObject = async () => {
        const producerNotice = Object.assign({}, this.state.producerNotice);

        if(producerNotice.noticeObjectUniqueImages.length == 0) {
            alert("이미지는 필수 입니다.");
            return false;
        }

        const params = {noticeObjectUniqueImages:producerNotice.noticeObjectUniqueImages};
        const { status, data } = await setProducerNoticeObjectUniqueImages(params);
        if(status !== 200){
            alert('판매자 개체인식 배너 이미지 저장이 실패 하였습니다. 다시 시도해주세요.');
            return
        }
        if(status === 200) {
            alert('판매자 개체인식 배너 이미지 저장이 완료되었습니다.')
        }
    }
    // 삭제
    onDeleteObjectClick = async (isConfirmed) => {

        const producerNotice = Object.assign({}, this.state.producerNotice);
        producerNotice.noticeObjectUniqueImages = [];
        let params = {
            noticeObjectUniqueImages: []
        }

        if(isConfirmed) {
            this.setState({ producerNotice: producerNotice })
        }

        const { status, data } = await setProducerNoticeObjectUniqueImages(params);
        if(status === -1){
            alert('판매자 개체인식 배너 이미지 삭제가 실패 하였습니다. 다시 시도해주세요.');
            return
        }
        if(status === 200) {
            alert('판매자 개체인식 배너 이미지 삭제가 완료되었습니다.')
        }
    }


    render() {
        const star = <span className='text-danger'>*</span>;
        const { producerNotice } = this.state;
        return (
            <Fragment>
                <Div relative>
                    <Div p={16}>
                        <FormGroup>
                            <Alert color={'secondary'} className='small'>
                                필수 항목 {star}을 모두 입력해야 등록이 가능합니다.<br/>
                                설정된 기간에 상품상세 배너공지가 APP에 노출되오니 정확하게 입력해 주세요.
                            </Alert>
                        </FormGroup>

                        <Div bc={'light'} p={16}>
                            <FormGroup>
                                <Label className={'font-weight-bold text-secondary small'}>기간 {star}</Label>
                                <Div>
                                    <DateRangePicker
                                        startDateId='my-noticeStartDate'
                                        endDateId='my-noticeEndDate'
                                        startDatePlaceholderText="시작일"
                                        endDatePlaceholderText="종료일"
                                        startDate={this.state.producerNotice.noticeStartDate ? moment(this.state.producerNotice.noticeStartDate) : null}
                                        endDate={this.state.producerNotice.noticeEndDate ? moment(this.state.producerNotice.noticeEndDate) : null}
                                        onDatesChange={this.onNoticeDatesChange}
                                        focusedInput={this.state.focusedInput}
                                        onFocusChange={(focusedInput) => { this.setState({ focusedInput })}}
                                        numberOfMonths={1}          //달력 갯수(2개로 하면 모바일에서는 옆으로 들어가버리기 때문에 orientation='vertical'로 해야함), pc 에서는 상관없음
                                        orientation={'horizontal'}
                                        openDirection="up"
                                        withPortal
                                        small
                                        readOnly
                                        showClearDates
                                        calendarInfoPositio="top"
                                        renderCalendarInfo={this.renderProducerNoticeCalendarInfo}
                                    />
                                </Div>
                                <span className={'small text-secondary'}>
                                    * 상품상세 공지배너가 APP에 노출되는 기간을 선택해 주세요.
                                </span>
                            </FormGroup>
                            <FormGroup>
                                <Label className={'font-weight-bold text-secondary small'}>공지 배너 이미지 {star}</Label>
                                <Div>
                                    <SingleImageUploader
                                        images={producerNotice.noticeImages}
                                        defaultCount={1}
                                        isShownMainText={false}
                                        onChange={this.onNoticeImagesChange}
                                        quality={1}
                                    />
                                </Div>
                                <span className={'small text-secondary'}>
                                    * 실제 노출될 공지사항 배너 이미지를 등록해 주세요.
                                </span>
                            </FormGroup>

                            <Div mt={20} width={'100%'}>
                                <Button px={20} size={'lg'} bg={'green'} fg={'white'} mr={10} onClick={this.onConfirmClick}>등록</Button>
                                <ModalConfirm title={'공지 삭제'} content={<div>현재 등록된 공지를 삭제하시겠습니까?</div>} onClick={this.onDeleteClick.bind(this)}>
                                    <Button px={20} size={'lg'} bg={'danger'} fg={'white'}>삭제</Button>
                                </ModalConfirm>
                            </Div>
                        </Div>
                        <Div mt={16} bc={'light'} p={16}>
                            <FormGroup>
                                <Label className={'font-weight-bold text-secondary small'}>일반 배너 이미지 {star}</Label>
                                <Div>
                                    <SingleImageUploader
                                        images={producerNotice.noticeNormalImages}
                                        defaultCount={1}
                                        isShownMainText={false}
                                        onChange={this.onNoticeNormalImagesChange}
                                        quality={1}
                                    />
                                </Div>
                                <span className={'small text-secondary'}>* 실제 노출될 일반 배너 이미지를 등록해 주세요.</span>
                            </FormGroup>

                            <Div mt={20} width={'100%'}>
                                <Button px={20} size={'lg'} bg={'green'} fg={'white'} mr={10} onClick={this.onConfirmNormal}>등록</Button>
                                <ModalConfirm title={'일반 배너 삭제'} content={<div>현재 등록된 일반 배너 이미지를 삭제하시겠습니까?</div>} onClick={this.onDeleteNormalClick.bind(this)}>
                                    <Button px={20} size={'lg'} bg={'danger'} fg={'white'}>삭제</Button>
                                </ModalConfirm>
                            </Div>
                        </Div>
                        {
                            this.state.producer.localfoodFlag &&
                            <Div mt={16} bc={'light'} p={16}>
                                <FormGroup>
                                    <Label className={'font-weight-bold text-secondary small'}>로컬푸드 개체인식 배너 이미지 {star}</Label>
                                    <Div>
                                        <SingleImageUploader
                                            images={producerNotice.noticeObjectUniqueImages}
                                            defaultCount={1}
                                            isShownMainText={false}
                                            onChange={this.onNoticeObjectUniqueImagesChange}
                                            quality={1}
                                        />
                                    </Div>
                                    <span className={'small text-secondary'}>* 실제 노출될 로컬푸드 개체인식 배너 이미지를 등록해 주세요.(개체인식 상품상세에 노출)</span>
                                </FormGroup>

                                <Div mt={20} width={'100%'}>
                                    <Button px={20} size={'lg'} bg={'green'} fg={'white'} mr={10} onClick={this.onConfirmObject}>등록</Button>
                                    <ModalConfirm title={'개체인 배너 삭제'} content={<div>현재 등록된 개체인식 배너를 삭제하시겠습니까?</div>} onClick={this.onDeleteObjectClick.bind(this)}>
                                        <Button px={20} size={'lg'} bg={'danger'} fg={'white'}>삭제</Button>
                                    </ModalConfirm>
                                </Div>
                            </Div>
                        }
                    </Div>
                </Div>
            </Fragment>
        )
    }
}