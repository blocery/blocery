import React, { Component, Fragment } from 'react'
import {FormGroup, Button, Input} from 'reactstrap'
import { getPaymentLocalProducer } from '~/lib/producerApi'
import { getLoginProducerUser } from "~/lib/loginApi";
import ComUtil from '~/util/ComUtil'
import { ExcelDownload } from '~/components/common'
import {Flex, Div, Span, Space, Right} from "~/styledComponents/shared";
import moment from 'moment-timezone'
import {localReplaceText} from "~/util/bzLogic";

//ag-grid
import { AgGridReact } from 'ag-grid-react';
import SearchDates from "~/components/common/search/SearchDates";
import MathUtil from "~/util/MathUtil";
import ExcelUtil from "~/util/ExcelUtil";
import {MenuButton} from "~/styledComponents/shared/AdminLayouts";
const isLocalFoodAdjDeliveryChk = (data) => {
    if(data.producerNo == 157){
        return true;
    }
    return false;
}
export default class WebCalculateLocal extends Component {
    constructor(props) {
        super(props);
        this.summaryGridRef = React.createRef();
        this.gridRef = React.createRef();
        this.state = {
            btnSearchLoading: false,
            loginUser: null,
            isSearchDataExist:false,
            search: {
                selectedGubun: '', //'week': 최초화면을 오늘(day)또는 1주일(week)로 설정.
                startDate: moment(moment().toDate()).startOf("month").add(-1,"days").startOf("month"),
                endDate: moment(moment().toDate()).startOf("month").add(-1, "days").endOf('month'),
                isConsumerOk: 'Y',
            },
            selectedRows: [],
            tipOpen: false,
            dataOrigin: null,
            summaryData: [],
            data: null,
            excelData: {
                columns: [],
                data: []
            },
            excelDtlData: {
                columns: [],
                data: []
            },
            totalData:{
                totalSumConsumerGoodsPrice:0,
                totalSumGoodsPrice:0,
                totalSumTotalFeeRateMoney:0,
                totalSumDeliveryFee:0,
                totalSumSupportPrice:0,
                totalSumSimplePayoutAmount:0,
                totalSumSupplyValue:0,
                totalSumVat:0
            },
            columnSummaryDefs: [
                {
                    headerName: "농가정보",
                    children: [
                        {headerName: "농가명", field: "sumLocalFarmerNm", cellStyle:{"textAlign":"left", 'background-color': '#f1fff1'}, width: 140},
                        {headerName: "농가번호", field: "sumLocalFarmerNo", cellStyle:{"textAlign":"left", 'background-color': '#f1fff1'}, width: 90}
                    ]
                },
                {
                    headerName: "매출내역 (A = B + C)",
                    children: [
                        {headerName: '소비자결제금액(A)',width: 150, field: 'sumConsumerGoodsPrice', cellStyle: {"textAlign":"left", 'background-color': '#fafab4'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}},
                        {headerName: '판매원가(B)',width: 120, field: 'sumTotalGoodsPrice', cellStyle: {"textAlign":"left", 'background-color': '#fafab4'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}},
                        {headerName: '배송비(C)',width: 110, field: 'sumDeliveryFee', cellStyle: {"textAlign":"left", 'background-color': '#fafab4'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}}
                    ]
                },
                // {
                //     headerName: "지원금",
                //     children: [
                //         {headerName: '쿠폰지원금(D)',width: 120, field: 'sumTotalSupportPrice', cellStyle: {"textAlign":"left", 'background-color': '#d9d9d9'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}},
                //     ]
                // },
                {
                    headerName: "정산내역 ( F = B - E )",
                    children: [
                        {headerName: '수수료(E)=판매원가*수수료율',width: 200, field: 'sumTotalFeeRateMoney', cellStyle: {"textAlign":"left", 'background-color': '#ffe3ee'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}},
                        {headerName: '업체지급금액(F)',width: 200, field: 'sumSimplePayoutAmount', cellStyle: {"textAlign":"left", 'font-weight' : 'bold', 'background-color': '#EBFBFF'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}}
                    ]
                },
                {
                    headerName: "과세정보",
                    children: [
                        {headerName: '공급가액(G=F-H)',width: 200, field: 'sumTotalSupplyValue', cellStyle: {"textAlign":"left", 'background-color': '#EBFBFF'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}},
                        {headerName: '부가세(H)',width: 200, field: 'sumTotalVat', cellStyle: {"textAlign":"left", 'background-color': '#EBFBFF'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true},},
                        {headerName: "과세여부", field: "sumVatFlag", cellStyle:{"textAlign":"left", 'background-color': '#f1fff1'}, width: 90}
                    ]
                },
            ],
            columnDefs: [
                {
                    headerName: "주문내역",
                    children: [
                        {
                            headerName: '확정일',width: 140, field: 'consumerOkDate', cellStyle:{"textAlign":"left", 'background-color': '#f1fff1'}, filterParams:{clearButton: true},
                            valueGetter: function(params) {
                                return ComUtil.utcToString(params.data.consumerOkDate,'YYYY-MM-DD HH:mm');
                            }
                        },
                        {
                            headerName: '주문일',width: 140, field: 'orderDate', cellStyle:{"textAlign":"left", 'background-color': '#f1fff1'}, filterParams:{clearButton: true},
                            valueGetter: function(params) {
                                return ComUtil.utcToString(params.data.orderDate,'YYYY-MM-DD HH:mm');
                            }
                        },
                        {headerName: '주문번호',width: 100, field: 'orderSeq', cellStyle:{"textAlign":"left", 'background-color': '#f1fff1'}, filterParams:{clearButton: true}},
                        {headerName: '주문자',width: 90, field: 'consumerNm', cellStyle:{"textAlign":"left", 'background-color': '#f1fff1'}, filterParams:{clearButton: true}},
                        {
                            headerName: '구분', width: 90, field: 'consumerNm', cellStyle:{"textAlign":"left", 'background-color': '#f1fff1'}, filterParams:{clearButton: true},
                            valueGetter: function(params) {
                                return localReplaceText(params.data)
                                // return (params.data.csRefundFlag && params.data.orderPrice < 0) ? "- 전표" :
                                //     (params.data.csRefundFlag && params.data.orderPrice > 0) ? "+ 전표" :
                                //         params.data.replaceFlag ? "-대체" : "일반"
                            }
                        },
                        // {headerName: '로컬농가No',width: 120, field: 'localfoodFarmerNo', cellStyle:{"textAlign":"left", 'background-color': '#f1fff1'}, filterParams:{clearButton: true}},
                        {headerName: '로컬농가No',width: 120, field: 'localFarmerNo', cellStyle:{"textAlign":"left", 'background-color': '#f1fff1'}, filterParams:{clearButton: true}},
                        {headerName: '로컬농가',width: 90, field: 'localFarmName', cellStyle:{"textAlign":"left", 'background-color': '#f1fff1'}, filterParams:{clearButton: true}},
                        {headerName: '상품번호',width: 90, field: 'goodsNo', cellStyle:{"textAlign":"left", 'background-color': '#f1fff1'}, filterParams:{clearButton: true}},
                        {headerName: '품목',width: 250, field: 'goodsNm', cellStyle:{"textAlign":"left", 'background-color': '#f1fff1'}, filterParams:{clearButton: true}},
                        {
                            headerName: '상품구분',width: 90, field: 'timeSaleGoods', cellStyle:{"textAlign":"left", 'background-color': '#f1fff1'}, filterParams:{clearButton: true},
                            valueGetter: function(params) {
                                return params.data.timeSaleGoods? "포텐타임" : params.data.blyTimeGoods? "블리타임" : params.data.superRewardGoods? "슈퍼리워드" : "일반상품";
                            }
                        },
                        {
                            headerName: '환불여부',width: 110, field: 'refundFlag', cellStyle:{"textAlign":"left", 'background-color': '#f1fff1'}, filterParams:{clearButton: true},
                            valueGetter: function(params) {
                                return params.data.refundFlag? "환불" : (params.data.partialRefundCount > 0 ? `(+부분환불 ${params.data.partialRefundCount}건)` : "-");
                            }
                        },
                        {headerName: '판매가',width: 80, field: 'currentPrice', cellStyle:{"textAlign":"left", 'background-color': '#f1fff1'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}},
                        {
                            headerName: '쿠폰지원금',width: 100, field: 'timeSaleSupportPrice', cellStyle:{"textAlign":"left", 'background-color': '#f1fff1'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true},
                            valueGetter: function(params) {
                                let supportPrice = 0;
                                if(params.data.timeSaleGoods) {
                                    supportPrice = MathUtil.roundHalf(MathUtil.dividedBy(MathUtil.multipliedBy(params.data.usedCouponBlyAmount,params.data.orderBlctExchangeRate),params.data.orderCnt));
                                }
                                return supportPrice;
                            }
                        },
                        {headerName: '수량',width: 70, field: 'orderCnt', cellStyle:{"textAlign":"left", 'background-color': '#f1fff1'}, filterParams:{clearButton: true}},
                        {
                            headerName: '과세여부',width: 90, field: 'vatFlag', cellStyle:{"textAlign":"left", 'background-color': '#f1fff1'}, filterParams:{clearButton: true},
                            valueGetter: function(params) {
                                return params.data.vatFlag? "과세" : "면세";
                            }
                        },
                    ]
                },
                {
                    headerName: "매출내역 (소비자결제금액 A = B + C)",
                    children: [
                        {
                            headerName: '소비자결제금액(A)',width: 130, field: 'consumerGoodsPrice', cellStyle: {"textAlign":"left", 'background-color': '#fafab4'},
                            cellRenderer: 'formatCurrencyRenderer',
                            filterParams:{clearButton: true},
                            valueGetter: function(params) {
                                return params.data.totalGoodsPrice + params.data.totalSupportPrice + params.data.adminDeliveryFee;
                            }
                        },
                        {headerName: '판매원가(B)',width: 100, field: 'totalGoodsPrice', cellStyle: {"textAlign":"left", 'background-color': '#fafab4'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}},
                        {headerName: '배송비(C)',width: 90, field: 'adminDeliveryFee', cellStyle: {"textAlign":"left", 'background-color': '#fafab4'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}},
                    ]
                },
                {
                    headerName: "지원금",
                    children: [
                        {
                            headerName: '쿠폰지원금(D)',width: 120, field: 'totalSupportPrice', cellStyle: {"textAlign":"left", 'background-color': '#d9d9d9'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true},
                            valueGetter: function(params) {
                                let supportPrice = 0;
                                if(params.data.timeSaleGoods) {
                                    supportPrice = MathUtil.roundHalf(MathUtil.multipliedBy(params.data.usedCouponBlyAmount,params.data.orderBlctExchangeRate));
                                }
                                return supportPrice;
                            }
                        },
                    ]
                },
                {
                    headerName: "수수료(판매원가 * 수수료율)",
                    children: [
                        {
                            headerName: '수수료율(%)',width: 110, field: 'feeRate', cellStyle: {"textAlign":"left", 'background-color': '#ffe3ee'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true},
                            valueGetter: function(params) {
                                return params.data.timeSaleGoods ? "-" : (params.data.blyTimeGoods ? "-" : (params.data.superRewardGoods ? "-" : params.data.feeRate.toFixed(2)));
                            }
                        },
                        {
                            headerName: '수수료(E)',width: 100, field: 'totalFeeRateMoney', cellStyle: {"textAlign":"left", 'background-color': '#ffe3ee'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true},
                            valueGetter: function(params) {
                                return MathUtil.multipliedBy(MathUtil.roundHalf(MathUtil.multipliedBy(params.data.currentPrice,MathUtil.dividedBy(params.data.feeRate,100))),params.data.orderCnt);
                            }
                        },
                    ]
                },
                {
                    headerName: "정산금액(F)",
                    children: [
                        {
                            headerName: '(F)=B-E',
                            width: 100, field: 'simplePayoutAmount', cellStyle: {"textAlign":"left", 'background-color': '#EBFBFF'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true},
                            valueGetter: function(params) {
                                let paymentAmt = params.data.simplePayoutAmount;
                                if(isLocalFoodAdjDeliveryChk(params.data)){
                                    paymentAmt = MathUtil.minusBy(params.data.simplePayoutAmount,params.data.adminDeliveryFee);
                                }
                                return paymentAmt;
                            }
                        },
                    ]
                },
                {
                    headerName: "공급가액(G)",
                    children: [
                        {
                            headerName: '(G)=F-H',width: 100, field: 'totalSupplyValue', cellStyle: {"textAlign":"left", 'background-color': '#EBFBFF'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true},
                            valueGetter: function(params) {
                                let paymentAmt = params.data.simplePayoutAmount;
                                if(isLocalFoodAdjDeliveryChk(params.data)){
                                    paymentAmt = MathUtil.minusBy(params.data.simplePayoutAmount,params.data.adminDeliveryFee);
                                }
                                return params.data.vatFlag ? MathUtil.roundHalf(MathUtil.dividedBy(paymentAmt,1.1)) : paymentAmt;
                            }
                        },
                    ]
                },
                {
                    headerName: "부가세(H)",
                    children: [
                        {
                            headerName: '(H)',width: 110, field: 'totalVat', cellStyle: {"textAlign":"left", 'background-color': '#EBFBFF'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true},
                            valueGetter: function(params) {
                                let paymentAmt = params.data.simplePayoutAmount;
                                if(isLocalFoodAdjDeliveryChk(params.data)){
                                    paymentAmt = MathUtil.minusBy(params.data.simplePayoutAmount,params.data.adminDeliveryFee);
                                }
                                return params.data.vatFlag ? MathUtil.roundHalf(MathUtil.multipliedBy(MathUtil.dividedBy(paymentAmt,1.1),0.1)) : 0;
                            }
                        },
                    ]
                }
            ],
            defaultColDef: {
                width: 130,
                resizable: true,
                filter: true,
                sortable: true,
                floatingFilter: false,
                filterParams: {
                    newRowsAction: 'keep'
                }
            },
            frameworkComponents: {
                // checkModifyRenderer: this.checkModifyRenderer,
            },
            components: {
                formatCurrencyRenderer: this.formatCurrencyRenderer,
            },
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 정산 내역이 없습니다.</span>',
        }
    }

