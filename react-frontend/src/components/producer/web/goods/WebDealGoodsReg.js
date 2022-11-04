import React, { Component, Fragment } from 'react'
import {Container, Row, Col, Input, FormGroup, Label, Button as RSButton, Fade, Badge, InputGroup, InputGroupAddon, InputGroupText, DropdownMenu,
    InputGroupButtonDropdown, DropdownToggle, DropdownItem, Alert} from 'reactstrap'
import Textarea from 'react-textarea-autosize'
import {
    RadioButtons,
    SingleImageUploader,
    ModalConfirm,
    OptionGoods,
    ModalPopup,
    SingleFileUploader, AuthMark, SwitchButton
} from '~/components/common'
import Style from './WebGoodsReg.module.scss'
import { addGoods, copyGoodsByGoodsNo } from '~/lib/goodsApi'
import { scOntPayProducerDeposit } from '~/lib/smartcontractApi'
import { getProducer, getProducerGoodsRegStopChk } from '~/lib/producerApi'
import { getGoodsByGoodsNo, deleteGoods, updateConfirmGoods, updateGoodsSalesStop, getGoodsContent, updateSalePaused, updateConfirmReqDealGoods, sendPriceUpdateMail } from '~/lib/goodsApi'
import { getItems } from '~/lib/adminApi'
import {getLoginProducerUser, checkPassPhraseForProducer, getLoginAdminUser} from '~/lib/loginApi'
import { ToastContainer, toast } from 'react-toastify'                              //토스트
import ComUtil from '~/util/ComUtil'
import Select from 'react-select'
import moment from 'moment-timezone'
import 'react-dates/initialize';
import { DateRangePicker, SingleDatePicker } from 'react-dates';
import { BlocerySpinner, Spinner, BlockChainSpinner, ModalWithNav, PassPhrase, Agricultural } from '~/components/common'

import CurrencyInput from '~/components/common/inputs/CurrencyInput'
import {Div, Span, Flex, ShadowBox, Button, Right, Space} from "~/styledComponents/shared";

import { TERMS_OF_DELIVERYFEE } from '~/lib/bloceryConst'

import SummernoteEditor from "~/components/common/summernoteEditor";
import Tag from "~/components/common/hashTag/HashTagInput";
import {FaBolt, FaClock, FaMinusCircle, FaPlusCircle} from "react-icons/fa";

import { Input as OptionInput } from '~/styledComponents/shared'
import Template from "~/util/Template";
import {Required} from "~/styledComponents/ShopBlyLayouts";

let validatedObj = {}

let bindData = {
    cultivationNm: [],//재배방법
    pesticideYn: null,  //농약유무
    items: [],         //품목
    itemKinds: [],      //품종
    packUnit: null,     //포장단위
    priceSteps: [],      //상품 할인단계
    termsOfDeliveryFees: [],      //배송비 조건 정책
    goodsTypes: [],     // 상품정보제공 고시설정
    vatFlag: null         // 과세여부
}

export default class WebDealGoodsReg extends Component {
    editorRef = React.createRef();

    constructor(props) {
        super(props);

        const { goodsNo } = this.props

        this.state = {
            startDate: null,
            endDate: null,
            dealStartFocusedInput: null, dealEndFocusedInput: null,
            focusedInput: null,
            isDeliveryFeeTermsOpen: false,//배송정책 종류 dropdown open 여부

            isOpen: false,
            goodsTypeModalOpen: false,

            isDidMounted: false,
            isLoading: {
                temp: false,    //임시저장 버튼에 쓰일 스피너
                update: false   //수정완료 버튼 스피너
            },
            chainLoading: false,    //블록체인 로딩용

            //등록시 사용
            goods: {
                goodsNo: goodsNo || null,
                producerNo: null,          //생산자번호
                goodsNm: '',              //상품명
                dealGoodsDesc: '',        //202109 추가. 공동구매 상품- 개요설명.

                goodsImages: [],	        //상품이미지
                searchTag: '',	        //태그
                itemNo: '',	            //품목번호
                itemName: '',	              //품목
                itemKindCode: '',             //품종번호
                itemKindName: '',             //품종명
                //breedNm: '',	          //품종
                productionArea: '',	      //생산지
                //cultivationNo: '',	  //재배방법번호
                cultivationNm: '토지',	  //재배방법명
                productionStart: '',      //수확시작일
                expectShippingStart: '',  //예상출하시작일
                expectShippingEnd: '',    //예상출하마감일
                pesticideYn: '무농약',	        //농약유무
                vatFlag: '',            // 과세여부
                packUnit: 'kg',	            //포장단위
                packAmount: '',	        //포장 양
                //packCnt: '',	            //판매개수
                // shipPrice: '',	        //출하 후 판매가
                // reservationPrice: '',	    //예약 시 판매가
                // cultivationDiary: '',	    //재배일지
                confirm: false,             //상품목록 노출 여부
                remainedDepositBlct: 0,
                totalDepositBlct: 0,
                remainedCnt: 0,
                discountRate: 0,            //할인율
                consumerPrice: null,           //소비자 가격
                totalPriceStep: 1,          //총 단계
                priceSteps: [
                    { stepNo: 1, until: null, price: 0, discountRate: 0 }
                ],             //단계별 가격

                deliveryFee: 0,             //배송비
                // deliveryQty: 0,          //배송비 정책 : 배송비 무료로 될 수량
                deliveryQty: '',            //배송비 정책 : 배송비 무료로 될 수량
                termsOfDeliveryFee: TERMS_OF_DELIVERYFEE.NO_FREE, //배송비 정책코드
                selfDeposit: false,         // 상품의 미배송보증금을 생산자가 냈는지 여부
                goodsTypeCode: 'none',          //해당없음:none, 식품(농수산물) : A, 가공식품 : P,  건강기능식품 : H
                goodsTypeName: '',
                directGoods: false,          //즉시판매상품 : true 예약상품, 공동구매상품 : false
                //// dealGoods 관련 필드
                dealGoods: true,            //공동구매상품 : true
                dealStartDate: 0,             //yyyymmddhh 공동구매시작
                dealEndDate: 0,             //yyyymmdd 공동구매종료
                dealMinCount: 0,            //상품판매개수 합계의 최소
                dealMaxCount: 0,            //상품판매개수 합계의 최대
                dealCount: 0,               //상품판매개수
                // stepNames: [],           //공동구매상품 진행단계명
                options: [{}],
                goodsInfo: [],
                //화면에서만 쓰이는 로컬 스토리지
                goodsInfoData: {
                    A: [],
                    P: [],
                    H: []
                },
                authMarkInfo:[],
                blyReviewConfirm: false,     //블리리뷰 노출 여부
                tags: [],
                groupTags: [],
                pbFlag: false,
                pbFarmerCode: '',
                pbItemCode: ''
            },

            dealStartDateHH:'00',
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

            loginUser: {},
            selected: null,
            //202012-selfDeposit제외.  modal: false,                //모달 여부
            //202012-selfDeposit제외.  modalType: '',              //모달 종류
            //202012-selfDeposit제외.  passPhrase: '', //비밀번호 6 자리 PIN CODE
            //202012-selfDeposit제외.  clearPassPhrase: true,
            producerInfo: null,
            isTempProdAdmin: false,     // tempProducer 관리자 여부
            selectedItemFeeRate: 0

        }
        this.inputPackUnit = React.createRef()
    }

    async componentDidMount() {
        await this.bind()
        const loginUser = await this.setLoginUserInfo();

        let adminUser = await getLoginAdminUser();

        const {data:producerInfo} = await getProducer();
        const state = Object.assign({}, this.state)

        if(adminUser && adminUser.email === "tempProducer@ezfarm.co.kr") {
            state.isTempProdAdmin = true;
        }

        state.isDidMounted = true
        state.loginUser = loginUser
        state.producerInfo = producerInfo;

        //신규
        if(!state.goods.goodsNo){

            state.goods.producerNo = loginUser.uniqueNo
            this.setValidatedObj(state)
            this.setState(state)
            return
        }

        //업데이트
        const goods = await this.search()
        console.log({goods})
        goods.currentPrice = goods.defaultCurrentPrice
        //품종세팅
        this.setItemKinds(goods.itemNo)

        //goods.vatFlag = this.getIsVatWording(goods.vatFlag);
        if(goods.dealStartDate) {
            const v_dealStartDateHH = moment(goods.dealStartDate,'YYYYMMDDHH').format('HH');
            state.dealStartDateHH = v_dealStartDateHH;
        }
        state.goods = goods
        state.selectedItemFeeRate = goods.feeRate
        //goodsContent 분리되었으므로 다시 가져오기, 가끔 data가 없을경우 fileName이 null이나 0인 경우가 있어서 제외
        if (!state.goods.goodsContent && state.goods.goodsContentFileName && state.goods.goodsContentFileName != 0) {
            let {data:goodsContent} = await getGoodsContent(state.goods.goodsContentFileName)
            if(goodsContent) {
                state.goods.goodsContent = goodsContent;
            }
            //console.log('goodsContent await:', goodsContent, state.goods.goodsContentFileName)
        }

        this.setValidatedObj(state);
        this.setState(state);
    }

    // getIsVatWording = (vatFlag) => {
    //     if(vatFlag) {
    //         return '과세'
    //     }
    //     return '면세'
    // }

    setLoginUserInfo = async() => {
        return await getLoginProducerUser();
    }

    //기초 데이타 바인딩 정보
    bind = async () => {

        const { data: itemsData } = await getItems(true)
        const items =  itemsData.map(item => ({value: item.itemNo, label: item.itemName, itemKinds: item.itemKinds, enabled: item.enabled, itemFeeRate: item.itemFeeRate}))

        //재배방법
        const cultivationNm = [
            { value: '토지', label:'토지'},
            { value: '온실', label:'온실'},
            { value: '수경재배', label:'수경재배'},
            { value: '자연산', label:'자연산'},
            { value: '양식', label:'양식'},
            { value: '해당없음', label:'해당사항 없음'}
        ]

        //농약유무
        const pesticideYn = [
            {value: '유기농', label:'유기농'},
            {value: '무농약', label:'무농약'},
            // {value: '농약사용', label:'농약사용'},
            {value: '해당없음', label:'해당사항 없음'}
        ]

        const packUnit = [
            {value: 'kg', label:'kg'},
            {value: 'g', label:'g'},
            {value: '근', label:'근'},
            {value: '99', label:'기타'}
        ]

        const priceSteps = [
            {value: 1, label:'상품 단일가'},
            {value: 2, label:'2단계 할인가'},
            {value: 3, label:'3단계 할인가'}
        ]

        const vatFlag = [
            {value: true, label: '과세'},
            {value: false, label: '면세'}
        ]

        const termsOfDeliveryFees = [
            { value: TERMS_OF_DELIVERYFEE.NO_FREE, label: '무료배송 없음' },
            { value: TERMS_OF_DELIVERYFEE.FREE, label: '무료배송' },
            { value: TERMS_OF_DELIVERYFEE.GTE_FREE, label: '개 이상 무료배송' },
            { value: TERMS_OF_DELIVERYFEE.GTE_PRICE_FREE, label: '원 이상 무료배송' },
            // { value: TERMS_OF_DELIVERYFEE.EACH_GROUP_COUNT, label: '개씩 배송요금 부과' },
        ]

        //상품종류 : 상품정보제공 고시 설정에서 사용
        const goodsTypes = [
            { value: 'none', label: '사용안함' },
            { value: 'A', label: '식품(농수축산물)' }, //Agricultural food
            { value: 'P', label: '가공식품' },      //Processed food
            { value: 'H', label: '건강기능식품' },   //Health functional food
        ]

        bindData = {
            items,
            itemKinds: [],
            cultivationNm,
            pesticideYn,
            packUnit,
            priceSteps,
            termsOfDeliveryFees,
            goodsTypes,
            vatFlag
        }
    }

