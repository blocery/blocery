import React, {Component, Fragment, useState, useRef, useEffect} from 'react'
import {
    Row,
    Col,
    Input,
    FormGroup,
    Label,
    Button,
    Fade,
    Badge,
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    DropdownMenu,
    InputGroupButtonDropdown,
    DropdownToggle,
    DropdownItem,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Collapse, Container
} from 'reactstrap'
import {
    RadioButtons,
    SingleImageUploader,
    SingleFileUploader,
    ModalConfirm,
    ModalPopup,
    SwitchButton
} from '~/components/common'
import Style from './WebGoodsReg.module.scss'
import { addGoods, copyGoodsByGoodsNo } from '~/lib/goodsApi'
import {getProducer, getProducerGoodsRegStopChk, getProducerByProducerNo, checkLocalGoodsDuplicate} from '~/lib/producerApi'
import { getGoodsByGoodsNo, deleteGoods, updateConfirmGoods, updateGoodsSalesStop, getGoodsContent, updateSalePaused, getBlyReview, sendPriceUpdateMail} from '~/lib/goodsApi'
import { getItems } from '~/lib/adminApi'
import {getLoginProducerUser, checkPassPhraseForProducer, getLoginAdminUser} from '~/lib/loginApi'
import { toast } from 'react-toastify'                              //토스트
import ComUtil from '~/util/ComUtil'
import Select from 'react-select'
import moment from 'moment-timezone'
import 'react-dates/initialize';
import { DateRangePicker, SingleDatePicker } from 'react-dates';
import { BlocerySpinner, Spinner, BlockChainSpinner, ModalWithNav, PassPhrase, AuthMark, Agricultural } from '~/components/common'
import LocalFarmerModal from '~/components/common/modals/LocalFarmerModal'

import CurrencyInput from '~/components/common/inputs/CurrencyInput'
import {Div, Right, Span, Flex, Space, JustListSpace, ListBorder, GridColumns} from "~/styledComponents/shared/Layouts";
import {Button as StyledButton} from "~/styledComponents/shared/Buttons";

import { TERMS_OF_DELIVERYFEE } from '~/lib/bloceryConst'

import SummernoteEditor from "~/components/common/summernoteEditor";
import Tag from "~/components/common/hashTag/HashTagInput";

import Template from "~/util/Template";
import {FaPlusCircle} from "react-icons/fa";
import {Input as OptionInput} from "~/styledComponents/shared";
import AdminLayouts from '~/styledComponents/shared/AdminLayouts'
import {Server} from "~/components/Properties";
import {Required} from "~/styledComponents/ShopBlyLayouts";
import {getValue} from "~/styledComponents/Util";
import {color} from "~/styledComponents/Properties";
import styled from 'styled-components'
import Checkbox from "~/components/common/checkboxes/Checkbox";
import {IoIosArrowUp, IoIosArrowDown} from 'react-icons/io'
import EventList from "~/components/admin/eventList";
import {useModal} from "~/util/useModal";
import Switch from "react-switch";
import SearchInput from "~/components/common/SearchInput";

let validatedObj = {}

let bindData = {
    cultivationNm: [],//재배방법
    pesticideYn: null,  //농약유무
    items: [],         //품목
    itemKinds: [],      //품종
    packUnit: null,     //포장단위
    priceSteps: [],      //상품 할인단계
    termsOfDeliveryFees: [],      //배송비 조건 정책
    goodsTypes: [],
    vatFlag: null,         // 과세여부
}

const BorderContainer = styled.div`
    border-radius: ${getValue(3)};
    border: 1px solid ${color.light};
    background: ${color.white};
`

const Body = styled.div`
    ${p => !p.noPadding && `
        padding-left: ${getValue(16)};
        padding-right: ${getValue(16)};
        padding-bottom: ${getValue(16)};
    `}
`

const Heading = styled.div`
    font-weight: bold;
    font-size: ${getValue(20)};
`


const CollapseContainer = ({title, subTitle, isOpen = true, children}) => {
    const [modalOpen, setModalOpen, selected, setSelected, setModalState, toggle] = useModal(isOpen)
    return(
        <BorderContainer>
            <Flex p={16}>
                <Flex>
                    <Heading>{title}</Heading>
                    <small>{subTitle}</small>
                </Flex>
                <Right>
                    <Button onClick={toggle} width={45}>{modalOpen? <IoIosArrowUp /> : <IoIosArrowDown />}</Button></Right>
            </Flex>
            <Collapse isOpen={modalOpen}>
                {children}
            </Collapse>
        </BorderContainer>
    )
}


// const Heading = ({children}) => <Div bold fontSize={20}>{children}</Div>
const StyledRow = styled(Div)`
    position: relative;

    ${p => p.isHover && `
        &:hover {
        
            background: ${color.veryLight};
        
            & > div:last-child {
                display: block;
            }
        }
    `}
`

function RowWrapper({children, onClick, isAdmin, eventFlag, }) {
    return (
        <StyledRow p={eventFlag && 8} px={!eventFlag && 8} bc={eventFlag && 'green'} isHover={isAdmin}>
            {
                eventFlag && (
                    <Div fontSize={11} mb={4}>
                        <b>이벤트 상품으로 지정 됨</b> (포텐타임, 슈퍼리워드 기간에는 소비자에게 현재 옵션만 보여집니다)
                    </Div>
                )
            }
            <Flex alignItems={'flex-end'} relative>
                {children}
            </Flex>
            {/* hover 될 때 까지 감춰질 박스 */}
            <Div id={'hoverContent'} absolute bottom={0} right={0} pl={4} display={'none'} zIndex={1} custom={`
                        transform: translateX(100%);
                    `}>
                <AdminLayouts.MenuButton height={45} onClick={onClick} fg={eventFlag ? 'danger' : 'green'}>{eventFlag ? '이벤트 상품 취소' : '이벤트 상품 지정'}</AdminLayouts.MenuButton>
            </Div>
        </StyledRow>

    )
}

function CustomInput ({index, value, name, onChange, onBlur, ...rest}) {
    const [inputValue, setValue] = useState(value)
    const inputRef = useRef();
    useEffect(() => {
        setValue(value)
    }, [value])
    const onFocus = () => {
        inputRef.current.select()
    }
    const onHandleChange = (e) => {
        setValue(e.target.value)

        if (onChange && typeof onChange === 'function')
            onChange({index, value: e.target.value, name: name})
    }
    const onHandleBlur = (e) => {
        if (onBlur && typeof onBlur === 'function')
            onBlur({index, value: e.target.value, name: name})
    }
    return <OptionInput {...rest} ref={inputRef} value={inputValue} onFocus={onFocus} onChange={onHandleChange} onBlur={onHandleBlur}/>
}

// 즉시상품
export default class WebDirectGoodsReg extends Component {
    editorRef = React.createRef();

    constructor(props) {
        super(props);

        const { goodsNo } = this.props

        this.state = {
            showAllOptions: false,  //옵션전체보기
            startDate: null,
            endDate: null,
            focusedInput: null,
            isDeliveryFeeTermsOpen: false,//배송정책 종류 dropdown open 여부

            isOpen: false,
            goodsTypeModalOpen: false,
            isGoodsCopySelectionOpen: false,
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
                goodsImages: [],	        //상품이미지
                authFiles:[],
                searchTag: '',	        //태그
                itemNo: '',	            //품목번호
                itemName: '',	              //품목
                itemKindCode: '',             //품종번호
                itemKindName: '',             //품종명
                //breedNm: '',	          //품종
                productionArea: '',	      //생산지
                //cultivationNo: '',	  //재배방법번호
                cultivationNm: '토지',	  //재배방법명
                saleEnd: null,      //판매마감일
                productionStart: '',      //수확시작일
                settingExpectShipping: false,       //(발송일) 설정여부
                expectShippingStart: '',  //예상출하(발송)시작일
                expectShippingEnd: '',    //예상출하(발송)마감일
                hopeDeliveryFlag:false,     //희망배송여부(소비자용)
                pesticideYn: '무농약',	        //농약유무
                vatFlag: '',            // 과세여부
                packUnit: 'kg',	            //포장단위
                packAmount: '',	        //포장 양
                packCnt: '',	            //판매개수
                // shipPrice: '',	        //출하 후 판매가
                // reservationPrice: '',	    //예약 시 판매가
                // cultivationDiary: '',	    //재배일지
                confirm: false,             //상품목록 노출 여부
                remainedCnt: 0,
                discountRate: 0,            //할인율
                consumerPrice: null,           //소비자 가격
                totalPriceStep: 1,          //총 단계
                priceSteps: [
                    {stepNo: 1, until: null, price: 0, discountRate: 0 }
                ],             //단계별 가격

                deliveryFee: 0,             //배송비
                // deliveryQty: 0,          //배송비 정책 : 배송비 무료로 될 수량
                deliveryQty: '',            //배송비 정책 : 배송비 무료로 될 수량
                termsOfDeliveryFee: TERMS_OF_DELIVERYFEE.NO_FREE, //배송비 정책코드
                goodsTypeCode: 'none',          //해당없음:none, 식품(농수산물) : A, 가공식품 : P,  건강기능식품 : H
                goodsTypeName: '',
                directGoods: true,          //즉시판매상품 : true 예약상품 : false
                options: [],
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
                settingSaleEnd: false,       //판매마감시간 설정여부
                objectUniqueFlag: false,    //localfoods 실물확인 사용여부
                localfoodFarmerNo: 0,       //localfood 생산자번호
                localfoodFarmer: null,

                pbFlag: false,             //pb상품 등록 여부
                pbFarmerCode: '',
                pbItemCode: ''
            },

            loginUser: {},
            selected: null,
            producerInfo: null,
            isTempProdAdmin: false,     // tempProducer 관리자 여부
            selectedItemFeeRate: 0,

            searchLocalFarmer: {keyword:'', code:''}
        }