    async componentDidMount() {

        await this.getUser();

        const {api:summaryGridApi} = this.summaryGridRef.current;
        if(summaryGridApi) {
            //ag-grid 레이지로딩중 감추기
            summaryGridApi.hideOverlay()
        }
    }

    getUser = async() => {
        //로그인 체크
        const loginUser = await getLoginProducerUser();
        if(!loginUser) {
            this.props.history.push('/producer/webLogin')
        }
        this.setState({
            loginUser: loginUser
        })
    }

    formatCurrencyRenderer = ({value, data:rowData}) => {
        return ComUtil.addCommas(value);
    }

    //[이벤트] 그리드 로드 후 callback 이벤트
    onSummaryGridReady(e) {
        //API init
        this.summaryGridApi = e.api;
        //this.summeryGridColumnApi = params.columnApi;
    }
    // onSummaryGridFilterChanged () {
    //     // this.setExcelData();
    // }

    //[이벤트] 그리드 로드 후 callback 이벤트
    onGridReady(e) {
        //API init
        this.gridApi = e.api;
        this.gridColumnApi = e.columnApi;
    }

    makeTitleText = () => {
        return "샵블리 " + this.makeMonthText();
    }

    makeMonthText = () => {
        const title = moment(this.state.search.startDate).format("YYMMDD")+"_"+moment(this.state.search.endDate).format("YYMMDD")+"내역";
        return title;
    }