    //input name에 사용
    names = {
        goodsNm: 'goodsNm',              //상품명
        dealGoodsDesc: 'dealGoodsDesc',	 //202109 추가. 공동구매 상품- 개요설명.

        searchTag: 'searchTag',	        //태그
        itemNo: 'itemNo',	            //품목번호
        // itemName: 'itemName',	            //품목
        itemKind: 'itemKind',	                //품종
        productionArea: 'productionArea',	//생산지
        // cultivationNm: 'cultivationNm',	//재배방법명
        dealStartDate: 'dealStartDate',     //공동구매시작일
        dealEndDate: 'dealEndDate',         //공동구매종료일
        productionStart: 'productionStart',      //수확시작일
        expectShippingStart: 'expectShippingStart',  //예상출하시작일
        expectShippingEnd: 'expectShippingEnd',    //예상출하마감일
        // pesticideYn: 'pesticideYn',	        //농약유무
        // packUnit: 'packUnit',	            //포장단위
        packAmount: 'packAmount',	        //포장 양
        //packCnt: 'packCnt',	            //판매개수
        // shipPrice: 'shipPrice',	        //출하 후 판매가
        // reservationPrice: 'reservationPrice',	    //예약 시 판매가 gfrd
        consumerPrice: 'consumerPrice',      //소비자 가격
        currentPrice: 'currentPrice',       //판매가

        deliveryFee: 'deliveryFee',             //배송비
        deliveryQty: 'deliveryQty',          //배송비 정책 : 배송비 무료로 될 수량
        goodsTypeCode: 'goodsTypeCode',      //상품종류 식품(농수산물) : A, 가공식품 : P,  건강기능식품 : H
        dealMinCount: 'dealMinCount',
        //dealMaxCount: 'dealMaxCount',
        pbFarmerCode: 'pbFarmerCode',
        pbItemCode: 'pbItemCode'
    }

    //밸리데이션 체크, null 은 밸리데이션 체크를 통과한 것을 의미함
    setValidatedObj = ({goods: obj}) => {
        let options = null;

        if(obj.options.length <= 0) {
            options = '옵션은 1개 이상 등록 필수입니다.'
        } else {
            for(let i = 0 ; i < obj.options.length; i++){
                const option = obj.options.find((option) => option.optionIndex === i)

                if(!option || !option.optionName || !option.packCnt || !option.optionPrice){
                    options = '옵션의 옵션명, 판매수량, 판매가격은 필수입니다'
                    break
                }
            }
        }

        //소비자가격 및 단계별 할인율 체크 end
        validatedObj = {
            // goodsNo: goodsNo || null,

            goodsNm: obj.goodsNm.length > 0 ? null : '상품명은 필수 입니다',              //상품명
            //잘안됨(안중요-제외) dealGoodsDesc: obj.dealGoodsDesc.length > 0 ? null : '공동구매 간단설명은 필수입니다',

            goodsImages: obj.goodsImages.length > 0 ? null : '대표 이미지는 최소 1장 이상 필요합니다',	        //상품이미지
            // searchTag: '',	        //태그
            itemNo: obj.itemNo ? null : '품목은 필수 입니다',	            //품목번호
            // itemName: '',	              //품목
            itemKindCode: obj.itemKindCode ? null : '품종은 필수 입니다',	            //품종
            productionArea: obj.productionArea ? null : '생산지는 필수 입니다',	      //생산지
            // cultivationNo: obj.cultivationNo ? null : '재배방법은 필수 입니다',,	  //재배방법번호

            cultivationNm: obj.cultivationNm ? null : '재배방법은 필수 입니다',	  //재배방법명
            pesticideYn: obj.pesticideYn ? null : '농약유무는 필수 입니다',	        //농약유무
            vatFlag: obj.vatFlag!==''? null : '과세여부를 선택해 주시기 바랍니다',              // 과세여부
            packUnit: obj.packUnit ? null : '포장단위는 필수 입니다',	            //포장단위
            packAmount: ComUtil.toNum(obj.packAmount) > 0 ? null : '포장양은 필수 입니다',	        //포장 양
            //packCnt: ComUtil.toNum(obj.packCnt) >= 0 ? null : '판매수량은 필수 입니다',	            //판매 수량

            deliveryQty:
                obj.termsOfDeliveryFee === TERMS_OF_DELIVERYFEE.GTE_PRICE_FREE ||
                obj.termsOfDeliveryFee === TERMS_OF_DELIVERYFEE.GTE_FREE ||                   //몇개이상 무료배송
                obj.termsOfDeliveryFee === TERMS_OF_DELIVERYFEE.EACH_GROUP_COUNT ?              //몇개씩 배송요금 부과
                    ComUtil.toNum(obj.deliveryQty) ? null : '무료배송조건을 입력해 주세요' : null,      //배송비 정책 : 배송비 무료로 될 수량

            deliveryFee:
                obj.termsOfDeliveryFee === TERMS_OF_DELIVERYFEE.FREE ?                //무료배송 일 경우 밸리데이션 체크 안함
                    null : ComUtil.toNum(obj.deliveryFee) ? null : '배송비는 필수 입니다',             //배송비

            //배송일
            expectShippingDate: (obj.expectShippingStart && obj.expectShippingEnd) ? null : '발송일을 달력에서 지정 해 주세요.',

            consumerPrice: ComUtil.toNum(obj.consumerPrice) > 0 ? null : '소비자가를 입력해 주세요',
            currentPrice: ComUtil.toNum(obj.currentPrice) > 0 ? null : '실제 판매되는 가격을 입력해 주세요',

            dealStartDate: ComUtil.toNum(obj.dealStartDate) > 0 ? null : '공동구매시작일은 필수 입니다',
            dealEndDate: ComUtil.toNum(obj.dealEndDate) > 0 ? null : '공동구매종료일은 필수 입니다',
            dealMinCount: ComUtil.toNum(obj.dealMinCount) > 0 ? null : '최소판매개수는 필수 입니다',
            //dealMaxCount: ComUtil.toNum(obj.dealMaxCount) > 0 ? null : '최대판매개수는 필수 입니다',
            // stepNames: obj.stepNames.length <= 0 ? null: '공동구매 진행단계를 1개 이상 입력해 주세요',
            options: options,

            goodsContent: obj.goodsContent ? null : '상품상세설명은 필수 입니다',
            goodsTypeCode: obj.goodsTypeCode ? null : '상품정보제공 고시 설정은 필수 입니다',
            //pb상품 여부
            pbFarmerCode: (!obj.pbFlag || obj.pbFarmerCode) ? null: 'PB상품의 농가번호는 필수 입니다',
            pbItemCode: (!obj.pbFlag || obj.pbItemCode) ? null: 'PB상품의 품목번호는 필수 입니다',
        }
    }

    //조회
    search = async () => {
        if(!this.state.goods.goodsNo)
            return

        const { data: goods } = await getGoodsByGoodsNo(this.state.goods.goodsNo)

        goods.goodsInfoData = {A:[], P:[], H:[]}

        goods.goodsInfoData[goods.goodsTypeCode] = Object.assign([], goods.newGoodsInfo)

        return goods
    }

    //대표상품 이미지
    onGoodsImageChange = (images) => {

        const goods = Object.assign({}, this.state.goods)
        goods.goodsImages = images

        this.setValidatedObj({goods})
        this.setState({goods})
    }

    onContentImageChange = (images) => {

        const goods = Object.assign({}, this.state.goods)
        goods.contentImages = images

        this.setValidatedObj({goods})
        this.setState({goods})
    }

    //업로드된 경로 받기
    onAuthFileChange = (name, file) => {
        const goods = Object.assign({}, this.state.goods)
        goods.authFiles[name] = file ? file : null;
        console.log("onUploadCompleted", file);
        this.setState({goods})
    }

    //재배방법
    onCultivationNmClick = (item) => {
        const goods = Object.assign({}, this.state.goods)
        goods.cultivationNm = item.value
        this.setValidatedObj({goods})
        this.setState({goods})
    }

    //농약유무
    onPesticideYnClick  = (item) => {
        const goods = Object.assign({}, this.state.goods)
        goods.pesticideYn = item.value
        this.setValidatedObj({goods})
        this.setState({goods})
    }
    //포장단위
    onPackUnitChange = (e) => {
        const goods = Object.assign({}, this.state.goods)

        //기타
        if(e.target.value === '99'){
            goods.packUnit = ''
        }else{
            goods.packUnit = e.target.value
        }

        //console.log({target: e.target.value})

        this.setValidatedObj({goods})
        this.setState({goods}, ()=>{
            this.inputPackUnit.current.focus()
        })

    }

    //과세여부
    onVatChange = (e) => {
        const goods = Object.assign({}, this.state.goods);
        goods.vatFlag = (e.target.value == 'true'); //string to boolean

        console.log(e.target.value, goods.vatFlag);

        this.setValidatedObj({goods});
        this.setState({goods})
    }

    onInputPackUnitChange = (e) => {
        const value = e.target.value
        const goods = Object.assign({}, this.state.goods)
        goods.packUnit = value
        this.setState({
            goods: goods
        })
        this.setValidatedObj({goods})
    }

    isEtcPackUnit = () => {
        //기타를 제외한 것을 선택
        const packUnits = bindData.packUnit.filter(item => item.value !== '99')
        const packUnit = packUnits.find(item => item.value === this.state.goods.packUnit)

        if(packUnit){
            return false
        }
        return true
    }

    //예상발송일 달력
    onExpectShippingChange = ({ startDate, endDate })=> {
        const goods = Object.assign({}, this.state.goods)
        goods.expectShippingStart = startDate && startDate.startOf('day')
        goods.expectShippingEnd = endDate && endDate.endOf('day')
        this.setValidatedObj({goods})
        this.setState({goods})
    }

    //공동구매진행단계 change
    // onStepNamesChange = (e) => {
    //     let { name, value } = e.target
    //     const goods = Object.assign({}, this.state.goods)
    //
    //     const stepNo = name.charAt(name.length-1);
    //
    //     let data = {
    //         stepName: value,
    //         description: ''
    //     }
    //     goods.stepNames[stepNo] = data
    //
    //     this.setValidatedObj({goods})
    //     this.setState({goods})
    // }

