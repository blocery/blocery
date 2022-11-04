import React, {useState, useEffect} from 'react';
import {Button, Div, Flex, Input, Right, Span, Hr, Space, GridColumns} from "~/styledComponents/shared";
import {MonthBox, SingleImageUploader} from "~/components/common";
import {Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import {useModal} from "~/util/useModal";
import SummernoteEditor from "~/components/common/summernoteEditor";
import moment from "moment-timezone";
import {BsCaretDownFill, BsCaretUpFill} from "react-icons/bs";
import adminApi, {saveRouletteManage} from "~/lib/adminApi";
import {FaMinusCircle} from "react-icons/fa";
import ComUtil from "~/util/ComUtil";
import CouponList from "~/components/common/modalContents/CouponList"
import 'react-month-picker/css/month-picker.css'
import MonthPicker from 'react-month-picker'

const pickerLang = {
    months: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
}
const Star = () => <Span fg={'danger'}>*</Span>
const Heading = ({children}) => <Div bold fontSize={13} mb={10}>{children}</Div>
const OuterBox = ({children}) => <Div mb={10} p={16} bg={'white'} rounded={5} bc={'light'}>{children}</Div>

const RouletteContent = ({rouletteId, onClose}) => {

    const today =  moment();
    const initMonth = today.subtract(0, 'month');
    const [limitMonth,] = useState({
        year: rouletteId? parseInt(rouletteId.toString().substr(0,4)):initMonth.year(),
        month: rouletteId? parseInt(rouletteId.toString().substr(4,2)):initMonth.month() + 1
    });
    const [searchMonthValue, setSearchMonthValue] = useState(limitMonth);
    const [yearMonthText, setYearMonthText] = useState(
        searchMonthValue.year + '-' + (searchMonthValue.month < 10 ? '0'+searchMonthValue.month:searchMonthValue.month)
    );
    const [monthDays,setMonthDays] = useState(moment(searchMonthValue.year + '-' + (searchMonthValue.month < 10 ? '0'+searchMonthValue.month:searchMonthValue.month), "YYYY-MM").daysInMonth())
    const [showMonthPicker, setShowMonthPicker] = useState(false);

    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal()

    const [state, setState] = useState({
        yyyymm: rouletteId|| (searchMonthValue.year + '' + (searchMonthValue.month < 10 ? '0'+searchMonthValue.month:searchMonthValue.month)),
        title: '',
        items: [
            {point: '', text:'', totalCount:'' }, {point: '', text:'', totalCount:'' }, {point: '', text:'', totalCount:'' }, {point: '', text:'', totalCount:'' },
            {point: '', text:'', totalCount:'' }, {point: '', text:'', totalCount:'' }, {point: '', text:'', totalCount:'' }, {point: '', text:'', totalCount:'' }
        ],
        rewards: [],
        content: '',
        rouletteInfoImages: []
    })

    useEffect(() => {
        search()
    }, [state.yyyymm])

    // 룰렛년월 text 표시
    const setYearMonthValAndText = (item) => {
        const intYear = parseInt(item.toString().substr(0,4));
        const intMonth = parseInt(item.toString().substr(4,2));
        const yearMonthVal={
            year: intYear,
            month: intMonth
        }
        setSearchMonthValue(yearMonthVal);
        makeMonthText(yearMonthVal);
    }
    // 룰렛년월로 검색
    // 검색한 데이터가 없을경우 초기설정 데이터로 세팅
    const search = async () => {
        let year = searchMonthValue.year;
        let month = searchMonthValue.month;
        let searchYearMonthVal = year + '' + month;
        if (month < 10) {
            searchYearMonthVal = year + '0' + month;
        }
        setYearMonthValAndText(searchYearMonthVal);
        const {data} = await adminApi.rouletteManage(searchYearMonthVal)
        if(data) {
            setState(data)
        }else{
            const newState = {...state};
            newState.title = "";
            newState.content = "";
            newState.items = [
                {point: '', text:'', totalCount:'' }, {point: '', text:'', totalCount:'' }, {point: '', text:'', totalCount:'' }, {point: '', text:'', totalCount:'' },
                {point: '', text:'', totalCount:'' }, {point: '', text:'', totalCount:'' }, {point: '', text:'', totalCount:'' }, {point: '', text:'', totalCount:'' }
            ];
            newState.rewards = [];
            newState.rouletteInfoImages = [];
            setState(newState);
        }
    }

    //룰렛항목 온체인지
    const onItemTextChange = (index, e) => {
        const {name, value} = e.target;
        const newState = {...state}
        if(name === 'point') {
            newState.items[index].point = value;
        }
        else if(name === 'text') {
            newState.items[index].text = value;
        }
        else if(name === 'totalCount') {
            newState.items[index].totalCount = value;
        }

        setState(newState)
    }

    const onSortClick = ({index, moveIndex}) => {
        if (index + moveIndex === -1){
            return
        }

        const items = Object.assign([], state.items)

        //잘라내기
        const value = items.splice(index, 1)[0]; //splice는 항상 array 로 리턴하기 때문

        items.splice(index+moveIndex, 0, value)

        setState({
            ...state,
            items: items
        })
    }

    //룰렛항목 행추가
    const onAddItemClick = () => {
        const newState = {...state}
        newState.items.push({point: '', text:'', totalCount:'' });
        setState(newState)
    }
    //룰렛항목 지우기
    const onItemDeleteClick = (index) => {
        const newState = {...state}
        newState.items.splice(index, 1)
        setState(newState)
    }

    //모달 토글
    const toggle = () => {
        setModalState(!modalOpen)
    }

    //쿠폰 적용 모달 띄우기
    const onCouponAddClick = (index) => {
        setSelected(index)
        toggle()
    }
    //모달 상품 선택 후 콜백 함수
    const couponModalCallback = (couponMaster) => {
        //console.log({selected, couponMaster})
        const index = selected
        if(couponMaster){
            const newState = {...state}
            newState.rewards.push({
                type:"coupon",
                count:(index+1),
                refNo:couponMaster.masterNo,
                etc:couponMaster.fixedWon
            })
            setState(newState)
        }
        toggle()
    }
    //쿠폰 삭제
    const onCouponDelClick = (index) => {
        const newState = {...state};
        newState.rewards = state.rewards.filter((item)=> item.count != (index+1));
        setState(newState)
    }

    const onInputchange = ({target}) => {
        const {name, value} = target
        setState({
            ...state,
            [name]: value
        })
    }

    const onEditChange = (data) => {
        setState({
            ...state,
            content: data
        })
    }

    //저장
    const onSaveClick = async () => {
        // validation check
        if (!canSave()) {
            return
        }

        if (!window.confirm("룰렛을 저장하시겠습니까? 기존 룰렛데이터를 확인하시고 저장하세요.")) {
            return;
        }
        console.log("state",state)
        const {data} = await adminApi.saveRouletteManage(state);
        if(!data){
            alert("오류가 발생하였습니다. 잠시후 다시 해보세요!")
        }
        onClose(true)
    }

    //validation check
    const canSave = () => {
        if (!state.title) {
            alert('룰렛제목은 필수 입니다')
            return false;
        }

        let hasItems = true
        let hasItemsPointMax = false;
        state.items.map(item => {
            if (!item.point || !item.text || !item.totalCount) {
                hasItems = false
            }

            if (item.point) {
                if (item.point > 999999999) {
                    hasItemsPointMax = true
                }
            }
        })

        if (!hasItems) {
            alert('룰렛항목의 룰렛포인트와 룰렛명은 필수 입니다')
            return false;
        }

        if (state.items.length < 4 || state.items.length > 8) {
            alert('룰렛항목은 최소4개 ~ 최대8개 까지 입력 가능합니다.')
            return false
        }

        if(hasItemsPointMax){
            alert('룰렛항목의 포인트는 최대 999999999보다 작아야 합니다.')
            return false
        }

        return true
    }

    //삭제
    const onDeleteClick = async () => {
        if (!window.confirm('삭제 하시겠습니까? 삭제하실때 운영중인 룰렛이 있을 경우 주의하세요')) {
            return
        }
        const {data} = await adminApi.delRouletteManage(state.yyyymm);
        onClose(true)
    }

    const makeMonthText = (m) => {
        let r_yearmonthtext = "";
        if (m && m.year && m.month) {
            r_yearmonthtext = m.year + '-' + pickerLang.months[m.month - 1];
        }
        setYearMonthText(r_yearmonthtext)
    }
    const handleClickMonthBox = () => {
        setShowMonthPicker(true);
    }
    const handleAMonthChange = (value, text) => {
        let data = {
            year: value,
            month: text
        }
        handleAMonthDismiss(data);
    }
    const handleAMonthDismiss= (item) => {
        //console.log('handleAMonthDismiss : ', item);
        setShowMonthPicker(false);
        makeMonthText(item);
        let vYear = item.year;
        let vMonth = item.month;
        let rYearMonth = vYear + '' + vMonth;
        if (vMonth < 10) {
            rYearMonth = vYear + '0' + vMonth;
        }
        setMonthDays(moment(vYear + '-' + (vMonth < 10 ? '0'+vMonth:vMonth), "YYYY-MM").daysInMonth());
        setSearchMonthValue({
            year:vYear,
            month:vMonth
        })
        setState({
            ...state,
            yyyymm: rYearMonth
        })
    }

    const onImageChange = (images) => {
        setState({
            ...state,
            rouletteInfoImages: images
        })
    }

    return (
        <div>

            <OuterBox>
                <Heading>룰렛 년월<Star/></Heading>
                <Div>
                    {
                        showMonthPicker &&
                        <MonthPicker
                            show={true}
                            years={[2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031]}
                            value={searchMonthValue}
                            lang={pickerLang.months}
                            onChange={handleAMonthChange}
                            onDismiss={handleAMonthDismiss}
                        >
                        </MonthPicker>
                    }
                    <MonthBox value={yearMonthText} onClick={handleClickMonthBox}/>
                </Div>
            </OuterBox>

            <OuterBox>
                <Heading>룰렛 소개 이미지 <small>룰렛 최상단에 들어가는 이미지 (필수X)</small></Heading>
                <SingleImageUploader images={state.rouletteInfoImages} defaultCount={5} onChange={onImageChange} />
            </OuterBox>

            <OuterBox>
                <Heading>룰렛 제목<Star/></Heading>
                <Div>
                    <Input block placeholder={'룰렛 제목 입력'} name={'title'} value={state.title} onChange={onInputchange}/>
                </Div>
            </OuterBox>

            <OuterBox>
                <Flex>
                    <Heading>룰렛 항목<Star/></Heading>
                    <Right><Button bg={'green'} fg={'white'} px={10} onClick={onAddItemClick}>행추가</Button></Right>
                </Flex>
                {
                    state.items.map((item, index) =>
                        <Flex custom={`
                        & > div {width: unset;}
                    `}>
                            <Input name={'point'} value={item.point} width={300} placeholder={'룰렛포인트'} onChange={onItemTextChange.bind(this, index)} />
                            <Input name={'text'} value={item.text} width={300} placeholder={'룰렛명'} onChange={onItemTextChange.bind(this, index)} />
                            <Input name={'totalCount'} value={item.totalCount} width={300} placeholder={'총 개수(하나는 큰값설정필요)'} onChange={onItemTextChange.bind(this, index)} />
                            <Div ml={10} fg={'white'}>
                                <Button
                                    bg={'danger'} fg={'white'}
                                    px={10}
                                    onClick={onItemDeleteClick.bind(this,index)}><FaMinusCircle />{' 삭제'}
                                </Button>
                                <Button
                                    bg={'secondary'} fg={'white'}
                                    px={10}
                                    onClick={onSortClick.bind(this, {index: index, moveIndex: -1})} ml={8} mr={8}>
                                    <BsCaretUpFill/>
                                </Button>
                                <Button
                                    bg={'secondary'} fg={'white'}
                                    px={10}
                                    onClick={onSortClick.bind(this, {index: index, moveIndex: 1})}>
                                    <BsCaretDownFill/>
                                </Button>
                            </Div>
                        </Flex>
                    )
                }
            </OuterBox>
            <OuterBox>
                <Flex>
                    <Heading>룰렛 리워드</Heading>
                    <Right></Right>
                </Flex>
                <Div p={16}>
                    <GridColumns repeat={6} colGap={0} rowGap={16}>
                        {
                            Array.from({length: monthDays}).map((_, index ) => {
                                const rewardItem = state.rewards && state.rewards.find(rewardItm => rewardItm.count === (index+1));
                                return <Stamp
                                    count={(index+1)}
                                    refNo={rewardItem && rewardItem.refNo || ""}
                                    etc={rewardItem && rewardItem.etc || ""}
                                    onAddClick={onCouponAddClick.bind(this,index)}
                                    onDelClick={onCouponDelClick.bind(this,index)}
                                />
                            })
                        }
                    </GridColumns>
                </Div>

            </OuterBox>

            <OuterBox>
                <Flex>
                    <Heading>룰렛 설명</Heading>
                    <Right></Right>
                </Flex>
                <SummernoteEditor onChange={onEditChange} quality={1} editorHtml={state.content} />
            </OuterBox>


            <Space mt={16} justifyContent={'center'}>
                <Button bg="green" fg={'white'} px={20} onClick={onSaveClick}>저장</Button>
                {
                    state.yyyymm && <Button bg="danger" fg={'white'} px={20} onClick={onDeleteClick}>삭제</Button>
                }
                <Button bg="dark" fg={'white'} px={20} onClick={() => onClose(false)}>취소</Button>
            </Space>

            {/*쿠폰검색 모달 */}
            <Modal size="lg" isOpen={modalOpen}
                   toggle={toggle} >
                <ModalHeader toggle={toggle}>
                    쿠폰 검색
                </ModalHeader>
                <ModalBody>
                    <CouponList onClose={couponModalCallback} />
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={toggle}>취소</Button>
                </ModalFooter>
            </Modal>


        </div>
    );
};


const Stamp = ({count, refNo, etc, onAddClick, onDelClick}) => {

    const [couponInfo, setCouponInfo] = useState(null);

    useEffect(() => {
        couponMasterSearch()
    }, [refNo])

    const couponMasterSearch = async () => {
        if(refNo > 0){
            const {data} = await adminApi.getCouponMaster({masterNo:refNo});
            setCouponInfo(data)
        }else{
            setCouponInfo(null)
        }
    }

    return (
        <Div>
            <Flex flexDirection={'column'}>
                <Flex flexDirection={'column'} justifyContent={'center'} m={'0 auto'} minWidth={100} minHeight={100} relative bc={'light'}
                      bc={refNo ? 'danger' : 'dark'}
                      fg={refNo ? 'danger' : 'dark'}
                >
                    <Div bold>출석 {count}회</Div>
                    <Div fontSize={8}>쿠폰번호 : {refNo ? refNo : '-'}</Div>
                    <Div fontSize={8}>쿠폰명 : {couponInfo ? couponInfo.couponTitle : '-'}</Div>
                    <Div fontSize={8}>금액 : {etc ? etc : '-'}</Div>
                    <Space m={10} justifyContent={'center'}>
                        {
                            refNo ?
                                <Button bg="danger" fg={'white'} px={10} fontSize={10} onClick={onDelClick}>쿠폰삭제</Button> :
                                <Button bg="green" fg={'white'} px={10} fontSize={10} onClick={onAddClick}>쿠폰적용</Button>
                        }

                    </Space>
                </Flex>
            </Flex>
        </Div>
    )
}

export default RouletteContent;