    onRefreshClick = async() => {
        const startDate = moment(this.state.search.startDate);
        const endDate = moment(this.state.search.endDate);
        const daysCnt = endDate.diff(startDate, 'days');
        if(daysCnt > 31){
            alert("31일 이상으로 검색을 하실 수 없습니다. 한달안으로 검색조건을 변경하세요.")
            return;
        }
        this.search();
    }

    search = async() => {
        const {api:summaryGridApi} = this.summaryGridRef.current;
        if (summaryGridApi) {
            //ag-grid 레이지로딩중 보이기
            summaryGridApi.showLoadingOverlay();
        }
        this.setState({btnSearchLoading: true})
        const startDate = this.state.search.startDate ?  moment(this.state.search.startDate).format("YYYYMMDD"):null;
        const endDate = this.state.search.endDate ?  moment(this.state.search.endDate).format("YYYYMMDD"):null;
        const isConsumerOk = this.state.search.isConsumerOk === 'Y' ? true:false;

        let {data} = await getPaymentLocalProducer(startDate, endDate, isConsumerOk);
        // console.log(data);
        let isSearchDataExist = data.length > 0;

        const list = data;
        const localfoodFarmerListObj = [];
        const localfoodFarmerSumObj = [];

        // 농가번호 + 과세및비과세 로 키 생성
        list.map(item => {
            const key = item.localfoodFarmerNo+"_"+(item.vatFlag?"TAX":"TAXFREE");
            if(!localfoodFarmerListObj[key])
                localfoodFarmerListObj[key] = []

            localfoodFarmerListObj[key] = localfoodFarmerListObj[key].concat(item)
        });

        //console.log("localfoodFarmerListObj",localfoodFarmerListObj)

        let totalSumConsumerGoodsPrice = 0;
        let totalSumGoodsPrice = 0;
        let totalSumTotalFeeRateMoney = 0;
        let totalSumDeliveryFee = 0;
        let totalSumSupportPrice = 0;
        let totalSumSimplePayoutAmount = 0;
        let totalSumSupplyValue = 0;
        let totalSumVat = 0;

        Object.keys(localfoodFarmerListObj).map(localfoodFarmerkey => {
            let localFarmerNo = "";
            let localFarmerNm = "";
            const vatFlag = localfoodFarmerkey.includes("TAXFREE") ? "면세":"과세";
            const list = localfoodFarmerListObj[localfoodFarmerkey];
            let sumConsumerGoodsPrice = 0;
            let sumTotalGoodsPrice = 0;
            let sumTotalFeeRateMoney = 0;
            let sumTotalSupportPrice = 0;
            let sumDeliveryFee = 0;
            let sumSimplePayoutAmount = 0;
            let sumTotalSupplyValue = 0;
            let sumTotalVat = 0;
            list.map(itemOD => {
                // localFarmerNo = itemOD.localfoodFarmerNo;
                localFarmerNo = itemOD.localFarmerNo; //2209 바코드로 수정.
                localFarmerNm = itemOD.localFarmName;
                let consumerGoodsPrice = itemOD.totalGoodsPrice + itemOD.adminDeliveryFee;
                let totalFeeRateMoney = MathUtil.multipliedBy(
                    MathUtil.roundHalf(
                        MathUtil.multipliedBy(itemOD.currentPrice,
                            MathUtil.dividedBy(itemOD.feeRate,100)
                        )
                    ),itemOD.orderCnt);

                sumConsumerGoodsPrice = sumConsumerGoodsPrice + consumerGoodsPrice;
                sumTotalGoodsPrice = sumTotalGoodsPrice + itemOD.totalGoodsPrice;
                // 포텐타임의 경우에만 더해야함.
                if(itemOD.timeSaleGoods) {
                    sumTotalSupportPrice = sumTotalSupportPrice + MathUtil.roundHalf(MathUtil.multipliedBy(itemOD.usedCouponBlyAmount,itemOD.orderBlctExchangeRate));
                }
                sumDeliveryFee = sumDeliveryFee + itemOD.adminDeliveryFee;
                sumTotalFeeRateMoney = sumTotalFeeRateMoney + totalFeeRateMoney;

                //백엔드 업체지급금액 (배송비 포함된가격이라 배송비를 빼야함)
                const paymentAmt = MathUtil.minusBy(itemOD.simplePayoutAmount,itemOD.adminDeliveryFee);
                sumSimplePayoutAmount = sumSimplePayoutAmount + paymentAmt;

                //업체지급금액(판매원가 - 수수료)
                //const paymentAmt = MathUtil.minusBy(itemOD.totalGoodsPrice,totalFeeRateMoney);
                //sumSimplePayoutAmount = sumSimplePayoutAmount + paymentAmt;

                if(!itemOD.refundFlag){
                    if(itemOD.vatFlag) {
                        //공급가액 : 업체지급금액 - 부가세(업체지급금액 / (1.1 * 0.1))
                        //sumTotalSupplyValue = sumTotalSupplyValue + (paymentAmt - Math.round(MathUtil.dividedBy(paymentAmt,MathUtil.multipliedBy(1.1,0.1))));
                        //부가세 : (업체지급금액 / (1.1 * 0.1))
                        //sumTotalVat = sumTotalVat + Math.round(MathUtil.dividedBy(paymentAmt,MathUtil.multipliedBy(1.1,0.1)));

                        //공급가액 : 업체지급금액 - 부가세( (업체지급금액 % 1.1) * 0.1 )
                        sumTotalSupplyValue = sumTotalSupplyValue + MathUtil.roundHalf(MathUtil.dividedBy(paymentAmt,1.1));
                        //부가세 : (업체지급금액 % 1.1) * 0.1
                        sumTotalVat = sumTotalVat + MathUtil.roundHalf(MathUtil.multipliedBy(MathUtil.dividedBy(paymentAmt,1.1),0.1));
                    }else{
                        sumTotalSupplyValue = sumTotalSupplyValue + paymentAmt;
                        sumTotalVat = sumTotalVat + 0;
                    }
                }
            })
            /*
            summaryTotalSupportPrice:0,
            summaryDeliveryFee:0,
            summaryTotalFeeRateMoney:0,
            summarySimplePayoutAmount:0,
            summaryTotalSupplyValue:0,
            summaryTotalVat:0
            * */
            totalSumConsumerGoodsPrice = totalSumConsumerGoodsPrice + sumConsumerGoodsPrice;
            totalSumGoodsPrice = totalSumGoodsPrice + sumTotalGoodsPrice;
            totalSumTotalFeeRateMoney = totalSumTotalFeeRateMoney + sumTotalFeeRateMoney;
            totalSumDeliveryFee = totalSumDeliveryFee + sumDeliveryFee;
            totalSumSupportPrice = totalSumSupportPrice + sumTotalSupportPrice;
            totalSumSimplePayoutAmount = totalSumSimplePayoutAmount + sumSimplePayoutAmount;
            totalSumSupplyValue = totalSumSupplyValue + sumTotalSupplyValue;
            totalSumVat = totalSumVat + sumTotalVat;

            const itemData = {
                sumLocalFarmerNo:localFarmerNo,
                sumLocalFarmerNm:localFarmerNm,
                sumVatFlag:vatFlag,
                sumConsumerGoodsPrice:sumConsumerGoodsPrice,
                sumTotalGoodsPrice:sumTotalGoodsPrice,
                sumDeliveryFee:sumDeliveryFee,
                sumTotalSupportPrice:sumTotalSupportPrice,
                sumTotalFeeRateMoney:sumTotalFeeRateMoney,
                sumSimplePayoutAmount:sumSimplePayoutAmount,
                sumTotalSupplyValue:sumTotalSupplyValue,
                sumTotalVat:sumTotalVat,
            }
            localfoodFarmerSumObj.push(itemData)
        });
        //console.log("localfoodFarmerSumObj",localfoodFarmerSumObj)
        this.setState({
            btnSearchLoading: false,
            isSearchDataExist: isSearchDataExist,
            totalData: {
                totalSumConsumerGoodsPrice,
                totalSumGoodsPrice,
                totalSumTotalFeeRateMoney,
                totalSumDeliveryFee,
                totalSumSupportPrice,
                totalSumSimplePayoutAmount,
                totalSumSupplyValue,
                totalSumVat,
            },
            summaryData: localfoodFarmerSumObj,
            dataOrigin:data,
            // data: data
        })

        this.setExcelData();

        if(summaryGridApi) {
            //ag-grid 레이지로딩중 감추기
            summaryGridApi.hideOverlay();

            if(localfoodFarmerListObj && localfoodFarmerListObj.length == 0){
                summaryGridApi.showNoRowsOverlay();
            }
        }
    }