    onOptionInputChange = (index, e) => {
        let { name, value } = e.target
        const goods = Object.assign({}, this.state.goods)

        goods.options[index][name] = value

        if(name === 'optionPrice' || name === 'packCnt')
            goods.options[index][name] = ComUtil.toNum(value)

        if(!this.props.goodsNo && name === 'packCnt')
            goods.options[index].remainedCnt = ComUtil.toNum(value)

        this.setValidatedObj({goods})
        this.setState({...this.state, goods})
    }

    onBlur = async (index, e) => {
        let { name, value } = e.target
        const goods = Object.assign({}, this.state.goods)
        if(goods.goodsNo) {
            const originGoods = await getGoodsByGoodsNo(goods.goodsNo)

            if((JSON.stringify(originGoods.options) === JSON.stringify(goods.options)) === false) {
                goods.options[index].remainedCnt = ComUtil.toNum(value)
            }
        }

        // onBlur시 optionIndex 세팅
        goods.options[index].optionIndex = index

        this.setValidatedObj({goods})
        this.setState({...this.state, goods})
    }

    // 옵션명 onBlur시 optionIndex 세팅
    onBlurOptionName = (index) => {
        const goods = Object.assign({}, this.state.goods)

        goods.options[index].optionIndex = index
    }

    //인풋박스
    onInputChange = (e) => {
        let { name, value } = e.target
        const goods = Object.assign({}, this.state.goods)

        if(name === 'currentPrice'){
            if(goods.consumerPrice === null || goods.consumerPrice === '') {
                alert('소비자가를 먼저 입력해주세요.');
                return;
            }
            if(this.state.selectedItemFeeRate === 0) {
                alert('품목을 먼저 선택해주세요.');
                return;
            }
            const currentPrice = ComUtil.toNum(value)
            const consumerPrice = ComUtil.toNum(goods.consumerPrice)

            if(currentPrice === 0){
                goods.discountRate = 100
            }
            else if(consumerPrice > 0 && currentPrice > 0){
                const discountRate = 100 - ((currentPrice / consumerPrice) * 100)
                goods.discountRate = ComUtil.toNum(discountRate)
            }
        }

        if(name === 'consumerPrice' && goods.currentPrice !== null && ComUtil.toNum(goods.currentPrice) > 0) {
            const currentPrice = ComUtil.toNum(goods.currentPrice);
            const consumerPrice = ComUtil.toNum(value);
            const discountRate = 100 - ((currentPrice / consumerPrice) * 100);
            goods.discountRate = ComUtil.toNum(discountRate);
        }

        goods[name] = value

        this.setValidatedObj({goods})
        this.setState({goods})
    }

    goodsRegStopChk = async () => {
        const {data:isGoodsRegStopChk} = await getProducerGoodsRegStopChk(this.state.goods.producerNo)
        if(isGoodsRegStopChk === true){
            alert("사용 중이신 계정이 서비스 이용 제한 상태입니다.\n" +
                "계속 이용하고자 하실 경우 샵블리 관리자에 문의하시기 바랍니다.\n" +
                "031-8090-3108")
            return false;
        }
        return true
    }

    //임시저장
    onAddTempGoodsClick = async (e) => {

        if(!await this.goodsRegStopChk()) return

        this.loadingToggle('temp')
        await this.saveTemp();
        this.loadingToggle('temp')
    }

    saveTemp = async () => {
        const goods = Object.assign({}, this.state.goods)
        goods.newGoodsInfo = Object.assign([], goods.goodsInfoData[goods.goodsTypeCode])

        if(goods.goodsNm.length <= 0){
            this.notify('상품명은 필수 입니다', toast.error)
            return
        }
        if(!goods.dealEndDate) {
            this.notify('공동구매기간은 필수 입니다', toast.error)
            return
        }
        if(goods.goodsTypeCode !== 'none' && goods.newGoodsInfo.length <= 0){
            this.notify('[상품정보제공 고시 설정] 상세 내용을 입력해주세요', toast.error)
            return
        }

        //옵션0번 자동세팅
        // goods.options[0].optionName = goods.goodsNm;
        goods.options[0].optionPrice = goods.currentPrice;

        // 과세,면세는 true,false로 변경
        // if(goods.vatFlag === '과세') {
        //     goods.vatFlag = true;
        // } else {
        //     goods.vatFlag = false;
        // }


        this.setState({goods})

        console.log({goods})

        await this.save(goods)
    }

    loadingToggle = (key) => {
        const isLoading = this.state.isLoading[key]
        this.setState({
            isLoading: {
                [key]: !isLoading
            }
        })
    }

    isPassedValidation = () => {
        const state = Object.assign({}, this.state)
        //에디터의 내용을 state에 미리 저장 후 밸리데이션 체크
        //state.goods.goodsContent = this.editorRef.current.getInstance().getValue()

        //밸리데이션 체크
        this.setValidatedObj(state)
        //밸리데이션을 통과했는지 여부
        const valid = this.isValidatedSuccessful()

        if(!valid.isSuccess){
            this.notify(valid.msg, toast.error)
            return false
        }
        return true
    }

    //상품노출
    onConfirmClick = async () => {

        if(!await this.goodsRegStopChk()) return

        if(!this.isPassedValidation()) return

        if(!window.confirm('상품을 판매개시 하시겠습니까? 이후 수정되는 항목이 제한 됩니다!')) return

        //임시저장
        await this.saveTemp()

        //노출 업데이트
        await this.confirmSave()
    }

    // 생산자가 판매개시를 요청함.
    onConfirmReqClick = async() => {

        if(!await this.goodsRegStopChk()) return

        if(!this.isPassedValidation()) return

        if(!window.confirm('상품을 판매개시 요청 하시겠습니까? 관리자 승인 이후에는 수정되는 항목이 제한 됩니다!')) return

        //임시저장
        await this.saveTemp()

        const goods = Object.assign({}, this.state.goods);
        let confirmResult = updateConfirmReqDealGoods(this.state.goods.goodsNo);
        if(confirmResult) {
            this.notify('상품을 판매개시 요청하였습니다', toast.success)
            this.setState({
                goods: goods
            })
        }
    }

    //상품수정(노출이후)
    onUpdateClick = async () => {

        if(!await this.goodsRegStopChk()) return

        if(this.state.goods.inSuperRewardPeriod || this.state.goods.inTimeSalePeriod){
            let vTitle = "수퍼리워드 및 포텐타임";
            if(this.state.goods.inSuperRewardPeriod) vTitle = '수퍼리워드';
            if(this.state.goods.inTimeSalePeriod) vTitle = '포텐타임';
            if(!this.state.isTempProdAdmin){
                alert(vTitle+" 기간중에는 수정하실 수 없습니다. 관리자에게 문의 바랍니다.")
                return
            }
        }

        if(!this.isPassedValidation()) return
        if(!window.confirm('수정되는 상품은 즉시 반영 됩니다')) return

        this.loadingToggle('update')
        await this.saveTemp();
        this.loadingToggle('update')
    }

    //할인율 계산
    getDiscountRate = (goods) => {
        return (100 - ((goods.currentPrice / goods.consumerPrice) * 100)) || 0
    }

    //저장(DB에 selectedStepPrice 가 없어져서, 사용자가 선택한 단계와는 상관없이 단계별 값이 있는 마지막 )
    save = async (goods) => {
        //상품상세
        goods.goodsContent = this.state.goods.goodsContent; //this.editorRef.current.getInstance().getValue()

        //블리리뷰 노출 여부
        goods.blyReviewConfirm = this.state.goods.blyReviewConfirm;

        //확정 전까지 재고수량 동기화
        if(!goods.confirm){
            goods.remainedCnt = goods.packCnt;  // 옵션들 packCnt의 합
        }

        // 생산자가 묶음배송일 경우 '원이상 무료배송'으로 goods에 저장함.
        if(this.state.producerInfo.producerWrapDeliver) {
            goods.termsOfDeliveryFee = TERMS_OF_DELIVERYFEE.GTE_PRICE_FREE;
            goods.deliveryQty = this.state.producerInfo.producerWrapLimitPrice;
            goods.deliveryFee = this.state.producerInfo.producerWrapFee;
        }

        // if(goods.inTimeSalePeriod) {
        //     goods.discountRate = goods.defaultDiscountRate
        // }

        // dealGoods는 판매종료일 항상 없고,  2099.12.31 로 저장
        // let endDate = new Date(2099,11,31,0,0,0);
        // goods.saleEnd = endDate;

        // 판매종료일을 dealEndDate와 동일하게 세팅 (2022.1.13)
        //goods.saleEnd = ComUtil.getDate(goods.dealEndDate.toString());
        goods.saleEnd = moment(goods.dealEndDate, 'YYYYMMDD');


        //상품이미지의 imageNo로 정렬
        ComUtil.sortNumber(goods.goodsImages, 'imageNo', false)

        const {data: errRes, status} = await addGoods(goods)

        // if(status !== 200) {
        //     alert('등록이 실패 하였습니다')
        //     return
        // }
        // else if(goodsNo === -1){
        //     alert('이미지 및 컨텐츠 사이즈가 10메가를 초과했습니다. 용량을 줄여서 다시 해주세요')
        //     return
        // }
        // else if(goodsNo === -2){
        //     alert('서버에서 컨텐츠를 파일로 저장시 오류가 발생하였습니다.')
        //     return
        // }

        if (errRes.resCode) {
            alert(errRes.errMsg) //위 3가지 에러 서버에서 리턴.
            return;
        }
        else{
            this.notify('저장되었습니다', toast.success)
            //goods.vatFlag = goods.vatFlag ? '과세' : '면세'
            goods.goodsNo = ComUtil.toNum(errRes.retData)  //goodsNo
            this.setState({
                goods: goods
            })
        }

        // 판매가격이 수정된 경우 관리자에 메일발송
        if((this.props.goodsNo) && ComUtil.toNum(goods.currentPrice) !== goods.defaultCurrentPrice && !this.state.isTempProdAdmin) {
            await sendPriceUpdateMail(this.state.goods.goodsNo)
        }
    }

    confirmSave = async() => {
        const goods = Object.assign({}, this.state.goods);
        goods.confirm = true; //상품목록에 노출

        let confirmResult = updateConfirmGoods(this.state.goods.goodsNo, goods.confirm);

        if(confirmResult) {
            this.notify('상품이 노출되었습니다', toast.success)
            this.setState({
                goods: goods
            })
        }
    }

    // 마이페이지로 이동
    moveToMypage = () => {
        window.location = '/mypage'
    }

