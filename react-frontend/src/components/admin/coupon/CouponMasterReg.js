import React, {useState, useEffect, lazy, Suspense, Fragment} from 'react';
import { FormGroup, Alert, Container, Input, CustomInput, Row, Col, Label, Button, Modal, ModalHeader, ModalBody, ModalFooter  } from 'reactstrap'
import Select from 'react-select'

import { getCouponMaster, saveCouponMaster, updateCouponMasterTitle, updateRewardCouponGoods } from '~/lib/adminApi'
import { SingleDatePicker } from 'react-dates';
import moment from 'moment-timezone'
import ComUtil from '~/util/ComUtil'
import { B2cGoodsSearch } from '~/components/common'

import {FaSearchPlus} from "react-icons/fa";
import {Server} from "~/components/Properties";
import {
    Div,
    Flex,
    Button as StyledButton,
    Space,
    Right,
    Input as StInput,
    Button as StButton
} from "~/styledComponents/shared";
import B2cGoodsSelSearch from "~/components/common/goodsSearch/b2cGoodsSelSearch";
import Checkbox from "~/components/common/checkboxes/Checkbox";
import ProducerList from "~/components/common/modalContents/producerList";

const BuyRewardGoodsList = lazy(()=> import('./BuyRewardGoodsList'))

const titleTags = {
    memberJoin: ['월 신규회원 가입쿠폰', '신년맞이 신규회원 가입 쿠폰'],                 //회원가입
    memberJoinProdGoods: ['무료쿠폰', 'xxx 무료쿠폰'],                                        //회원가입생산자상품
    goodsBuyReward: ['차곡차곡 쌓이는 적립형 쿠폰'],                               //구매 보상쿠폰
    specialCoupon: ['스페셜 쿠폰', '고객님께만 드려요. 스페셜쿠폰', '고객님께만 드려요 :) 스페셜쿠폰', '이벤트 당첨 쿠폰', '후기 이벤트 당첨(x등) 쿠폰'],   //스페셜 쿠폰
    potenCoupon: ['포텐타임 자동쿠폰'],                                          //포텐타임 자동쿠폰
    deliveryCoupon: ['배송비 무료쿠폰']                              // 배송비 무료쿠폰
}

