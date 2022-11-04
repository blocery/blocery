import React, { Component } from 'react';
import {FormGroup, Label, Button, Alert, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap'
import Select from 'react-select'
import moment from 'moment-timezone'
import 'react-dates/lib/css/_datepicker.css';
import 'react-dates/initialize';
import { SingleDatePicker } from 'react-dates';
import {FaSearchPlus} from 'react-icons/fa'
import {BlocerySpinner, B2cGoodsSelSearch} from '~/components/common'
import ComUtil from '~/util/ComUtil'
import MathUtil from "~/util/MathUtil";
import {getPotenCouponMaster, getTimeSaleAdmin, setTimeSaleRegist, setTimeSaleUpdate} from '~/lib/adminApi'
import {Div, Flex, Span} from "~/styledComponents/shared";

export default class B2cTimeSaleReg extends Component{
    constructor(props) {
        super(props);

        const { timeSaleGoodsNo } = this.props;

        this.state = {
            isReg:timeSaleGoodsNo != null ? false:true,

            isDidMounted:false,
            focusedInput: null,

            timeSaleStartFocusedInput: null, timeSaleEndFocusedInput: null,
            timeSaleStart:"", timeSaleStartHH:"10", timeSaleStartMM:"00",
            timeSaleEnd:"", timeSaleEndHH:"10", timeSaleEndMM:"00",

            hourOptions: [
                {value:'00',label:'00'},
                {value:'01',label:'01'}, {value:'02',label:'02'}, {value:'03',label:'03'},
                {value:'04',label:'04'}, {value:'05',label:'05'}, {value:'06',label:'06'},
                {value:'07',label:'07'}, {value:'08',label:'08'}, {value:'09',label:'09'},
                {value:'10',label:'10'}, {value:'11',label:'11'}, {value:'12',label:'12'},
                {value:'13',label:'13'}, {value:'14',label:'14'}, {value:'15',label:'15'},
                {value:'16',label:'16'}, {value:'17',label:'17'}, {value:'18',label:'18'},
                {value:'19',label:'19'}, {value:'20',label:'20'}, {value:'21',label:'21'},
                {value:'22',label:'22'}, {value:'23',label:'23'},

            ],
            minuteOptions: [
                {value:'00',label:'00'},
                {value:'05',label:'05'}, {value:'10',label:'10'},
                {value:'15',label:'15'}, {value:'20',label:'20'},
                {value:'25',label:'25'}, {value:'30',label:'30'},
                {value:'35',label:'35'}, {value:'40',label:'40'},
                {value:'45',label:'45'}, {value:'50',label:'50'},
                {value:'55',label:'55'}, {value:'59',label:'59'}
            ],

            timeSaleGoods: {
                goodsNo:timeSaleGoodsNo,    // 타임세일 상품 번호

                timeSaleStart:null,         // 타임세일 시작일(일자T시:분)
                timeSaleEnd:null,           // 타임세일 종료일(일자T시:분)

                producerNo:null,            //생산자번호
                producerFarmNm:"",          //생산자명
                goodsNm:"",                 //상품명
                consumerPrice:0,            //소비자가
                currentPrice:0,             //판매가
                discountRate:0,             //할인율

                timeSalePrice:0,            //타임세일가
                timeSaleDiscountRate:0,     //타임세일가 할인율
                timeSaleFeeRate:5,          //타임세일 수수료 최소 5%
                timeSaleSupportPrice: 0,        //판매지원금  (사용안함)
                timeSalePayoutAmount:0,      //정산가 (timeSaleFeeRate 계산용)

                timeSalePriority:0,         //202104추가, 동일시간대에서 낮은값일수록 우선노출
            },

            goodsSearchModal:false,
            currentGoodsIdx:null,
        };
    }

    // 상품 검색 모달 [상품선택] 온체인지 이벤트
    goodsSearchModalOnChange = (obj) => {

        const timeSaleGoods = Object.assign([], this.state.timeSaleGoods);

        timeSaleGoods.producerNo = obj.producerNo;
        timeSaleGoods.producerFarmNm = obj.producerFarmNm;
        timeSaleGoods.goodsNo = obj.goodsNo;
        timeSaleGoods.goodsNm = obj.goodsNm;

        timeSaleGoods.consumerPrice = obj.consumerPrice;
        timeSaleGoods.currentPrice = obj.currentPrice;
        timeSaleGoods.discountRate = obj.discountRate;
        timeSaleGoods.timeSaleFeeRate = obj.feeRate;
        timeSaleGoods.potenCouponDiscount = obj.potenCouponDiscount;
        //202205 eventFlag 옵션에 추가.
        timeSaleGoods.eventOptionPrice = obj.eventOptionPrice;
        timeSaleGoods.eventOptionName = obj.eventOptionName;

        //202205:미사용인듯.
        // if(timeSaleGoods.timeSalePrice) {
        //     let v_disCountRate = (100 - (100 * (ComUtil.toNum(timeSaleGoods.timeSalePrice) / ComUtil.toNum(timeSaleGoods.consumerPrice)))) || 0;
        //     timeSaleGoods.timeSaleDiscountRate = Math.round(v_disCountRate, 0);
        // }

        this.setState({
            timeSaleGoods
        });

        this.goodsSearchModalToggle();
    };

    goodsSearchModalToggle = () => {
        this.setState(prevState => ({
            goodsSearchModal: !prevState.goodsSearchModal
        }));
    };

    //밸리데이션 체크
    setValidatedObj = (timeSaleGoods) => {

        let v_startDateTime = this.state.timeSaleStart;
        let v_startDate = moment(v_startDateTime).startOf('day').format('YYYY-MM-DD');
        let v_startDateHH = this.state.timeSaleStartHH;
        let v_startDateMM = this.state.timeSaleStartMM;

        let v_endDateTime = this.state.timeSaleEnd;
        let v_endDate = moment(v_endDateTime).endOf('day').format('YYYY-MM-DD');
        let v_endDateHH = this.state.timeSaleEndHH;
        let v_endDateMM = this.state.timeSaleEndMM;

        const startDate = moment(v_startDate + 'T' + v_startDateHH + ':' + v_startDateMM+':00').format('YYYY-MM-DDTHH:mm:ss');
        const endDate = moment(v_endDate + 'T' + v_endDateHH + ':' + v_endDateMM+':00').format('YYYY-MM-DDTHH:mm:ss');

        if(!v_startDateTime) {
            alert("시작일은 필수 입니다.");
            return false;
        }
        if(!v_endDateTime) {
            alert("종료일은 필수 입니다.");
            return false;
        }

        if(moment(startDate).format('x') > moment(endDate).format('x')){
            alert('시작일자가 종료일자보다 큽니다!');
            return false;
        }

        if(!timeSaleGoods.goodsNo) {
            alert("상품등록은 필수 입니다.");
            return false;
        }

        // if(!timeSaleGoods.timeSalePrice) {
        //     alert("포텐타임가는 필수 입니다.");
        //     return false;
        // }
        //
        // if(ComUtil.toNum(timeSaleGoods.timeSalePrice) <= 0) {
        //     alert("포텐타임가는 필수 입니다.");
        //     return false;
        // }

        //feeRate로 바꿔서 필요없음.
        // if(ComUtil.toNum(timeSaleGoods.currentPrice) < ComUtil.toNum(timeSaleGoods.timeSalePrice)) {
        //     alert("판매가보다 포텐타임가 금액큽니다- 현재가:" + timeSaleGoods.currentPrice + ", 포텐가:" + timeSaleGoods.timeSalePrice);
        //     return false;
        // }

        if(ComUtil.toNum(timeSaleGoods.timeSaleFeeRate) <= 0 || ComUtil.toNum(timeSaleGoods.timeSaleFeeRate) < 5) {
            alert("타임세일가 수수료는 필수 입니다.(최소 5% 이상)");
            return false;
        }

        return true;

    };

    componentDidMount = async () => {

        if(this.state.timeSaleGoods.goodsNo){
            // 포텐타임 정보 조회
            let timeSaleGoods = Object.assign({}, this.state.timeSaleGoods);
            let goodsNo = timeSaleGoods.goodsNo;
            const { status, data } = await getTimeSaleAdmin(goodsNo);
            console.log("getTimeSaleAdmin==",data);
            if(status !== 200){
                alert('응답이 실패 하였습니다');
                return
            }

            const {data:potenCouponInfo} = await getPotenCouponMaster(goodsNo);

            console.log(potenCouponInfo);

            timeSaleGoods.producerNo = data.producerNo;
            timeSaleGoods.producerFarmNm = data.producerFarmNm;
            timeSaleGoods.goodsNo = data.goodsNo;
            timeSaleGoods.goodsNm = data.goodsNm;

            timeSaleGoods.consumerPrice = data.consumerPrice;
            timeSaleGoods.currentPrice = data.defaultCurrentPrice;
            timeSaleGoods.discountRate = data.defaultDiscountRate;
            timeSaleGoods.timeSalePrice = data.timeSalePrice;
            timeSaleGoods.timeSaleDiscountRate = data.timeSaleDiscountRate;
            timeSaleGoods.timeSaleFeeRate = data.timeSaleFeeRate;
            timeSaleGoods.timeSaleSupportPrice = data.timeSaleSupportPrice;
            timeSaleGoods.potenCouponDiscount = potenCouponInfo.potenCouponDiscount;
            timeSaleGoods.timeSalePayoutAmount = MathUtil.multipliedBy(potenCouponInfo.potenCouponGoodsPrice,(1 - MathUtil.dividedBy(data.timeSaleFeeRate,100)));
            timeSaleGoods.timeSalePriority = data.timeSalePriority; //202104 추가
            //202205 eventFlag 옵션에 추가.
            timeSaleGoods.eventOptionPrice = data.eventOptionPrice;
            timeSaleGoods.eventOptionName = data.eventOptionName;
            timeSaleGoods.eventGoodsNm = data.eventGoodsNm; //2022.05추가


            let v_startDateTime =  moment(data.timeSaleStart);
            let v_endDateTime = moment(data.timeSaleEnd);
            let v_startDate = moment(v_startDateTime).format('YYYY-MM-DD');
            let v_startDateHH = moment(v_startDateTime).format('HH');
            let v_startDatemm = moment(v_startDateTime).format('mm');
            let v_endDate = moment(v_endDateTime).format('YYYY-MM-DD');
            let v_endDateHH = moment(v_endDateTime).format('HH');
            let v_endDatemm = moment(v_endDateTime).format('mm');

            this.setState({
                timeSaleStart:v_startDate, timeSaleStartHH:v_startDateHH, timeSaleStartMM:v_startDatemm,
                timeSaleEnd:v_endDate, timeSaleEndHH:v_endDateHH, timeSaleEndMM:v_endDatemm,
                timeSaleGoods
            });

        }else{
            let nowDay =  moment().day(); //0:일요일 〜 6:토요일
            if(nowDay < 4) {
                //이번주 목요일 오전10시 일자 구하기
                let nowDate = moment().day(4).hours(10).minutes(0).seconds(0).milliseconds(0).toDate();
                let v_startDate = moment(nowDate).format('YYYY-MM-DD');
                let v_endDate = moment(v_startDate).add(1,"days").format('YYYY-MM-DD');
                this.setState({
                    timeSaleStart: v_startDate, timeSaleEnd: v_endDate
                });
            }else{
                //다음주 목요일 오전10시 일자 구하기
                let next_thurs = moment().weekday(7+4);
                let nowDate = next_thurs.hours(10).minutes(0).seconds(0).milliseconds(0).toDate();
                let v_startDate = moment(nowDate).format('YYYY-MM-DD');
                let v_endDate = moment(v_startDate).add(1,"days").format('YYYY-MM-DD');
                this.setState({
                    timeSaleStart: v_startDate, timeSaleEnd: v_endDate
                });
            }
        }

        this.setState({isDidMounted:true})

    };

    ///타임세일 시작일자 달력
    renderStartCalendarInfo = (stepNo) => <Alert className='m-1'>시작 날짜를 선택해 주세요</Alert>;
    ///타임세일 종료일자 달력
    renderEndCalendarInfo = (stepNo) => <Alert className='m-1'>종료 날짜를 선택해 주세요</Alert>;

    //타임세일 일자 달력
    onCalendarDatesChange = (gubun, date) => {
        let v_gubun = gubun;
        let v_date = date.endOf('day');
        if(gubun == "start"){
            this.setState({
                timeSaleStart:v_date
            });
        }
        if(gubun == "end"){
            this.setState({
                timeSaleEnd:v_date
            });
        }
    }

    onStartHHChange = (data) => {
        let v_StartHH = data.value;
        this.setState({
            timeSaleStartHH:v_StartHH
        });
    }
    onStartMMChange = (data) => {
        let v_StartMM = data.value;
        this.setState({
            timeSaleStartMM:v_StartMM
        });
    }
    onEndHHChange = (data) => {
        let v_EndHH = data.value;
        this.setState({
            timeSaleEndHH:v_EndHH
        });
    }
    onEndMMChange = (data) => {
        let v_EndMM = data.value;
        this.setState({
            timeSaleEndMM:v_EndMM
        });
    }

    //인풋박스
    onInputChange = (e) => {
        let {name, value} = e.target;

        if(value < 0){
            alert('해당 값은 0보다 작을 수 없습니다.');
            return;
        }

        // if(name !== 'timeSaleSupportPrice' && value <= 0) {
        //     alert('해당 값은 0보다 커야합니다.');
        //     return;
        // }

        let timeSaleGoods = Object.assign({}, this.state.timeSaleGoods);

        let obj_state = {};
        timeSaleGoods[name] = value;

        if(name === "timeSalePayoutAmount") {
            //timeSaleGoods.timeSaleFeeRate = (1 - (ComUtil.toNum(value) / timeSaleGoods.eventOptionPrice)) * 100;
            timeSaleGoods.timeSaleFeeRate = MathUtil.multipliedBy((1 - MathUtil.dividedBy(ComUtil.toNum(value),timeSaleGoods.eventOptionPrice)),100);

        }

        // if(name == "timeSalePrice"){
        //     let v_disCountRate = (100 -  (100 * (ComUtil.toNum(value)/ComUtil.toNum(timeSaleGoods.consumerPrice)))) || 0;
        //     timeSaleGoods.timeSaleDiscountRate = Math.round(v_disCountRate,0);
        // }
        obj_state.timeSaleGoods = timeSaleGoods;
        this.setState(obj_state);
    };

    // 상품검색 클릭
    goodsSearchModalPopup = (e) => {
        this.setState({
            goodsSearchModal: true
        })
    };

    //상품 컴포넌트 관련 온체인지
    onInputTimeSaleGoodsChange = (e) => {
        let { name, value } = e.target;
        const timeSaleGoods = Object.assign([], this.state.timeSaleGoods);
        timeSaleGoods[name] = value;
        this.setState({
            timeSaleGoods
        });
    };

    onCancelClick = () => {
        // 기획전 닫기(취소), 리스트 리플래시(재조회)
        let params = {
            refresh:true
        };
        this.props.onClose(params);
    };
    onConfirmClick = async () => {
        //기획전 등록 및 수정 처리
        const timeSaleGoods = Object.assign({}, this.state.timeSaleGoods);

        let return_chk = this.setValidatedObj(timeSaleGoods);
        if(!return_chk){
            return false;
        }

        let v_startDateTime = this.state.timeSaleStart;
        let v_startDate = moment(v_startDateTime).startOf('day').format('YYYY-MM-DD');
        let v_startDateHH = this.state.timeSaleStartHH;
        let v_startDateMM = this.state.timeSaleStartMM;

        let v_endDateTime = this.state.timeSaleEnd;
        let v_endDate = moment(v_endDateTime).endOf('day').format('YYYY-MM-DD');
        let v_endDateHH = this.state.timeSaleEndHH;
        let v_endDateMM = this.state.timeSaleEndMM;

        const startDate = moment(v_startDate + 'T' + v_startDateHH + ':' + v_startDateMM+':00').format('YYYY-MM-DDTHH:mm:ss');
        const endDate = moment(v_endDate + 'T' + v_endDateHH + ':' + v_endDateMM+':00').format('YYYY-MM-DDTHH:mm:ss');

        timeSaleGoods.timeSaleStart = startDate;
        timeSaleGoods.timeSaleEnd = endDate;
        timeSaleGoods.timeSale = true;
        timeSaleGoods.timeSalePrice = ComUtil.toNum(timeSaleGoods.eventOptionPrice)
        //202104 노출우선순위 추가
        timeSaleGoods.timeSalePriority = ComUtil.toNum(timeSaleGoods.timeSalePriority)

        if(!timeSaleGoods.eventGoodsNm) {
            alert("이벤트용 상품명은 필수 입니다.");
            return false;
        }


        let params = timeSaleGoods;

        if(this.state.isReg == true) {
            const {status, data} = await setTimeSaleRegist(params);
            if (status !== 200) {
                alert('포텐타임 저장이 실패 하였습니다');
                return
            }
            if (status === 200) {
                if(data === -1){
                    alert('로그인을 다시 해야 합니다.');
                    return
                }
                else if(data === -9){
                    alert('포텐타임 쿠폰 등록이 안되어 있습니다.');
                    return
                }
                // 닫기 및 목록 재조회
                let params = {
                    refresh: true
                };
                this.props.onClose(params);
            }
        }else{
            const {status, data} = await setTimeSaleUpdate(params);
            if (status !== 200) {
                alert('포텐타임 저장이 실패 하였습니다');
                return
            }
            if (status === 200) {
                // 닫기 및 목록 재조회
                let params = {
                    refresh: true
                };
                this.props.onClose(params);
            }
        }
    };

    render() {

        if(!this.state.isDidMounted) return <BlocerySpinner/>;

        const { timeSaleGoods } = this.state;

        const star = <span className='text-danger'>*</span>;


        return (
            <Div custom={`
                  position: relative;
                  z-index:1019 !important;
            `}>

                <div className='pt-0 pl-2 pr-2 pb-1'>
                    <FormGroup>
                        <Alert color={'secondary'} className='small'>
                            <Span fg={'danger'}>[포텐타임쿠폰]을 먼저 등록하고 진행해 주세요.</Span> <br/>
                            필수 항목 {star}을 모두 입력해야 등록이 가능합니다.<br/>
                            설정된 기간에 포텐타임이 APP에 노출되오니 정확하게 입력해 주세요.
                        </Alert>
                    </FormGroup>

                    <Flex>
                        <FormGroup>
                            <Label className={'font-weight-bold text-secondary small'}>기간 {star}</Label>
                            <div className="d-flex align-items-center">
                                <SingleDatePicker
                                    placeholder="시작일"
                                    date={this.state.timeSaleStart ? moment(this.state.timeSaleStart) : null}
                                    onDateChange={this.onCalendarDatesChange.bind(this,'start')}
                                    focused={this.state['timeSaleStartDateFocused']}
                                    onFocusChange={({ focused }) => this.setState({ ['timeSaleStartDateFocused']:focused })}
                                    id={"timeSaleStartDate"}
                                    numberOfMonths={1}
                                    withPortal
                                    small
                                    readOnly
                                    calendarInfoPosition="top"
                                    enableOutsideDays
                                    // daySize={45}
                                    verticalHeight={700}
                                    renderCalendarInfo={this.renderStartCalendarInfo.bind(this)}
                                />
                                <div className="pl-1" style={{width: '100px'}}>
                                    <Select
                                        name={'timeSaleStartHH'}
                                        options={this.state.hourOptions}
                                        value={this.state.timeSaleStartHH ? this.state.hourOptions.find(itemHH => itemHH.value === this.state.timeSaleStartHH) : '00'}
                                        onChange={this.onStartHHChange}
                                    />
                                </div>
                                <div className="pl-1" style={{width: '100px'}}>
                                    <Select
                                        name={'timeSaleStartMM'}
                                        options={this.state.minuteOptions}
                                        value={this.state.timeSaleStartMM ? this.state.minuteOptions.find(itemMM => itemMM.value === this.state.timeSaleStartMM) : '00'}
                                        onChange={this.onStartMMChange}
                                    />
                                </div>
                                <div className="pl-1 pr-1"><span>~</span></div>
                                <SingleDatePicker
                                    placeholder="종료일"
                                    date={this.state.timeSaleEnd ? moment(this.state.timeSaleEnd) : null}
                                    onDateChange={this.onCalendarDatesChange.bind(this,'end')}
                                    focused={this.state['timeSaleEndDateFocused']}
                                    onFocusChange={({ focused }) => this.setState({ ['timeSaleEndDateFocused']:focused })}
                                    id={"timeSaleEndDate"}
                                    numberOfMonths={1}
                                    withPortal
                                    small
                                    readOnly
                                    calendarInfoPosition="top"
                                    enableOutsideDays
                                    // daySize={45}
                                    verticalHeight={700}
                                    renderCalendarInfo={this.renderEndCalendarInfo.bind(this)}
                                />
                                <div className="pl-1" style={{width: '100px'}}>
                                    <Select
                                        name={'timeSaleEndHH'}
                                        options={this.state.hourOptions}
                                        value={this.state.timeSaleEndHH ? this.state.hourOptions.find(itemHH => itemHH.value === this.state.timeSaleEndHH) : '00'}
                                        onChange={this.onEndHHChange}
                                    />
                                </div>
                                <div className="pl-1" style={{width: '100px'}}>
                                    <Select
                                        name={'timeSaleEndMM'}
                                        options={this.state.minuteOptions}
                                        value={this.state.timeSaleEndMM ? this.state.minuteOptions.find(itemMM => itemMM.value === this.state.timeSaleEndMM) : '00'}
                                        onChange={this.onEndMMChange}
                                    />
                                </div>
                            </div>
                            <span className={'small text-secondary'}>
                                * 포텐타임이 APP에 노출되는 기간을 선택해 주세요.
                            </span>
                        </FormGroup>
                        <FormGroup>
                            <Label className={'font-weight-bold text-secondary small'}>이벤트 상품명 {star}</Label>
                            <div className="input-group">
                                <input type="text"
                                       name={'eventGoodsNm'}
                                       className="ml-1"
                                       style={{width:'300px'}}
                                       value={timeSaleGoods.eventGoodsNm||""}
                                       placeholder={'이벤트기간에만 누출(필수 입력)'}
                                       onChange={this.onInputTimeSaleGoodsChange} />
                            </div>
                            <span className={'small text-secondary'}>
                                * 설정된 시간동안 상품명에 적용됩니다.
                            </span>
                        </FormGroup>
                    </Flex>
                    <FormGroup>
                        <Label className={'font-weight-bold text-secondary small'}>포텐타임 상품등록 {star}</Label>
                        <div className="d-flex">
                            <div className="d-flex flex-column align-items-center mb-1">

                                <div className="d-flex align-items-center mb-1" >
                                    <div className="input-group">
                                        <input type="text"
                                               name={'mdPickProducerNo'}
                                               className="ml-1"
                                               style={{width:'50px'}}
                                               value={timeSaleGoods.producerNo||""}
                                               readOnly='readonly'
                                               placeholder={'생산자번호'}
                                               onChange={this.onInputTimeSaleGoodsChange} />
                                        <input type="text"
                                               name={'mdPickProducerFarmNm'}
                                               className="ml-1"
                                               style={{width:'100px'}}
                                               value={timeSaleGoods.producerFarmNm||""}
                                               readOnly='readonly'
                                               placeholder={'생산자명'}
                                               onChange={this.onInputTimeSaleGoodsChange} />
                                        <input type="text"
                                               name={'mdPickGoodsNm'}
                                               className="ml-1"
                                               style={{width:'450px'}}
                                               value={timeSaleGoods.goodsNm ||""}
                                               readOnly='readonly'
                                               placeholder={'상품명'}
                                               onChange={this.onInputTimeSaleGoodsChange} />
                                        <input type="number"
                                               name={'mdPickGoodsNo'}
                                               className="ml-1"
                                               style={{width:'100px'}}
                                               value={timeSaleGoods.goodsNo||""}
                                               readOnly='readonly'
                                               placeholder={'상품번호'}
                                               onChange={this.onInputTimeSaleGoodsChange} />
                                        <div>
                                            <Button color={'info'}
                                                    onClick={this.goodsSearchModalPopup}>
                                                <FaSearchPlus /> 상품검색
                                            </Button>
                                        </div>

                                    </div>

                                </div>

                            </div>
                        </div>
                        {timeSaleGoods.goodsNm &&
                            <div> 선택된 이벤트옵션: {timeSaleGoods.eventOptionName} </div>
                        }

                        {
                            (timeSaleGoods.goodsNo) && (
                                <div>
                                    <div className="mt-1">우선순위 :
                                        <input type="number"
                                               name={'timeSalePriority'}
                                               className="ml-1"
                                               style={{width:'100px'}}
                                               //value={timeSaleGoods.timeSalePriority}
                                               value={timeSaleGoods.timeSalePriority||"0"}
                                               //placeholder={'우선순위 낮은값일수록 우선노출'}
                                               onChange={this.onInputChange}
                                        /> (동일시간 시작시, 우선순위 낮은값일수록 우선노출)
                                    </div>
                                    {/*<div className="mt-1">소비자가 : {ComUtil.addCommas(timeSaleGoods.consumerPrice)} 원</div>*/}
                                    <div className="mt-1">
                                        판매가 : {ComUtil.addCommas(timeSaleGoods.eventOptionPrice)} 원
                                        {/*({ComUtil.addCommas(Math.round(timeSaleGoods.discountRate,0))}%)*/}
                                    </div>
                                    <div className="mt-1">
                                        포텐타임가 : <input type="number"
                                                       name={'timeSalePrice'}
                                                       className="ml-1"
                                                       style={{width:'150px'}}
                                                       // value={timeSaleGoods.currentPrice}
                                                       value={MathUtil.multipliedBy(timeSaleGoods.eventOptionPrice,(1-MathUtil.dividedBy(timeSaleGoods.potenCouponDiscount,100)))}
                                                       // value={timeSaleGoods.timeSalePrice||""}
                                                       placeholder={'포텐타임가'}
                                                       // onChange={this.onInputChange}
                                                        disabled={true}
                                                    /> 원
                                        ({timeSaleGoods.potenCouponDiscount}% 할인 적용시)
                                        {/*({ComUtil.addCommas(Math.round(timeSaleGoods.timeSaleDiscountRate,0))}%)*/}
                                    </div>
                                    <div className="mt-1">
                                        <span className="mr-5">
                                            정산가 :
                                            <input type="number"
                                                   name={'timeSalePayoutAmount'}
                                                   className="ml-1"
                                                   style={{width:'100px'}}
                                                   value={timeSaleGoods.timeSalePayoutAmount||""}
                                                   placeholder={'정산가'}
                                                   onChange={this.onInputChange} />
                                       {/*<input type="number"*/}
                                       {/*              name={'timeSaleFeeRate'}*/}
                                       {/*              className="ml-1"*/}
                                       {/*              style={{width:'100px'}}*/}
                                       {/*              value={timeSaleGoods.timeSaleFeeRate||""}*/}
                                       {/*              placeholder={'타임세일수수료(5% 이상 입력)'}*/}
                                       {/*              onChange={this.onInputChange} /> %*/}
                                        </span>
                                        {/*<span className="ml-4 mr-5">*/}
                                        {/*    판매지원금 : <input type="number"*/}
                                        {/*                 name={'timeSaleSupportPrice'}*/}
                                        {/*                 className="ml-1"*/}
                                        {/*                 style={{width:'100px'}}*/}
                                        {/*                 value={timeSaleGoods.timeSaleSupportPrice||""}*/}
                                        {/*                 placeholder={'판매지원금'}*/}
                                        {/*                 onChange={this.onInputChange} /> 원*/}
                                        {/*</span>*/}
                                        <span className="ml-4">
                                            {/*정산가 : {timeSaleGoods.timeSalePrice * ((100 - timeSaleGoods.timeSaleFeeRate) / 100) + ComUtil.toNum(timeSaleGoods.timeSaleSupportPrice)}원*/}
                                            수수료 : {timeSaleGoods.timeSaleFeeRate||""}%
                                        </span>
                                    </div>
                                </div>
                            )
                        }

                    </FormGroup>

                    <div className="d-flex">
                        <div className='flex-grow-1 p-1'>
                            <Button onClick={this.onCancelClick} block color={'warning'}>취소</Button>
                        </div>
                        <div className='flex-grow-1 p-1'>
                            <Button onClick={this.onConfirmClick} block color={'info'}>저장</Button>
                        </div>
                    </div>

                </div>


                {/*상품검색 모달 */}
                <Modal size="lg" isOpen={this.state.goodsSearchModal}
                       toggle={this.goodsSearchModalToggle} >
                    <ModalHeader toggle={this.goodsSearchModalToggle}>
                        상품 검색
                    </ModalHeader>
                    <ModalBody>
                        <B2cGoodsSelSearch onChange={this.goodsSearchModalOnChange} />
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary"
                                onClick={this.goodsSearchModalToggle}>취소</Button>
                    </ModalFooter>
                </Modal>

            </Div>
        )
    }
}