    //react-toastify
    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_RIGHT
            //className: ''     //클래스를 넣어도 됩니다
        })
    }

    //미리보기
    onPreviewClick = () => {
        this.toggle()
    }
    //만약 모달 창 닫기를 강제로 하려면 아래처럼 넘기면 됩니다
    onPreviewClose = () => {
        this.toggle()
    }
    toggle = () => {
        this.setState({
            isOpen: !this.state.isOpen
        })
    }

    // 인증마크 온체인지 이벤트
    onAuthMarkChange = (data) => {
        let goods = Object.assign({}, this.state.goods)
        if(data) {
            goods.authMarkInfo = data
            this.setState({goods})
        }
        console.log("goods.authMarkInfo==",goods.authMarkInfo)
    }

    // 상품정보제공 고시 설정
    onGoodsTypeModal = (data) => {
        let goods = Object.assign({}, this.state.goods)
        //console.log("onGoodsTypeModal====",data)
        if(data) {
            goods.goodsInfoData[goods.goodsTypeCode] = data
            this.setValidatedObj({goods})
            this.setState({goods})
        }
        this.setState({
            goodsTypeModalOpen: !this.state.goodsTypeModalOpen
        })
    }

    //품목
    onItemChange = (item) => {
        //품종 세팅
        this.setItemKinds(item.value)
        this.setState({ selectedItemFeeRate: item.itemFeeRate })

        const goods = Object.assign({}, this.state.goods)

        if(item.value !== goods.itemNo){
            goods.itemKindCode = null
            goods.itemKindName = null
        }

        goods.itemNo = item.value
        goods.itemName = item.label
        this.setValidatedObj({goods})
        this.setState({ goods })
    }

    //밸리데이션검증 성공여부
    isValidatedSuccessful = () => {
        let isSuccess = true
        let msg = ''

        //Object.keys(validatedObj)

        Object.keys(validatedObj).some((key) => {
            const _msg = validatedObj[key]
            if(_msg){
                isSuccess = false
                msg = _msg
            }
            return _msg !== null || _msg === undefined || _msg === ''
        })

        return {isSuccess, msg}
    }

    // 상품 삭제
    onDeleteGoodsClick = async(isConfirmed) => {
        if(isConfirmed){
            const result = await deleteGoods(this.state.goods.goodsNo)
            if(result.data === true) {
                this.props.onClose();
            }
        }
    }

    // 상품 판매 중단
    onGoodsStopClick = async(isConfirmed) => {
        if(isConfirmed){
            const result = await updateGoodsSalesStop(this.state.goods.goodsNo)
            if(result.data === true) {
                this.props.onClose();
            }
        }
    }

    //상품 복사(상품복사종류 선택 팝업)
    onGoodsCopyPopClick = async () => {

        if(!await this.goodsRegStopChk()) return

        this.setState({
            isGoodsCopySelectionOpen: true
        })
    }
    //상품복사종류선택 팝업 닫힐때
    onGoodsCopySelectionPopupClose = () => {
        this.setState({
            isGoodsCopySelectionOpen: false
        })
    }
    //상품복사 종류 선택
    onGoodsCopyPopupClick = async (isReviewGoods) => {
        let pIsReviewGoods = isReviewGoods;
        if(window.confirm('해당상품을 '+(isReviewGoods?'동일':'다른')+'상품으로 복사하시겠습니까?')) {
            const {status, data: goodsNo} = await copyGoodsByGoodsNo(this.state.goods.goodsNo, pIsReviewGoods)

            if (status != 200 || goodsNo <= 0) {
                alert('[상품복사실패] 다시 진행해주세요')
                return
            }

            alert('복사가 완료되었습니다. 상품 목록에서 확인해 주세요')


            this.setState({
                isGoodsCopySelectionOpen: false
            });
        }
    }


    //상품 복사
    onCopyClick = async(isConfirmed) => {
        if (isConfirmed) {
            let isReviewGoods = false;
            if(window.confirm('동일한 상품이 맞습니까? 다른 상품일경우 취소를 눌러주세요!')) {
                isReviewGoods = true;
            }
            const {status, data: goodsNo} = await copyGoodsByGoodsNo(this.state.goods.goodsNo, isReviewGoods)

            if (status != 200 || goodsNo <= 0) {
                alert('[상품복사실패] 다시 진행해주세요')
                return
            }

            alert('복사가 완료되었습니다. 상품 목록에서 확인해 주세요')
        }
    }

    // 상품 판매 일시중지
    onGoodsPausedClick = async (isConfirmed) => {
        if(isConfirmed) {
            const result = await updateSalePaused(this.state.goods.goodsNo, true)
            if(result.data === true) {
                this.props.onClose();
            }
        }
    }

    // 상품 판매 재개
    onGoodsResumeClick = async (isConfirmed) => {

        if(!await this.goodsRegStopChk()) return

        if(isConfirmed) {
            const result = await updateSalePaused(this.state.goods.goodsNo, false)
            if(result.data === true) {
                this.props.onClose();
            }
        }
    }

    //배송정책 드롭다운 클릭
    onTermsOfDeliveryFeeChange = ({value, label}) => {
        // deliveryFeeTerms.find(terms=>terms.value === value).label

        const state = Object.assign({}, this.state)

        //state.termsOfDeliveryFee = value

        switch (value){
            //무료배송
            case TERMS_OF_DELIVERYFEE.FREE :
                state.goods.deliveryFee = 0     //배송비
                state.goods.deliveryQty = ''    //무료배송 조건
                break;
            case TERMS_OF_DELIVERYFEE.NO_FREE :
                state.goods.deliveryQty = ''    //무료배송 조건
                break;
        }

        state.goods.termsOfDeliveryFee = value

        this.setValidatedObj(state)
        this.setState(state)
    }

    onStartHHChange = (data) => {
        let state = Object.assign({}, this.state)
        const goods = state.goods;
        let v_StartHH = data.value;
        const dealStartDateOnlyDate = moment(goods.dealStartDate, 'YYYYMMDDHH').format('YYYYMMDD');
        const dealStartDate = moment(dealStartDateOnlyDate+''+v_StartHH, 'YYYYMMDDHH').format('YYYYMMDDHH');
        //공동구매시작일 설정(마지막 선택한 단계의 날짜로)
        goods.dealStartDate = dealStartDate+'00';
        this.setState({
            goods:goods,
            dealStartDateHH:v_StartHH
        });
    }

    // 공동구매시작일~공동구매종료일
    onDateChange = (gubun, date) => {
        //console.log("onDateChange===",date)
        if(gubun == "start"){
            const state = Object.assign({}, this.state)
            const v_StartHH = this.state.dealStartDateHH;
            const dealStartDate = moment(moment(date).format('YYYYMMDD')+''+v_StartHH,'YYYYMMDDHH').format('YYYYMMDDHH')
            //공동구매시작일 설정(마지막 선택한 단계의 날짜로)
            state.goods.dealStartDate = dealStartDate+'00';
            state.dealStartDateHH = v_StartHH;
            const goods = state.goods;
            this.setValidatedObj({goods})
            this.setState(state)
        }
        if(gubun == "end"){
            const goods = Object.assign({}, this.state.goods)
            //goods.saleEnd = date
            const dealEndDate = moment(date).format('YYYYMMDD');

            //상품판매기한 설정(마지막 선택한 단계의 날짜로)
            goods.dealEndDate = dealEndDate

            this.setValidatedObj({goods})
            this.setState({goods})
        }
    }

    onItemKindChange = (data) => {
        const goods = Object.assign({}, this.state.goods)
        goods.itemKindName = data.label;
        goods.itemKindCode = data.value;
        this.setValidatedObj({goods})
        this.setState({goods})
    }

    //품종 세팅
    setItemKinds = (itemNo) => {
        if(itemNo !== this.state.goods.itemNo){
            const item = bindData.items.find(item => item.value === itemNo)
            if(item && item.itemKinds){
                bindData.itemKinds = item.itemKinds.map((itemKind) => ({value: itemKind.code, label: itemKind.name}))
            }
        }
    }

    // 상품정보제공고시
    onGoodsTypeChange = (data) => {
        console.log(data)
        const goods = Object.assign({}, this.state.goods)
        goods.goodsTypeName = data.label;
        goods.goodsTypeCode = data.value;
        this.setValidatedObj({goods})
        this.setState({goods})
    }

    goodsTypeSetting = () => {
        this.setState({ goodsTypeModalOpen: true })
    }

    // 판매 개시 후 상품수량 수정
    modifyPackCnt = () => {
        const goods = Object.assign({}, this.state.goods)
        let inputPackCnt = prompt('판매할 총 수량을 입력하세요. (현재 총 수량: ' + goods.packCnt + ', 현재 잔여수량: ' + goods.remainedCnt + ')', '숫자만 입력')

        //숫자가 아닌 값을 입력 했을경우 방어코드
        if(!inputPackCnt || Number.isNaN(Number(inputPackCnt))) {
            return
        }

        //방어코드
        inputPackCnt = ComUtil.toNum(inputPackCnt)

        const prevRemainedCnt = goods.remainedCnt   // 바뀌기 전 남은 수량

        if(inputPackCnt - goods.packCnt >= 0) {     // 현재수량보다 플러스
            goods.remainedCnt = prevRemainedCnt + (inputPackCnt-goods.packCnt)
            goods.packCnt = inputPackCnt

            console.log(goods.packCnt, goods.remainedCnt)
        } else {                                    // 현재수량보다 마이너스
            if(inputPackCnt < goods.packCnt-goods.remainedCnt) {
                alert('판매완료된 수량보다 작은 수를 입력하실 수 없습니다.')
                return false
            } else {
                goods.remainedCnt = prevRemainedCnt - (goods.packCnt-inputPackCnt)
                goods.packCnt = inputPackCnt
            }
        }

        if(window.confirm(`판매수량을 ${ComUtil.addCommas(inputPackCnt)}개로 변경하시겠습니까?`)) {
            this.setState({ goods })

        }
    }

    // db에 저장된 판매수량 다시 가져오기
    // resetPackCnt = async() => {
    //     const originGoods = await this.search();    // db에 저장되어 있는 goods 정보
    //     const goods = Object.assign({}, this.state.goods)
    //
    //     goods.packCnt = originGoods.packCnt
    //     goods.remainedCnt = originGoods.remainedCnt
    //
    //     this.setState({ goods })
    // }

    //상품 컨텐츠 온체인지 (tui-editor)
    onChangeGoodsContent = (editorHtml) => {
        const goods = Object.assign({}, this.state.goods)
        goods.goodsContent = editorHtml;
        this.setState({goods});
    }

    // 블리리뷰 노출 여부
    onChangeBlyReview = (e) => {
        const state = Object.assign({}, this.state)

        state.goods.blyReviewConfirm = e.target.checked
        this.setState({ state })
    }

    onblyReviewChange = (editorHtml) => {
        const goods = Object.assign({}, this.state.goods)
        goods.blyReview = editorHtml;
        this.setState({goods});
    }

    onTagChange = (tags) => {
        const goods = Object.assign({}, this.state.goods);
        goods.tags = tags
        this.setState({goods});
    }
    onGroupTagChange = (tags) => {
        const goods = Object.assign({}, this.state.goods);
        goods.groupTags = tags
        this.setState({goods});
    }
    addOptionClick = () => {
        const goods = Object.assign({}, this.state.goods)
        const options = Object.assign([], this.state.goods.options)
        options.push({})

        goods.options = options

        this.setState({
            ...this.state,
            goods
        })
    }

    // 옵션 숨김 처리(소비자화면에서만 안 보임)
    onHideClick = ({index}) => {
        const goods = Object.assign({}, this.state.goods)

        goods.options[index].deleted = !goods.options[index].deleted

        this.setState({
            ...this.state, goods
        })
    }

    // 옵션 행 삭제
    onDeleteClick = ({index}) => {
        const goods = Object.assign({}, this.state.goods)
        const options = Object.assign([], this.state.goods.options)

        options.splice(index, 1)
        goods.options = options

        this.setState({
            ...this.state, goods
        })
    }

    // 옵션 이미지
    onOptionImageChange = (index, images) => {
        const newGoods = Object.assign({}, this.state.goods)

        newGoods.options[index].optionImages = images

        this.setState({
            ...this.state,
            goods: newGoods
        })
    }

    onTemplateClick = (type) => {
        const goods = Object.assign({}, this.state.goods);
        let typeNm = "일반";
        if(type === 'AHP')  typeNm = "축산(돼지)";
        else if(type === 'AHC')  typeNm = "축산(소)";

        if(window.confirm("상품상세에 템플릿양식["+typeNm+"] 적용 하시겠습니까?")){
            const templateData = Template.goodsDrlTemplateType(type);
            goods.goodsContent = templateData;
            this.setState({
                goods: goods
            })
        }
    }

    onPbFlagChange = () => {
        const goods = Object.assign({}, this.state.goods)

        goods.pbFlag = !goods.pbFlag

        this.setState({
            ...this.state, goods
        })
    }

    render(){
        if(!this.state.isDidMounted) return <BlocerySpinner/>

        const { isTempProdAdmin, goods } = this.state
        const star = <span className='text-danger'>*</span>

        const dealStartDate = ComUtil.utcToString(goods.dealStartDate, 'YYYY-MM-DD');
        const dealEndDate = ComUtil.utcToString(goods.dealEndDate, 'YYYY-MM-DD');
        const now = ComUtil.utcToString(new Date().getTime(), 'YYYY-MM-DD')

        let dealEnd = false;
        if(dealEndDate) {
            const compareDate = ComUtil.compareDate(dealEndDate, now)
            if (compareDate === -1) {
                dealEnd = true
            } else {
                dealEnd = false
            }
        }

        const salesStopText = goods.saleStopped && <div className='p-3 text-center text-danger ml-1 mr-1'>상품이 판매중단되어 판매가 불가능 합니다</div>
        const confirmText = (goods.confirm && !goods.saleStopped) && <div className='p-3 text-center text-danger ml-1 mr-1'>상품이 판매개시되어 수정내용이 제한됩니다</div>
        const btnAddTempGoods = !goods.confirm ? <Button className='d-flex align-items-center justify-content-center' onClick={this.onAddTempGoodsClick} disabled={this.state.isLoading.temp} bg='warning' fg={'white'}>임시저장{this.state.isLoading.temp && <Spinner/> }</Button> : null
        const btnConfirm = (goods.goodsNo && !goods.confirm) ?  <Button bg={'warning'} fg={'white'} onClick={this.onConfirmClick}>확인(판매개시)</Button> : null
        const btnConfirmReq = (goods.goodsNo && !goods.confirm) ?  <Button bg={'warning'} fg={'white'} onClick={this.onConfirmReqClick}>판매개시요청</Button> : null
        const btnDelete = (goods.goodsNo && !goods.confirm) ? <ModalConfirm title={'상품을 삭제 하시겠습니까?'} content={'삭제된 상품은 복구가 불가능 합니다'} onClick={this.onDeleteGoodsClick}><Button bg={'danger'} fg={'white'}>삭제</Button></ModalConfirm> : null
        const btnPreview = goods.goodsNo ? <Button bg={'secondary'} onClick={this.onPreviewClick}>미리보기</Button> : null
        const btnGoodsStop = (goods.confirm && !goods.saleStopped) ? <ModalConfirm title={'상품을 영구판매종료 하시겠습니까?'} content={'영구판매종료된 상품은 다시 판매가 불가능 합니다'} onClick={this.onGoodsStopClick}><Button bg={'secondary'}>영구판매종료</Button></ModalConfirm> : null
        const btnUpdate = (goods.confirm && !goods.saleStopped) ? <Button bg={'warning'} fg={'white'} className='d-flex align-items-center justify-content-center' onClick={this.onUpdateClick} disabled={this.state.isLoading.update}>수정완료{this.state.isLoading.update && <Spinner/>}</Button> : null
        //const btnCopy = (goods.goodsNo && goods.confirm )? <ModalConfirm title={'상품복사를 진행 하시겠습니까?'} content={<Fragment>1. 마지막 저장된 내용을 기준으로 복사가 진행 됩니다<br/> &nbsp;&nbsp;복사 진행전 저장을 꼭 해 주세요<br/>2. 상품을 복사하시면, 상품리뷰와 재배이력이 원본상품에 저장/관리 됩니다. <br/> &nbsp;&nbsp;동일유형 상품만 복사하세요. </Fragment>} onClick={this.onCopyClick}><Button bg={'secondary'}>상품복사</Button></ModalConfirm> : null
        const btnCopy = (goods.goodsNo && goods.confirm )? <Button bg={'secondary'} onClick={this.onGoodsCopyPopClick}>상품복사</Button> : null
        const btnPaused = (!goods.salePaused && goods.confirm && !goods.saleStopped && !dealEnd) ? <ModalConfirm title={'판매 일시중지'} content={'일시중지 후 다시 판매개시를 할 수 있습니다. 일시중지 하시겠습니까?'} onClick={this.onGoodsPausedClick}><Button>일시중지</Button></ModalConfirm> : null
        const btnResume = (goods.salePaused && goods.confirm && !goods.saleStopped && !dealEnd) ? <ModalConfirm title={'판매재개'} content={'해당 상품을 다시 판매개시하시겠습니까?'} onClick={this.onGoodsResumeClick}><Button bg='info' fg={'white'}>판매재개</Button></ModalConfirm> : null

        const termsOfDeliveryFee = bindData.termsOfDeliveryFees.find(terms => terms.value === goods.termsOfDeliveryFee)
        let termsOfDeliveryFeeLabel
        if(termsOfDeliveryFee)
            termsOfDeliveryFeeLabel = termsOfDeliveryFee.label

        const producerWrapDeliver = this.state.producerInfo.producerWrapDeliver;
        if(producerWrapDeliver) {
            termsOfDeliveryFeeLabel = '생산자 묶음배송'
            goods.deliveryQty = this.state.producerInfo.producerWrapLimitPrice;
            goods.deliveryFee = this.state.producerInfo.producerWrapFee;
        }

        const godongGigaComp = (<Flex>
            <SingleDatePicker
                placeholder="공동구매시작일"
                date={goods.dealStartDate ? ComUtil.longToDateMoment(goods.dealStartDate) : null}
                onDateChange={this.onDateChange.bind(this,'start')}
                focused={this.state['dealStartFocusedInput']} // PropTypes.bool
                onFocusChange={({ focused }) => this.setState({ ['dealStartFocusedInput']:focused })} // PropTypes.func.isRequired
                id={"dealStartDate"} // PropTypes.string.isRequired,
                numberOfMonths={1}
                isOutsideRange={()=>false}
                withPortal
                small
                readOnly
                calendarInfoPosition="top"
                enableOutsideDays
                // daySize={45}
                verticalHeight={700}
                // renderCalendarInfo={this.renderUntilCalendarInfo.bind(this, stepNo)}
            />
            <div className="pl-1" style={{width: '100px'}}>
                <Select
                    name={'dealStartDateHH'}
                    options={this.state.hourOptions}
                    value={this.state.dealStartDateHH ? this.state.hourOptions.find(itemHH => itemHH.value === this.state.dealStartDateHH) : '00'}
                    onChange={this.onStartHHChange}
                />
            </div>
            <div className="pl-1 pr-1"><span>~</span></div>
            <SingleDatePicker
                placeholder="공동구매종료일"
                date={goods.dealEndDate ? ComUtil.intToDateMoment(goods.dealEndDate) : null}
                onDateChange={this.onDateChange.bind(this,'end')}
                focused={this.state['dealEndFocusedInput']} // PropTypes.bool
                onFocusChange={({ focused }) => this.setState({ ['dealEndFocusedInput']:focused })} // PropTypes.func.isRequired
                id={"dealEndDate"} // PropTypes.string.isRequired,
                numberOfMonths={1}
                isOutsideRange={()=>false}
                withPortal
                small
                readOnly
                calendarInfoPosition="top"
                enableOutsideDays
                // daySize={45}
                verticalHeight={700}
                // renderCalendarInfo={this.renderUntilCalendarInfo.bind(this, stepNo)}
            />
            <Span pl={1}>24(자정까지)</Span>
        </Flex>);

        const arrAuthFile = [...Array(3)]

        return(
            <Fragment>
                <div className={Style.wrap}>
                    {
                        this.state.chainLoading && <BlockChainSpinner/>
                    }
                    <Container fluid>
                        <Row>
                            <Col className='pt-2'>
                                <Alert color={'secondary'} className='small'>아래 항목 입력 후 먼저 저장을 해주세요.[임시저장]<br/>
                                    확인(판매개시) 버튼 클릭 시 상품 판매가 시작됩니다<br/>[필수{star}] 항목을 모두 입력해야 노출 가능합니다
                                </Alert>
                            </Col>
                        </Row>
                    </Container>

                    <Container>
                        <Row>
                        <Col className='border p-0'>
                            {
                                this.state.validationCnt > 0 && (
                                    <div className={Style.badge}>
                                        <Badge color="danger" pill>필수{this.state.validationCnt}</Badge>
                                    </div>
                                )
                            }
                            {
                                salesStopText
                            }
                            {
                                confirmText
                            }

                            <Container>
                                <Div bold fontSize={20}>공동구매 상품정보</Div>
                                <FormGroup>
                                    <Label className={'text-secondary small'}>대표 이미지{star}</Label>
                                    <SingleImageUploader images={goods.goodsImages} quality={1} maxFileSizeMB={10} defaultCount={10} isShownMainText={true} onChange={this.onGoodsImageChange} />
                                    <Fade in={validatedObj.goodsImages ? true : false} className="text-danger small mt-1" >{validatedObj.goodsImages}</Fade>
                                </FormGroup>
                                <h6>상세이미지업로드(소비자에게 노출되지 않는 Markdown방식 URL복사용 이미지 입니다)</h6>
                                <FormGroup>
                                    <Label className={'text-secondary small'}>이미지{star}</Label>
                                    <SingleImageUploader
                                        images={goods.contentImages}
                                        quality={1} maxFileSizeMB={10}
                                        defaultCount={10}
                                        isShownMainText={false}
                                        onChange={this.onContentImageChange}
                                        isShownCopyButton={true}
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label className={'text-secondary small'}>상품명{star}</Label>
                                    <Input name={this.names.goodsNm} value={goods.goodsNm} onChange={this.onInputChange}/>
                                    <Fade in={validatedObj.goodsNm? true : false} className="text-danger small mt-1" >{validatedObj.goodsNm}</Fade>
                                </FormGroup>
                                <FormGroup>
                                    <Label className={'text-secondary small'}>공동구매 간단설명{star}</Label>
                                    <Textarea style={{width: '100%', minHeight: 100, borderRadius: 1, border: '1px solid rgba(0,0,0,.125)'}}
                                              name={this.names.dealGoodsDesc} value={goods.dealGoodsDesc} onChange={this.onInputChange}/>
                                    <Fade in={validatedObj.dealGoodsDesc? true : false} className="text-danger small mt-1" >{validatedObj.dealGoodsDesc}</Fade>
                                </FormGroup>
                            </Container>
                            <hr/>
                            <Container>
                                <Div bold fontSize={20}>기본정보</Div>
                                <FormGroup>
                                    <Flex>
                                        <Label className={'text-secondary small'}>품목{star}</Label>
                                        <Span ml={'auto'} fg={'green'} fontSize={12}>적용 수수료 : {this.state.selectedItemFeeRate}%</Span>
                                    </Flex>
                                    {
                                        !isTempProdAdmin ?
                                            goods.confirm ? <div>{goods.itemName}</div> : (
                                                <Fragment>
                                                    <Select options={bindData.items}
                                                            value={ bindData.items.find(item => item.value === goods.itemNo)}
                                                            onChange={this.onItemChange}
                                                    />
                                                    <Fade in={validatedObj.itemNo? true : false} className="text-danger small mt-1" >{validatedObj.itemNo}</Fade>
                                                </Fragment>
                                            ) :
                                            <Fragment>
                                                <Select options={bindData.items}
                                                        value={ bindData.items.find(item => item.value === goods.itemNo)}
                                                        onChange={this.onItemChange}
                                                />
                                                <Fade in={validatedObj.itemNo? true : false} className="text-danger small mt-1" >{validatedObj.itemNo}</Fade>
                                            </Fragment>
                                    }


                                </FormGroup>
                                <FormGroup>
                                    <Label className={'text-secondary small'}>품종{star}</Label>
                                    {
                                        !isTempProdAdmin ?
                                            goods.confirm ? <div>{goods.itemKindName}</div> : (
                                                <Fragment>
                                                    <Select options={bindData.itemKinds}
                                                            value={goods.itemKindCode ? bindData.itemKinds.find(itemKind => itemKind.value === goods.itemKindCode) : null}
                                                            onChange={this.onItemKindChange}
                                                    />
                                                    <Fade in={validatedObj.itemKind? true : false} className="text-danger small mt-1" >{validatedObj.itemKind}</Fade>
                                                </Fragment>
                                            ) :
                                            <Fragment>
                                                <Select options={bindData.itemKinds}
                                                        value={goods.itemKindCode ? bindData.itemKinds.find(itemKind => itemKind.value === goods.itemKindCode) : null}
                                                        onChange={this.onItemKindChange}
                                                />
                                                <Fade in={validatedObj.itemKind? true : false} className="text-danger small mt-1" >{validatedObj.itemKind}</Fade>
                                            </Fragment>
                                    }
                                </FormGroup>
                                <FormGroup>
                                    <Label className={'text-secondary small'}>생산지{star}</Label>
                                    <Input name={this.names.productionArea} value={goods.productionArea} placeholder='ex)전남 여수' onChange={this.onInputChange} />
                                    <Fade in={validatedObj.productionArea? true : false} className="text-danger small mt-1" >{validatedObj.productionArea}</Fade>
                                </FormGroup>
                                <FormGroup>
                                    <Label className={'text-secondary small'}>재배방법</Label>
                                    {/*<RadioButtons nameField='cultivationNm' value={goods.cultivationNm} defaultIndex={0} data={bindData.cultivationNm || []} onClick={this.onCultivationNmClick} />*/}
                                    <RadioButtons
                                        value={bindData.cultivationNm.find(item => item.value === goods.cultivationNm)}
                                        options={bindData.cultivationNm} onClick={this.onCultivationNmClick} />
                                    <Fade in={validatedObj.cultivationNm? true : false} className="text-danger small mt-1" >{validatedObj.cultivationNm}</Fade>
                                </FormGroup>
                                <FormGroup>
                                    <Label className={'text-secondary small'}>농약유무</Label>
                                    <RadioButtons
                                        value={bindData.pesticideYn.find(item => item.value === goods.pesticideYn)}
                                        options={bindData.pesticideYn} onClick={this.onPesticideYnClick} />
                                    <Fade in={validatedObj.pesticideYn? true : false} className="text-danger small mt-1" >{validatedObj.pesticideYn}</Fade>
                                    {/*<RadioButtons nameField='pesticideYn' defaultIndex={0} data={bindData.pesticideYn || []} onClick={this.onPesticideYnClick} />*/}
                                </FormGroup>
                                <FormGroup>
                                    <Label className={'text-secondary small'}>과세여부</Label>
                                    <Fragment>
                                        <div className='d-flex align-items-center'>

                                            {
                                                bindData.vatFlag.map((item, index) => {
                                                        const id = `vatFlag_${index}`
                                                        return(
                                                            <Fragment key={id}>
                                                                <input
                                                                    checked={  (goods.vatFlag !== '' && goods.vatFlag === item.value ) ? true : false}
                                                                    className={'mr-2'}
                                                                    type="radio"
                                                                    id={id}
                                                                    name="vatFlag"
                                                                    value={item.value}
                                                                    onChange={this.onVatChange} />
                                                                <label for={id} className='p-0 m-0 mr-3'>{item.label}</label>
                                                            </Fragment>
                                                        )
                                                    }
                                                )
                                            }
                                        </div>

                                        <Fade in={validatedObj.vatFlag? true : false} className="text-danger small mt-1" >{validatedObj.vatFlag}</Fade>
                                    </Fragment>
                                </FormGroup>
                            </Container>
                            {
                                this.state.producerInfo.pbFlag &&
                                <Container>
                                    <hr/>
                                    <Div bold fontSize={20}>PB상품 정보</Div>
                                    <Flex py={10}>
                                        <Div mr={10}>PB상품 여부</Div>
                                        <SwitchButton checked={goods.pbFlag} onChange={this.onPbFlagChange} />
                                    </Flex>
                                    <FormGroup>
                                        <div>
                                            <Label className={'text-secondary small'}>농가번호{goods.pbFlag && <Required/>}</Label>
                                            <Input style={{width:400}} name={this.names.pbFarmerCode} value={goods.pbFarmerCode} onChange={this.onInputChange}/>
                                        </div>
                                        <div>
                                            <Label className={'text-secondary small'}>품목번호{goods.pbFlag && <Required/>}</Label>
                                            <Input style={{width:400}} name={this.names.pbItemCode} value={goods.pbItemCode} onChange={this.onInputChange}/>
                                        </div>
                                    </FormGroup>
                                </Container>
                            }

                            <hr/>
                            <Container>
                                <h6>상품정보제공 고시 설정</h6>
                                <FormGroup>
                                    <Label className={'text-secondary small'}>분류선택{star}</Label>
                                    {
                                        <Fragment>
                                            <div className='d-flex'>
                                                <div style={{width:'500px'}}>
                                                    <Select options={bindData.goodsTypes}
                                                            value={ bindData.goodsTypes.find(item => item.value === goods.goodsTypeCode)}
                                                            onChange={this.onGoodsTypeChange}
                                                    />
                                                </div>
                                                <div className='d-flex align-items-center justify-content-center'>
                                                    {
                                                        goods.goodsTypeCode != 'none' &&
                                                        <Button ml={2} size='sm' bg='secondary' onClick={this.goodsTypeSetting}>설정</Button>
                                                    }
                                                </div>
                                            </div>
                                            <Fade in={validatedObj.goodsTypeCode? true : false} className="text-danger small mt-1" >{validatedObj.goodsTypeCode}</Fade>
                                        </Fragment>
                                    }
                                </FormGroup>
                            </Container>
                            <hr/>
                            <Container>
                                <Div bold fontSize={20}>판매정보</Div>
                                <FormGroup>
                                    <Label className={'text-secondary small'}>포장 양{star}</Label>
                                    {/*{*/}
                                    {/*    goods.confirm ? <div>{ComUtil.addCommas(goods.packAmount)}</div> : (*/}
                                    <Fragment>
                                        <Input type="number" className={'mr-1'} name={this.names.packAmount} value={goods.packAmount} onChange={this.onInputChange}/>
                                        <Fade in={validatedObj.packAmount? true : false} className="text-danger small mt-1" >{validatedObj.packAmount}</Fade>
                                    </Fragment>
                                    {/*    )*/}
                                    {/*}*/}
                                </FormGroup>
                                <FormGroup>
                                    <Label className={'text-secondary small'}>포장 단위{star}</Label>
                                    {/*{*/}
                                    {/*    goods.confirm ? <div>{ComUtil.addCommas(goods.packAmount)}</div> : (*/}
                                    <Fragment>
                                        <div className='d-flex align-items-center'>

                                            {
                                                bindData.packUnit.filter(item=>item.value !== '99').map((item, index) => {
                                                        const id = `packUnit_${index}`
                                                        return(
                                                            <Fragment key={id}>
                                                                <input
                                                                    checked={goods.packUnit === item.value ? true : false}
                                                                    className={'mr-2'}
                                                                    type="radio"
                                                                    id={id}
                                                                    name="packUnit"
                                                                    value={item.value}
                                                                    onChange={this.onPackUnitChange} />
                                                                <label for={id} className='p-0 m-0 mr-3'>{item.label}</label>
                                                            </Fragment>
                                                        )
                                                    }
                                                )
                                            }

                                            <input
                                                checked={this.isEtcPackUnit()}
                                                className={'mr-2'}
                                                type="radio"
                                                id={'packUnit_3'}
                                                name="packUnit"
                                                value={bindData.packUnit[3].value}
                                                onChange={this.onPackUnitChange} />
                                            <label for={'packUnit_3'} className='p-0 m-0 mr-3'>{bindData.packUnit[3].label}</label>
                                        </div>

                                        <Input
                                            className={'mt-2'}
                                            // style={{display: document.getElementById('packUnit_3').checked ? 'block' : 'none'}}
                                            innerRef={this.inputPackUnit}
                                            value={goods.packUnit}
                                            onChange={this.onInputPackUnitChange}
                                            placeholder={'l(리터), 개, 등의 단위 입력'}
                                        />

                                        <Fade in={validatedObj.packUnit? true : false} className="text-danger small mt-1" >{validatedObj.packUnit}</Fade>
                                    </Fragment>
                                    {/*    )*/}
                                    {/*}*/}
                                </FormGroup>
                            </Container>
                            <hr/>
                            <Container>
                                <Div bold fontSize={20}>가격정보</Div>
                                <FormGroup>
                                    <Label className={'text-secondary small'}>소비자가{star}</Label>
                                    <Fragment>
                                        <InputGroup  size={'md'}>
                                            <CurrencyInput name={this.names.consumerPrice} value={goods.consumerPrice} onChange={this.onInputChange} placeholder={'소비자가'}/>
                                            <InputGroupAddon addonType="append">
                                                <InputGroupText>원</InputGroupText>
                                            </InputGroupAddon>
                                        </InputGroup>
                                        <Fade in={validatedObj.consumerPrice ? true : false} className="text-danger small mt-1" >{validatedObj.consumerPrice}</Fade>
                                    </Fragment>
                                </FormGroup>
                                <FormGroup>
                                    <div className={'d-flex'}>
                                        <Label className={'text-secondary small'}>판매가{star}</Label>
                                        <span className={'ml-auto text-secondary small'}>{Math.round(ComUtil.addCommas(goods.discountRate),0)} %
                                            {
                                                goods.consumerPrice && goods.consumerPrice > 0 && goods.currentPrice && goods.currentPrice > 0 && (
                                                    ` (- ${ ComUtil.addCommas(ComUtil.toNum(goods.consumerPrice) - ComUtil.toNum(goods.currentPrice))} 원) `
                                                )
                                            }
                                            할인
                                                </span>
                                    </div>
                                    <Fragment>
                                        <InputGroup  size={'md'}>
                                            <CurrencyInput name={this.names.currentPrice} value={goods.currentPrice} onChange={this.onInputChange} placeholder={`판매가`}/>
                                            <InputGroupAddon addonType="append">
                                                <InputGroupText>원</InputGroupText>
                                            </InputGroupAddon>
                                        </InputGroup>
                                        {/*<Flex>*/}
                                        {/*    <Fade in={validatedObj.currentPrice ? true : false} className="text-danger small mt-1" >{validatedObj.currentPrice}</Fade>*/}
                                        {/*    <Right fontSize={12} fg={'green'} mt={5}>*/}
                                        {/*        정산예정금 &nbsp;*/}
                                        {/*        {ComUtil.addCommas(ComUtil.toNum(goods.currentPrice) - (ComUtil.toNum(goods.currentPrice)*ComUtil.toNum(this.state.selectedItemFeeRate)*0.01))} 원*/}
                                        {/*    </Right>*/}
                                        {/*</Flex>*/}
                                        {/*<Flex>*/}
                                        {/*    <Right textAlign={'right'} fg={'dark'} fontSize={12}>*/}
                                        {/*        - 배송비 조건에 따라 다를 수 있습니다.  <br/>*/}
                                        {/*        - 행사 진행 시 사전협의된 금액으로 정산됩니다.*/}
                                        {/*    </Right>*/}
                                        {/*</Flex>*/}
                                    </Fragment>
                                </FormGroup>
                            </Container>
                            <hr/>
                            <Container>
                                <Div bold fontSize={20}>배송정보</Div>
                                <FormGroup>
                                    <Label className={'text-secondary small'}>무료배송 조건{star}</Label>
                                    <Fragment>
                                        <InputGroup>
                                            <CurrencyInput
                                                disabled={goods.termsOfDeliveryFee === TERMS_OF_DELIVERYFEE.NO_FREE || goods.termsOfDeliveryFee === TERMS_OF_DELIVERYFEE.FREE} readOnly={producerWrapDeliver}
                                                style={{width:50}} name={this.names.deliveryQty} value={goods.deliveryQty} onChange={this.onInputChange} placeholder={'배송조건(숫자)'}/>
                                            <InputGroupButtonDropdown addonType="append" style={{zIndex:0}} isOpen={this.state.isDeliveryFeeTermsOpen} toggle={()=>this.setState({isDeliveryFeeTermsOpen:!this.state.isDeliveryFeeTermsOpen})}>
                                                <DropdownToggle caret>
                                                    {
                                                        termsOfDeliveryFeeLabel
                                                    }
                                                </DropdownToggle>
                                                { producerWrapDeliver ? null :
                                                    <DropdownMenu>
                                                        {
                                                            bindData.termsOfDeliveryFees.map((terms, index) =>
                                                                <DropdownItem
                                                                    key={'termsOfDeliveryFees' + index}
                                                                    onClick={this.onTermsOfDeliveryFeeChange.bind(this, terms)}>{terms.label}</DropdownItem>)
                                                        }
                                                    </DropdownMenu>
                                                }
                                            </InputGroupButtonDropdown>
                                        </InputGroup>
                                        <Fade in={validatedObj.deliveryQty ? true : false} className="text-danger small mt-1" >{validatedObj.deliveryQty}</Fade>
                                    </Fragment>
                                    {/*    )*/}
                                    {/*}*/}
                                </FormGroup>
                                <FormGroup>
                                    <Label className={'text-secondary small'}>배송비{star}</Label>
                                    <Fragment>
                                        <CurrencyInput disabled={goods.termsOfDeliveryFee === TERMS_OF_DELIVERYFEE.FREE}  name={this.names.deliveryFee} value={goods.deliveryFee} onChange={this.onInputChange} placeholder={'배송비'} readOnly={producerWrapDeliver}/>
                                        <Fade in={validatedObj.deliveryFee ? true : false} className="text-danger small mt-1" >{validatedObj.deliveryFee}</Fade>
                                    </Fragment>
                                </FormGroup>
                            </Container>
                            <hr/>
                            <Container>
                                <h5>공동구매기간{star}</h5>
                                {
                                    goods.dealCount > 0 && <Div fg={'danger'} fontSize={12} ml={1}>*판매건수가 존재합니다. 기간변경시 주의</Div>
                                }
                                {
                                    !isTempProdAdmin ?
                                        (
                                            goods.confirm ?
                                                (
                                                    goods.dealCount > 0 ?
                                                        <Flex>
                                                            {ComUtil.intToDateString(goods.dealStartDate,'YYYY-MM-DD HH')} ~ {ComUtil.intToDateString(goods.dealEndDate,'YYYY-MM-DD')} 24(자정까지)
                                                        </Flex>
                                                        :
                                                        <>{godongGigaComp}</>
                                                )
                                                :
                                                <>{godongGigaComp}</>
                                        )
                                        :
                                        <>{godongGigaComp}</>
                                }
                            </Container>

                            <hr/>

                            <Container>
                                <h5>공동구매 정보 입력</h5>
                                <FormGroup>
                                    <Label className={'text-secondary small'}>최소판매개수{star}</Label>
                                    <Fragment>
                                        <InputGroup  size={'md'}>
                                            <CurrencyInput name={this.names.dealMinCount} value={goods.dealMinCount} onChange={this.onInputChange} />
                                        </InputGroup>
                                    </Fragment>
                                </FormGroup>
                                {/*<FormGroup>*/}
                                {/*    <Label className={'text-secondary small'}>최대판매개수{star}</Label>*/}
                                {/*    <Fragment>*/}
                                {/*        <InputGroup  size={'md'}>*/}
                                {/*            <CurrencyInput name={this.names.dealMaxCount} value={goods.dealMaxCount} onChange={this.onInputChange} />*/}
                                {/*        </InputGroup>*/}
                                {/*    </Fragment>*/}
                                {/*</FormGroup>*/}
                                {/*<FormGroup>*/}
                                {/*    <Label className={'text-secondary small'}>공동구매 진행단계{star} <Span fontSize={12}>(ex.생산,선별,포장,출하 등)</Span></Label>*/}
                                {/*    <Flex>*/}
                                {/*        <Input type='text' name={'dealStepName0'} value={goods.stepNames[0] ? goods.stepNames[0].stepName: ''} onChange={this.onStepNamesChange} />*/}
                                {/*        <Input type='text' name={'dealStepName1'} value={goods.stepNames[1] ? goods.stepNames[1].stepName: ''} onChange={this.onStepNamesChange} />*/}
                                {/*        <Input type='text' name={'dealStepName2'} value={goods.stepNames[2] ? goods.stepNames[2].stepName: ''} onChange={this.onStepNamesChange} />*/}
                                {/*        <Input type='text' name={'dealStepName3'} value={goods.stepNames[3] ? goods.stepNames[3].stepName: ''} onChange={this.onStepNamesChange} />*/}
                                {/*    </Flex>*/}
                                {/*</FormGroup>*/}
                            </Container>

                            <Container>
                                <h5>옵션 정보</h5>
                                <Flex>
                                    {
                                        goods.confirm ? <Div fonSize={10} fg={'danger'}>*판매가 시작되면 일부 옵션 정보는 수정하실 수 없습니다.</Div>
                                            : <Button mb={10} bg={'green'} fg={'white'} px={10} onClick={this.addOptionClick}><FaPlusCircle/>{' 행추가'}</Button>
                                    }
                                    <Right textAlign={'right'} fg={'dark'} fontSize={12}>
                                        <Div fg={'green'}>* 정산예정금</Div>
                                        - 배송비 조건에 따라 다를 수 있습니다.  <br/>
                                        - 행사 진행 시 사전협의된 금액으로 정산됩니다.
                                    </Right>
                                </Flex>
                                {
                                    validatedObj.options &&
                                    <Div fg={'danger'} fontSize={12} ml={1}>첫번째 옵션 상품은 기본 상품입니다. (판매수량만 확인해 주세요) </Div>
                                }
                                {
                                    goods.options.map((item,index)=>{
                                        return (
                                            <Flex key={item.optionIndex} custom={`& button {flex-shrink: 0;} > div {width: unset;}`}>
                                                <SingleImageUploader
                                                    images={item.optionImages}
                                                    defaultCount={1}
                                                    isShownMainText={false}
                                                    onChange={this.onOptionImageChange.bind(this, index)}
                                                    quality={1}
                                                />
                                                <OptionInput type="text"
                                                             underLine
                                                             // readOnly={(index==0)?true:false}
                                                             mr={10}
                                                             width={300}
                                                             name={'optionName'}
                                                             value={item.optionName}
                                                             // value={(index==0)? goods.goodsNm:item.optionName}
                                                             onChange={this.onOptionInputChange.bind(this, index)}
                                                             //onBlur={this.onBlurOptionName.bind(this, index)}
                                                             placeholder={'옵션명' + ((index==0)?' (상품명)': ' (필수)')} />
                                                <OptionInput type="number"
                                                             underLine
                                                             mr={10}
                                                             name={'packCnt'}
                                                             value={item.packCnt}
                                                             onChange={this.onOptionInputChange.bind(this, index)}
                                                             onBlur={this.onBlur.bind(this, index)}
                                                             disabled={goods.confirm}
                                                             placeholder={'판매수량'} />
                                                <OptionInput type="number"
                                                             underLine
                                                             readOnly={(index==0)?true:false}
                                                             mr={10}
                                                             name={'optionPrice'}
                                                             onChange={this.onOptionInputChange.bind(this, index)}
                                                             value={(index==0)? goods.currentPrice:item.optionPrice}
                                                             disabled={goods.confirm}
                                                             placeholder={'가격'} />
                                                {
                                                    this.state.isTempProdAdmin ? ( //숨김은 관리자만 가능 (수정모드/신규모드 상관없이 )
                                                        !goods.options[index].deleted ?
                                                            <Button   bg={'secondary'}  fg={'white'}
                                                                onClick={this.onHideClick.bind(this, {index})}>숨김
                                                            </Button>
                                                            :
                                                            <Button bg={'danger'} fg={'white'}
                                                                    onClick={this.onHideClick.bind(this,{index})}
                                                            >숨김해제(현재 숨김상태임)</Button>
                                                    ) : //생산자에게는 숨김상태인지 알려만 줌.
                                                        goods.options[index].deleted ? <Div fg={'danger'}> 숨김상태입니다.(관리자가에 의한 설정)</Div> : null
                                                }
                                                {
                                                    index != 0 && !goods.confirm && //수정모드에선 삭제는 안됨. (!goods.confirm = 신규입력모드)
                                                    <Button bg={'warning'} fg={'white'} ml={10}
                                                            onClick={this.onDeleteClick.bind(this, {index})}>삭제
                                                    </Button>
                                                }
                                                <Div ml={3} fg={'green'} fontSize={12}>
                                                    <Div>정산예정금</Div>
                                                    {
                                                        index != 0 ?
                                                            <Div>{ComUtil.addCommas(ComUtil.toNum(goods.options[index].optionPrice) - (ComUtil.toNum(goods.options[index].optionPrice)*ComUtil.toNum(this.state.selectedItemFeeRate)*0.01))} 원</Div>
                                                            :
                                                            <Div>{ComUtil.addCommas(ComUtil.toNum(goods.currentPrice) - (ComUtil.toNum(goods.currentPrice)*ComUtil.toNum(this.state.selectedItemFeeRate)*0.01))} 원</Div>
                                                    }
                                                </Div>
                                            </Flex>
                                        )
                                    })
                                }
                            </Container>

                            <hr/>
                            <Container>
                                <h5>발송일{star}</h5>
                                <DateRangePicker
                                    startDateId='expectShippingStart'
                                    endDateId='expectShippingEnd'
                                    startDatePlaceholderText="시작일"
                                    endDatePlaceholderText="종료일"
                                    startDate={goods.expectShippingStart ? moment(goods.expectShippingStart) : null}
                                    endDate={goods.expectShippingEnd ? moment(goods.expectShippingEnd) : null}
                                    onDatesChange={this.onExpectShippingChange}
                                    focusedInput={this.state.focusedInput}
                                    onFocusChange={(focusedInput) => { this.setState({ focusedInput })}}
                                    numberOfMonths={1}          //달력 갯수(2개로 하면 모바일에서는 옆으로 들어가버리기 때문에 orientation='vertical'로 해야함), pc 에서는 상관없음
                                    orientation={'horizontal'}
                                    openDirection="up"
                                    isOutsideRange={()=>false}
                                    withPortal
                                    small
                                    readOnly
                                    showClearDates
                                    calendarInfoPosition="top"
                                />
                                <Fade in={validatedObj.expectShippingDate ? true : false} className="text-danger small mt-1" >{validatedObj.expectShippingDate}</Fade>
                            </Container>

                            <hr/>

                            <Container>
                                <h5>인증마크 서류</h5>
                                {
                                    arrAuthFile.map((empty, index) => {
                                        const vFileNo = index + 1;
                                        const authFile = goods.authFiles && goods.authFiles.length > 0 ? goods.authFiles.find((authFile) => authFile && authFile.fileNo === vFileNo) : {fileNo: vFileNo, filePath: '', fileName:'', fileExtsn: ''}
                                        return(
                                            <FormGroup inline>
                                                <Row>
                                                    <Col sm={9}>
                                                        <SingleFileUploader name={index} fileNo={vFileNo} fileGubun='producerauthfile' file={authFile} onChange={this.onAuthFileChange}/>
                                                    </Col>
                                                </Row>
                                            </FormGroup>
                                        )
                                    })
                                }
                                <Fade in={true} className="text-danger small mt-1">{star}국가 인증마크를 많이 업로드할수록, 검색시 상위리스트로 노출될 가능성이 높아집니다.</Fade>
                            </Container>

                            <Container>
                                <Div mt={10}>
                                    <AuthMark
                                        isPrint={!isTempProdAdmin}
                                        infoValues={this.state.goods.authMarkInfo}
                                        onChange={this.onAuthMarkChange}
                                    />
                                </Div>
                            </Container>

                            <hr/>

                            <Container>
                                <h5>상품상세설명{star}</h5>
                                <FormGroup>
                                    <Div mb={5}>
                                        <Space>
                                            <RSButton onClick={this.onTemplateClick.bind(this,'BASIC')} bg={'secondary'} fg={'white'}>템플릿양식(일반)</RSButton>
                                            <RSButton onClick={this.onTemplateClick.bind(this,'AHP')} bg={'secondary'} fg={'white'}>템플릿양식[축산(돼지)]</RSButton>
                                            <RSButton onClick={this.onTemplateClick.bind(this,'AHC')} bg={'secondary'} fg={'white'}>템플릿양식[축산(소)]</RSButton>
                                        </Space>
                                    </Div>
                                    <SummernoteEditor
                                        height={700}
                                        quality={1}
                                        onChange={this.onChangeGoodsContent}
                                        editorHtml={goods.goodsContent||null}
                                    />
                                    <FormGroup>
                                        <Fade in={validatedObj.goodsContent ? true : false} className="text-danger small mt-1" >{validatedObj.goodsContent}</Fade>
                                    </FormGroup>
                                </FormGroup>
                            </Container>
                            <hr/>

                            <Container>
                                <Flex>
                                    <h5>#상품 태그</h5>
                                    <small>상품 검색 또는 상품의 연관된 상품을 찾기위해 사용 됩니다.(상품상세의 연관상품 에서)</small>
                                </Flex>
                                <FormGroup>
                                    <Label className={'text-secondary small'}>"#"을 제외한 노출될 단어를 입력해 주세요. 예) 상추, 사과, 유기농, 이력추적, 존맛탱, 선물, 추천상품</Label>
                                    <Tag tags={goods.tags} onChange={this.onTagChange} />
                                </FormGroup>
                            </Container>
                            {
                                this.state.isTempProdAdmin && (
                                    <Container>
                                        <Flex>
                                            <h5>#그룹 태그</h5>
                                            <small>상품의 그룹(카테고리) 태그 입니다. 관리자의 그룹태그관리와 연동되어 사용 되며 상품검색에서 사용 되지 않습니다.</small>
                                        </Flex>
                                        <FormGroup>
                                            <Label className={'text-secondary small'}>"#"을 제외한 노출될 단어를 입력해 주세요. 예) 제철상품, 사과베스트</Label>
                                            <Tag tags={goods.groupTags} onChange={this.onGroupTagChange} />
                                        </FormGroup>
                                    </Container>
                                )
                            }
                        </Col>
                    </Row>

                    </Container>
                    <br/>
                    {/* 버튼 */}
                    <Container>
                        <Row>
                            <Col className='p-0'>
                                <div className='d-flex align-items-center justify-content-center'>
                                    <Div mr={5}>
                                        {btnAddTempGoods}
                                    </Div>
                                    <Div mr={5}>
                                        {btnCopy}
                                    </Div>
                                    <Div mr={5}>
                                        {btnPreview}
                                    </Div>
                                    {this.state.isTempProdAdmin ?
                                        (
                                            <Div mr={5}>{btnConfirm}</Div>
                                        )
                                        :
                                        (
                                            <Div mr={5}>{btnConfirmReq}</Div>
                                        )
                                    }
                                    <Div mr={5}>
                                        {btnUpdate}
                                    </Div>
                                    <Div mr={5}>
                                        {btnDelete}
                                    </Div>
                                    <Div mr={5}>
                                        {btnPaused}
                                    </Div>
                                    <Div mr={5}>
                                        {btnResume}
                                    </Div>
                                    <Div mr={5}>
                                        {btnGoodsStop}
                                    </Div>
                                </div>
                            </Col>
                        </Row>
                    </Container>

                    {
                        this.state.isGoodsCopySelectionOpen && (
                            <ModalPopup
                                title={'상품 복사 종류 선택'}
                                onClick={this.onGoodsCopySelectionPopupClose}
                                showFooter={false}
                                content={
                                    <div>
                                        <Container>
                                            <Row>
                                                <Col xs={6}>
                                                    <Button className={'mb-2'} color={'warning'} size={'lg'} block onClick={this.onGoodsCopyPopupClick.bind(this, true)}>동일 상품 복사</Button>
                                                    <div className={'small text-center text-secondary f6'}>
                                                        <div className={'mb-2'}>
                                                            - 마지막 저장된 내용을 기준으로 복사가 진행 됩니다. <br/><b className={'text-warning'}>복사 진행전 저장을 꼭 해 주세요</b>
                                                        </div>
                                                        <div>
                                                            - 상품을 복사하시면, <br/><b className={'text-warning'}>상품리뷰와 재배이력</b>이 원본상품에 저장/관리 됩니다. <br/><b className={'text-warning'}>동일유형 상품만 복사하세요.</b>
                                                        </div>
                                                    </div>
                                                </Col>
                                                <Col xs={6}>
                                                    <Button className={'mb-2'} color={'info'} size={'lg'} block onClick={this.onGoodsCopyPopupClick.bind(this, false)}>다른 상품 복사</Button>
                                                    <div className={'small text-center text-secondary f6'}>
                                                        <div className={'mb-2'}>
                                                            - 다른 상품으로 복사할 경우에 <br/>복사를 <b className={'text-warning'}>신규</b>로 하실 수 있습니다. <br/><b className={'text-warning'}>복사 진행전 저장을 꼭 해 주세요</b>
                                                        </div>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Container>
                                    </div>
                                }/>
                        )
                    }

                    <ModalWithNav show={this.state.isOpen} title={'상품미리보기'} onClose={this.onPreviewClose} noPadding={true}>
                        <Container>
                            <Row>
                                <Col className='p-0 position-relative'>
                                    <iframe
                                        src={`/goods?goodsNo=${goods.goodsNo}`}
                                        style={{width: '100%', height: 760}}
                                    ></iframe>
                                </Col>
                            </Row>
                        </Container>
                    </ModalWithNav>

                    {/* 상품정보제공 고시 설정 입력 */}
                    <ModalWithNav show={this.state.goodsTypeModalOpen} title={'고시 항목 설정'} onClose={this.onGoodsTypeModal} noPadding={true}>
                        {
                            <Agricultural
                                code={this.state.goods.goodsTypeCode}
                                infoValues={this.state.goods.goodsInfoData[this.state.goods.goodsTypeCode]}
                                onClose={this.onGoodsTypeModal}
                            />
                        }
                    </ModalWithNav>

                    {/*<ToastContainer />  /!* toast 가 그려질 컨테이너 *!/*/}

                </div>
            </Fragment>
        )
    }

}