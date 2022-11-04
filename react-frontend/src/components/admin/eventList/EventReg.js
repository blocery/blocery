import React, { Component } from 'react';
import {FormGroup, Label, Button, Alert} from 'reactstrap'
import {BlocerySpinner, FooterButtonLayer, SingleImageUploader} from '~/components/common'
import { getEventInfo, setEventInfoSave } from '~/lib/adminApi'
import SummernoteEditor from "~/components/common/summernoteEditor";
import {DateRangePicker} from "react-dates";
import ComUtil from "~/util/ComUtil";
import {Div, Flex} from "~/styledComponents/shared";
import Switch from "react-switch";

export default class EventReg extends Component{
    constructor(props) {
        super(props);

        const { eventNo } = this.props;

        this.state = {
            isDidMounted: false,
            focusedInput: null,
            event: {
                eventNo: eventNo,          // 이벤트 No
                startDay:'',               // 이벤트 시작일
                endDay:'',                 // 이벤트 종료일
                images:[],	               // 이벤트 이미지
                eventTitle: "",            // 이벤트 타이틀
                eventContent: "",          // 이벤트 내용
                eventType:0,               // 이벤트 타입 (0:event,1:listUrl)
                eventLink: "",             // 이벤트 링크 URL
                replyHide:false            // 댓글기능 숨기기
            }
        };
    }

    //밸리데이션 체크
    setValidatedObj = (event) => {
        if(!event.startDay) {
            alert("시작일은 필수 입니다.");
            return false;
        }
        if(!event.endDay) {
            alert("종료일은 필수 입니다.");
            return false;
        }
        if(event.images.length == 0) {
            alert("이미지는 필수 입니다.");
            return false;
        }
        if(event.eventTitle.length == 0) {
            alert("이벤트 타이틀은 필수 입니다.");
            return false;
        }


    };

    componentDidMount = async () => {

        if(this.state.event.eventNo){

            // 이벤트 정보 조회
            let eventData = Object.assign({}, this.state.event);
            let eventNo = this.state.event.eventNo;
            const { status, data } = await getEventInfo(this.state.event.eventNo);
            //console.log("getEvent==",data);
            if(status !== 200){
                alert('응답이 실패 하였습니다');
                return
            }

            data.eventNo = eventNo;
            eventData = data;
            this.setState({
                event:eventData
            })

        }

        this.setState({isDidMounted:true})

    };

    //인풋박스
    onInputChange = (e) => {
        let {name, value} = e.target;
        let event = Object.assign({}, this.state.event);

        let obj_state = {};
        event[name] = value;

        obj_state.event = event;
        this.setState(obj_state);
    };

    //이미지 온체인지 이벤트
    onEventImagesChange = (images) => {
        const event = Object.assign({}, this.state.event);
        event.images = images;
        this.setState({event})
    };

    onEventContentChange = (editorHtml) => {
        const event = Object.assign({}, this.state.event);
        event.eventContent = editorHtml;
        this.setState({event});
    };

    onEventTypeChange = (eventType) => {
        const event = Object.assign({}, this.state.event);
        event.eventType = eventType;
        this.setState({event});
    }

    onEventReplyHideChange = (replyHide) => {
        const event = Object.assign({}, this.state.event);
        event.replyHide = replyHide;
        this.setState({event});
    }

    //이벤 기간 달력 문구 렌더러
    renderEventCalendarInfo = () => <Alert className='m-1'>이벤트 시작일 ~ 종료일을 선택해 주세요</Alert>;

    //기획전 기간 달력
    onEventDatesChange = ({ startDate, endDate }) => {
        const event = Object.assign({}, this.state.event);
        event.startDay = startDate && startDate.startOf('day').format('YYYYMMDD');
        event.endDay = endDate && endDate.endOf('day').format('YYYYMMDD');
        this.setState({event})
    };

    onCancelClick = () => {
        //  닫기(취소), 리스트 리플래시(재조회)
        let params = {
            refresh:true
        };
        this.props.onClose(params);
    };
    onConfirmClick = async () => {
        //등록 및 수정 처리
        const event = Object.assign({}, this.state.event);

        if(event.eventTitle.length == 0) {
            alert("이벤트 타이틀은 필수 입니다.");
            return false;
        }

        let params = event;

        const { status, data } = await setEventInfoSave(params);
        if(status !== 200){
            alert('이벤트 저장이 실패 하였습니다');
            return
        }
        if(status === 200){
            // 닫기 및 목록 재조회
            let params = {
                refresh:true
            };
            this.props.onClose(params);
        }
    };

