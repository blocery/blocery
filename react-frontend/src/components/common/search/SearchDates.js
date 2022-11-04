import React, {useState,useEffect} from 'react';
import {Flex, Div} from '~/styledComponents/shared/Layouts'
import {Alert, Button, ButtonGroup} from 'reactstrap'
import moment from "moment-timezone";
import {SingleDatePicker} from "react-dates";
import 'moment/locale/ko'
const SearchDates = (props) => {
    // isHiddenAll "전체" 버튼 숨길 경우 true
    const {btnAllHidden = false, isHiddenAll = false, isCurrenYeartHidden = false, txtAllTitle, isNotOnSearch}= props;

    // 시작일자 달력 , 종료일자 달력
    const renderStartCalendarInfo = () => <Alert className='m-1'>시작 날짜를 선택해 주세요</Alert>;
    const renderEndCalendarInfo = () => <Alert className='m-1'>종료 날짜를 선택해 주세요</Alert>;
    const [startDayFocusedInput,setStartDayFocusedInput] = useState(null);
    const [endDayFocusedInput,setEndDayFocusedInput] = useState(null);

    const [selectedGubun, setSelectedGubun] = useState(props.gubun ? props.gubun:'day');
    const [startDate, setStartDate] = useState((props.startDate ? props.startDate:moment(moment().toDate())));
    const [endDate, setEndDate] = useState((props.endDate ? props.endDate:moment(moment().toDate())));

    useEffect(() => {
        //한글언어
        moment.locale('ko');
    },[]);

    useEffect(() => {
        if(props.startDate != null){
            setStartDate(props.startDate);
        }
        if(props.endDate != null){
            setEndDate(props.endDate)
        }
        if(props.gubun === 'all' && props.startDate == null && props.endDate == null){
            setStartDate(null);
            setEndDate(null);
        }
    }, [props]);

    const selectCondition = async (gubun)=>{
        let pStartDate = null;
        let pEndDate = null;
        if(gubun === "day") {
            pStartDate = moment(moment().toDate());
            pEndDate = moment(moment().toDate());
        } else if(gubun === "week") {
            pStartDate = moment(moment().toDate()).subtract(7,"day");
            pEndDate = moment(moment().toDate());
        } else if(gubun === "month") {
            pStartDate = moment(moment().toDate()).subtract(1,"month");
            pEndDate = moment(moment().toDate());
        } else if(gubun === "3month") {
            pStartDate = moment(moment().toDate()).subtract(3,"month");
            pEndDate = moment(moment().toDate());
        } else if(gubun === "6month") {
            pStartDate = moment(moment().toDate()).subtract(6,"month");
            pEndDate = moment(moment().toDate());
        } else if(gubun === "1year") {
            const startYearStateDate = moment().startOf('year').toDate();
            pStartDate = moment(startYearStateDate);
            pEndDate = moment(moment().toDate());
        }

        setStartDate(pStartDate);
        setEndDate(pEndDate);
        setSelectedGubun(gubun);
        props.onChange({
            startDate:pStartDate,
            endDate:pEndDate,
            gubun:gubun,
            isSearch:isNotOnSearch?false:true
        })
    }
    const onStartDateChange = async (date) => {
        setStartDate(moment(date));
        props.onChange({
            startDate:moment(date),
            endDate:endDate,
            gubun:selectedGubun,
            isSearch:false
        })
    }
    const onEndDateChange = async (date) => {
        setEndDate(moment(date));
        props.onChange({
            startDate:startDate,
            endDate:moment(date),
            gubun:selectedGubun,
            isSearch:false
        })
    }

    return (
        <>
            <Flex flexDirection={props.useBr?'column':'row'}>
                {
                    !btnAllHidden &&
                    <ButtonGroup className="pr-2">
                        <Button color="secondary" onClick={selectCondition.bind(this,'day')} style={{zIndex:0}} zIndex={0} active={selectedGubun === 'day'}> 오늘 </Button>
                        <Button color="secondary" onClick={selectCondition.bind(this,'week')} style={{zIndex:0}} active={selectedGubun === 'week'}> 1주일 </Button>
                        <Button color="secondary" onClick={selectCondition.bind(this,'month')} style={{zIndex:0}} active={selectedGubun === 'month'}> 1개월 </Button>
                        <Button color="secondary" onClick={selectCondition.bind(this,'3month')} style={{zIndex:0}} active={selectedGubun === '3month'}> 3개월 </Button>
                        <Button color="secondary" onClick={selectCondition.bind(this,'6month')} style={{zIndex:0}} active={selectedGubun === '6month'}> 6개월 </Button>
                        {
                            !isCurrenYeartHidden && <Button color="secondary" onClick={selectCondition.bind(this,'1year')} style={{zIndex:0}} active={selectedGubun === '1year'}> 현재년도 </Button>
                        }
                        {
                            !isHiddenAll && <Button color="secondary" onClick={selectCondition.bind(this,'all')} style={{zIndex:0}} active={selectedGubun === 'all'}> {txtAllTitle ? txtAllTitle : '전체'} </Button>
                        }
                    </ButtonGroup>
                }
                <Flex>
                    <SingleDatePicker
                        locale={'ko'}
                        placeholder="검색시작일"
                      date={startDate}
                      onDateChange={onStartDateChange}
                      focused={startDayFocusedInput} // PropTypes.bool
                      onFocusChange={({focused}) => setStartDayFocusedInput(focused)} // PropTypes.func.isRequired
                      id={"startDate"} // PropTypes.string.isRequired,
                      numberOfMonths={1}
                      withPortal={false}
                      isOutsideRange={()=>false}
                      small
                      readOnly
                      calendarInfoPosition="top"
                      verticalHeight={700}
                      renderCalendarInfo={renderStartCalendarInfo}

                    /> <Div mx={5}>~</Div>
                    <SingleDatePicker
                        locale={'ko'}
                        placeholder="검색종료일"
                      date={endDate}
                      onDateChange={onEndDateChange}
                      focused={endDayFocusedInput} // PropTypes.bool
                      onFocusChange={({focused}) => setEndDayFocusedInput(focused)} // PropTypes.func.isRequired
                      id={"endDate"} // PropTypes.string.isRequired,
                      numberOfMonths={1}
                      withPortal={false}
                      isOutsideRange={()=>false}
                      small
                      readOnly
                      calendarInfoPosition="top"
                      verticalHeight={700}
                      renderCalendarInfo={renderEndCalendarInfo}
                    />
                </Flex>
            </Flex>
        </>
    )
}
export default SearchDates