    setExcelData = () => {
        if(!this.summaryGridApi)
            return;

        const excelData = this.getExcelData();
        this.setState({
            excelData: excelData,
        })
    }

    getExcelData = () => {
        const columns = [
            '농가명','농가번호',
            '소비자결재금액(A)', '판매원가(B)', '배송비(C)',
            //'쿠폰지원금(D)',
            '수수료(E)',
            '업체지급금액(F)', '공급가액(G)', '부가세(H)',
            '과세여부'
        ]

        const excelData = this.state.summaryData.map((item) => {
            return [
                item.sumLocalFarmerNm, item.sumLocalFarmerNo,
                item.sumConsumerGoodsPrice,
                item.sumTotalGoodsPrice,
                item.sumDeliveryFee,
                //item.sumTotalSupportPrice,
                item.sumTotalFeeRateMoney,
                item.sumSimplePayoutAmount,
                item.sumTotalSupplyValue,
                item.sumTotalVat,
                item.sumVatFlag
            ]
        });

        // console.log(JSON.stringify(excelData));
        return [{
            columns: columns,
            data: excelData,
        }]
    }

    onExcelDownloadDtl = () => {
        const selectedRows = this.state.selectedRows;
        let title = "";
        if(selectedRows != null){
            title = `${selectedRows[0].sumLocalFarmerNm}_${selectedRows[0].sumLocalFarmerNo}_${selectedRows[0].sumVatFlag}`;
        }
        const title2 = moment(this.state.search.startDate).format("YYMMDD")+"_"+moment(this.state.search.endDate).format("YYMMDD")+"내역";
        const fileName =  "샵블리 " + title + " " + title2;

        const excelData = this.getExcelDtlData();
        ExcelUtil.download(fileName, excelData)
    }