    render() {

        if(!this.state.isDidMounted) return <BlocerySpinner/>;

        const { event } = this.state;

        const star = <span className='text-danger'>*</span>;

        const btnCancel = <Button onClick={this.onCancelClick} block color={'warning'}>취소</Button>;
        const btnSave = <Button onClick={this.onConfirmClick} block color={'info'}>저장</Button>;

        return (
            <div style={{position: 'relative'}}>

                <div className='pt-0 pl-2 pr-2 pb-1'>
                    <FormGroup>
                        <Label className={'font-weight-bold text-secondary small'}>
                            이벤트 타이틀 {star}
                        </Label>
                        <div>
                            <input
                                type="text"
                                name={"eventTitle"}
                                style={{width:'80%'}}
                                value={event.eventTitle}
                                onChange={this.onInputChange}
                            />
                        </div>
                    </FormGroup>

                    <FormGroup>
                        <Label className={'font-weight-bold text-secondary small'}>기간 {star}</Label>
                        <div>
                            <DateRangePicker
                                startDateId='my-eventStartDate'
                                endDateId='my-eventEndDate'
                                startDatePlaceholderText="시작일"
                                endDatePlaceholderText="종료일"
                                startDate={event.startDay ? ComUtil.intToDateMoment(event.startDay).startOf() : null}
                                endDate={event.endDay ? ComUtil.intToDateMoment(event.endDay).endOf() : null}
                                onDatesChange={this.onEventDatesChange}
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
                                isOutsideRange={()=>false}
                                renderCalendarInfo={this.renderEventCalendarInfo}
                            />
                        </div>
                        <span className={'small text-secondary'}>
                            * 이벤트가 APP에 노출되는 기간을 선택해 주세요.
                        </span>
                    </FormGroup>
                    <FormGroup>
                        <Label className={'font-weight-bold text-secondary small'}>이미지 {star}</Label>
                        <div>
                            <SingleImageUploader
                                images={event.images}
                                defaultCount={1}
                                isShownMainText={false}
                                onChange={this.onEventImagesChange}
                                quality={1}
                            />
                        </div>
                        <span className={'small text-secondary'}>
                            * 이벤트 목록에 노출되는 이미지를 등록해 주세요.
                        </span>
                    </FormGroup>

                    <FormGroup>
                        <Div bold>댓글기능숨김</Div>
                        <Div>
                            <Switch checked={event.replyHide} onChange={this.onEventReplyHideChange}></Switch>
                        </Div>
                    </FormGroup>

                    <FormGroup>
                            <Div fw={500} mb={8}>이벤트 표시 타입</Div>
                            <Div>
                                <input type={'radio'} id={'eventType1'} name={'eventType'} checked={event.eventType === 0 && true} onChange={this.onEventTypeChange.bind(this, 0)} /><label htmlFor="eventType" className='pl-1 mr-3 f5'> 이벤트 내용 선택</label>
                            </Div>
                            <Div>
                                <input type={'radio'} id={'eventType2'} name={'eventType'} checked={event.eventType === 1 && true} onChange={this.onEventTypeChange.bind(this, 1)} /><label htmlFor="eventType" className='pl-1 mr-3 f5'> 이벤트 목록 URL 선택</label>
                            </Div>
                    </FormGroup>

                    <FormGroup style={{'display':event.eventType === 0 ? 'block':'none'}}>
                        <Label className={'font-weight-bold text-secondary small'}>이벤트 내용</Label>
                        <div className="d-flex align-items-center">
                            <SummernoteEditor
                                onChange={this.onEventContentChange} editorHtml={event.eventContent}
                                quality={1}
                                height={700}
                            />
                        </div>
                    </FormGroup>

                    <FormGroup style={{'display':event.eventType === 1 ? 'block':'none'}}>
                        <Label className={'font-weight-bold text-secondary small'}>링크</Label>
                        <div>
                            <input
                                type="text"
                                name={"eventLink"}
                                style={{width:'80%'}}
                                value={event.eventLink}
                                onChange={this.onInputChange}
                            />
                        </div>
                    </FormGroup>

                    <FooterButtonLayer data={[
                        btnCancel,
                        btnSave,
                    ]} />

                </div>

            </div>
        )
    }
}
