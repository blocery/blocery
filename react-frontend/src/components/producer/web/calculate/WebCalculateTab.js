import React, { Component, Fragment } from 'react'
import {FormGroup, Button, Input} from 'reactstrap'
import {paymentProducerGigan} from '~/lib/producerApi'
import { getLoginProducerUser } from "~/lib/loginApi";
import ComUtil from '~/util/ComUtil'
import { ExcelDownload } from '~/components/common'
import {localReplaceText} from "~/util/bzLogic";
//ag-grid
import { AgGridReact } from 'ag-grid-react';
import moment from 'moment-timezone'
import SearchDates from "~/components/common/search/SearchDates";
import MathUtil from "~/util/MathUtil";
import {Div, Space} from "~/styledComponents/shared";
const isLocalFoodAdjDeliveryChk = (data) => {
    if(data.producerNo == 157){
        return true;
    }
    return false;
}
export default class WebCalculateTab extends Component {
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
                onlyValidData: false,
            },
            data: [],
            summaryData: [],
            excelData: {
                columns: [],
                data: []
            },
            tipOpen: false,
            columnSummaryDefs: [
                {
                    headerName: "과세여부",
                    field: "vatFlag",
                    cellStyle: {"textAlign":"left", "background-color": '#f1fff1'},
                    width: 90
                },
                {
                    headerName: "매출내역 (소비자결제금액 A = B + C)",
                    children: [
                        {headerName: '소비자결제금액(A)',width: 150, field: 'summaryConsumerGoodsPrice', cellStyle: {"textAlign":"left", 'background-color': '#fafab4'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}},
                        {headerName: '판매원가(B)',width: 120, field: 'summaryTotalGoodsPrice', cellStyle: {"textAlign":"left", 'background-color': '#fafab4'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}},
                        {headerName: '배송비(C)',width: 110, field: 'summaryDeliveryFee', cellStyle: {"textAlign":"left", 'background-color': '#fafab4'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}},
                    ]
                },
                {
                    headerName: "지원금",
                    children: [
                        {headerName: '쿠폰지원금(D)',width: 120, field: 'summaryTotalSupportPrice', cellStyle: {"textAlign":"left", 'background-color': '#d9d9d9'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}},
                    ]
                },
                {
                    headerName: "수수료(E)",
                    children: [
                        {headerName: '판매원가(B) * 수수료율(%)',width: 180, field: 'summaryTotalFeeRateMoney', cellStyle: {"textAlign":"left", 'background-color': '#ffe3ee'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}},
                    ]
                },
                {
                    headerName: "정산내역",
                    children: [
                        {
                            headerName: '업체지급금액(F)=A-E',
                            width: 200, field: 'summarySimplePayoutAmount',
                            cellStyle: {"textAlign":"left", 'background-color': '#EBFBFF'},
                            cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}
                        },
                        {headerName: '공급가액(G)=F-H',width: 200, field: 'summaryTotalSupplyValue', cellStyle: {"textAlign":"left", 'background-color': '#EBFBFF'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}},
                        {headerName: '부가세(H)',width: 200, field: 'summaryTotalVat', cellStyle: {"textAlign":"left", 'background-color': '#EBFBFF'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true},},
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
                            headerName: '(F)=A-E',
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
                },
                // {
                //     headerName: "BLCT 기정산내역",
                //     children: [
                //         {headerName: '총매출',width: 80, field: 'totalBlctToken', cellStyle: {"textAlign":"left", 'background-color': '#f1fff1'}, filterParams:{clearButton: true}},
                //         {headerName: '판매수수료',width: 100, field: 'totalFeeRateBlct', cellStyle: {"textAlign":"left", 'background-color': '#f1fff1'}, filterParams:{clearButton: true}},
                //         {headerName: '정산합계',width: 90, field: 'totalPayoutAmountBlct', cellStyle: {"textAlign":"left", 'background-color': '#f1fff1'}, filterParams:{clearButton: true}},
                //         {headerName: '원화 환산',width: 100, field: 'totalPaidBlctToWon', cellStyle: {"textAlign":"left", 'background-color': '#f1fff1'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}},
                //     ]
                // }
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
            },
            components: {
                formatCurrencyRenderer: this.formatCurrencyRenderer,
            },
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 정산 내역이 없습니다.</span>',
        }
    }

    async componentDidMount() {
        await this.getInit();
    }

    getInit = async() => {
        //로그인 체크
        const loginUser = await getLoginProducerUser();
        if(!loginUser) {
            this.props.history.push('/producer/webLogin')
        }

        let columnSummaryDefsHeaderName1 = '업체지급금액(F)=A-E';
        let columnSummaryDefsHeaderName2 = '(F)=A-E';
        let columnLocalfoodFarmerNo = null;
        let columnLocalFarmerName = null;

        //로컬푸드 계산서 발행내역
        let columnLocalSummary = null;
        const paramData = {
            producerNo:loginUser.uniqueNo
        }
        if(isLocalFoodAdjDeliveryChk(paramData)){
            columnSummaryDefsHeaderName1 = '업체지급금액(F)=B-E';
            columnSummaryDefsHeaderName2 = '(F)=B-E';
            // columnLocalfoodFarmerNo = {headerName: '로컬농가No',width: 120, field: 'localfoodFarmerNo', cellStyle:{"textAlign":"left", 'background-color': '#f1fff1'}, filterParams:{clearButton: true}};
            columnLocalfoodFarmerNo = {headerName: '로컬농가No',width: 120, field: 'localFarmerNo', cellStyle:{"textAlign":"left", 'background-color': '#f1fff1'}, filterParams:{clearButton: true}};
            columnLocalFarmerName = {headerName: '로컬농가',width: 90, field: 'localFarmName', cellStyle:{"textAlign":"left", 'background-color': '#f1fff1'}, filterParams:{clearButton: true}};
            columnLocalSummary = {
                headerName: "로컬푸드 계산서 발행내역",
                children: [
                    {
                        headerName: "판매원가(B)", width: 200, field: 'localSummaryTotalGoodsPrice',
                        cellStyle: function (params){
                            if(params.data.vatFlag == '합계금액'){
                                return {"textAlign":"left", "font-weight":"bold", "background-color":"#f3ce4e"};
                            }
                            return {"textAlign":"left", "background-color":"#f3ce4e"};
                        },
                        cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}
                    },
                    {
                        headerName: '공급가액(I)=B-J',width: 200, field: 'localSummaryTotalSupplyValue',
                        cellStyle: function (params){
                            if(params.data.vatFlag == '합계금액'){
                                return {"textAlign":"left", "font-weight":"bold", "background-color":"#f3ce4e"};
                            }
                            return {"textAlign":"left", "background-color":"#f3ce4e"};
                        },
                        cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}
                        },
                    {
                        headerName: '부가세(J)',width: 200, field: 'localSummaryTotalVat',
                        cellStyle: function (params){
                            if(params.data.vatFlag == '합계금액'){
                                return {"textAlign":"left", "font-weight":"bold", "background-color":"#f3ce4e"};
                            }
                            return {"textAlign":"left", "background-color":"#f3ce4e"};
                        },
                        cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true},
                    },
                ]
            };
        }
        let columnSummaryDefs = [
            {
                headerName: "과세여부", field: "vatFlag",
                cellStyle: function (params){
                    if(params.data.vatFlag == '합계금액'){
                        return {"textAlign":"left", "font-weight":"bold", "background-color":"#d9e8f6"};
                    }
                    return {"textAlign":"left", "background-color": '#f1fff1'};
                },
                width: 90
            },
            {
                headerName: "매출내역 (소비자결제금액 A = B + C)",
                children: [
                    {
                        headerName: '소비자결제금액(A)',width: 150, field: 'summaryConsumerGoodsPrice',
                        cellStyle: function (params){
                            if(params.data.vatFlag == '합계금액'){
                                return {"textAlign":"left", "font-weight":"bold", "background-color":"#fafab4"};
                            }
                            return {"textAlign":"left", "background-color":"#fafab4"};
                        },
                        cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}
                    },
                    {
                        headerName: '판매원가(B)',width: 120, field: 'summaryTotalGoodsPrice',
                        cellStyle: function (params){
                            if(params.data.vatFlag == '합계금액'){
                                return {"textAlign":"left", "font-weight":"bold", "background-color":"#fafab4"};
                            }
                            return {"textAlign":"left", "background-color": '#fafab4'};
                        },
                        cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}
                    },
                    {
                        headerName: '배송비(C)',width: 110, field: 'summaryDeliveryFee',
                        cellStyle: function (params){
                            if(params.data.vatFlag == '합계금액'){
                                return {"textAlign":"left", "font-weight":"bold", "background-color":"#fafab4"};
                            }
                            return {"textAlign":"left", "background-color":"#fafab4"};
                        },
                        cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}
                     },
                ]
            },
            {
                headerName: "지원금",
                children: [
                    {
                        headerName: '쿠폰지원금(D)',width: 120, field: 'summaryTotalSupportPrice',
                        cellStyle: function (params){
                            if(params.data.vatFlag == '합계금액'){
                                return {"textAlign":"left", "font-weight":"bold", "background-color":"#d9d9d9"};
                            }
                            return {"textAlign":"left", "background-color":"#d9d9d9"};
                        },
                        cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}
                    },
                ]
            },
            {
                headerName: "수수료(E)",
                children: [
                    {
                        headerName: '판매원가(B) * 수수료율(%)',width: 190, field: 'summaryTotalFeeRateMoney',
                        cellStyle: function (params){
                            if(params.data.vatFlag == '합계금액'){
                                return {"textAlign":"left", "font-weight":"bold", "background-color":"#ffe3ee"};
                            }
                            return {"textAlign":"left", "background-color":"#ffe3ee"};
                        },
                        cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}
                    },
                ]
            },
            {
                headerName: "정산내역",
                children: [
                    {
                        headerName: columnSummaryDefsHeaderName1,
                        width: 200, field: 'summarySimplePayoutAmount',
                        cellStyle: function (params){
                            if(params.data.vatFlag == '합계금액'){
                                return {"textAlign":"left", "font-weight":"bold", "background-color":"#EBFBFF"};
                            }
                            return {"textAlign":"left", "background-color":"#EBFBFF"};
                        },
                        cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}
                    },
                    {
                        headerName: '공급가액(G)=F-H',width: 200, field: 'summaryTotalSupplyValue',
                        cellStyle: function (params){
                            if(params.data.vatFlag == '합계금액'){
                                return {"textAlign":"left", "font-weight":"bold", "background-color":"#EBFBFF"};
                            }
                            return {"textAlign":"left", "background-color":"#EBFBFF"};
                        },
                        cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}
                    },
                    {
                        headerName: '부가세(H)',width: 200, field: 'summaryTotalVat',
                        cellStyle: function (params){
                            if(params.data.vatFlag == '합계금액'){
                                return {"textAlign":"left", "font-weight":"bold", "background-color":"#EBFBFF"};
                            }
                            return {"textAlign":"left", "background-color":"#EBFBFF"};
                        },
                        cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}
                    }
                ]
            },
            columnLocalSummary
        ];
        let columnDefs = [
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
                    columnLocalfoodFarmerNo,
                    columnLocalFarmerName,
                    {
                        headerName: '구분', width: 90, field: 'consumerNm', cellStyle:{"textAlign":"left", 'background-color': '#f1fff1'}, filterParams:{clearButton: true},
                        valueGetter: function(params) {
                            return localReplaceText(params.data)
                            // return (params.data.refundForReplace && params.data.orderPrice < 0) ? "- 전표" :
                            //     (params.data.refundForReplace && params.data.orderPrice > 0) ? "+ 전표" :
                            //         params.data.csRefundFlag ? "대체" : "일반"
                        }
                    },
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
                        headerName: columnSummaryDefsHeaderName2,
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
        ];

        this.setState({
            loginUser: loginUser,
            columnSummaryDefs: columnSummaryDefs,
            columnDefs: columnDefs
        })

        const {api:gridApi} = this.gridRef.current;
        const {api:summaryGridApi} = this.summaryGridRef.current;
        if(gridApi) {
            //ag-grid 레이지로딩중 감추기
            gridApi.hideOverlay()
        }
        if(summaryGridApi) {
            //ag-grid 레이지로딩중 감추기
            summaryGridApi.hideOverlay()
        }

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
    onSummaryGridFilterChanged () {
        // this.setExcelData();
    }

    //[이벤트] 그리드 로드 후 callback 이벤트
    onGridReady(e) {
        //API init
        this.gridApi = e.api;
        this.gridColumnApi = e.columnApi;
    }

    onGridFilterChanged () {
        // this.setExcelData();
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
        const {api:gridApi} = this.gridRef.current;
        const {api:summaryGridApi} = this.summaryGridRef.current;

        if (summaryGridApi) {
            //ag-grid 레이지로딩중 보이기
            summaryGridApi.showLoadingOverlay();
        }
        if (gridApi) {
            //ag-grid 레이지로딩중 보이기
            gridApi.showLoadingOverlay();
        }
        this.setState({btnSearchLoading: true});

        const startDate = this.state.search.startDate ?  moment(this.state.search.startDate).format("YYYYMMDD"):null;
        const endDate = this.state.search.endDate ?  moment(this.state.search.endDate).format("YYYYMMDD"):null;
        const isConsumerOk = this.state.search.isConsumerOk === 'Y'?true:false;

        console.log("isConsumerOk",isConsumerOk)

        let {data} = await paymentProducerGigan(startDate, endDate, isConsumerOk);

        if(this.state.search.onlyValidData) {
            data = data.filter(item => !item.replaceFlag && !(item.refundForReplace && item.orderPrice < 0 ))
        }

        console.log(data);
        let isSearchDataExist = data.length > 0;

        // summaryData 세팅하기
        let vatSummary = {
            vatFlag: '과세',
            summaryConsumerGoodsPrice:0,
            summaryTotalGoodsPrice:0,
            summaryTotalSupportPrice:0,
            summaryDeliveryFee:0,
            summaryTotalFeeRateMoney:0,
            summarySimplePayoutAmount:0,
            summaryTotalSupplyValue:0,
            summaryTotalVat:0,

            localSummaryTotalGoodsPrice:0,
            localSummaryTotalSupplyValue:0,
            localSummaryTotalVat:0
        };
        let notVatSummary = {
            vatFlag: '면세',
            summaryConsumerGoodsPrice:0,
            summaryTotalGoodsPrice:0,
            summaryTotalSupportPrice:0,
            summaryDeliveryFee:0,
            summaryTotalFeeRateMoney:0,
            summarySimplePayoutAmount:0,
            summaryTotalSupplyValue:0,
            summaryTotalVat:0,

            localSummaryTotalGoodsPrice:0,
            localSummaryTotalSupplyValue:0,
            localSummaryTotalVat:0
        };
        let totVatSummary = {
            vatFlag: '합계금액',
            summaryConsumerGoodsPrice:0,
            summaryTotalGoodsPrice:0,
            summaryTotalSupportPrice:0,
            summaryDeliveryFee:0,
            summaryTotalFeeRateMoney:0,
            summarySimplePayoutAmount:0,
            summaryTotalSupplyValue:0,
            summaryTotalVat:0,

            localSummaryTotalGoodsPrice:0,
            localSummaryTotalSupplyValue:0,
            localSummaryTotalVat:0
        };

        data.map(orderDetail => {
            let consumerGoodsPrice = orderDetail.totalGoodsPrice + orderDetail.adminDeliveryFee;
            let totalFeeRateMoney = MathUtil.multipliedBy( MathUtil.roundHalf(MathUtil.multipliedBy(orderDetail.currentPrice, MathUtil.dividedBy(orderDetail.feeRate,100))) , orderDetail.orderCnt);
            let paymentAmt = orderDetail.simplePayoutAmount;
            let goodsPrice = orderDetail.totalGoodsPrice;

            //옥천로컬푸드 157일경우 배송비 제외
            if(isLocalFoodAdjDeliveryChk(orderDetail)){
                paymentAmt = MathUtil.minusBy(orderDetail.simplePayoutAmount,orderDetail.adminDeliveryFee);
            }

            if(orderDetail.vatFlag && !orderDetail.refundFlag) {
                vatSummary.summaryConsumerGoodsPrice = vatSummary.summaryConsumerGoodsPrice + consumerGoodsPrice;
                vatSummary.summaryTotalGoodsPrice = vatSummary.summaryTotalGoodsPrice + goodsPrice;

                // 포텐타임의 경우에만 더해야함.
                if(orderDetail.timeSaleGoods) {
                    vatSummary.summaryTotalSupportPrice = vatSummary.summaryTotalSupportPrice + MathUtil.roundHalf(MathUtil.multipliedBy(orderDetail.usedCouponBlyAmount,orderDetail.orderBlctExchangeRate));
                }
                vatSummary.summaryDeliveryFee = vatSummary.summaryDeliveryFee + orderDetail.adminDeliveryFee;
                vatSummary.summaryTotalFeeRateMoney = vatSummary.summaryTotalFeeRateMoney + totalFeeRateMoney;
                vatSummary.summarySimplePayoutAmount = vatSummary.summarySimplePayoutAmount + paymentAmt;
                vatSummary.summaryTotalSupplyValue = vatSummary.summaryTotalSupplyValue + MathUtil.roundHalf(MathUtil.dividedBy(paymentAmt,1.1));
                vatSummary.summaryTotalVat = vatSummary.summaryTotalVat + MathUtil.roundHalf(MathUtil.multipliedBy(MathUtil.dividedBy(paymentAmt,1.1),0.1));

                vatSummary.localSummaryTotalGoodsPrice = vatSummary.localSummaryTotalGoodsPrice + goodsPrice;
                vatSummary.localSummaryTotalSupplyValue = vatSummary.localSummaryTotalSupplyValue + MathUtil.roundHalf(MathUtil.dividedBy(goodsPrice,1.1));
                vatSummary.localSummaryTotalVat = vatSummary.localSummaryTotalVat + MathUtil.roundHalf(MathUtil.multipliedBy(MathUtil.dividedBy(goodsPrice,1.1),0.1));

            } else if(!orderDetail.refundFlag){
                notVatSummary.summaryConsumerGoodsPrice = notVatSummary.summaryConsumerGoodsPrice + consumerGoodsPrice;
                notVatSummary.summaryTotalGoodsPrice = notVatSummary.summaryTotalGoodsPrice + goodsPrice;

                // 포텐타임의 경우에만 더해야함.
                if(orderDetail.timeSaleGoods) {
                    notVatSummary.summaryTotalSupportPrice = notVatSummary.summaryTotalSupportPrice + MathUtil.roundHalf(MathUtil.multipliedBy(orderDetail.usedCouponBlyAmount,orderDetail.orderBlctExchangeRate));
                }
                notVatSummary.summaryDeliveryFee = notVatSummary.summaryDeliveryFee + orderDetail.adminDeliveryFee;
                notVatSummary.summaryTotalFeeRateMoney = notVatSummary.summaryTotalFeeRateMoney + totalFeeRateMoney;
                notVatSummary.summarySimplePayoutAmount = notVatSummary.summarySimplePayoutAmount + paymentAmt;
                notVatSummary.summaryTotalSupplyValue = notVatSummary.summaryTotalSupplyValue + paymentAmt;
                notVatSummary.summaryTotalVat = notVatSummary.summaryTotalVat + 0;

                notVatSummary.localSummaryTotalGoodsPrice = notVatSummary.localSummaryTotalGoodsPrice +  goodsPrice;
                notVatSummary.localSummaryTotalSupplyValue = notVatSummary.localSummaryTotalSupplyValue + goodsPrice;
                notVatSummary.localSummaryTotalVat = notVatSummary.localSummaryTotalVat + 0;
            }
        })

        totVatSummary.summaryConsumerGoodsPrice = vatSummary.summaryConsumerGoodsPrice + notVatSummary.summaryConsumerGoodsPrice;
        totVatSummary.summaryTotalGoodsPrice = vatSummary.summaryTotalGoodsPrice + notVatSummary.summaryTotalGoodsPrice;
        totVatSummary.summaryTotalSupportPrice = vatSummary.summaryTotalSupportPrice + notVatSummary.summaryTotalSupportPrice;
        totVatSummary.summaryDeliveryFee = vatSummary.summaryDeliveryFee + notVatSummary.summaryDeliveryFee;
        totVatSummary.summaryTotalFeeRateMoney = vatSummary.summaryTotalFeeRateMoney + notVatSummary.summaryTotalFeeRateMoney;
        totVatSummary.summarySimplePayoutAmount = vatSummary.summarySimplePayoutAmount + notVatSummary.summarySimplePayoutAmount;
        totVatSummary.summaryTotalSupplyValue = vatSummary.summaryTotalSupplyValue + notVatSummary.summaryTotalSupplyValue;
        totVatSummary.summaryTotalVat = vatSummary.summaryTotalVat + notVatSummary.summaryTotalVat;

        totVatSummary.localSummaryTotalGoodsPrice = vatSummary.localSummaryTotalGoodsPrice + notVatSummary.localSummaryTotalGoodsPrice;
        totVatSummary.localSummaryTotalSupplyValue = vatSummary.localSummaryTotalSupplyValue + notVatSummary.localSummaryTotalSupplyValue;
        totVatSummary.localSummaryTotalVat = vatSummary.localSummaryTotalVat + notVatSummary.localSummaryTotalVat;

        let summaryData = [vatSummary, notVatSummary, totVatSummary];

        this.setState({
            btnSearchLoading: false,
            isSearchDataExist: isSearchDataExist,
            data:data,
            summaryData: summaryData
        })

        this.setExcelData();

        if(summaryGridApi) {
            //ag-grid 레이지로딩중 감추기
            summaryGridApi.hideOverlay()

            if(!summaryData){
                summaryGridApi.showNoRowsOverlay();
            }
        }
        //ag-grid api
        if(gridApi) {
            //ag-grid 레이지로딩중 감추기
            gridApi.hideOverlay();

            if(!data){
                gridApi.showNoRowsOverlay();
            }
        }
    }


    setExcelData = () => {
        if(!this.gridApi)
            return;

        var excelData = this.getExcelData();
        this.setState({
            excelData: excelData,
        })
    }

    getExcelData = () => {

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
                '로컬농가No', '로컬농가',
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

            let localfoodFarmerNo = "";
            let localFarmName = "";
            if(chkLocal){
                paymentAmt = MathUtil.minusBy(orderDetail.simplePayoutAmount,orderDetail.adminDeliveryFee);
                localfoodFarmerNo = orderDetail.localfoodFarmerNo;
                localFarmName = orderDetail.localFarmName;
            }
            const supplyValue = orderDetail.vatFlag ? MathUtil.roundHalf(MathUtil.dividedBy(paymentAmt,1.1)) : paymentAmt;
            const vat = orderDetail.vatFlag ? MathUtil.roundHalf(MathUtil.multipliedBy(MathUtil.dividedBy(paymentAmt,1.1),0.1)) : 0;

            const orderDetailTotalSupportPrice = orderDetail.timeSaleGoods ? MathUtil.roundHalf(MathUtil.multipliedBy(orderDetail.usedCouponBlyAmount,orderDetail.orderBlctExchangeRate)) : 0;

            if(chkLocal){
                return [
                    consumerOkDate, orderDate, orderDetail.orderSeq, orderDetail.consumerNm,
                    localfoodFarmerNo, localFarmName,
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

    // 확정유무
    onSearchIsConsumerOkChange = async (e) => {
        const vSearch = Object.assign({}, this.state.search);
        vSearch.isConsumerOk = e.target.value;
        await this.setState({search:vSearch})
    }

    // onChangeMinusChecked = (e) => {
    //     const vSearch = Object.assign({}, this.state.search);
    //     vSearch.onlyValidData = e.target.checked;
    //     this.setState({
    //         search: vSearch
    //     });
    // }

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

                            {/*<div className="ml-3 text-secondary small" >*/}
                            {/*    <Checkbox bg={'green'} checked={this.state.search.onlyValidData} onChange={this.onChangeMinusChecked}> 마이너스전표 제외 </Checkbox>*/}
                            {/*</div>*/}

                            <div className="ml-3">
                                <Button color={'info'} size={'sm'} onClick={this.onRefreshClick} disabled={this.state.btnSearchLoading}>
                                    <span fontSize={'small'}>검색</span>
                                </Button>
                            </div>

                            <div className='d-flex ml-auto'>
                                {
                                    state.isSearchDataExist &&
                                    <div className="ml-5 mr-3">
                                        {/*<label><h6>{this.makeTitleText(this.state.searchMonthValue)}</h6></label>*/}
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
                        className="ag-theme-balham mb-3 ml-2 mr-2"
                        style={{
                            height: '165px'
                        }}
                    >
                        {
                            this.state.isSearchDataExist &&
                            <div>
                                {`${moment(state.search.startDate).format("YYYY-MM-DD")} ~ ${moment(state.search.endDate).format("YYYY-MM-DD")} 내역`}
                            </div>
                        }
                        <AgGridReact
                            ref={this.summaryGridRef}
                            columnDefs={state.columnSummaryDefs}  //컬럼 세팅
                            defaultColDef={state.defaultColDef}
                            overlayLoadingTemplate={state.overlayLoadingTemplate}
                            overlayNoRowsTemplate={state.overlayNoRowsTemplate}
                            onGridReady={this.onSummaryGridReady.bind(this)}   //그리드 init(최초한번실행)
                            onFilterChanged={this.onSummaryGridFilterChanged.bind(this)}
                            rowData={state.summaryData}
                            components={state.components}
                            frameworkComponents={state.frameworkComponents}
                            suppressMovableColumns={true} //헤더고정시키
                            onCellDoubleClicked={this.copy}
                        >
                        </AgGridReact>
                    </div>
                    <div
                        className="ag-theme-balham mb-3 ml-2 mr-2"
                        style={{
                            height: '500px'
                        }}
                    >
                        <AgGridReact
                            ref={this.gridRef}
                            columnDefs={state.columnDefs}  //컬럼 세팅
                            defaultColDef={state.defaultColDef}
                            overlayLoadingTemplate={state.overlayLoadingTemplate}
                            overlayNoRowsTemplate={state.overlayNoRowsTemplate}
                            onGridReady={this.onGridReady.bind(this)}   //그리드 init(최초한번실행)
                            onFilterChanged={this.onGridFilterChanged.bind(this)}
                            rowData={state.data}
                            components={state.components}
                            frameworkComponents={state.frameworkComponents}
                            suppressMovableColumns={true} //헤더고정시키
                            onCellDoubleClicked={this.copy}
                        >
                        </AgGridReact>
                    </div>
                </FormGroup>
            </Fragment>
        )
    }
}