    getExcelDtlData = () => {

        let columns = [
            '확정일', '주문일', '주문번호', '주문자',
            '상품번호', '품목', '상품구분', '환불여부', '판매가', '쿠폰지원금', '수량', '과세여부',
            '소비자판매가(A=B+D)', '판매원가(B)', '쿠폰지원금(C)', '배송비(D)',
            '수수료율', '수수료(E)',
            '정산금액(F=A-E)', '공급가액(G=F-H)', '부가세(H)'
        ]

        const paramData = {
            producerNo:this.state.loginUser.uniqueNo
        }
        const chkLocal = isLocalFoodAdjDeliveryChk(paramData);
        if(chkLocal){
            columns = [
                '확정일', '주문일', '주문번호', '주문자',
                '로컬농가No', '로컬농가', '구분',
                '상품번호', '품목', '상품구분', '환불여부', '판매가', '쿠폰지원금', '수량', '과세여부',
                '소비자판매가(A=B+D)', '판매원가(B)', '쿠폰지원금(C)', '배송비(D)',
                '수수료율', '수수료(E)',
                '정산금액(F=B-E)', '공급가액(G=F-H)', '부가세(H)'
            ]
        }


        const excelData = this.state.data.map((orderDetail) => {
            const consumerOkDate = ComUtil.utcToString(orderDetail.consumerOkDate,'YYYY-MM-DD HH:mm');
            const orderDate = ComUtil.utcToString(orderDetail.orderDate,'YYYY-MM-DD HH:mm');
            const timeSaleGoods = orderDetail.timeSaleGoods ? "포텐타임" : ( orderDetail.blyTimeGoods? "블리타임" : ( orderDetail.superRewardGoods? "슈퍼리워드" : "일반상품" ) );
            const vatFlag = orderDetail.vatFlag ? "과세" : "면세";
            const refundFlag = orderDetail.refundFlag ? "환불" : "-";

            // 쿠폰지원금
            const timeSaleSupportPrice = orderDetail.timeSaleGoods ? MathUtil.roundHalf(MathUtil.dividedBy(MathUtil.multipliedBy(orderDetail.usedCouponBlyAmount,orderDetail.orderBlctExchangeRate),orderDetail.orderCnt)) : 0;

            const totalGoodsPrice = orderDetail.totalGoodsPrice + orderDetail.adminDeliveryFee;
            const feeRate = orderDetail.timeSaleGoods ? " " : orderDetail.blyTimeGoods ? " " : orderDetail.superRewardGoods? "" :orderDetail.feeRate;
            const feeRateMoney = MathUtil.multipliedBy(MathUtil.roundHalf(MathUtil.multipliedBy(orderDetail.currentPrice,MathUtil.dividedBy(orderDetail.feeRate,100))),orderDetail.orderCnt);
            let paymentAmt = orderDetail.simplePayoutAmount;

            // let localfoodFarmerNo = "";
            let localFarmerNo = "";
            let localFarmName = "";
            let gubun = "";
            if(chkLocal){
                paymentAmt = MathUtil.minusBy(orderDetail.simplePayoutAmount,orderDetail.adminDeliveryFee);
                // localfoodFarmerNo = orderDetail.localfoodFarmerNo;
                localFarmerNo = orderDetail.localFarmerNo;
                localFarmName = orderDetail.localFarmName;
                gubun = localReplaceText(orderDetail)
                // gubun = (orderDetail.csRefundFlag && orderDetail.orderPrice < 0) ? "- 전표" :
                //     (orderDetail.csRefundFlag && orderDetail.orderPrice > 0) ? "+ 전표" :
                //         orderDetail.replaceFlag ? "-대체" : "일반";
            }
            const supplyValue = orderDetail.vatFlag ? MathUtil.roundHalf(MathUtil.dividedBy(paymentAmt,1.1)) : paymentAmt;
            const vat = orderDetail.vatFlag ? MathUtil.roundHalf(MathUtil.multipliedBy(MathUtil.dividedBy(paymentAmt,1.1),0.1)) : 0;

            const orderDetailTotalSupportPrice = orderDetail.timeSaleGoods ? MathUtil.roundHalf(MathUtil.multipliedBy(orderDetail.usedCouponBlyAmount,orderDetail.orderBlctExchangeRate)) : 0;

            if(chkLocal){
                return [
                    consumerOkDate, orderDate, orderDetail.orderSeq, orderDetail.consumerNm,
                    localFarmerNo, localFarmName, gubun,
                    orderDetail.goodsNo, orderDetail.goodsNm, timeSaleGoods, refundFlag, orderDetail.currentPrice, timeSaleSupportPrice, orderDetail.orderCnt, vatFlag,
                    totalGoodsPrice, orderDetail.totalGoodsPrice, orderDetailTotalSupportPrice, orderDetail.adminDeliveryFee,
                    feeRate, feeRateMoney,
                    paymentAmt, supplyValue, vat
                ]
            }else{
                return [
                    consumerOkDate, orderDate, orderDetail.orderSeq, orderDetail.consumerNm,
                    orderDetail.goodsNo, orderDetail.goodsNm, timeSaleGoods, refundFlag, orderDetail.currentPrice, timeSaleSupportPrice, orderDetail.orderCnt, vatFlag,
                    totalGoodsPrice, orderDetail.totalGoodsPrice, orderDetailTotalSupportPrice, orderDetail.adminDeliveryFee,
                    feeRate, feeRateMoney,
                    paymentAmt, supplyValue, vat
                ]
            }

        });

        // console.log(JSON.stringify(excelData));
        return [{
            columns: columns,
            data: excelData,
        }]
    }