const CouponMasterReg = (props) => { // props에 수정할 공지사항 key를 넘겨서 db 조회해서 보여줘야함

    const p_masterNo = props.masterNo||0;

    const [couponTypeOptions,setCouponTypeOptions] = useState(
        [
            {value: 'memberJoin', label: '회원가입'},
            // {value: 'memberJoinProdGoods', label: '회원가입생산자상품'},
            {value: 'goodsBuyReward', label: '구매 보상쿠폰'},
            {value: 'specialCoupon', label: '스페셜 쿠폰'},
            {value: 'potenCoupon', label: '포텐타임 자동쿠폰'},
            {value: 'deliveryCoupon', label: '배송비 쿠폰'},
        ]
    );

    // 시작일자 달력
    const renderStartCalendarInfo = () => <Alert className='m-1'>시작 날짜를 선택해 주세요</Alert>;
    // 종료일자 달력
    const renderEndCalendarInfo = () => <Alert className='m-1'>종료 날짜를 선택해 주세요</Alert>;

    const [startDayFocusedInput,setStartDayFocusedInput] = useState(null);
    const [endDayFocusedInput,setEndDayFocusedInput] = useState(null);
    const [useEndDayFocusedInput,setUseEndDayFocusedInput] = useState(null);
    const [checkUseEndDay, setCheckUseEndDay] = useState(false);

    // 쿠폰 종류 라디오 버튼 (할인금액 or 할인율) radio checked
    // const [radioCouponKind,setRadioCouponKind] = useState('0');

    // 최소 주문 금액 라디오 버튼 (없음, 10000원, 20000원, 30000원, 직접입력) radio checked
    const [radioMinOrderAmtKind,setRadioMinOrderAmtKind] = useState('0');

    // 쿠폰 발급 정보
    const [couponMaster,setCouponMaster] = useState({
        masterNo:p_masterNo,
        couponType:"memberJoin",
        useDuration:30,
        startDay:null,
        endDay:null,
        totalCount:0,
        remainCount:0,
        deleted:false,
        couponTitle:"",
        fixedWon:0,
        couponBlyAmount:0,
        minOrderBlyAmount:0,
        prodGoodsProducerNo:0,  //회원가입생산자상품 팜토리 8번 일단 고정

        minGoodsPrice : 0,   //2020-01 추가. 최소사용금액. 0보다 크면 적용. 0이면 한도가 없다고 봐야함-BLY한도에 걸림.

        potenCouponGoodsNo:0,           //포텐타임 자동쿠폰용 상품번호. -> targetGoodsNo 로 쓸 수 있을듯
        potenCouponProducerNo:0,        //포텐타임 상품 관련 생산자번호
        potenCouponProducerFarmNm:"",   //포텐타임 생산자농장명
        potenCouponGoodsNm:"",          //포텐타임 상품명
        potenCouponGoodsPrice:0,        //포텐타임 상품가격
        potenCouponDiscount:0,          //%할인율. 50, 70 등.
        potenCouponSalePrice:0,             //할인율을 계산하기 위한 할인금액

        //targetGoodsNo:0,  // 쿠폰발급상품관련정보
        // producerNo:0,
        // producerFarmNm:null,
        // goodsNm:null,
        targetGoods: [],         // array로 저장되는 구매보상리워드 대상상품
        couponMemo: '',
        onlyAppCoupon: false,    // 앱전용쿠폰
        couponGoods: null,        //특정상품구매쿠폰
        wonCoupon: true,       //원화쿠폰 (default로 지정 2022.7.7)
        downloadableFlag: false, //다운로드해서 사용하는 쿠폰
        downloadLevel: 0,
        targetProducerNo: 0,
        targetProducerName: null,
        useEndDay: null
    });

    const couponOptions = [
        {value:'all',label:'전체'},
        {value:'couponGoods',label:'상품전용'},
        {value:'targetProducerNo',label:'생산자용'},
    ]

    const levelOptions = [
        {value:0,label:'전체'},
        {value:1,label:'VVIP'},
        {value:2,label:'VIP'},
        {value:3,label:'GOLD'},
        {value:4,label:'SILVER'},
        {value:5,label:'BRONZE'},
    ]

    const [multiGoodsSearchModal, setMultiGoodsSearchModal] = useState(false)
    const [goodsSearchModal, setGoodsSearchModal] = useState(false)

    const [couponGoodsChecked, setCouponGoodsChecked] = useState(false);
    const [targetProducerChecked, setTargetProducerChecked] = useState(false);
    const [couponOptionValue, setCouponOptionValue] = useState("all");

    const [producerModalOpen, setProducerModalOpen] = useState(false);

    const {
        masterNo,
        couponType,
        startDay, endDay, useDuration, prodGoodsProducerNo, useEndDay,
        totalCount, remainCount,
        couponTitle,
        fixedWon,
        couponBlyAmount,
        minOrderBlyAmount,
        potenCouponDiscount,
        potenCouponSalePrice,
        couponMemo,
        minGoodsPrice
    } = couponMaster;

    useEffect(() => {

        async function fetch() {
            await search();
        }

        fetch();
    }, []);

    const search = async () => {
        //수정일경우
        if(p_masterNo > 0){
            const {data:couponMasterInfo} = await getCouponMaster({masterNo:p_masterNo})
            console.log({couponMasterInfo});

            if(couponMasterInfo){

                // 최소주문금액 라디오 버튼 체크
                const v_minOrderBlyAmount = couponMasterInfo.minOrderBlyAmount;
                if(v_minOrderBlyAmount == 0){
                    setRadioMinOrderAmtKind('0');
                } else if(v_minOrderBlyAmount == 10000){
                    setRadioMinOrderAmtKind('1');
                } else if(v_minOrderBlyAmount == 20000){
                    setRadioMinOrderAmtKind('2');
                } else if(v_minOrderBlyAmount == 30000){
                    setRadioMinOrderAmtKind('3');
                } else {
                    setRadioMinOrderAmtKind('9');
                }

                if(couponMasterInfo.couponType === "potenCoupon") {
                    couponMasterInfo.potenCouponSalePrice = (couponMasterInfo.potenCouponGoodsPrice * (1 - couponMasterInfo.potenCouponDiscount/100)).toFixed(0);
                }

                // 쿠폰발급내역 정보 가져오기
                setCouponMaster(couponMasterInfo)

                if(couponMasterInfo.couponGoods) {
                    setCouponGoodsChecked(true);
                    setCouponOptionValue('couponGoods')
                }

                if(couponMasterInfo.targetProducerNo > 0) {
                    setTargetProducerChecked(true)
                    setCouponOptionValue('targetProducerNo')
                }

                if(couponMasterInfo.useEndDay > 0) {
                    setCheckUseEndDay(true)
                }
            }
        }
    };

    const onInputChange = (e) => {
        const {name,value} = e.target;

        const newCouponMaster = Object.assign({}, couponMaster)

        newCouponMaster[name] = value

        if (name === 'fixedWon') {
            //원화입력시 bly 초기화
            newCouponMaster.couponBlyAmount = 0;
            newCouponMaster.minOrderBlyAmount = 0;
        }
        // setCouponMaster({
        //     ...couponMaster,
        //     [name]:value
        // });

        //임시로 쿠폰BLY와 최소주문BLY 를 같이 사용함
        if (name === 'couponBlyAmount') {
            newCouponMaster.minOrderBlyAmount = value;
            newCouponMaster.fixedWon = 0;
        }

        if (name === "potenCouponSalePrice") {
            newCouponMaster.potenCouponSalePrice = value;
            newCouponMaster.potenCouponDiscount = (1 - value / newCouponMaster.potenCouponGoodsPrice) * 100;
        }

        setCouponMaster(newCouponMaster)
    };

    // 발급 위치
    const onCouponTypeChange = (data) => {
        console.log("onCouponTypeChange");
        let v_CouponType = data.value;
        console.log({v_CouponType});

        if(v_CouponType === "goodsBuyReward") {
            setCouponMaster({
                ...couponMaster,
                couponType:v_CouponType,
                startDay: "", endDay: "", useEndDay: "",
                useDuration:30,
                targetGoods:[],
                prodGoodsProducerNo:0,
                potenCouponGoodsNo:0,           //포텐타임 자동쿠폰용 상품번호. -> targetGoodsNo 로 쓸 수 있을듯
                potenCouponProducerNo:0,        //포텐타임 상품 관련 생산자번호
                potenCouponProducerFarmNm:"",   //포텐타임 생산자농장명
                potenCouponGoodsNm:"",          //포텐타임 상품명
                potenCouponDiscount:0,          //포텐타임 할인율
                downloadableFlag: false,
                downloadLevel: 0,
                wonCoupon: false
            });
        } else if(v_CouponType === "memberJoin") {
            setCouponMaster({
                ...couponMaster,
                couponType: v_CouponType,
                useDuration:30,
                targetGoods:[],
                prodGoodsProducerNo:0,
                potenCouponGoodsNo:0,           //포텐타임 자동쿠폰용 상품번호. -> targetGoodsNo 로 쓸 수 있을듯
                potenCouponProducerNo:0,        //포텐타임 상품 관련 생산자번호
                potenCouponProducerFarmNm:"",   //포텐타임 생산자농장명
                potenCouponGoodsNm:"",          //포텐타임 상품명
                potenCouponDiscount:0,          //포텐타임 할인율
                downloadableFlag: false,
                downloadLevel: 0,
                useEndDay: null
            });
        }
        else if(v_CouponType === 'memberJoinProdGoods'){
            setCouponMaster({
                ...couponMaster,
                couponType: v_CouponType,
                useDuration:3,
                targetGoods:[],
                prodGoodsProducerNo: Server._serverMode() !== 'stage' ? 8:40,  //회원가입생산자상품 팜토리 8번 일단 고정,  production 8번(팜토리), stage 40(디팜)
                potenCouponGoodsNo:0,           //포텐타임 자동쿠폰용 상품번호. -> targetGoodsNo 로 쓸 수 있을듯
                potenCouponProducerNo:0,        //포텐타임 상품 관련 생산자번호
                potenCouponProducerFarmNm:"",   //포텐타임 생산자농장명
                potenCouponGoodsNm:"",          //포텐타임 상품명
                potenCouponDiscount:0,          //포텐타임 할인율
                downloadableFlag: false,
                downloadLevel: 0,
                wonCoupon: false,
                useEndDay: null
            });
        } else if(v_CouponType === 'specialCoupon') {
            setCouponMaster({
                ...couponMaster,
                couponType:v_CouponType,
                startDay: "", endDay: "",
                useDuration:30,
                targetGoods:[],
                prodGoodsProducerNo:0,
                potenCouponGoodsNo:0,           //포텐타임 자동쿠폰용 상품번호. -> targetGoodsNo 로 쓸 수 있을듯
                potenCouponProducerNo:0,        //포텐타임 상품 관련 생산자번호
                potenCouponProducerFarmNm:"",   //포텐타임 생산자농장명
                potenCouponGoodsNm:"",          //포텐타임 상품명
                potenCouponDiscount:0,          //포텐타임 할인율
                downloadableFlag: false,
                downloadLevel: 0,
                useEndDay: null
            })
        } else if(v_CouponType === 'potenCoupon') {
            setCouponMaster({
                ...couponMaster,
                couponType:v_CouponType,
                startDay: "", endDay: "", useEndDay: "",
                useDuration:30,
                targetGoods:[],
                prodGoodsProducerNo:0,
                potenCouponGoodsNo:0,           //포텐타임 자동쿠폰용 상품번호. -> targetGoodsNo 로 쓸 수 있을듯
                potenCouponProducerNo:0,        //포텐타임 상품 관련 생산자번호
                potenCouponProducerFarmNm:"",   //포텐타임 생산자농장명
                potenCouponGoodsNm:"",          //포텐타임 상품명
                potenCouponDiscount:0,          //포텐타임 할인율
                fixedWon:0,
                downloadableFlag: false,
                downloadLevel: 0,
                wonCoupon: false
            })
        } else if(v_CouponType === 'deliveryCoupon') {
            setCouponMaster({
                ...couponMaster,
                couponType:v_CouponType,
                startDay: "", endDay: "", useEndDay: null,
                useDuration:30,
                targetGoods:[],
                prodGoodsProducerNo:0,
                potenCouponGoodsNo:0,           //포텐타임 자동쿠폰용 상품번호. -> targetGoodsNo 로 쓸 수 있을듯
                potenCouponProducerNo:0,        //포텐타임 상품 관련 생산자번호
                potenCouponProducerFarmNm:"",   //포텐타임 생산자농장명
                potenCouponGoodsNm:"",          //포텐타임 상품명
                potenCouponDiscount:0,          //포텐타임 할인율
                fixedWon:0,
                downloadableFlag: false,
                downloadLevel: 0,
                wonCoupon: false, // TODO 원쿠폰은 아니어야할듯... 확인 필요. useEndDay도 null로 할지 "" 이걸로 할지 확인필요
            })
        }
    };

    // 발급 일자 달력
    const onCalendarDatesChange = (gubun, date) => {
        //console.log("date",date.format('YYYYMMDD'));
        if(gubun == "start"){
            setCouponMaster({
                ...couponMaster,
                startDay:date.format('YYYYMMDD')
            });
        }
        if(gubun == "end"){
            setCouponMaster({
                ...couponMaster,
                endDay:date.format('YYYYMMDD')
            });
        }

        if(gubun == "useEndDay") {
            setCouponMaster({
                ...couponMaster,
                useDuration:0,
                useEndDay:date.format('YYYYMMDD')
            });
        }
    };

    // 최소 주문 금액 (라디오 체크 이벤트)
    const onMinOrderAmtKindRadioChange = (e) => {
        const v_RadioMinOrderAmtKind = e.target.value;
        setRadioMinOrderAmtKind(v_RadioMinOrderAmtKind);

        let v_minOrderBlyAmount = 0;
        if(v_RadioMinOrderAmtKind === '0'){
            v_minOrderBlyAmount = 0;
        } else if(v_RadioMinOrderAmtKind === '1'){
            v_minOrderBlyAmount = 10000;
        } else if(v_RadioMinOrderAmtKind === '2'){
            v_minOrderBlyAmount = 20000;
        } else if(v_RadioMinOrderAmtKind === '3'){
            v_minOrderBlyAmount = 30000;
        }

        setCouponMaster({
            ...couponMaster,
            minOrderBlyAmount: v_minOrderBlyAmount
        });
    };

    const close = () => {
        props.onClose();
    };

    //취소 창닫기
    const onCancelClick = () => {
        close();
    };

    // 쿠폰발급내역 등록 및 수정
    const onSaveClick = async () => {
        const couponMasterInfo = Object.assign({}, couponMaster);

        if(couponMasterInfo.couponTitle.length === 0){
            alert("쿠폰명은 필수 입력입니다!");
            return false;
        }

        if(couponMasterInfo.couponType === 'memberJoin' || couponMasterInfo.couponType === 'memberJoinProdGoods') {
            if (
                couponMasterInfo.startDay === null ||
                couponMasterInfo.startDay === "" ||
                couponMasterInfo.endDay === null ||
                couponMasterInfo.endDay === ""
            ) {
                alert("발급기간은 필수 입력입니다!");
                return false;
            }

            if(couponMasterInfo.couponType === 'memberJoinProdGoods'){
                if (couponMasterInfo.useDuration === null || couponMasterInfo.useDuration === "") {
                    alert("사용가능일수는 필수 입력입니다! (기본3일)");
                    return false;
                }
            }
        }

        if(couponMasterInfo.couponType === 'goodsBuyReward' && couponMasterInfo.targetGoods.length === 0) {
            alert("쿠폰상품은 필수 입력입니다!");
            return false;
        }

        if(couponMasterInfo.couponType === 'potenCoupon' && couponMasterInfo.potenCouponGoodsNo === 0) {
            alert("쿠폰상품은 필수 입력입니다!");
            return false;
        }

        if(couponMasterInfo.couponType !== 'memberJoinProdGoods' && couponMasterInfo.couponType !== 'potenCoupon' && couponMasterInfo.couponType !== 'deliveryCoupon') {
            if (couponMasterInfo.fixedWon === 0 && couponMasterInfo.couponBlyAmount === 0) {
                alert("금액은 필수 입력입니다!");
                return false;
            }
        }

        if(couponMasterInfo.totalCount === 0 || !couponMasterInfo.totalCount){
            alert("총 수량은 필수 입력입니다!");
            return false;
        }

        if(couponGoodsChecked && !couponMasterInfo.couponGoods) {
            alert("상품전용쿠폰은 상품 필수입력입니다!")
            return false;
        }

        if(targetProducerChecked && couponMasterInfo.targetProducerNo === 0) {
            alert("생산자용쿠폰은 생산자 필수선택입니다!")
            return false;
        }

        if(checkUseEndDay && (couponMasterInfo.useEndDay === null || couponMasterInfo.useEndDay === "")) {
            alert("사용기한을 지정해주세요.")
            return false;
        }

        console.log({couponMasterInfo});

        const params = couponMasterInfo;

        const { data } = await saveCouponMaster(params);

        if (data === 1) {
            alert("쿠폰 발급이 등록(수정) 처리 되었습니다!");
            close();
        } else {
            if (data === -1) {
                alert("세션이 만료 되었습니다 다시 로그인 하시길 바랍니다!");
            } else if (data === -2) {
                alert("소비자가 해당 쿠폰을 발급을 하여 수정을 할 수 없습니다!");
            } else {
                alert("쿠폰발급 등록(수정)중 오류가 발생하였습니다!");
            }
        }

    };

    // 생산자 쿠폰의 생산자 선택
    const onProducerClick = () => {
        toggleProducerModal();
    }

    const toggleProducerModal = () => {
        setProducerModalOpen(!producerModalOpen);
    }

    const onProducerModalClosed = (data) => {
        if (data) {
            setCouponMaster({
                ...couponMaster,
                targetProducerNo: data.producerNo,
                targetProducerName: data.farmName
            })
        }
        toggleProducerModal();
    }

    // 구매쿠폰 상품리스트 수정
    const onTargetGoodsUpdateClick = async () => {
        const couponMasterInfo = Object.assign({}, couponMaster);

        if(couponMasterInfo.targetGoods.length === 0) {
            alert("쿠폰상품은 필수 입력입니다!");
            return false;
        }
        const params = couponMasterInfo;
        const {data} = await updateRewardCouponGoods(params);

        if(data === 1) {
            alert("쿠폰발급 상품이 수정 처리 되었습니다!");
            close();
        } else {
            if (data === -1) {
                alert("세션이 만료 되었습니다 다시 로그인 하시길 바랍니다!");
            } else {
                alert("쿠폰발급 등록(수정)중 오류가 발생하였습니다!");
            }
        }
    }

    // 쿠폰명 수정
    const onTitleUpdateClick = async () => {
        const couponMasterInfo = Object.assign({}, couponMaster);
        if (couponMasterInfo.couponTitle.length === 0) {
            alert("쿠폰명은 필수 입력입니다!");
            return false;
        }

        const params = couponMasterInfo;
        const { data } = await updateCouponMasterTitle(params);

        if (data === 1) {
            alert("쿠폰명이 수정 처리 되었습니다!");
            close();
        } else {
            if (data === -1) {
                alert("세션이 만료 되었습니다 다시 로그인 하시길 바랍니다!");
            } else if (data === -2) {
                alert("소비자가 해당 쿠폰을 발급을 하여 수정을 할 수 없습니다!");
            } else {
                alert("쿠폰발급 등록(수정)중 오류가 발생하였습니다!");
            }
        }
    }

    //상품 컴포넌트 관련 온체인지 (실제로는 readOnly라서 안쓰임)
    const onInputBlyTimeGoodsChange = (e) => {
        // let { name, value } = e.target;
    };

    // 상품 검색 모달 [상품선택] 온체인지 이벤트
    const goodsSearchModalOnChange = (obj) => {
        // if(couponMaster.couponType === 'goodsBuyReward') {
        //     setCouponMaster({
        //         ...couponMaster,
        //         // targetGoodsNo: obj.goodsNo,
        //         targetGoods: obj
        //         // producerNo: obj.producerNo,
        //         // producerFarmNm: obj.producerFarmNm,
        //         // goodsNm: obj.goodsNm,
        //     });
        // } else if(couponMaster.couponType === 'potenCoupon') {

        // 쿠폰으로 살수있는 상품 선택이면 포텐 아님 (2022.5.25)
        if(couponGoodsChecked) {
            const couponGoods = {
                targetGoodsNo: obj.goodsNo,
                producerNo: obj.producerNo,
                producerFarmNm: obj.producerFarmNm,
                goodsNm: obj.goodsNm + '[' + obj.eventOptionName + ']'
            }
            setCouponMaster({
                ...couponMaster,
                couponGoods: couponGoods
            })

        } else {
            setCouponMaster({
                ...couponMaster,
                potenCouponGoodsNo: obj.goodsNo,
                potenCouponProducerNo: obj.producerNo,
                potenCouponProducerFarmNm: obj.producerFarmNm,
                potenCouponGoodsNm: obj.goodsNm + '[' + obj.eventOptionName + ']', //eventFlag반영
                potenCouponGoodsPrice: obj.eventOptionPrice //obj.currentPrice,  //eventFlag반영
            });
        }
        // }
        goodsSearchModalToggle();
    };

    const goodsSearchModalToggle = () => {
        setGoodsSearchModal(!goodsSearchModal);
    };

    // 상품검색 클릭
    const goodsSearchModalPopup = (e) => {
        setGoodsSearchModal(true);
    };

    // 상품검색 클릭(여러개)
    const multipleGoodsSearchModal = (e) => {
        setMultiGoodsSearchModal(true);
    }

    // 구매보상 쿠폰 (다중)상품선택
    const multiGoodsToggle = (data) => {
        setCouponMaster({
            ...couponMaster,
            targetGoods: data
        });
        setMultiGoodsSearchModal(!multiGoodsSearchModal);
    }

    // 앱 전용쿠폰
    const onAppCouponCheckChange = (e) => {
        setCouponMaster({
            ...couponMaster,
            onlyAppCoupon: e.target.checked
        });
    }

    // 다운로드 쿠폰의 등급선택
    const onLevelOptionsChange = (item) =>{
        setCouponMaster({
            ...couponMaster,
            downloadLevel: item.value
        })
    }

    const onCouponOptionsChange = (item) => {
        setCouponOptionValue(item.value);

        setCouponGoodsChecked(false);
        setTargetProducerChecked(false);

        if(item.value === 'couponGoods') {
            setCouponGoodsChecked(true);

            setCouponMaster({
                ...couponMaster,
                targetProducerNo: 0,
                targetProducerName: null
            })

        } else if(item.value === 'targetProducerNo') {
            setTargetProducerChecked(true);

            setCouponMaster({
                ...couponMaster,
                couponGoods: null
            })

        }
    }

    const onDownloadableFlagCheckChange = (e) => {
        setCouponMaster({
            ...couponMaster,
            downloadableFlag: e.target.checked,
            downloadLevel: 0
        })
    }

    const onUseEndDayCheckChange = (e) => {
        setCheckUseEndDay(e.target.checked)
        if(e.target.checked) {
            setCouponMaster({
                ...couponMaster,
                useDuration:-1,
                useEndDay: null
            });
        } else {
            setCouponMaster({
                ...couponMaster,
                useDuration:30,
                useEndDay: null
            });
        }
    }

    const star = <span className='text-danger'>*</span>;
    return(
        <div>
            <div className='pt-0 pl-2 pr-2 pb-1'>
                <FormGroup>
                    <Alert color={'secondary'} className='small'>
                        아래 모든 항목은 필수 입력 항목입니다.<br/>
                        발급기간 동안에만 쿠폰이 지급되며, 발급기간이 남아도 총 수량이 소진되면 더 이상 지급되지 않습니다.
                    </Alert>
                </FormGroup>
                <FormGroup>
                    <Label className={'font-weight-bold text-secondary small'}>발급 위치 {star}</Label>
                    <Space>
                        <div className="pl-1" style={{width: '250px'}}>
                            {
                                (masterNo == 0) &&
                                <Select
                                    name={'couponType'}
                                    options={couponTypeOptions}
                                    value={couponType ? couponTypeOptions.find(items => items.value === couponType) : 'memberJoin'}
                                    onChange={onCouponTypeChange}
                                />
                            }
                            {
                                (masterNo > 0) &&
                                <div>{couponTypeOptions.find(items => items.value === couponType) && couponTypeOptions.find(items => items.value === couponType).label}</div>
                            }
                        </div>
                        <div className="pl-2 text-secondary small" >
                            <Checkbox bg={'green'} checked={couponMaster.onlyAppCoupon} onChange={onAppCouponCheckChange}>앱전용 </Checkbox>
                        </div>

                        {
                            (couponMaster.couponType === 'specialCoupon' || couponMaster.couponType === 'deliveryCoupon') &&
                            <div className="text-secondary small d-flex align-items-center">
                                <div className="pl-1">
                                    <Checkbox bg={'green'} checked={couponMaster.downloadableFlag} onChange={onDownloadableFlagCheckChange}>다운로드 </Checkbox>
                                </div>
                            </div>
                        }

                        {
                            (couponMaster.couponType === 'memberJoin' || couponMaster.couponType === 'specialCoupon') &&
                                <div className="text-secondary small d-flex align-items-center">
                                    <div className="pl-1 d-flex">
                                        <Checkbox bg={'green'} checked={checkUseEndDay} onChange={onUseEndDayCheckChange}>사용기한지정 </Checkbox>
                                    </div>
                                    <div className="pl-2"  style={{width: '150px'}}>
                                        <Select options={couponOptions}
                                                value={couponOptions.find(item => item.value === couponOptionValue)}
                                                onChange={onCouponOptionsChange}
                                        />
                                    </div>
                                </div>
                        }
                    </Space>
                </FormGroup>

                <FormGroup>
                    <Label className={'font-weight-bold text-secondary small'}>
                        쿠폰명 {star}
                    </Label>
                    <Flex bg={'light'} width={'100%'} mb={10} flexWrap={'wrap'} p={5}>
                        {
                            titleTags[couponType].map(tag =>
                                <Div p={5}>
                                    <StyledButton fontSize={12} rounded={20} bc={'secondary'} bg={'white'} p={5} px={10}
                                                  onClick={() => setCouponMaster({...couponMaster, couponTitle: tag})}
                                    >{tag}</StyledButton>
                                </Div>
                            )
                        }
                    </Flex>
                    <div>
                        <Input
                            type="text"
                            name={"couponTitle"}
                            style={{width:'80%'}}
                            value={couponTitle}
                            onChange={onInputChange}
                        />
                    </div>
                </FormGroup>
                <FormGroup>
                    <Label className={'font-weight-bold text-secondary small'}>
                        메모(관리자 전용)
                    </Label>
                    <div>
                        <Input
                            type="text"
                            name={"couponMemo"}
                            style={{width:'80%'}}
                            value={couponMemo}
                            onChange={onInputChange}
                        />
                    </div>
                </FormGroup>

                {
                    (couponMaster.couponType === 'goodsBuyReward') &&
                    <FormGroup>

                        <Label className={'font-weight-bold text-secondary small'}>
                            쿠폰상품 {star}
                        </Label>
                        <div>
                            {
                                couponMaster.targetGoods.length > 0 &&
                                couponMaster.targetGoods.map((item)=>{
                                    return(
                                        <div className={'d-flex'}>
                                            <Input type="text"
                                                   name={'mdPickProducerFarmNm'}
                                                   className="ml-1"
                                                   style={{width: '150px'}}
                                                   value={item.producerFarmNm || ""}
                                                   readOnly='readonly'
                                                   placeholder={'생산자명'}/>
                                            <Input type="text"
                                                   name={'mdPickGoodsNm'}
                                                   className="ml-1"
                                                   style={{width: '250px'}}
                                                   value={item.goodsNm || ""}
                                                   readOnly='readonly'
                                                   placeholder={'상품명'}/>
                                            <Input type="number"
                                                   name={'mdPickGoodsNo'}
                                                   className="ml-1"
                                                   style={{width: '100px'}}
                                                   value={item.targetGoodsNo || ""}
                                                   readOnly='readonly'
                                                   placeholder={'상품번호'}/>
                                            {/*<Input type="text"*/}
                                            {/*       name={'mdPickCurrentPrice'}*/}
                                            {/*       style={{width: '100px'}}*/}
                                            {/*       value={item.currentPrice || ""}*/}
                                            {/*       disabled={true}*/}
                                            {/*       readOnly='readonly'*/}
                                            {/*       placeholder={'판매가격'}/>*/}
                                        </div>
                                    )
                                })
                            }
                            <div className={'mt-2'}>
                                <Button color={'info'} onClick={multipleGoodsSearchModal}>
                                    <FaSearchPlus /> 상품검색
                                </Button>
                            </div>
                        </div>
                    </FormGroup>
                }

                {
                    (couponMaster.couponType === 'potenCoupon' || couponGoodsChecked) &&
                    <FormGroup>
                        <Label className={'font-weight-bold text-secondary small'}>
                            쿠폰상품 {star}
                        </Label>
                        <div className="d-flex align-items-center">
                            <Input type="text"
                                   name={'mdPickProducerNo'}
                                   style={{width: '60px'}}
                                   value={couponMaster.couponGoods ? couponMaster.couponGoods.producerNo : couponMaster.potenCouponProducerNo || ""}
                                   readOnly='readonly'
                                   placeholder={'생산자번호'}
                                   onChange={onInputBlyTimeGoodsChange}/>
                            <Input type="text"
                                   name={'mdPickProducerFarmNm'}
                                   className="ml-1"
                                   style={{width: '130px'}}
                                   value={couponMaster.couponGoods ? couponMaster.couponGoods.producerFarmNm : couponMaster.potenCouponProducerFarmNm || ""}
                                   readOnly='readonly'
                                   placeholder={'생산자명'}
                                   onChange={onInputBlyTimeGoodsChange}/>
                            <Input type="text"
                                   name={'mdPickGoodsNm'}
                                   className="ml-1"
                                   style={{width: '250px'}}
                                   value={couponMaster.couponGoods ? couponMaster.couponGoods.goodsNm : couponMaster.potenCouponGoodsNm || ""}
                                   readOnly='readonly'
                                   placeholder={'상품명'}
                                   onChange={onInputBlyTimeGoodsChange}/>
                            <Input type="text"
                                   name={'mdPickGoodsPrice'}
                                   className="ml-1"
                                   style={{width: '90px'}}
                                   value={couponMaster.potenCouponGoodsPrice || ""}
                                   readOnly='readonly'
                                   placeholder={'상품가격'}
                                   onChange={onInputBlyTimeGoodsChange}/>
                            <Input type="number"
                                   name={'mdPickGoodsNo'}
                                   className="ml-1"
                                   style={{width: '70px'}}
                                   value={couponMaster.couponGoods ? couponMaster.couponGoods.targetGoodsNo : couponMaster.potenCouponGoodsNo || ""}
                                   readOnly='readonly'
                                   placeholder={'상품번호'}
                                   onChange={onInputBlyTimeGoodsChange}/>
                            <div className="ml-1">
                                <Button color={'info'}
                                        onClick={goodsSearchModalPopup}>
                                    <FaSearchPlus /> 상품검색
                                </Button>
                            </div>
                        </div>
                    </FormGroup>

                }
                {
                    targetProducerChecked &&
                    <FormGroup>
                        <Label className={'font-weight-bold text-secondary small'}>
                            생산자번호 {star}
                        </Label>
                        <Flex>
                            <StInput readOnly={true} width={70} value={couponMaster.targetProducerNo} mr={5} />
                            <StInput readOnly={true} width={200} value={couponMaster.targetProducerName} mr={5} />
                            <StButton bg={'green'} fg={'white'} onClick={onProducerClick} px={10}><FaSearchPlus/>{' 생산자검색'}</StButton>
                        </Flex>
                    </FormGroup>
                }

                {
                    couponMaster.downloadableFlag &&
                    <>
                        <FormGroup>
                            <Label className={'font-weight-bold text-secondary small'}>등급번호 {star}</Label>

                            <div style={{width: '150px'}}>
                                <Select options={levelOptions}
                                        value={levelOptions.find(item => item.value === couponMaster.downloadLevel)}
                                        onChange={onLevelOptionsChange}
                                />
                            </div>
                        </FormGroup>
                    </>
                }
                {
                    ((couponMaster.couponType === 'memberJoin') || (couponMaster.couponType === 'memberJoinProdGoods') || (couponMaster.downloadableFlag) )&&

                    <FormGroup>
                        {
                            couponMaster.downloadableFlag ?
                                <Label className={'font-weight-bold text-secondary small'}>다운로드 가능기간(기간 설정시에만 쿠폰 다운로드 페이지에 노출됩니다)</Label>
                                :
                                <Label className={'font-weight-bold text-secondary small'}>발급 기간 {star}</Label>
                        }
                        <div className="d-flex align-items-center">
                            <SingleDatePicker
                                placeholder="시작일"
                                date={startDay ? moment(ComUtil.intToDateMoment(startDay)).startOf('day') : null}
                                onDateChange={onCalendarDatesChange.bind(this, 'start')}
                                focused={startDayFocusedInput}
                                onFocusChange={({focused}) => setStartDayFocusedInput(focused)}
                                id={"startDay"}
                                numberOfMonths={1}
                                withPortal
                                small
                                readOnly
                                isOutsideRange={() => false}
                                calendarInfoPosition="top"
                                verticalHeight={700}
                                renderCalendarInfo={renderStartCalendarInfo}
                            />
                            <div className="pl-1 pr-1"><span>~</span></div>
                            <SingleDatePicker
                                placeholder="종료일"
                                date={endDay ? moment(ComUtil.intToDateMoment(endDay)).endOf('day') : null}
                                onDateChange={onCalendarDatesChange.bind(this, 'end')}
                                focused={endDayFocusedInput}
                                id={"endDay"}
                                onFocusChange={({focused}) => setEndDayFocusedInput(focused)}
                                numberOfMonths={1}
                                withPortal
                                small
                                readOnly
                                isOutsideRange={() => false}
                                calendarInfoPosition="top"
                                verticalHeight={700}
                                renderCalendarInfo={renderEndCalendarInfo}
                            />
                        </div>
                    </FormGroup>
                }
                {
                    (couponMaster.couponType !== 'potenCoupon' && !checkUseEndDay) &&
                    <>
                        <FormGroup>
                            <Label className={'font-weight-bold text-secondary small'}>발급시작일~사용가능일수 {star}</Label>
                            <div className='d-flex align-items-center' style={{width:'40%'}}>
                                <Input
                                    type='number'
                                    name={'useDuration'} value={useDuration}
                                    onFocus={(event) => event.target.select()}
                                    onChange={onInputChange}/> <span className='ml-2'>일</span>
                            </div>
                        </FormGroup>
                    </>
                }

                {
                    checkUseEndDay &&
                    <>
                        <FormGroup>
                            <Label className={'font-weight-bold text-secondary small'}>쿠폰사용기한지정 {star}</Label>
                            <div className="d-flex align-items-center">
                                <SingleDatePicker
                                    placeholder="종료일"
                                    date={useEndDay ? moment(ComUtil.intToDateMoment(useEndDay)).endOf('day') : null}
                                    onDateChange={onCalendarDatesChange.bind(this, 'useEndDay')}
                                    focused={useEndDayFocusedInput}
                                    id={"useEndDay"}
                                    onFocusChange={({focused}) => setUseEndDayFocusedInput(focused)}
                                    numberOfMonths={1}
                                    withPortal
                                    small
                                    readOnly
                                    isOutsideRange={() => false}
                                    calendarInfoPosition="top"
                                    verticalHeight={700}
                                    renderCalendarInfo={renderEndCalendarInfo}
                                />
                            </div>
                        </FormGroup>
                    </>
                }

                {
                    (couponMaster.couponType !== 'memberJoinProdGoods' && couponMaster.couponType !== 'potenCoupon' && couponMaster.couponType !== 'deliveryCoupon') &&
                    <>
                        <FormGroup>
                            <Label className={'font-weight-bold text-secondary small'}>원화금액(원) {star}</Label>
                            <div className='d-flex align-items-center' style={{width:'40%'}}>
                                <Input
                                    type='number'
                                    name={'fixedWon'} value={fixedWon}
                                    onFocus={(event) => event.target.select()}
                                    onChange={onInputChange}
                                    readOnly={couponType == 'specialCoupon' ? false:false }
                                /> <span className='ml-2'>원</span>
                            </div>
                        </FormGroup>
                        {
                            !couponMaster.wonCoupon &&
                            <FormGroup>
                                <Label className={'font-weight-bold text-secondary small'}>쿠폰금액(BLY) </Label>
                                <div className='d-flex align-items-center' style={{width:'40%'}}>
                                    <Input
                                        type='number'
                                        name={'couponBlyAmount'} value={couponBlyAmount}
                                        onFocus={(event) => event.target.select()}
                                        onChange={onInputChange}
                                        readOnly={couponType == 'specialCoupon' ? false:true }
                                    /> <span className='ml-2'>BLY</span>
                                </div>
                            </FormGroup>
                        }
                    </>
                }
                {
                    (couponMaster.couponType === 'potenCoupon') &&
                    <>
                        <FormGroup>
                            <Label className={'font-weight-bold text-secondary small'}>할인행사가(원) {star}</Label>
                            <div className='d-flex align-items-center' style={{width:'80%'}}>
                                <Input
                                    type='number'
                                    name={'potenCouponSalePrice'} value={potenCouponSalePrice}
                                    onFocus={(event) => event.target.select()}
                                    onChange={onInputChange}
                                /> <span className='ml-2'>원</span>

                                <span className='ml-2' style={{width:'80%'}}>할인율 {couponMaster.potenCouponDiscount}%</span>
                            </div>
                        </FormGroup>
                    </>
                }
                <FormGroup>
                    <Label className={'font-weight-bold text-secondary small'}>총 수량 {star}</Label>
                    <div className='d-flex align-items-center' style={{width:'40%'}}>
                        <Input
                            type='number'
                            name={'totalCount'} value={totalCount}
                            onFocus={(event) => event.target.select()}
                            onChange={onInputChange}/> <span className='ml-2'>개</span>
                    </div>
                </FormGroup>
                { //2022 01 신규추가.
                    (couponMaster.couponType === 'memberJoin' || couponMaster.couponType === 'specialCoupon') &&
                    <FormGroup>
                        <Label className={'font-weight-bold text-secondary small'}>최소 주문 금액(원) {!couponMaster.wonCoupon && <span>- 0이면 아래 BLY한도만 적용</span>} {star}</Label>
                        <div className='d-flex align-items-center' style={{width: '40%'}}>
                            <Input
                                type='number'
                                name={'minGoodsPrice'}
                                value={minGoodsPrice}
                                onChange={onInputChange}
                                onFocus={(event) => event.target.select()}
                            /> <span className='ml-2'> 원 </span>
                        </div>
                    </FormGroup>
                }

                {
                    (couponMaster.couponType !== 'memberJoinProdGoods' && couponMaster.couponType !== 'potenCoupon' && !couponMaster.wonCoupon && couponMaster.couponType !== 'deliveryCoupon') &&
                    <>
                        <FormGroup>
                            <Label className={'font-weight-bold text-secondary small'}>최소 주문 금액 </Label>
                            <div className='d-flex align-items-center' style={{width:'40%'}}>
                                <Input
                                    type='number'
                                    name={'couponBlyAmount'}
                                    value={minOrderBlyAmount}
                                    onChange={onInputChange}
                                    readOnly
                                    onFocus={(event) => event.target.select()}
                                /> <span className='ml-2'>BLY</span>
                            </div>
                        </FormGroup>
                    </>
                }


            </div>
            <div className="d-flex">
                <div className='flex-grow-1 p-1'>
                    <Button onClick={onCancelClick} block color={'warning'}>취소</Button>
                </div>
                <div className='flex-grow-1 p-1'>
                    <Button
                        onClick={onSaveClick} block color={'info'}
                        disabled={ (masterNo > 0) && (totalCount-remainCount) > 0 ? true:false}
                    >저장</Button>
                </div>
                <div className='flex-grow-1 p-1'>
                    <Button
                        onClick={onTitleUpdateClick} block color={'info'}
                        disabled={ (masterNo == 0) ? true:false}
                    >쿠폰명 & 메모 수정</Button>
                </div>
                {
                    (masterNo > 0 && couponMaster.couponType === 'goodsBuyReward') &&
                    <div className='flex-grow-1 p-1'>
                        <Button onClick={onTargetGoodsUpdateClick} block color={'info'}>상품수정</Button>
                    </div>
                }
            </div>

            {/* 쿠폰발급 상품검색 모달 */}
            <Modal size="lg" isOpen={goodsSearchModal}
                   toggle={goodsSearchModalToggle} >
                <ModalHeader toggle={goodsSearchModalToggle}>
                    쿠폰 상품검색
                </ModalHeader>
                <ModalBody>
                    {/* 2022.05 아래로 변경. <B2cGoodsSearch onChange={goodsSearchModalOnChange} />*/}
                    <B2cGoodsSelSearch onChange={goodsSearchModalOnChange} />
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={goodsSearchModalToggle}>취소</Button>
                </ModalFooter>
            </Modal>

            {/*{*/}
            {/*    multiGoodsSearchModal &&*/}
            <Modal
                isOpen={multiGoodsSearchModal}
                toggle={multiGoodsToggle}
                size="lg"
                style={{maxWidth: '800px', width: '80%'}}
                centered>
                <ModalHeader toggle={multiGoodsToggle}>쿠폰 발급 대상 상품 검색</ModalHeader>
                <ModalBody>
                    <Suspense fallback={null}>
                        <BuyRewardGoodsList
                            // isSearch={true}
                            // masterCouponNo={this.state.masterNo}
                            onClose={multiGoodsToggle} goodsList={couponMaster.targetGoods} />
                    </Suspense>
                </ModalBody>
            </Modal>

            {/*생산자 모달 */}
            <Modal size="lg" isOpen={producerModalOpen}
                   toggle={toggleProducerModal} >
                <ModalHeader toggle={toggleProducerModal}>
                    생산자 검색
                </ModalHeader>
                <ModalBody>
                    <ProducerList
                        onClose={onProducerModalClosed}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary"
                            onClick={toggleProducerModal}>취소</Button>
                </ModalFooter>
            </Modal>
        </div>
    )
}

export default CouponMasterReg