        this.inputPackUnit = React.createRef()
    }

    async componentDidMount() {
        await this.bindStdData()
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

            //2022.05 : producerWrapDelivered 로컬푸드에만 적용중
            if (state.producerInfo.localfoodFlag) {
                //신규시에 묶음배송 자동 설정.
                state.goods.producerWrapDelivered = true
                state.goods.termsOfDeliveryFee = TERMS_OF_DELIVERYFEE.GTE_PRICE_FREE; //몇원 이상 무료.

                //최근상품 묶음배송정책 가져와서 설정
                state.goods.deliveryQty = producerInfo.producerWrapLimitPrice;
                state.goods.deliveryFee = producerInfo.producerWrapFee;
            }


            //옵션 1번째 초기값 세팅
            state.goods.options.push({
                optionIndex: 0,
                packCnt: '',
                remainedCnt: '',
                optionPrice: '',
                sortNum: 0,
                isNew: false,
                sizeNo: 0,
                optionImages: []
            })
            console.log({state})
            // this.setValidatedObj(state)
            this.setState(state)
            return
        }

        //업데이트
        const goods = await this.search()

        goods.currentPrice = goods.defaultCurrentPrice

        //품종세팅
        this.setItemKinds(goods.itemNo)

        //goods.vatFlag = this.getIsVatWording(goods.vatFlag);
        //goods.vatFlag = this.getIsVatWording(goods.vatFlag);
        state.goods = goods
        state.selectedItemFeeRate = goods.feeRate

        state.searchLocalFarmer.data = goods.localfoodFarmer

        //goodsContent 분리되었으므로 다시 가져오기, 가끔 data가 없을경우 fileName이 null이나 0인 경우가 있어서 제외
        if (!state.goods.goodsContent && state.goods.goodsContentFileName && state.goods.goodsContentFileName != 0) {
            let {data:goodsContent} = await getGoodsContent(state.goods.goodsContentFileName)
            if(goodsContent) {
                state.goods.goodsContent = goodsContent;
            }
            //console.log('goodsContent await:', goodsContent, state.goods.goodsContentFileName)
        }

        //옵션 정렬 //sort버튼 제거
        //ComUtil.sortNumber(state.goods.options, 'sortNum')

        // this.setValidatedObj(state);
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
    bindStdData = async () => {
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

        //배송비 조건 넣기
        // const termsOfDeliveryFees = []
        //
        // Object.keys(termsOfDeliveryFeeInfo).map(key => {
        //     termsOfDeliveryFees.push(termsOfDeliveryFeeInfo[key])
        // })

        const termsOfDeliveryFees = [
            { value: TERMS_OF_DELIVERYFEE.NO_FREE, label: '무료배송 없음' },
            { value: TERMS_OF_DELIVERYFEE.FREE, label: '무료배송' },
            { value: TERMS_OF_DELIVERYFEE.GTE_FREE, label: '개 이상 무료배송' },
            { value: TERMS_OF_DELIVERYFEE.GTE_PRICE_FREE, label: '원 이상 무료배송' },
            { value: TERMS_OF_DELIVERYFEE.EACH_GROUP_COUNT, label: '개씩 배송요금 부과' },
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
        // goodsImages: 'goodsImages',	        //상품이미지
        searchTag: 'searchTag',	        //태그
        itemNo: 'itemNo',	            //품목번호
        // itemName: 'itemName',	            //품목
        itemKind: 'itemKind',	                //품종
        productionArea: 'productionArea',	//생산지
        // cultivationNm: 'cultivationNm',	    //재배방법명
        saleEnd: 'saleEnd',                     //판매마감일
        productionStart: 'productionStart',      //수확시작일
        expectShippingStart: 'expectShippingStart',  //예상출하시작일
        expectShippingEnd: 'expectShippingEnd',    //예상출하마감일
        // pesticideYn: 'pesticideYn',	        //농약유무
        // packUnit: 'packUnit',	            //포장단위
        packAmount: 'packAmount',	        //포장 양
        packCnt: 'packCnt',	            //판매개수
        // shipPrice: 'shipPrice',	        //출하 후 판매가
        // reservationPrice: 'reservationPrice',	    //예약 시 판매가 gfrd
        consumerPrice: 'consumerPrice',      //소비자 가격
        currentPrice: 'currentPrice',       //판매가

        deliveryFee: 'deliveryFee',             //배송비
        deliveryQty: 'deliveryQty',          //배송비 정책 : 배송비 무료로 될 수량
        goodsTypeCode: 'goodsTypeCode',      //상품종류 식품(농수산물) : A, 가공식품 : P,  건강기능식품 : H

        pbFarmerCode: 'pbFarmerCode',
        pbItemCode: 'pbItemCode',
    }

    //밸리데이션 체크, null 은 밸리데이션 체크를 통과한 것을 의미함
    setValidatedObj = ({goods: obj}) => {

        //소비자가격 및 단계별 할인율 체크 end
        validatedObj = {
            // goodsNo: goodsNo || null,
            // producerNo: null,          //생산자번호
            goodsNm: obj.goodsNm.length > 0 ? null : '상품명은 필수 입니다',              //상품명
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
            packCnt: ComUtil.toNum(obj.packCnt) >= 0 ? null : '판매수량은 필수 입니다',	            //판매 수량

            deliveryQty:
                !obj.producerWrapDelivered &&    // 묶음배송비 적용여부가 true 일 때는 체크x
                (obj.termsOfDeliveryFee === TERMS_OF_DELIVERYFEE.GTE_PRICE_FREE ||              // 얼마이상 구매시 무료배송
                    obj.termsOfDeliveryFee === TERMS_OF_DELIVERYFEE.GTE_FREE ||                   //몇개이상 무료배송
                    obj.termsOfDeliveryFee === TERMS_OF_DELIVERYFEE.EACH_GROUP_COUNT) ?              //몇개씩 배송요금 부과
                    ComUtil.toNum(obj.deliveryQty) ? null : '무료배송조건을 입력해 주세요' : null,      //배송비 정책 : 배송비 무료로 될 수량

            deliveryFee:
                obj.producerWrapDelivered || obj.termsOfDeliveryFee === TERMS_OF_DELIVERYFEE.FREE ?                //무료배송 일 경우 밸리데이션 체크 안함
                    null : ComUtil.toNum(obj.deliveryFee) ? null : '배송비는 필수 입니다',             //배송비

            //희망배송일
            expectShippingDate: obj.hopeDeliveryFlag ? (obj.expectShippingStart && obj.expectShippingEnd) ? null : '소비자 희망수령일 기능을 사용하면, 소비자가 정한 날짜(시작일 ~ 종료일 사이)에 꼭 도착 할 수 있게 배송 일정을 맞춰 주셔야 합니다.' : null,

            consumerPrice: ComUtil.toNum(obj.consumerPrice) > 0 ? null : '소비자가를 입력해 주세요',
            currentPrice: ComUtil.toNum(obj.currentPrice) > 0 ? null : '실제 판매되는 가격을 입력해 주세요',
            // priceSteps: priceSteps,

            saleEnd: obj.saleEnd ? null : '판매마감일은 필수 입니다',      //판매마감일
            goodsContent: obj.goodsContent ? null : '상품상세설명은 필수 입니다',
            goodsTypeCode: obj.goodsTypeCode ? null : '상품정보제공 고시 설정은 필수 입니다',

            //로컬 생산자인 경우
            //localfoodFarmerNo: !this.state.producerInfo.localfoodFlag ? null : obj.localfoodFarmerNo > 0 ? null : '농가를 선택해 주세요.',

            //옵션관련 필수입력 check
            optionInfoError: (!obj.goodsNo && obj.objectUniqueFlag) ? null : obj.options.find(option => (!option.optionName || ComUtil.toNum(option.optionPrice) <= 0 )) ? '옵션에 필수정보가 입력되지 않았습니다.':null,
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

        //옵션1이미지 자동 설정.
        if(!goods.objectUniqueFlag && !goods.options[0].optionImages) {
            goods.options[0].optionImages = images
        }

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
        goods.authFiles[name] = file ? file:null;
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

    // 옵션 이미지
    onOptionImageChange = (index, images) => {
        const newGoods = Object.assign({}, this.state.goods)

        newGoods.options[index].optionImages = images

        this.setState({
            goods: newGoods
        })
    }

    ////옵션 함수
    onOptionInputBlur = ({index, name, value}) => {
        // let { name, value } = e.target
        const goods = Object.assign({}, this.state.goods)

        const option = goods.options[index]

        if(['optionPrice', 'packCnt'].includes(name)) {
            let numValue = value
            if(isNaN(Number(numValue))) numValue = ''

            //임시저장 상태일 때는 재고수량 항상 동기화
            if(name === 'packCnt' && (!goods.confirm || option.isNew)) {
                option.remainedCnt = numValue
            }

            option[name] = numValue

            //옵션 가격 일 경우 판매가(currentPrice) 중 최저가에 맞는 금액을 세팅 해 준다.

            if(name === 'optionPrice') {

                //옵션 중 최저가 sync

                goods.currentPrice = this.getCurrentPriceByOptions(goods.options)

                goods.discountRate = this.calcDiscountPrice(goods.consumerPrice, goods.currentPrice)
                console.log({goods: goods})

            }

        }else {
            option[name] = value
        }

        // if(name === 'optionPrice' || name === 'packCnt') {
        //     if(isNaN(Number(value))) value = ''
        //
        //     option[name] = value//ComUtil.toNum(value)
        // }


        this.setValidatedObj({goods})
        this.setState({goods})
        console.log(goods.options[index])
    }

    getCurrentPriceByOptions = (options) => {

        const visibleOptionPrices = options.filter(option => !option.deleted).map(option => option.optionPrice || 0)

        if(visibleOptionPrices.length > 0) {
            const minOptionPrice =  Math.min(...visibleOptionPrices)

            console.log({minOptionPrice: minOptionPrice})

            return minOptionPrice
        }

        return 0
    }


    calcDiscountPrice = (consumerPrice, currentPrice) => {

        if(ComUtil.toNum(currentPrice) <= 0){
            return 100
        }
        else if(ComUtil.toNum(consumerPrice) > 0){

            const discountRate = 100 - ((currentPrice / consumerPrice) * 100)

            return ComUtil.toNum(discountRate)

        }
        return 100
    }

    // onBlur = async (index, e) => {
    //     let { name, value } = e.target
    //     const goods = Object.assign({}, this.state.goods)
    //     if(goods.goodsNo) {
    //         const originGoods = await getGoodsByGoodsNo(goods.goodsNo)
    //
    //         if((JSON.stringify(originGoods.options) === JSON.stringify(goods.options)) === false) {
    //             goods.options[index].remainedCnt = ComUtil.toNum(value)
    //         }
    //     }
    //
    //     // onBlur시 optionIndex 세팅
    //     goods.options[index].optionIndex = index
    //
    //     this.setValidatedObj({goods})
    //     this.setState({...this.state, goods})
    // }
    //
    // // 옵션명 onBlur시 optionIndex 세팅
    // onBlurOptionName = (index) => {
    //     const goods = Object.assign({}, this.state.goods)
    //
    //     goods.options[index].optionIndex = index
    // }

    onLocalGoodsDupCheck = async (e) => {
        console.log('onLocalGoodsDupCheck', e.target.value)

        if(this.state.producerInfo.localfoodFlag) {
            console.log( this.state.producerInfo.producerNo, this.state.searchLocalFarmer.data.localfoodFarmerNo);

            let {data:checkDup} = await checkLocalGoodsDuplicate(this.state.producerInfo.producerNo, this.state.searchLocalFarmer.data.localfoodFarmerNo, e.target.value);
            if (checkDup) {
                alert('판매 중인 동일농가/품목코드 가 이미 존재합니다. 랩씨드 계정으로 임시저장 등록하는 방식을 추천!!');
            }
        }

    }
    //인풋박스
    onInputChange = (e) => {
        let { name, value } = e.target
        const goods = Object.assign({}, this.state.goods)

        let nowDate = moment().toDate();
        let eventStartDay = moment('2021-05-03');
        let eventEndDay = moment('2021-06-01');

        if(nowDate >= eventStartDay && nowDate < eventEndDay) {
            if(!this.state.isTempProdAdmin){
                if((name === 'currentPrice' || name === 'consumerPrice') && this.state.goods.goodsNo){
                    alert(`
                    2021.05.03 ~ 2021.05.31
                    '적립형 쿠폰 이벤트' 진행으로 기간내 금액 수정이 제한됩니다.
                    금액 변경 희망 시 관리자 문의 바랍니다.

                    031-8090-3108
                    `)
                    return
                }
            }
        }

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

            //첫번째 옵션에 가격 세팅
            //TODO 동기화 제거. 사람이 직접 변경 해야함. 지속적인 버그발생 중임
            // goods.options[0].optionPrice = currentPrice
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

    //임시저장
    onAddTempGoodsClick = async (e) => {

        if(!await this.goodsRegStopChk()) return

        this.loadingToggle('temp')
        await this.saveTemp();
        this.loadingToggle('temp')
    }

    saveTemp = async () => {
        const goods = Object.assign({}, this.state.goods)

        if(!goods.localGoodsNo || goods.localGoodsNo.length <= 0) {
            goods.localGoodsNo = 0;
        }

        goods.newGoodsInfo = Object.assign([], goods.goodsInfoData[goods.goodsTypeCode])

        if(this.state.producerInfo.localfoodFlag && !this.state.searchLocalFarmer.data) {
            this.notify('농가 선택은 필수 입니다', toast.error)
            return
        }

        if(goods.goodsNm.length <= 0){
            this.notify('상품명은 필수 입니다', toast.error)
            return
        }
        if(goods.goodsTypeCode !== 'none' && goods.newGoodsInfo.length <= 0){
            this.notify('[상품정보제공 고시 설정] 상세 내용을 입력해주세요', toast.error)
            return
        }

        if(this.state.producerInfo.localfoodFlag) { //로컬푸드 전용.
            //수정상품 && 실물확인 사용x => 옵션0번 자동세팅
            if (goods.goodsNo && !goods.objectUniqueFlag) {
                //TODO 다시 주석처리함 : 0번째 옵션 가격은 항상 사람이 눈으로 보고 조정 해야 함
                // goods.options[0].optionPrice = ComUtil.toNum(goods.currentPrice);
            }
            //신규상품 && 실물확인 사용o => 옵션 0개여야 됨
            if (goods.objectUniqueFlag && (!goods.goodsNo || (goods.goodsNo && !goods.confirm))) {
                goods.options = []
            }
            //재고연동상품은 option0을 임시저장시에 숨김.
            else if (!goods.objectUniqueFlag && (!goods.goodsNo || (goods.goodsNo && !goods.confirm))) {
                if (goods.options[0].sizeNo === 0) { //sizeNo없을때만 숨김.
                    goods.options[0].deleted = true
                }

                //localFamerNo 바코드 체크? localFamerNo가 페이지에 없어서 일단 pass
                // if (!goods.localfoodFarmer.localFamerNo) {
                //     alert("local 농가의 바코드 번호가 필요합니다. ");
                //     return
                // }

                //localGoodsNo 입력 잘못했는지 체크.
                //TODO 메모 : localGoodsNo가 중복 저장 되도록 수정(개체인식 때문)
                // const {data: chk} = await getLocalGoodsDupChk(goods.producerNo, goods.localGoodsNo, this.state.searchLocalFarmer.data.localfoodFarmerNo, (goods.goodsNo) ? goods.goodsNo : 0)
                //
                // if (chk) {
                //     alert("이미 동일한 재고관리용 상품바코드가, 해당 농가에 존재합니다.");
                //     return
                // }
            }
        }
        console.log(goods)

        // 과세,면세는 true,false로 변경
        // //if(goods.vatFlag === '과세') {
        //     goods.vatFlag = true;
        // } else {
        //     goods.vatFlag = false;
        // }


        //밸리데이션 말고 체크 하는게 없는데 필요 없는듯
        // this.setState({goods})

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
        if (!this.state.goods.localfoodFarmerNo && this.state.goods.options.filter(option=>option.deleted).length === this.state.goods.options.length) {
            alert("옵션 모두를 숨김할 수 없습니다. 숨김해제 필요.")
            return
        }

        // const goods = Object.assign({}, this.state.goods)
        // goods.newGoodsInfo = Object.assign([], goods.goodsInfoData[goods.goodsTypeCode])
        //
        // this.setState({
        //     goods: goods
        // })

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

        if(this.state.producerInfo.localfoodFlag) {
            goods.localfoodFarmerNo = this.state.searchLocalFarmer.data.localfoodFarmerNo;
        }

        //확정 전까지 재고수량 동기화
        // if(!goods.confirm){
        //     goods.remainedCnt = goods.packCnt;
        // }

        //백엔드쪽 Goods packCnt, remaindCnt는 사용하진 않는데 그냥.. option packCnt랑 숫자 맞추기용..
        let packCntSum = 0;
        for(let i=0; i<goods.options.length; i++) {
            packCntSum += ComUtil.toNum(goods.options[i].packCnt)
        }
        goods.packCnt = packCntSum;
        goods.remainedCnt = packCntSum;

        // 예전코드: 생산자가 묶음배송일 경우 '원이상 무료배송'으로 goods에 저장함.
        // if(this.state.producerInfo.producerWrapDeliver) {
        //     goods.termsOfDeliveryFee = TERMS_OF_DELIVERYFEE.GTE_PRICE_FREE;
        //     goods.deliveryQty = this.state.producerInfo.producerWrapLimitPrice;
        //     goods.deliveryFee = this.state.producerInfo.producerWrapFee;
        // }

        if(goods.inTimeSalePeriod) {
            goods.discountRate = goods.defaultDiscountRate
        }

        // 판매종료일 사용 안할경우 2099.12.31 로 저장
        if(!goods.settingSaleEnd) {
            let endDate = new Date(2099,11,31,0,0,0);
            goods.saleEnd = endDate;
        }



        //상품이미지의 imageNo로 정렬
        ComUtil.sortNumber(goods.goodsImages, 'imageNo', false)

        //옵션 인덱스와 goodsNo 동기화
        goods.options.map(option => ComUtil.sortNumber(option.optionImages, 'imageNo',false))

        //옵션 정렬
        /** [중요] optionIndex 를 back-end 에서 무조건 순서대로 optionIndex 를 채번하기 저장 전 optionIndex 로 정렬 해야 함 **/
        ComUtil.sortNumber(goods.options, 'optionIndex')


        console.log({saveGoods: JSON.stringify(goods)})

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

            //sortNum 로 재정렬 //sort버튼 제거
            //ComUtil.sortNumber(goods.options, 'sortNum')
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
        this.setState({
            selectedItemFeeRate: item.itemFeeRate
        })

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

    onLocalFoodFarmerChange = (param) => {
        const searchLocalFarmer = Object.assign({}, this.state.searchLocalFarmer)
        searchLocalFarmer.keyword = param.keyword
        searchLocalFarmer.code = param.code
        searchLocalFarmer.data = param.data

        console.log(searchLocalFarmer)

        const goods = Object.assign({}, this.state.goods);
        goods.localfoodFarmer = param.data

        this.setState({
            searchLocalFarmer, goods
        })
    }

    // 로컬푸드생산자
    // onLocalFoodFarmerChange = (item) => {
    //     console.log(item);
    //     const goods = Object.assign({}, this.state.goods)
    //     goods.localfoodFarmerNo = item.value;
    //     this.setState({ goods })
    // }

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
        console.log('onGoodsCopyPopupClick', isReviewGoods, pIsReviewGoods)
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
        if(isConfirmed){
            let isReviewGoods = false;
            if(window.confirm('동일한 상품이 맞습니까? 다른 상품일경우 취소를 눌러주세요!')) {
                isReviewGoods = true;
            }
            const { status, data: goodsNo } = await copyGoodsByGoodsNo(this.state.goods.goodsNo, isReviewGoods)

            if(status != 200 || goodsNo <= 0){
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

    // 판매종료일
    onDateChange = (date) => {
        const goods = Object.assign({}, this.state.goods)

        //상품판매기한 설정(마지막 선택한 단계의 날짜로)
        goods.saleEnd = date.endOf('day');

        this.setValidatedObj({goods})

        this.setState({goods})
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
        const goods = Object.assign({}, this.state.goods)
        goods.goodsTypeName = data.label;
        goods.goodsTypeCode = data.value;

        console.log(goods)

        this.setValidatedObj({goods})
        this.setState({goods})
    }

    goodsTypeSetting = () => {
        this.setState({ goodsTypeModalOpen: true })
    }

    modifyOptionPackCnt = (index) => {
        const goods = Object.assign({}, this.state.goods)

        const optionPackCnt = goods.options[index].packCnt ? goods.options[index].packCnt : 0;
        const optionRemainedCnt = goods.options[index].remainedCnt ? goods.options[index].remainedCnt : 0;
        let inputPackCnt = prompt('판매할 총 수량을 입력하세요. (현재 총 수량: ' + optionPackCnt + ', 현재 잔여수량: ' + optionRemainedCnt + ')', '숫자만 입력')

        //숫자가 아닌 값을 입력 했을경우 방어코드
        if(!inputPackCnt || Number.isNaN(Number(inputPackCnt))) {
            return
        }

        //방어코드
        inputPackCnt = ComUtil.toNum(inputPackCnt)

        const prevRemainedCnt = goods.options[index].remainedCnt   // 바뀌기 전 남은 수량

        if(inputPackCnt - goods.options[index].packCnt >= 0) {     // 현재수량보다 플러스
            goods.options[index].remainedCnt = prevRemainedCnt + (inputPackCnt-goods.options[index].packCnt)
            goods.options[index].packCnt = inputPackCnt

            console.log(goods.options[index].packCnt, goods.options[index].remainedCnt)
        } else {                                    // 현재수량보다 마이너스
            if(inputPackCnt < goods.options[index].packCnt-goods.options[index].remainedCnt) {
                alert('판매완료된 수량보다 작은 수를 입력하실 수 없습니다.')
                return false
            } else {
                goods.options[index].remainedCnt = prevRemainedCnt - (goods.options[index].packCnt-inputPackCnt)
                goods.options[index].packCnt = inputPackCnt
            }
        }

        //코드 추가
        if(window.confirm(`판매수량을 ${ComUtil.addCommas(inputPackCnt)}개로 변경하시겠습니까?`)) {
            this.setState({ goods })
        }
    }

    // db에 저장된 판매수량 다시 가져오기
    resetOptionPackCnt = async(index) => {
        const originGoods = await this.search();    // db에 저장되어 있는 goods 정보
        const goods = Object.assign({}, this.state.goods)

        goods.options[index].packCnt = originGoods.options[index].packCnt
        goods.options[index].remainedCnt = originGoods.options[index].remainedCnt

        this.setState({ goods })
    }

    // 판매 개시 후 상품수량 수정
    // modifyPackCnt = () => {
    //     const goods = Object.assign({}, this.state.goods)
    //     const inputPackCnt = prompt('판매할 총 수량을 입력하세요. (현재 총 수량: ' + goods.packCnt + ', 현재 잔여수량: ' + goods.remainedCnt + ')', '숫자만 입력')
    //
    //     const prevRemainedCnt = goods.remainedCnt   // 바뀌기 전 남은 수량
    //
    //     if(inputPackCnt - goods.packCnt >= 0) {     // 현재수량보다 플러스
    //         goods.remainedCnt = prevRemainedCnt + (inputPackCnt-goods.packCnt)
    //         goods.packCnt = inputPackCnt
    //
    //         console.log(goods.packCnt, goods.remainedCnt)
    //     } else {                                    // 현재수량보다 마이너스
    //         if(inputPackCnt < goods.packCnt-goods.remainedCnt) {
    //             alert('판매완료된 수량보다 작은 수를 입력하실 수 없습니다.')
    //             return false
    //         } else {
    //             goods.remainedCnt = prevRemainedCnt - (goods.packCnt-inputPackCnt)
    //             goods.packCnt = inputPackCnt
    //         }
    //     }
    //
    //     if(window.confirm('판매수량을 변경하시겠습니까?')) {
    //         this.setState({ goods })
    //     }
    // }
    //
    // // db에 저장된 판매수량 다시 가져오기
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

    onHopeDeliveryFlag = (e) => {
        const hopeDeliveryFlag = e.target.checked;
        const goods = Object.assign({}, this.state.goods);
        goods.hopeDeliveryFlag = hopeDeliveryFlag;
        this.setValidatedObj({goods})
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
    saleEndChange = () => {
        const goods = Object.assign({}, this.state.goods);
        if(!goods.settingSaleEnd) {
            goods.saleEnd = new Date();
        }
        goods.settingSaleEnd = !goods.settingSaleEnd;
        this.setState({
            goods: goods
        })
    }

    objectUniqueChange = () => {
        const goods = Object.assign({}, this.state.goods);

        goods.objectUniqueFlag = !goods.objectUniqueFlag

        // if (goods.objectUniqueFlag ) {
        //     goods.localGoodsNo = 0    //실물확인은 재고관리 안함.
        // }
        this.setState({goods:goods})
    }

    settingExpectShippingChange = () => {
        const goods = Object.assign({}, this.state.goods);
        if(!goods.settingExpectShipping) {
            goods.expectShippingStart = null;
            goods.expectShippingEnd = null;
        }
        goods.settingExpectShipping = !goods.settingExpectShipping;
        this.setState({
            goods: goods
        })
    }

    producerWrapDeliveredChange = async (e) => {
        const {name, checked} = e.target
        const goods = Object.assign({}, this.state.goods);

        goods.producerWrapDelivered = checked//!goods.producerWrapDelivered;

        //묶음배송 적용시, 생산자의 묶음배송정책 가져와 세팅
        if (checked) {
            const {data} = await getProducerByProducerNo(goods.producerNo)
            goods.termsOfDeliveryFee = TERMS_OF_DELIVERYFEE.GTE_PRICE_FREE; //몇원 이상 무료.
            goods.deliveryFee = data.producerWrapFee       //(배송료)
            goods.deliveryQty = data.producerWrapLimitPrice //(limit 3만원 이상)
            console.log({data})
            //todo goods.deliveryFee  (배송료)
            //todo goods.deliveryQty (limit 3만원 이상)
        }else { //묶음배송 아닐때는 유료배송으로 적용.
            goods.termsOfDeliveryFee = TERMS_OF_DELIVERYFEE.NO_FREE;
            goods.deliveryQty = '';
            goods.deliveryFee = this.state.producerInfo.producerWrapFee;
        }
        this.setState({
            goods: goods
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

    // 옵션 행추가
    addOptionClick = () => {
        const goods = Object.assign({}, this.state.goods)
        // const options = Object.assign([], this.state.goods.options)

        let maxOptionIndex = 0;
        let maxSortNum = 0;

        goods.options.map(o => {
            if(o.optionIndex > maxOptionIndex)
                maxOptionIndex = o.optionIndex
            //sort버튼 제거
            // if(o.sortNum > maxSortNum)
            //     maxSortNum = o.sortNum
        })

        goods.options.push({
            optionIndex: maxOptionIndex + 1,
            packCnt: '',
            remainedCnt: '',
            optionPrice: '',
            sortNum: 0, //sort버튼 제거 maxSortNum + 1,
            deleted: false,
            eventFlag: false,
            isNew: true,
            optionImages: []
        })

        this.setState({
            ...this.state,
            goods
        })


        console.log("행추가 : ", goods.options)
    }

    // 옵션 숨김 or 보이기 처리(숨김시 소비자화면에서만 안 보임)
    onHideClick = ({index}) => {
        const goods = Object.assign({}, this.state.goods)

        //숨겨진 옵션이면 행사 지정 못하도록 방어
        if(!goods.options[index].deleted && goods.options[index].eventFlag) {
            alert('옵션을 숨기려면 이벤트 상품을 먼저 해제 바랍니다.')
            return
        }


        goods.options[index].deleted = !goods.options[index].deleted

        goods.currentPrice = this.getCurrentPriceByOptions(goods.options)
        goods.discountRate = this.calcDiscountPrice(goods.consumerPrice, goods.currentPrice)

        this.setState({
            ...this.state, goods
        })
    }

    // 옵션 행 삭제 (신규 추가 된 행만 삭제 가능)
    onDeleteClick = ({index}) => {
        const goods = Object.assign({}, this.state.goods)
        // const options = Object.assign([], this.state.goods.options)

        goods.options.splice(index, 1)

        goods.currentPrice = this.getCurrentPriceByOptions(goods.options)
        goods.discountRate = this.calcDiscountPrice(goods.consumerPrice, goods.currentPrice)

        this.setState({
            goods
        })
    }

    //이벤트 상품으로 지정 및 취소
    onApplyEventOptionClick = (index, eventFlag) => {

        if(this.state.goods.inSuperRewardPeriod || this.state.goods.inTimeSalePeriod) {
            alert('이벤트 기간 중에는 변경이 불가능 합니다.')
            return
        }

        //숨겨진 옵션이면 행사 지정 못하도록 방어
        if(eventFlag && this.state.goods.options[index].deleted) {
            alert('이벤트 상품으로 지정 하려면 옵션 숨김해제를 먼저 해 주세요.')
            return
        }

        const goods = Object.assign({}, this.state.goods)

        //eventFlag 초기화
        goods.options.map(o => o.eventFlag = false)

        if(eventFlag) {
            //eventFlag 세팅
            goods.options[index].eventFlag = true;
        }

        this.setState({
            goods: goods
        })

        console.log(goods.options)
    }

    //sort버튼 제거
    // onSortDownClick = (index, moveIndex) => {
    //
    //     const sortNum = index + moveIndex
    //
    //     if (sortNum < 1 || sortNum === this.state.goods.options.length){
    //         return
    //     }
    //
    //     console.log({index, moveIndex, sortNum})
    //
    //     // if(nextIndex < 0 || nextIndex === this.state.goods.options.length) return
    //
    //     const goods = Object.assign({}, this.state.goods)
    //
    //     console.log(goods.options)
    //
    //     //위치 바꾸기
    //     goods.options[index].sortNum = sortNum
    //     goods.options[sortNum].sortNum = index
    //
    //     ComUtil.sortNumber(goods.options, 'sortNum')
    //
    //     //잘라내기
    //     // const option = goods.options.splice(index, 1)[0]; //splice는 항상 array 로 리턴하기 때문
    //
    //     //붙여넣기
    //     // goods.options.splice(nextIndex, 0, option)
    //
    //     this.setState({goods})
    // }

    //옵션전체 보기여부 체크박스
    onShoAllCheckChange = (e) => {
        this.setState({
            showAllOptions: e.target.checked
        })
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

        const saleEndDate = ComUtil.utcToString(goods.saleEnd, 'YYYY-MM-DD');
        const now = ComUtil.utcToString(new Date().getTime(), 'YYYY-MM-DD')

        let saleEnd = false;
        if(saleEndDate) {
            const compareDate = ComUtil.compareDate(saleEndDate, now)
            if (compareDate === -1) {
                saleEnd = true
            } else {
                saleEnd = false
            }
        }

        const salesStopText = goods.saleStopped && <div className='p-3 text-center text-danger'>상품이 판매중단되어 판매가 불가능 합니다</div>
        const confirmText = (goods.confirm && !goods.saleStopped) && <div className='text-center text-danger'>상품이 판매개시되어 수정내용이 제한됩니다</div>
        const btnAddTempGoods = !goods.confirm ? <Button className='d-flex align-items-center justify-content-center' onClick={this.onAddTempGoodsClick} disabled={this.state.isLoading.temp} color='warning'>임시저장{this.state.isLoading.temp && <Spinner/> }</Button> : null
        const btnConfirm = (goods.goodsNo && !goods.confirm) ?  <Button onClick={this.onConfirmClick} color={'warning'}>확인(판매개시)</Button> : null
        const btnDelete = (goods.goodsNo && !goods.confirm) ? <ModalConfirm title={'상품을 삭제 하시겠습니까?'} content={'삭제된 상품은 복구가 불가능 합니다'} onClick={this.onDeleteGoodsClick}><Button color={'danger'} >삭제</Button></ModalConfirm> : null
        const btnPreview = goods.goodsNo ? <Button onClick={this.onPreviewClick}>미리보기</Button> : null
        const btnGoodsStop = (goods.confirm && !goods.saleStopped) ? <ModalConfirm title={'상품을 영구판매종료 하시겠습니까?'} content={'영구판매종료된 상품은 다시 판매가 불가능 합니다'} onClick={this.onGoodsStopClick}><Button color={'secondary'} >영구판매종료</Button></ModalConfirm> : null
        const btnUpdate = (goods.confirm && !goods.saleStopped) ? <Button className='d-flex align-items-center justify-content-center'  onClick={this.onUpdateClick} disabled={this.state.isLoading.update} color={'warning'}>수정완료{this.state.isLoading.update && <Spinner/>}</Button> : null
        //const btnCopy = (goods.goodsNo && goods.confirm )? <ModalConfirm title={'상품복사를 진행 하시겠습니까?'} content={<Fragment>1. 마지막 저장된 내용을 기준으로 복사가 진행 됩니다<br/> &nbsp;&nbsp;복사 진행전 저장을 꼭 해 주세요<br/>2. 상품을 복사하시면, 상품리뷰가 원본상품에 저장/관리 됩니다. <br/> &nbsp;&nbsp;동일유형 상품만 복사하세요. </Fragment>} onClick={this.onCopyClick}><Button color={'secondary'}>상품복사</Button></ModalConfirm> : null
        const btnCopy = (goods.goodsNo && goods.confirm )? <Button bg={'secondary'} onClick={this.onGoodsCopyPopClick}>상품복사</Button> : null
        const btnPaused = (!goods.salePaused && goods.confirm && !goods.saleStopped && !saleEnd) ? <ModalConfirm title={'판매 일시중지'} content={'일시중지 후 다시 판매개시를 할 수 있습니다. 일시중지 하시겠습니까?'} onClick={this.onGoodsPausedClick}><Button>일시중지</Button></ModalConfirm> : null
        const btnResume = (goods.salePaused && goods.confirm && !goods.saleStopped && !saleEnd) ? <ModalConfirm title={'판매재개'} content={'해당 상품을 다시 판매개시하시겠습니까?'} onClick={this.onGoodsResumeClick}><Button color='info'>판매재개</Button></ModalConfirm> : null

        const termsOfDeliveryFee = bindData.termsOfDeliveryFees.find(terms => terms.value === goods.termsOfDeliveryFee)
        let termsOfDeliveryFeeLabel
        if(termsOfDeliveryFee)
            termsOfDeliveryFeeLabel = termsOfDeliveryFee.label

        //예전코드 const producerWrapDeliver = this.state.producerInfo.producerWrapDeliver;
        // if(producerWrapDeliver) {
        //     termsOfDeliveryFeeLabel = '생산자 묶음배송'
        //     goods.deliveryQty = this.state.producerInfo.producerWrapLimitPrice;
        //     goods.deliveryFee = this.state.producerInfo.producerWrapFee;
        // }

        // const compSalesCnt = <>
        //     <div className='mr-2'><Button size='sm' onClick={this.modifyPackCnt}>수정</Button></div>
        //     <div><Button size='sm' onClick={this.resetPackCnt}>수정취소</Button></div>
        // </>;

        const arrAuthFile = [...Array(3)]

        //숨김 처리된 옵션
        const deletedOptions = goods.options.filter(o => o.deleted)
        const enabledOptions = goods.options.filter(o => !o.deleted)

        // console.log({goods})

        return(
            <Div bg={'background'} pb={300}>
                <Div p={16} maxWidth={1200} relative custom={`margin: 0 auto;`}>
                    {
                        this.state.chainLoading && <BlockChainSpinner/>
                    }

                    <JustListSpace>
                        {
                            this.state.validationCnt > 0 && (
                                <div className={Style.badge}>
                                    <Badge color="danger" pill>필수{this.state.validationCnt}</Badge>
                                </div>
                            )
                        }
                        {
                            salesStopText && salesStopText
                        }
                        {
                            confirmText && confirmText
                        }
                        {
                            (goods.inSuperRewardPeriod || goods.inTimeSalePeriod) && (
                                <Div bg={goods.inSuperRewardPeriod ? 'danger' : 'warning'} fg={'white'} fontSize={14} p={16} mb={16}>
                                    <strong>
                                        {goods.inSuperRewardPeriod ? '슈퍼리워드 진행중' : '포텐타임 진행중'}
                                        {!this.state.isTempProdAdmin && ' (이벤트 기간동안 상품 수정을 할 수 없습니다.)'}
                                    </strong>
                                </Div>
                            )
                        }
                        <CollapseContainer title={'즉시상품 정보'}>
                            <Body>
                                <JustListSpace space={8}>

                                    { this.state.producerInfo.localfoodFlag &&
                                    <Flex mt={10}>
                                        {/*<div className='d-flex justify-content-center align-items-center textBoldLarge f3'>농가 선택</div>*/}
                                        <Label className={'text-secondary small'}>농가 선택<Required/></Label>

                                        <Div ml={10}>
                                            <SearchInput
                                                placeholder={'농가명/바코드No'}
                                                //모달 타이틀
                                                title={'농가조회'}
                                                data={this.state.searchLocalFarmer}
                                                modalComponent={LocalFarmerModal}
                                                onChange={this.onLocalFoodFarmerChange}/>
                                        </Div>

                                        {
                                            this.state.goods.goodsNo &&
                                            <Div ml={10}>
                                                <Flex>
                                                    <Div>저장된 농가 : </Div>
                                                    <Div>{this.state.goods.localfoodFarmer.farmName || ''}</Div>
                                                </Flex>
                                            </Div>
                                        }

                                        {//!this.state.goods.objectUniqueFlag &&
                                            <Div ml={50}>
                                                <Flex>
                                                    <Div>
                                                        <div className='text-secondary small'> 로컬푸드 관리자 품목코드<Required/> : </div>
                                                        {/*<div className='text-secondary small'> (*실물확인 아닌상품 재고count 연동때 입력, 옵션0자동숨김) </div>*/}
                                                    </Div>
                                                    <Input type="number" style={{width:100}} name={"localGoodsNo"} value={goods.localGoodsNo} disabled={!this.state.isTempProdAdmin && goods.confirm}
                                                           onChange={this.onInputChange} onBlur={this.onLocalGoodsDupCheck}/>
                                                </Flex>
                                            </Div>
                                        }

                                    </Flex>
                                    }

                                    <div>
                                        <Label className={'text-secondary small'}>상품명<Required/></Label>
                                        {/* 판매개시 되면 상품명 변경 불가(관리자만 가능) */}
                                        <Input name={this.names.goodsNm} value={goods.goodsNm} disabled={!this.state.isTempProdAdmin && goods.confirm} onChange={this.onInputChange}/>
                                        <Fade in={validatedObj.goodsNm? true : false} className="text-danger small mt-1" >{validatedObj.goodsNm}</Fade>
                                    </div>
                                    <div>
                                        <Label className={'text-secondary small'}>
                                            대표 이미지<Required/>
                                            {
                                                validatedObj.goodsImages && (
                                                    <Span fg={'danger'} ml={4}>{validatedObj.goodsImages}</Span>
                                                )
                                            }
                                        </Label>
                                        <SingleImageUploader images={goods.goodsImages} quality={1} defaultCount={10} isShownMainText={true} onChange={this.onGoodsImageChange} />
                                    </div>
                                    <div>
                                        <Label className={'text-secondary small'}>상세이미지업로드(소비자에게 노출되지 않는 Markdown방식 URL복사용 이미지 입니다)</Label>
                                        <SingleImageUploader
                                            images={goods.contentImages}
                                            quality={1}
                                            defaultCount={10}
                                            isShownMainText={false}
                                            onChange={this.onContentImageChange}
                                            isShownCopyButton={true}
                                        />
                                    </div>
                                </JustListSpace>
                            </Body>
                        </CollapseContainer>
                        <CollapseContainer title={'기본 정보'}>
                            <Body>
                                <JustListSpace space={8}>
                                    <div>
                                        <Label className={'text-secondary small'}>품목<Required/>
                                            <Span ml={3} fg={'green'} fontSize={12}>적용 수수료 :{this.state.selectedItemFeeRate}%</Span>
                                        </Label>

                                        <Div maxWidth={400}>
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
                                        </Div>
                                    </div>
                                    <div>
                                        <Label className={'text-secondary small'}>품종<Required/></Label>
                                        <Div maxWidth={400}>
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
                                        </Div>
                                    </div>
                                    <div>
                                        <Label className={'text-secondary small'}>생산지<Required/></Label>
                                        <Input name={this.names.productionArea} style={{maxWidth:400}} value={goods.productionArea} placeholder='ex)전남 여수' onChange={this.onInputChange} />
                                        <Fade in={validatedObj.productionArea? true : false} className="text-danger small mt-1" >{validatedObj.productionArea}</Fade>
                                    </div>
                                    <div>
                                        <Label className={'text-secondary small'}>재배방법</Label>
                                        {/*<RadioButtons nameField='cultivationNm' value={goods.cultivationNm} defaultIndex={0} data={bindData.cultivationNm || []} onClick={this.onCultivationNmClick} />*/}
                                        <RadioButtons
                                            value={bindData.cultivationNm.find(item => item.value === goods.cultivationNm)}
                                            options={bindData.cultivationNm} onClick={this.onCultivationNmClick} />
                                        <Fade in={validatedObj.cultivationNm? true : false} className="text-danger small mt-1" >{validatedObj.cultivationNm}</Fade>
                                    </div>
                                    <div>
                                        <Label className={'text-secondary small'}>농약유무</Label>
                                        <RadioButtons
                                            value={bindData.pesticideYn.find(item => item.value === goods.pesticideYn)}
                                            options={bindData.pesticideYn} onClick={this.onPesticideYnClick} />
                                        <Fade in={validatedObj.pesticideYn? true : false} className="text-danger small mt-1" >{validatedObj.pesticideYn}</Fade>
                                        {/*<RadioButtons nameField='pesticideYn' defaultIndex={0} data={bindData.pesticideYn || []} onClick={this.onPesticideYnClick} />*/}
                                    </div>
                                    <div>
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
                                    </div>
                                </JustListSpace>
                            </Body>
                        </CollapseContainer>

                        {
                            this.state.producerInfo.pbFlag &&
                            <CollapseContainer title={'PB상품 정보'}>
                                <Flex pl={16}>
                                    <Div mr={10} mb={10}>PB상품 여부</Div>
                                    <SwitchButton checked={goods.pbFlag} onChange={this.onPbFlagChange} />
                                </Flex>
                                <Body>
                                    <div>
                                        <Label className={'text-secondary small'}>농가번호{goods.pbFlag && <Required/>}</Label>
                                        <Input style={{width:400}} name={this.names.pbFarmerCode} value={goods.pbFarmerCode} onChange={this.onInputChange}/>
                                    </div>
                                    <div>
                                        <Label className={'text-secondary small'}>품목번호{goods.pbFlag && <Required/>}</Label>
                                        <Input style={{width:400}} name={this.names.pbItemCode} value={goods.pbItemCode} onChange={this.onInputChange}/>
                                    </div>
                                </Body>
                            </CollapseContainer>
                        }

                        <CollapseContainer title={'상품정보제공 고시 설정'}>
                            <Body>
                                <Label className={'text-secondary small'}>분류선택<Required/></Label>
                                <div>
                                    {
                                        <Fragment>
                                            <div className='d-flex'>
                                                <Div width={400}>
                                                    <Select options={bindData.goodsTypes}
                                                            value={ bindData.goodsTypes.find(item => item.value === goods.goodsTypeCode)}
                                                            onChange={this.onGoodsTypeChange}
                                                    />
                                                </Div>
                                                <div className='d-flex align-items-center justify-content-center'>
                                                    {
                                                        goods.goodsTypeCode != 'none' &&
                                                        <Button className='ml-2' size='sm' color='secondary' onClick={this.goodsTypeSetting}>설정</Button>
                                                    }
                                                </div>
                                            </div>
                                            <Fade in={validatedObj.goodsTypeCode? true : false} className="text-danger small mt-1" >{validatedObj.goodsTypeCode}</Fade>
                                        </Fragment>
                                    }
                                </div>
                            </Body>
                        </CollapseContainer>

                        <CollapseContainer title={'판매 정보'}>
                            <Body>
                                <JustListSpace>
                                    <div>
                                        <Label className={'text-secondary small'}>포장 양<Required/></Label>
                                        <Fragment>
                                            <Input type="number" style={{width:400}} name={this.names.packAmount} value={goods.packAmount} onChange={this.onInputChange}/>
                                            <Fade in={validatedObj.packAmount? true : false} className="text-danger small mt-1" >{validatedObj.packAmount}</Fade>
                                        </Fragment>
                                    </div>
                                    <div>
                                        <Label className={'text-secondary small'}>포장 단위<Required/></Label>
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

                                                {
                                                    // goods.packUnitCode === '99' && <input type='text' name='packUnitText' value={goods.packUnit} onChange={this.onInputPackUnitChange} />
                                                }
                                            </div>

                                            <Input
                                                style={{width: 400}}
                                                className={'mt-2'}
                                                // style={{display: document.getElementById('packUnit_3').checked ? 'block' : 'none'}}
                                                innerRef={this.inputPackUnit}
                                                value={goods.packUnit}
                                                onChange={this.onInputPackUnitChange}
                                                placeholder={'l(리터), 개, 등의 단위 입력'}
                                            />
                                            {/*<Fade in={validatedObj.packUnit? true : false} className="text-danger small mt-1" >{validatedObj.packUnit}</Fade>*/}
                                        </Fragment>
                                    </div>
                                </JustListSpace>
                            </Body>
                        </CollapseContainer>

                        <CollapseContainer title={'가격 정보'}>
                            <Body>
                                <JustListSpace>
                                    <div>
                                        <Label className={'text-secondary small'}>소비자가<Required/></Label>
                                        <Div maxWidth={400}>
                                            <InputGroup size={'md'}>
                                                <CurrencyInput name={this.names.consumerPrice} value={goods.consumerPrice} onChange={this.onInputChange} placeholder={'소비자가'}/>
                                                <InputGroupAddon addonType="append">
                                                    <InputGroupText>원</InputGroupText>
                                                </InputGroupAddon>
                                            </InputGroup>

                                        </Div>
                                        <Fade in={validatedObj.consumerPrice ? true : false} className="text-danger small mt-1" >{validatedObj.consumerPrice}</Fade>
                                    </div>
                                    <div>
                                        <Div maxWidth={400}>
                                            {/*    <div className={'d-flex'}>*/}
                                            {/*        <Label className={'text-secondary small'}>판매가<Required/></Label>*/}
                                            {/*        <span className={'ml-auto text-secondary small'}>{Math.round(ComUtil.addCommas(goods.discountRate),0)} %*/}
                                            {/*            {*/}
                                            {/*                goods.consumerPrice && goods.consumerPrice > 0 && goods.currentPrice && goods.currentPrice > 0 && (*/}
                                            {/*                    ` (- ${ ComUtil.addCommas(ComUtil.toNum(goods.consumerPrice) - ComUtil.toNum(goods.currentPrice))} 원) `*/}
                                            {/*                )*/}
                                            {/*            }*/}
                                            {/*            할인*/}
                                            {/*</span>*/}
                                            {/*    </div>*/}
                                            <div>
                                                <Label className={'text-secondary small'}>판매가(옵션의 최저가로 자동 적용됨)</Label>
                                                <Space>
                                                    <div>{ComUtil.addCommas(goods.currentPrice)}원</div>
                                                    <div>
                                                        {`(-${ComUtil.addCommas(ComUtil.toNum(goods.consumerPrice) - ComUtil.toNum(goods.currentPrice))}원 ${this.state.goods.discountRate.toFixed(1)} % 할인)`}
                                                    </div>
                                                </Space>
                                            </div>
                                            {/*<InputGroup size={'md'}>*/}
                                            {/*    <CurrencyInput name={this.names.currentPrice} value={goods.currentPrice} onChange={this.onInputChange} placeholder={`판매가`}/>*/}
                                            {/*    <InputGroupAddon addonType="append">*/}
                                            {/*        <InputGroupText>원</InputGroupText>*/}
                                            {/*    </InputGroupAddon>*/}
                                            {/*</InputGroup>*/}
                                        </Div>
                                    </div>
                                </JustListSpace>
                            </Body>
                        </CollapseContainer>


                        <CollapseContainer title={'옵션 정보'}>
                            <Body>
                                {
                                    this.state.producerInfo.localfoodFlag &&
                                    <Flex py={8}>
                                        <Checkbox bg={'green'} checked={goods.objectUniqueFlag} onChange={this.objectUniqueChange} disabled={goods.confirm}>
                                            상품 실물확인 사용여부
                                        </Checkbox>
                                    </Flex>
                                }
                                <JustListSpace>
                                    <div>
                                        <GridColumns repeat={3} p={8} mb={8} fontSize={12} rounded={3} bc={'dark'} bg={'veryLight'}
                                                     custom={`
                                        // column-count: 3;
                                        // column-rule: 1px dotted gray;
                                        // column-gap: 16px;
                                        // height: 170px;
                                        // & > p {
                                        //     margin-bottom: 8px!important;
                                        // }
                                        // & > p:last-child {
                                        //     margin: 0;
                                        // }
                                    `}
                                        >
                                            <JustListSpace>
                                                <div>
                                                    <strong style={{color: color.green}}>첫번째 옵션의 가격은 판매가격과 자동 연동 됩니다.</strong>
                                                </div>
                                                <div>
                                                    <strong style={{color: color.green}}>정산예정금이란?</strong>

                                                    <Flex dot alignItems={'flex-start'}><div>배송비 조건에 따라 다를 수 있습니다.</div></Flex>
                                                    <Flex dot alignItems={'flex-start'}><div>행사 진행 시 사전협의된 금액으로 정산됩니다.</div></Flex>

                                                </div>
                                            </JustListSpace>
                                            <JustListSpace>
                                                <div>
                                                    <strong style={{color: color.green}}>판매개시가 되면</strong>
                                                    <Flex dot alignItems={'flex-start'}><div>행삭제 및 옵션명을 변경 할 수 없습니다.</div></Flex>
                                                    <Flex dot alignItems={'flex-start'}><div>행추가/옵션숨김/복원은 언제나 가능 합니다.</div></Flex>
                                                </div>
                                                <div>
                                                    <strong style={{color: color.green}}>특정옵션 재고 부족시 판매수량을 0으로 수정해 주세요</strong>
                                                </div>
                                            </JustListSpace>
                                            <JustListSpace>
                                                <div>
                                                    <strong style={{color: color.green}}>이벤트(포텐타임/슈퍼리워드) 기간일 경우</strong>
                                                    <Flex dot alignItems={'flex-start'}><div>옵션 수정이 불가능 합니다.</div></Flex>
                                                    <Flex dot alignItems={'flex-start'}><div>소비자에게 이벤트 진행중인 옵션 하나만 활성화 되며 이벤트 기간이 끝나면 자동으로 모든 옵션이 활성화(숨김 제외) 됩니다.</div></Flex>
                                                </div>

                                            </JustListSpace>

                                            {/*<div>*/}
                                            {/*    {*/}
                                            {/*        //생산자에게 슈퍼리워드, 포텐타임일 때 숨겨진것을 설명(관리자만 숨김 할 수 있기 때문)*/}
                                            {/*        ((goods.inSuperRewardPeriod || goods.inTimeSalePeriod) && enabledOptions.length ===  1) &&(*/}
                                            {/*            <Div fg={'danger'} mt={8} bold>*/}
                                            {/*                <div>*/}
                                            {/*                    {`${goods.inSuperRewardPeriod ? '슈퍼리워드' : ''}${goods.inTimeSalePeriod ? '포텐타임' : ''} 이벤트 진행중으로 [${enabledOptions[0].optionName}]을 제외한 나머지 옵션은 관리자에 의해 "숨김처리" 입니다.`}*/}
                                            {/*                </div>*/}
                                            {/*            </Div>*/}

                                            {/*        )*/}
                                            {/*    }*/}
                                            {/*</div>*/}
                                            {/*{*/}
                                            {/*    (goods.confirm && !this.state.isTempProdAdmin) && <Div fg={'danger'}>*판매가 시작되면 행추가 및 옵션명 수정불가. (특정옵션 재고 부족시 판매수량을 0으로 수정해 주세요)</Div>*/}
                                            {/*}*/}

                                        </GridColumns>
                                    </div>

                                    {
                                        ((!goods.goodsNo && !goods.objectUniqueFlag) || (goods.goodsNo && !goods.confirm && !goods.objectUniqueFlag) || (goods.goodsNo && goods.confirm && goods.options.length>0)) &&
                                        <Div mb={10}>
                                            <Space>
                                                {
                                                    !goods.objectUniqueFlag &&
                                                    <AdminLayouts.MenuButton bg={'green'} fg={'white'} px={10} onClick={this.addOptionClick} disabled={(goods.confirm && !this.state.isTempProdAdmin)}>
                                                        <FaPlusCircle/>{' 행추가'}
                                                    </AdminLayouts.MenuButton>
                                                }
                                                <Checkbox bg={'danger'} checked={this.state.showAllOptions} onChange={this.onShoAllCheckChange}>전체보기</Checkbox>
                                                <div>전체 {ComUtil.addCommas(this.state.goods.options.length)} / 숨김 {deletedOptions.length}</div>
                                            </Space>
                                            {
                                                validatedObj.options &&
                                                <Div fg={'danger'} fontSize={12} ml={1}>첫번째 옵션 상품은 기본 상품입니다. (판매수량만 확인해 주세요) </Div>
                                            }
                                            <div>
                                                <JustListSpace space={10}>
                                                    {
                                                        goods.options.map((item,index)=>{

                                                            if(!this.state.showAllOptions && item.deleted) {
                                                                return null
                                                            }

                                                            return (
                                                                <RowWrapper key={item.optionIndex} eventFlag={item.eventFlag} onClick={this.onApplyEventOptionClick.bind(this, index, !item.eventFlag)} isAdmin={this.state.isTempProdAdmin}>
                                                                    {/*<Div mr={8}>*/}
                                                                    {/*    <div style={{marginBottom: 1}}>*/}
                                                                    {/*        <StyledButton bg={'white'} width={22} height={22} p={0} disabled={index === 0} onClick={this.onSortDownClick.bind(this, index, -1)}><IoIosArrowUp/></StyledButton>*/}
                                                                    {/*    </div>*/}
                                                                    {/*    <div>*/}
                                                                    {/*        <StyledButton bg={'white'} width={22} height={22} p={0} disabled={index === 0} onClick={this.onSortDownClick.bind(this, index, 1)}><IoIosArrowDown/></StyledButton>*/}
                                                                    {/*    </div>*/}
                                                                    {/*</Div>*/}
                                                                    <AdminLayouts.MenuButton
                                                                        mr={8}
                                                                        height={45}
                                                                        bg={'danger'}
                                                                        fg={'white'}
                                                                        onClick={this.onDeleteClick.bind(this, {index})}
                                                                        disabled={index === 0 || (!item.isNew && this.state.goods.confirm)}
                                                                    >행삭제
                                                                    </AdminLayouts.MenuButton>
                                                                    {/* 숨김은 관리자만 가능 (수정모드/신규모드 상관없이 ) //포텐타임,슈퍼리워드 중에는 숨김해제 불가. */}

                                                                    {
                                                                        this.state.isTempProdAdmin && (
                                                                            <Div mr={8} width={69}>
                                                                                <AdminLayouts.MenuButton
                                                                                    block height={45}
                                                                                    fg={item.deleted ? 'green' : 'danger'}
                                                                                    onClick={this.onHideClick.bind(this, {index})}
                                                                                >
                                                                                    {item.deleted ? '숨김해제' : '숨기기'}
                                                                                </AdminLayouts.MenuButton>
                                                                            </Div>
                                                                        )
                                                                    }

                                                                    <Div
                                                                        custom={`
                                                        & > div > div {
                                                            width: 100%;
                                                            height: 100%;
                                                            overflow: hidden;
                                                        }
                                                        & > div > div > div {
                                                            width: 100%;
                                                            height: 100%;
                                                            margin: 0;
                                                        }
                                                        & > div:first-child {
                                                            width: 100px;
                                                            height: 45px;
                                                        }
                                                    `}>
                                                                        <SingleImageUploader
                                                                            images={item.optionImages}
                                                                            defaultCount={1}
                                                                            isShownMainText={false}
                                                                            onChange={this.onOptionImageChange.bind(this, index)}
                                                                            quality={1}
                                                                        />
                                                                    </Div>

                                                                    <Div flexGrow={1} ml={8}>
                                                                        <AdminLayouts.Label content={index === 0 && '*옵션명'} fg={'danger'}>
                                                                            <CustomInput type="text"
                                                                                         mr={8}
                                                                                         width={'100%'}
                                                                                         maxWidth={350}
                                                                                         index={index}
                                                                                         name={'optionName'}
                                                                                         value={item.optionName}
                                                                                onChange={this.onOptionInputChange}
                                                                                         onBlur={this.onOptionInputBlur}
                                                                                         fontSize={12}
                                                                                         placeholder={'옵션명'} //판매개시 되면 생산자는 옵션명 변경 불가
                                                                                         disabled={!this.state.isTempProdAdmin && goods.confirm}
                                                                            />
                                                                            {/*<OptionInput type="text"*/}
                                                                            {/*             readOnly={!this.state.isTempProdAdmin && goods.confirm}*/}
                                                                            {/*             mr={8}*/}
                                                                            {/*             width={'100%'}*/}
                                                                            {/*             maxWidth={350}*/}
                                                                            {/*             name={'optionName'}*/}
                                                                            {/*             value={item.optionName}*/}
                                                                            {/*             onChange={this.onOptionInputBlur.bind(this, index)}*/}
                                                                            {/*             fontSize={12}*/}
                                                                            {/*             placeholder={'옵션명'} />*/}
                                                                        </AdminLayouts.Label>
                                                                    </Div>

                                                                    {(goods.localGoodsNo && !goods.objectUniqueFlag) ?//재고관리용 sizeNo
                                                                    <AdminLayouts.Label content={index === 0 && '*단위코드'} fg={'danger'}>
                                                                        <CustomInput type="number"
                                                                            //underLine
                                                                                     ml={8}
                                                                                     width={100}
                                                                                     index={index}
                                                                                     name={'sizeNo'}
                                                                                     value={item.sizeNo}
                                                                                     onBlur={this.onOptionInputChange}
                                                                                     onBlur={this.onOptionInputBlur}
                                                                            //disabled={!item.isNew && goods.confirm}
                                                                                     fontSize={12}
                                                                                     placeholder={'재고관리용'}
                                                                        />
                                                                    </AdminLayouts.Label> : null
                                                                    }

                                                                    <AdminLayouts.Label content={index === 0 && '*판매수량'} fg={'danger'}>
                                                                        <CustomInput type="number"
                                                                            //underLine
                                                                                     ml={8}
                                                                                     width={100}
                                                                                     index={index}
                                                                                     name={'packCnt'}
                                                                                     value={item.packCnt}
                                                                            // onChange={this.onOptionInputBlur}
                                                                                     onBlur={this.onOptionInputBlur}
                                                                                     disabled={!item.isNew && goods.confirm}
                                                                                     fontSize={12}
                                                                                     placeholder={'판매수량(필수)'}
                                                                        />
                                                                    </AdminLayouts.Label>

                                                                    {
                                                                        (goods.goodsNo && !goods.inSuperRewardPeriod && !goods.inTimeSalePeriod) &&
                                                                        <Space spaceGap={8} ml={8}>
                                                                            <div><AdminLayouts.MenuButton height={45} disabled={item.isNew || !goods.confirm} onClick={this.modifyOptionPackCnt.bind(this, index)}>수정</AdminLayouts.MenuButton></div>
                                                                            <div><AdminLayouts.MenuButton height={45} disabled={item.isNew || !goods.confirm} onClick={this.resetOptionPackCnt.bind(this, index)}>원복</AdminLayouts.MenuButton></div>
                                                                        </Space>
                                                                    }
                                                                    <AdminLayouts.Label content={index === 0 && '잔여수량'}>
                                                                        <OptionInput
                                                                            ml={8}
                                                                            width={80}
                                                                            value={item.remainedCnt}
                                                                            disabled={true}
                                                                            fontSize={12}
                                                                            placeholder={'잔여수량'}
                                                                        />
                                                                    </AdminLayouts.Label>
                                                                    <AdminLayouts.Label content={index === 0 && '*판매가'} fg={'danger'}>
                                                                        <CustomInput type="number"
                                                                            // underLine
                                                                                     ml={8}
                                                                                     width={110}
                                                                                     index={index}
                                                                                     name={'optionPrice'}
                                                                            // value={(index === 0 && !goods.objectUniqueFlag) ? goods.currentPrice:item.optionPrice}
                                                                                     value={item.optionPrice}
                                                                            //disabled={index === 0 || (!this.state.isTempProdAdmin && goods.confirm)}
                                                                            // onChange={this.onOptionInputBlur}
                                                                                     onBlur={this.onOptionInputBlur}
                                                                            //disabled={index === 0} //참고 오른쪽 풀어도 로컬0번 가격 수정이 잘안됨 && !this.state.producerInfo.localfoodFlag} //생산자도 0번외에는 수정가능.
                                                                                     fontSize={12}
                                                                                     placeholder={'가격'  + ((index==0)?' (판매가)': ' (필수)') }
                                                                        />
                                                                    </AdminLayouts.Label>
                                                                    <AdminLayouts.Label content={index === 0 && '정렬'} >
                                                                        <CustomInput type="number"
                                                                            // underLine
                                                                                     ml={8}
                                                                                     width={70}
                                                                                     index={index}
                                                                                     name={'sortNum'}
                                                                                     value={item.sortNum}
                                                                                     onBlur={this.onOptionInputBlur}
                                                                                     disabled={index === 0 && !this.state.producerInfo.localfoodFlag} //생산자도 0번외에는 수정가능.
                                                                                     fontSize={12}
                                                                        />
                                                                    </AdminLayouts.Label>
                                                                    <Div ml={8} fg={'green'} fontSize={12} width={80}>
                                                                        <div>정산예정금</div>
                                                                        <div>{ComUtil.addCommas(ComUtil.roundDown(ComUtil.toNum(goods.options[index].optionPrice) - (ComUtil.toNum(goods.options[index].optionPrice)*ComUtil.toNum(this.state.selectedItemFeeRate)*0.01)), 0)} 원</div>
                                                                        {/*{*/}
                                                                        {/*    index === 0 && !goods.objectUniqueFlag?*/}
                                                                        {/*        <div>{ComUtil.addCommas(ComUtil.roundDown(ComUtil.toNum(goods.currentPrice) - (ComUtil.toNum(goods.currentPrice)*ComUtil.toNum(this.state.selectedItemFeeRate)*0.01)),0)} 원</div>*/}
                                                                        {/*        :*/}
                                                                        {/*        <div>{ComUtil.addCommas(ComUtil.roundDown(ComUtil.toNum(goods.options[index].optionPrice) - (ComUtil.toNum(goods.options[index].optionPrice)*ComUtil.toNum(this.state.selectedItemFeeRate)*0.01)), 0)} 원</div>*/}
                                                                        {/*}*/}
                                                                    </Div>


                                                                </RowWrapper>
                                                            )
                                                        })
                                                    }
                                                </JustListSpace>
                                            </div>
                                        </Div>
                                    }


                                </JustListSpace>
                            </Body>
                        </CollapseContainer>

                        <CollapseContainer title={'배송정보'}>
                            <Body>
                                {
                                    //(window.location.hostname === 'localhost') && ///Server._serverMode() === "stage") &&
                                    this.state.producerInfo.producerWrapDeliver &&  //2022.05: localfoodFlag에만 적용 (2022.07 일반 생산자 포함)
                                    <Label className={'text-secondary small'}>묶음 배송비 적용여부<Required/> (동일 생산자상품을 일정가격 이상 구매시 배송비할인 묶음배송)</Label>
                                }
                                {
                                    //(window.location.hostname === 'localhost') && ///Server._serverMode() === "stage") &&
                                    this.state.producerInfo.producerWrapDeliver &&  //2022.05: localfoodFlag에만 적용 (2022.07 일반 생산자 포함)
                                    <Flex py={8}>
                                        <Checkbox bg={'green'} checked={goods.producerWrapDelivered} onChange={this.producerWrapDeliveredChange}>묶음 배송 가능</Checkbox>
                                    </Flex>
                                }
                                <Div relative py={8}>
                                    {
                                        goods.producerWrapDelivered && (
                                            <Flex absolute fg={'white'} top={0} left={0} right={0} bottom={0} zIndex={1} bg={'rgba(0,0,0,0.3)'} justifyContent={'center'}>
                                                <div>
                                                    <Div fontSize={20} >
                                                        묶음 배송용 조건/배송비는 <b>[상점관리 > 상점정보]</b> 메뉴에서 설정 해주세요.
                                                    </Div>
                                                    <Div fontSize={16} >
                                                        {`현재 ${ComUtil.addCommas(goods.deliveryQty)}원이상 배송비 ${ComUtil.addCommas(goods.deliveryFee)}원 으로 설정되어 있습니다.`}
                                                    </Div>
                                                </div>
                                            </Flex>
                                        )
                                    }
                                    <Div maxWidth={400}>
                                        <InputGroup>
                                            <CurrencyInput
                                                disabled={goods.termsOfDeliveryFee === TERMS_OF_DELIVERYFEE.NO_FREE || goods.termsOfDeliveryFee === TERMS_OF_DELIVERYFEE.FREE} readOnly={goods.producerWrapDelivered} //readOnly={goods.producerWrapDelivered && goods.deliveryQty}
                                                style={{width:50}} name={this.names.deliveryQty} value={goods.deliveryQty} onChange={this.onInputChange} placeholder={'배송조건(숫자)'}/>
                                            <InputGroupButtonDropdown addonType="append" style={{zIndex:0}} isOpen={this.state.isDeliveryFeeTermsOpen} toggle={()=>this.setState({isDeliveryFeeTermsOpen:!this.state.isDeliveryFeeTermsOpen})}>
                                                <DropdownToggle caret>
                                                    {
                                                        termsOfDeliveryFeeLabel
                                                    }
                                                </DropdownToggle>
                                                { goods.producerWrapDelivered ? null :
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
                                    </Div>
                                    <Div maxWidth={400}>
                                        <Label className={'text-secondary small'}>배송비<Required/></Label>
                                        <CurrencyInput disabled={goods.termsOfDeliveryFee === TERMS_OF_DELIVERYFEE.FREE}  name={this.names.deliveryFee} value={goods.deliveryFee} readOnly={goods.producerWrapDelivered }  //readOnly={goods.producerWrapDelivered && goods.deliveryFee}
                                                       onChange={this.onInputChange} placeholder={'배송비'}
                                        />
                                        {
                                            validatedObj.deliveryFee && <Div fg={'danger'}><small>{validatedObj.deliveryFee}</small></Div>
                                        }
                                    </Div>
                                </Div>
                            </Body>
                        </CollapseContainer>
                        <CollapseContainer title={'판매종료일'}>
                            <Body>
                                <Flex>

                                    <Checkbox bg={'green'} checked={goods.settingSaleEnd} onChange={this.saleEndChange}>판매종료일 지정</Checkbox>

                                    {goods.settingSaleEnd ?
                                        <Flex className='ml-3'>
                                            <SingleDatePicker
                                                placeholder="판매종료일"
                                                date={goods.saleEnd ? moment(goods.saleEnd) : null}
                                                onDateChange={this.onDateChange}
                                                focused={this.state['focused']} // PropTypes.bool
                                                onFocusChange={({focused}) => this.setState({['focused']: focused})} // PropTypes.func.isRequired
                                                id={"stepPriceDate"} // PropTypes.string.isRequired,
                                                numberOfMonths={1}
                                                withPortal
                                                small
                                                readOnly
                                                calendarInfoPosition="top"
                                                enableOutsideDays
                                                // daySize={45}
                                                verticalHeight={700}
                                                // renderCalendarInfo={this.renderUntilCalendarInfo.bind(this, stepNo)}
                                            />
                                            {
                                                goods.settingSaleEnd &&
                                                <Fade in={true} className="text-danger small ml-3" >{"설정한 기간까지만 상품이 노출됩니다."}</Fade>
                                            }
                                        </Flex>
                                        :
                                        null
                                    }
                                </Flex>
                            </Body>
                        </CollapseContainer>

                        <CollapseContainer title={'발송일'}>
                            <Body>
                                <JustListSpace>
                                    <Flex>
                                        <Checkbox bg={'green'} checked={goods.settingExpectShipping} onChange={this.settingExpectShippingChange}>발송일 적용</Checkbox>
                                        <div className='ml-2'>
                                            {
                                                goods.settingExpectShipping &&
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
                                                    withPortal
                                                    small
                                                    readOnly
                                                    showClearDates
                                                    calendarInfoPosition="top"
                                                    // isDayBlocked={(date)=>{
                                                    //     //상품판매기한보다 작거나 같은 일자는 블록처리하여 선택할 수 없도록 함
                                                    //     if(date.isSameOrBefore(moment(goods.saleEnd))) return true
                                                    //     return false
                                                    // }}
                                                    // renderCalendarInfo={this.renderExpectShippingCalendarInfo}
                                                    // displayFormat={'YYYY.MM.DD'}
                                                />
                                            }
                                        </div>

                                    </Flex>
                                    {
                                        goods.settingExpectShipping &&
                                        <Flex>
                                            <Checkbox bg={'green'} checked={goods.hopeDeliveryFlag} onChange={this.onHopeDeliveryFlag}>소비자 희망수령일 기능 적용</Checkbox>
                                            <div>
                                                {
                                                    (goods.settingExpectShipping && goods.hopeDeliveryFlag) &&
                                                    <Fade in={validatedObj.expectShippingDate} className="text-danger small mt-1" >{validatedObj.expectShippingDate}</Fade>
                                                }
                                            </div>
                                        </Flex>
                                    }
                                </JustListSpace>
                            </Body>
                        </CollapseContainer>

                        <CollapseContainer title={'상품상세설명'}>
                            <Body>
                                <Label className={'text-secondary small'}>(에디터의 모든 이미지는 샵블리 > 상품상세에서 가로 100%로 자동 반영 됩니다.)</Label>
                                <div>
                                    <Div mb={5}>
                                        <Space>
                                            <Button onClick={this.onTemplateClick.bind(this,'BASIC')} bg={'secondary'} fg={'white'}>템플릿양식(일반)</Button>
                                            <Button onClick={this.onTemplateClick.bind(this,'AHP')} bg={'secondary'} fg={'white'}>템플릿양식[축산(돼지)]</Button>
                                            <Button onClick={this.onTemplateClick.bind(this,'AHC')} bg={'secondary'} fg={'white'}>템플릿양식[축산(소)]</Button>
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
                                </div>
                            </Body>
                        </CollapseContainer>

                        <CollapseContainer title={'인증마크 서류'}>
                            <Body>
                                <JustListSpace>
                                    <div>
                                        <Label className={'text-secondary text-danger small'}>국가 인증마크를 많이 업로드할수록, 검색시 상위리스트로 노출될 가능성이 높아집니다.</Label>
                                        {
                                            arrAuthFile.map((empty, index) => {
                                                const vFileNo = index + 1;
                                                const authFile = goods.authFiles && goods.authFiles.length > 0 ? goods.authFiles.find((authFile) => authFile && authFile.fileNo === vFileNo) : {fileNo: vFileNo, filePath: '', fileName:'', fileExtsn: ''}
                                                return(
                                                    <FormGroup inline key={vFileNo}>
                                                        <Row>
                                                            <Col sm={9}>
                                                                <SingleFileUploader name={index} fileNo={vFileNo} fileGubun='producerauthfile' file={authFile} onChange={this.onAuthFileChange}/>
                                                            </Col>
                                                        </Row>
                                                    </FormGroup>
                                                )
                                            })
                                        }
                                    </div>
                                    <div>
                                        <AuthMark
                                            isPrint={!isTempProdAdmin}
                                            infoValues={this.state.goods.authMarkInfo}
                                            onChange={this.onAuthMarkChange}
                                        />
                                    </div>
                                </JustListSpace>
                            </Body>
                        </CollapseContainer>

                        <CollapseContainer title={'#상품 태그'} subTitle={'상품 검색 또는 상품의 연관된 상품을 찾기위해 사용 됩니다.(상품상세의 연관상품 에서)'}>
                            <Body>
                                <Label className={'text-secondary small'}>"#"을 제외한 노출될 단어를 입력해 주세요. 예) 상추, 사과, 유기농, 이력추적, 존맛탱, 선물, 추천상품</Label>
                                <Tag tags={goods.tags} onChange={this.onTagChange} />
                            </Body>
                        </CollapseContainer>
                        {
                            this.state.isTempProdAdmin && (
                                <CollapseContainer title={'#그룹 태그'} subTitle={'상품의 그룹(카테고리) 태그 입니다. 관리자의 그룹태그관리와 연동되어 사용 되며 상품검색에서 사용 되지 않습니다.'}>
                                    <Body>
                                        <Label className={'text-secondary small'}>"#"을 제외한 노출될 단어를 입력해 주세요. 예) 제철상품, 사과베스트</Label>
                                        <Tag tags={goods.groupTags} onChange={this.onGroupTagChange} />
                                    </Body>
                                </CollapseContainer>
                            )
                        }
                        {/* 버튼 */}
                        <div className={'d-flex justify-content-center w-100'} style={{position: 'fixed', zIndex:1, bottom: 0, left: 0, padding: 16, background: color.background}}>
                            <Space spaceGap={8}>
                                {btnAddTempGoods && btnAddTempGoods}
                                {btnCopy && btnCopy}
                                {btnPreview && btnPreview}
                                {btnConfirm && btnConfirm}
                                {btnUpdate && btnUpdate}
                                {btnDelete && btnDelete}
                                {btnPaused && btnPaused}
                                {btnResume && btnResume}
                                {btnGoodsStop && btnGoodsStop}
                            </Space>
                        </div>

                    </JustListSpace>

                    {
                        this.state.isGoodsCopySelectionOpen && (
                            <ModalPopup
                                title={'상품 복사 종류 선택'}
                                onClick={this.onGoodsCopySelectionPopupClose}
                                showFooter={false}
                                content={
                                    <div>
                                        <div>
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
                                        </div>
                                    </div>
                                }/>
                        )
                    }

                    <ModalWithNav show={this.state.isOpen} title={'상품미리보기'} onClose={this.onPreviewClose} noPadding={true}>
                        <div>
                            <Row>
                                <Col className='p-0 position-relative'>
                                    <iframe
                                        src={`/goods?goodsNo=${goods.goodsNo}`}
                                        style={{width: '100%', height: 760}}
                                    ></iframe>
                                </Col>
                            </Row>
                        </div>
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

                </Div>

            </Div>
        )
    }

}