    toggleTip = () => {
        this.setState({
            tipOpen: !this.state.tipOpen
        })
    }

    copy = ({value}) => {
        ComUtil.copyTextToClipboard(value, '', '');
    }

    onDayClick = async (dayTp) => {
        const vSearch = Object.assign({}, this.state.search);
        const firstDay = moment(moment().toDate()).startOf("month").add(-1,"days").startOf("month");
        const endDay = moment(moment().toDate()).startOf("month").add(-1, "days").endOf('month');
        let startDate = null;
        let endDate = null;
        if(dayTp === 'month'){
            startDate = firstDay;
            endDate = endDay;
        } else if(dayTp === 'first'){
            startDate = firstDay;
            endDate = moment(firstDay.toDate()).add(14,"days");
        } else if(dayTp === 'last'){
            startDate = moment(firstDay.toDate()).add(15,"days");
            endDate = endDay;
        }
        await this.setState({
            search: {
                startDate: startDate,
                endDate: endDate,
                selectedGubun: '',
                isConsumerOk:vSearch.isConsumerOk
            }
        });
    }

    onDatesChange = async (data) => {
        const vSearch = Object.assign({}, this.state.search);
        await this.setState({
            search: {
                startDate: data.startDate,
                endDate: data.endDate,
                selectedGubun: data.gubun,
                isConsumerOk:vSearch.isConsumerOk
            }
        });
    }

    onSelectionChanged = () => {
        const selectedRows = this.summaryGridApi.getSelectedRows();
        // console.log("selectedRows=====",selectedRows)
        if(selectedRows != null) {

            const localFarmerNo = selectedRows[0] && selectedRows[0].sumLocalFarmerNo;
            const vatFlagNm = selectedRows[0] && selectedRows[0].sumVatFlag;
            let vatFlag = true;
            if(vatFlagNm === '면세'){vatFlag = false;}
            // console.log("localFarmerNo=====", localFarmerNo)
            const dataOrigin = Object.assign([], this.state.dataOrigin)
            const dataSorted = dataOrigin.filter(
                // item => item.localfoodFarmerNo === localFarmerNo && item.vatFlag === vatFlag
                item => item.localFarmerNo === localFarmerNo && item.vatFlag === vatFlag
            )
            // console.log("dataSorted=====", dataSorted)
            this.setState({
                selectedRows: selectedRows,
                data: dataSorted
            })
        }
    }

    // 확정유무
    onSearchIsConsumerOkChange = async (e) => {
        const vSearch = Object.assign({}, this.state.search);
        vSearch.isConsumerOk = e.target.value;
        await this.setState({
            search: vSearch
        });
    }

    render() {
        const state = this.state
        return (
            <Fragment>
                <FormGroup>
                    <div className='p-3'>
                        <div className='p-1 mt-1 d-flex align-items-center'>
                            <div className='pt-3 pb-3 d-flex'>
                                <SearchDates
                                    btnAllHidden={true}
                                    isHiddenAll={true}
                                    isCurrenYeartHidden={true}
                                    gubun={state.search.selectedGubun}
                                    startDate={state.search.startDate}
                                    endDate={state.search.endDate}
                                    onChange={this.onDatesChange}
                                />
                            </div>
                            <div className="ml-3">
                                <Space>
                                    <Button color={'secondary'} size={'sm'} onClick={this.onDayClick.bind(this,'month')}>한달</Button>
                                    <Button color={'secondary'} size={'sm'} onClick={this.onDayClick.bind(this,'first')}>1일-15일</Button>
                                    <Button color={'secondary'} size={'sm'} onClick={this.onDayClick.bind(this,'last')}>16일-마지막일</Button>
                                </Space>
                            </div>

                            <div className='ml-3'>
                                <Input type='select'
                                       name='searchIsConsumerOk'
                                       id='searchIsConsumerOk'
                                       onChange={this.onSearchIsConsumerOkChange}
                                       value={this.state.search.isConsumerOk}
                                >
                                    <option name='isConsumerOk' value='N'>주문일기준</option>
                                    <option name='isConsumerOk' value='Y'>구매확정일기준</option>
                                </Input>
                            </div>

                            <div className="ml-3">
                                <Button color={'info'} size={'sm'} onClick={this.onRefreshClick} disabled={this.state.btnSearchLoading}>
                                    <span fontSize={'small'}>검색</span>
                                </Button>
                            </div>

                            <div className='d-flex ml-auto'>
                                {
                                    state.isSearchDataExist &&
                                        <div className="ml-5 mr-3">
                                            <ExcelDownload data={state.excelData}
                                                           fileName={this.makeTitleText()}
                                                           sheetName={this.makeTitleText()}
                                                           button={
                                                               <Button color={'info'} size={'sm'} style={{width: '100px'}}>
                                                                   <div className="d-flex">
                                                                       엑셀 다운로드
                                                                   </div>
                                                               </Button>
                                                           }/>
                                        </div>
                                }
                            </div>
                        </div>
                    </div>

                    <div className='border mt-1 ml-2 mr-2 mb-3 p-3'>
                        <div className='p-1'>
                            <div className="d-flex">
                                <h5>ShopBly 정산 tip! </h5>
                                <div className="ml-2">
                                    <Button color={'secondary'} outline size={'sm'} onClick={this.toggleTip}> {this.state.tipOpen ? ' ▲ ' : ' ▼ ' } </Button>
                                </div>
                            </div>

                            {this.state.tipOpen &&
                            <div className='mt-4 text-secondary small'>
                                1. 소비자결제금액은 소비자의 총 결제 금액으로 판매원가와 배송비로 구성되어 있습니다. <br/>
                                * '판매원가'란 결제금액에서 배송비를 뺀 금액입니다.(수수료 적용 O) <br/>
                                * 배송비와 쿠폰지원금에는 판매수수료가 적용되지 않습니다. <br/>
                                <br/>
                                2. ShopBly는 합포장(묶음배송) 주문건이라도 판매 상품별로 개별주문번호가 생성됩니다. <br/>
                                * 합포장(묶음배송) 상품'의 배송비가 발생할 경우, 가장 빠른 주문번호 한 건에 반영합니다. <br/>
                                * 합포장(묶음배송) 주문은 주문번호를 통해 확인하실수 있습니다.(앞에 4자리가 동일해요!) <br/>
                                <div className='border m-2 p-2 d-inline-block'>
                                    예시) <br/>
                                    1637001, 1637002, 1637003 이렇게 묶음배송으로 3개의 상품을 주문한 경우에는<br/>
                                    1637001 주문건에 배송비가 반영됩니다.
                                </div>
                                <br/> <br/>
                                3. 이벤트, 특가 상품의 경우 수수료가 다르게 적용될 수 있습니다. <br/>
                            </div>
                            }
                        </div>
                    </div>

                    <div
                        className="ag-theme-balham mt-3 mb-3 ml-2 mr-2"
                        style={{
                            height: '500px'
                        }}
                    >
                        {
                            this.state.isSearchDataExist &&
                                <Flex>
                                    <Div>{`${moment(state.search.startDate).format("YYYY-MM-DD")} ~ ${moment(state.search.endDate).format("YYYY-MM-DD")} 내역`}</Div>
                                    <Right>
                                        소비자결제금액:<Span>{ComUtil.addCommas(state.totalData.totalSumConsumerGoodsPrice)} </Span>
                                        판매원가:<Span>{ComUtil.addCommas(state.totalData.totalSumGoodsPrice)} </Span>
                                        배송비:<Span>{ComUtil.addCommas(state.totalData.totalSumDeliveryFee)} </Span>
                                        수수료:<Span>{ComUtil.addCommas(state.totalData.totalSumTotalFeeRateMoney)} </Span>
                                        업체지급금액:<Span bold>{ComUtil.addCommas(state.totalData.totalSumSimplePayoutAmount)} </Span>
                                        공급가액:<Span>{ComUtil.addCommas(state.totalData.totalSumSupplyValue)} </Span>
                                        부가세:<Span>{ComUtil.addCommas(state.totalData.totalSumVat)} </Span>
                                    </Right>
                                </Flex>
                        }
                        <AgGridReact
                            ref={this.summaryGridRef}
                            columnDefs={state.columnSummaryDefs}  //컬럼 세팅
                            defaultColDef={state.defaultColDef}
                            overlayLoadingTemplate={state.overlayLoadingTemplate}
                            overlayNoRowsTemplate={state.overlayNoRowsTemplate}
                            onGridReady={this.onSummaryGridReady.bind(this)}   //그리드 init(최초한번실행)
                            // onFilterChanged={this.onSummaryGridFilterChanged.bind(this)}
                            rowData={state.summaryData}
                            components={state.components}
                            frameworkComponents={state.frameworkComponents}
                            suppressMovableColumns={true} //헤더고정시키
                            onCellDoubleClicked={this.copy}
                            rowSelection={'single'}
                            onSelectionChanged={this.onSelectionChanged.bind(this)}
                            suppressRowClickSelection={false}
                        >
                        </AgGridReact>
                    </div>

                    {
                        (state.selectedRows && state.selectedRows.length > 0) &&
                        <Div p={16}>
                            <div
                                className="ag-theme-balham mt-3 mb-3 ml-2 mr-2"
                                style={{
                                    height: '500px'
                                }}
                            >
                                <Flex>
                                    <Div>
                                        {`${state.selectedRows[0].sumLocalFarmerNm} (${state.selectedRows[0].sumLocalFarmerNo}) [${state.selectedRows[0].sumVatFlag}]`}
                                    </Div>
                                    <Right>
                                        <Flex>
                                            <Space>
                                                <Div>
                                                    소비자결제금액:<Span>{ComUtil.addCommas(state.selectedRows[0].sumConsumerGoodsPrice)} </Span>
                                                    판매원가:<Span>{ComUtil.addCommas(state.selectedRows[0].sumTotalGoodsPrice)} </Span>
                                                    배송비:<Span>{ComUtil.addCommas(state.selectedRows[0].sumDeliveryFee)} </Span>
                                                    수수료:<Span>{ComUtil.addCommas(state.selectedRows[0].sumTotalFeeRateMoney)} </Span>
                                                    업체지급금액:<Span bold>{ComUtil.addCommas(state.selectedRows[0].sumSimplePayoutAmount)} </Span>
                                                    공급가액:<Span>{ComUtil.addCommas(state.selectedRows[0].sumTotalSupplyValue)} </Span>
                                                    부가세:<Span>{ComUtil.addCommas(state.selectedRows[0].sumTotalVat)} </Span>
                                                </Div>
                                                <Div pb={5}>
                                                    <MenuButton onClick = {this.onExcelDownloadDtl}>
                                                        <div className="d-flex">엑셀 다운로드</div>
                                                    </MenuButton>
                                                </Div>
                                            </Space>
                                        </Flex>
                                    </Right>
                                </Flex>
                                <AgGridReact
                                    ref={this.gridRef}
                                    columnDefs={state.columnDefs}  //컬럼 세팅
                                    defaultColDef={state.defaultColDef}
                                    overlayLoadingTemplate={state.overlayLoadingTemplate}
                                    overlayNoRowsTemplate={state.overlayNoRowsTemplate}
                                    onGridReady={this.onGridReady.bind(this)}   //그리드 init(최초한번실행)
                                    rowData={state.data}
                                    components={state.components}
                                    frameworkComponents={state.frameworkComponents}
                                    suppressMovableColumns={true} //헤더고정시키
                                    onCellDoubleClicked={this.copy}
                                >
                                </AgGridReact>
                            </div>
                        </Div>
                    }

                </FormGroup>
            </Fragment>
        )
    }
}