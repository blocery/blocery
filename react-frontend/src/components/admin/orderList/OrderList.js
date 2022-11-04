import React, {Component, useEffect} from 'react';
import {Button, Input, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'
import "react-table/react-table.css"
import { getAllOrderDetailList, getOneOrderDetail, findCsOrderList } from '~/lib/adminApi'
import { getLoginAdminUser } from '~/lib/loginApi'
import { getProducerByProducerNo } from "~/lib/producerApi";
import {AdminModalWithNav, ProducerProfileCard} from '~/components/common'
import ComUtil from '~/util/ComUtil'
import {getPgNm} from '~/util/bzLogic'
import moment from 'moment-timezone'
import Select from 'react-select'

import { AgGridReact } from 'ag-grid-react';
import "react-datepicker/src/stylesheets/datepicker.scss";
import {Div, Flex, Hr, Span, FilterGroup, Space, Right} from "~/styledComponents/shared";
import ConsumerDetail from "~/components/common/contents/ConsumerDetail";
import SearchDates from "~/components/common/search/SearchDates";
import TrackerDeliverRenderer from "./TrackerDeliverRenderer";
import InputFilter from '~/components/common/gridFilter/InputFilter'
import CheckboxFilter from '~/components/common/gridFilter/CheckboxFilter'
import FilterContainer from "~/components/common/gridFilter/FilterContainer";
import {MenuButton, SmButton} from "~/styledComponents/shared/AdminLayouts";
import BizGoodsViewer from "~/components/common/contents/BizGoodsViewer";
import OrderScheduleReReg from "~/components/admin/orderList/OrderScheduleReReg";
const PROGRESS_STATE = {
    0: '-',
    1: '피킹중',
    2: '피킹완료',
    3: '배송완료',
    4: '배송시작',
    99: '주문전체취소'
}
export default class OrderList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchDateOption:[
                {value:'orderDate', label:'주문일기준'},
                {value:'consumerOkDate', label:'구매확정일기준'}
            ],
            searchDate:'orderDate',
            search: {
                isSearch:true,
                selectedGubun: 'day', //'week': 최초화면을 오늘(day)또는 1주일(week)로 설정.
                startDate: moment(moment().toDate()),
                endDate: moment(moment().toDate()),
                searchOrderStatus: 'all'
            },
            filterItems: {
                orderStatusItems:[],
            },

            independentSearchBy:'consumerNo',

            loading: false,
            data: [],
            isOpen: false,
            modalType: '',
            modalValue: null,

            orderSeq: null,
            goodsNo: null,
            producerInfo: null,
            frameworkComponents: {
                goodsNmRenderer: this.goodsNmRenderer,
                payMethodNmRenderer: this.payMethodNmRenderer,
                farmNmRenderer: this.farmNmRenderer,
                timeSaleRenderer: this.timeSaleRenderer,
                nameRenderer: this.nameRenderer,
                consumerNoRenderer: this.consumerNoRenderer,
                expectShippingRenderer: this.expectShippingRenderer,
                trackerDeliverRenderer: TrackerDeliverRenderer,
                reOrderRenderer: this.reOrderRenderer,
                numberRenderer: this.numberRenderer
            },
            columnDefs: [
                {headerName: "주문일시", field: "orderDate"},
                {headerName: "출고일시", field: "trackingNumberTimestamp"},
                {headerName: "구매확정일시", field: "consumerOkDate"},
                {
                    headerName: "그룹번호", field: "orderSubGroupNo", width: 90,
                    // valueGetter: function(params) {
                    //     const orderSubGroupNo = params.data.orderSubGroupNo||0;
                    //     const subGroupListSize = params.data.subGroupListSize||0;
                    //     if(subGroupListSize > 1){
                    //         return Math.abs(orderSubGroupNo).toString(16).toUpperCase();
                    //     }
                    //     return "";
                    // }
                },
                {headerName: "주문번호", field: "orderSeq"},
                {
                    headerName: "주문상태", field: "orderStatus", width: 90,
                    valueGetter: (params) => {
                        return this.getOrderStatus(params.data)
                    },
                    cellRenderer: "reOrderRenderer"
                },
                {headerName: "취소상세", field: "cancelType", width: 100, hide: true, valueGetter: function (params) {
                        if (params.data.refundFlag || ['cancelled', 'revoked'].includes(params.data.payStatus)) {
                            if (params.data.refundFlag) {
                                return '환불'
                            }
                            if (params.data.cancelType === 1) {
                                const str = ComUtil.join('/', params.data.cancelReason, params.data.cancelReasonDetail)
                                return '소비자 주문취소' + ComUtil.getCombinedString(`(${str})`, str)
                            } else if (params.data.cancelType === 2) {
                                const str = ComUtil.join('/', params.data.dpCancelReason)
                                return '생산자 주문취소' + ComUtil.getCombinedString(`(${str})`, str)
                            }
                            if (params.data.dpCancelReason) {
                                const str = ComUtil.join('/', params.data.dpCancelReason)
                                return '생산자 주문취소' + ComUtil.getCombinedString(`(${str})`, str)
                            }else{
                                const str = ComUtil.join('/', params.data.cancelReason, params.data.cancelReasonDetail)
                                return '소비자 주문취소' + ComUtil.getCombinedString(`(${str})`, str)
                            }
                        }else{
                            return ''
                        }
                    }},
                {
                    headerName: "주문그룹상태", field: "progressState",
                    width: 120,
                    cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                    filterParams: {
                        clearButton: true //클리어버튼
                    },
                    valueGetter: function(params) {
                        return PROGRESS_STATE[params.data.progressState];
                    }
                },
                {headerName: "상품구분", field: "timeSaleGoods", width: 100, cellRenderer: "timeSaleRenderer",
                    valueGetter: function(params) {
                        let result = params.data.timeSaleGoods ? "포텐타임" : ( params.data.blyTimeGoods? "블리타임" : (params.data.superRewardGoods? "슈퍼리워드" : "일반상품"));
                        if(params.data.onePlusSubFlag)
                            result = "증정품";
                        return result;
                    }
                },
                {headerName: "상품종류", field: "directGoods", width: 90,
                    valueGetter: function getter(params) {
                        return params.data.directGoods ? "즉시" : (params.data.dealGoods ? "공동구매" : "예약");
                    },
                },
                {headerName: "농가명", field: "farmName", cellRenderer: "farmNmRenderer", width: 100},
                {headerName: "로컬푸드농가명", field: "localFarmerName", width: 120},
                {headerName: "상품번호", field: "goodsNo", width: 90},
                {headerName: "상품명", field: "goodsOptionNm", cellRenderer: "goodsNmRenderer", width: 150},
                {
                    headerName: "주문수량", field: "orderCnt", width: 90,
                    cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                    valueGetter: function(params) {
                        return (params.data.partialRefundCount > 0 ? `${params.data.orderCnt} (+부분환불 ${params.data.partialRefundCount}건)` : params.data.orderCnt);
                    }
                },
                {headerName: "주문취소사유", field: "dpCancelReason"},
                {headerName: "수수료(%)", field: "feeRate"},
                {headerName: "품목명", field: "itemName", width: 90, cellStyle:ComUtil.getCellStyle({cellAlign: 'center'})},
                {headerName: "배송비", field: "adminDeliveryFee", cellRenderer: "numberRenderer",
                    cellStyle:ComUtil.getCellStyle({cellAlign: 'center'})},
                {headerName: "총주문금액(원)", field: "adminOrderPrice", width: 120, cellRenderer: "numberRenderer",
                    cellStyle:ComUtil.getCellStyle({cellAlign: 'center'})},
                // {headerName: "판매지원금", field: "timeSaleSupportPrice", width: 120},
                {
                    headerName: "총정산금액", field: "simplePayoutAmount", width: 120, cellRenderer: "numberRenderer",
                    cellStyle:ComUtil.getCellStyle({cellAlign: 'center'})
                },
                // 전표비고 field
                {
                    headerName: "전표비고", field: "csRefundDesc",
                    width: 100,
                    cellStyle:ComUtil.getCellStyle({cellAlign: 'left'}),
                    // hide:true,
                    filterParams: {
                        clearButton: true //클리어버튼
                    }
                },
                {headerName: "부가세", field: "vatFlag", cellRenderer: "vatRenderer", width: 80,
                    valueGetter: function ({data}) {
                        return data.vatFlag ? '과세' : '면세'
                    }
                },
                {
                    headerName: "결제수단", field: "payMethod", cellRenderer: "payMethodNmRenderer", width: 90,
                    valueGetter: function(params) {
                        if(params.data.payMethod === 'blct') {
                            return 'bly';
                        } else if(params.data.payMethod === 'cardBlct') {
                            return 'cardBly';
                        }
                        return params.data.payMethod;
                    }
                },
                {
                    headerName: "PG구분", field: "pgProvider", width: 110,
                    valueGetter: function(params) {
                        return getPgNm(params.data.pgProvider);
                    }
                },
                {headerName: "카드결제(원)", field: "adminCardPrice", width: 110, cellRenderer: "numberRenderer"},
                {headerName: "토큰결제(bly)", field: "adminBlctToken", width: 130, cellRenderer: "numberRenderer"},
                {headerName: "쿠폰", field: "usedCouponNo", width: 90,
                    valueGetter: function(params) {
                        return (params.data.usedCouponNo > 0) ? "사용" : "미사용";
                    }
                },
                {headerName: "쿠폰bly", field: "usedCouponBlyAmount", width: 130},
                {headerName: "주문당시환율", field: "orderBlctExchangeRate", width: 110},
                // {headerName: "수수료(보상포함금액) ", field: "bloceryOnlyFee", width: 90,
                //     valueGetter: function(params) {
                //         return (params.data.bloceryOnlyFee + params.data.consumerReward + params.data.producerReward);
                //     }
                // },
                // {headerName: "소비자 구매보상", field: "consumerReward", width: 110},
                // {headerName: "blocery 수익", field: "bloceryOnlyFee", width: 110},
                // {
                //     headerName: "생산자 지급액(원)", field: "payoutAmount",
                //     valueGetter: function ({data}){
                //         return  ComUtil.addCommas(data.payoutAmount)
                //     },
                //     cellStyle:ComUtil.getCellStyle({cellAlign: 'center'})
                // },
                // {headerName: "생산자 지급액(BLCT)", field: "payoutAmountBlct", width: 150,
                //     valueGetter: function ({data}){
                //         return  ComUtil.addCommas(data.payoutAmountBlct.toFixed(2, 1))
                //     },
                //     cellStyle:ComUtil.getCellStyle({cellAlign: 'center'})
                // },

                {
                    headerName: "소비자번호", field: "consumerNo", width: 100,
                    cellRenderer: "consumerNoRenderer"
                },
                {
                    headerName: "주문자", field: "consumerNm", width: 80,
                    cellRenderer: "nameRenderer"
                },
                {headerName: "이메일", field: "consumerEmail"},
                {headerName: "주문자연락처", field: "consumerPhone"},
                {headerName: "[받는]사람", field: "receiverName"},
                {headerName: "[받는]연락처", field: "receiverPhone"},
                {headerName: "[받는]우편번호", field: "receiverZipNo"},
                {
                    headerName: "[받는]주소", field: "receiverAddr", width: 120,
                    valueGetter: function({data}) {
                        let v_addr = data.receiverAddr;
                        if(data.receiverRoadAddr != null) {
                            v_addr = data.receiverRoadAddr;
                        }
                        const v_addrDtl = (data.receiverAddrDetail ? " "+data.receiverAddrDetail : "");
                        const v_fullAddr = v_addr + v_addrDtl
                        return v_fullAddr;
                    }
                },
                {headerName: "공동현관 출입번호", field: "commonEnterPwd", hide: true},
                {headerName: "택배사", field: "transportCompanyName"},
                {headerName: "송장번호", field: "trackingNumber"},
                {headerName: "배송메세지", field: "deliveryMsg"},
                {headerName: "배송추적", field: "",  cellRenderer:"trackerDeliverRenderer", width: 100},
                {
                    headerName: "예상배송 시작일", field: "expectShippingStart",
                    cellRenderer: "expectShippingRenderer"
                },
                {
                    headerName: "예상배송 종료일", field: "expectShippingEnd",
                    cellRenderer: "expectShippingRenderer"
                },
                {headerName: "희망수령일", field: "hopeDeliveryDate"}
            ],
            defaultColDef: {
                width: 120,
                resizable: true,
                filter: true,
                sortable: true,
                floatingFilter: false,
                filterParams: {
                    newRowsAction: 'keep'
                }
            },
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
        }
    }

    //[이벤트] 그리드 로드 후 callback 이벤트
    onGridReady(params) {
        //API init
        this.gridApi = params.api
        this.columnApi = params.columnApi
    }

    async componentDidMount() {
        let user = await getLoginAdminUser();
        if (!user || user.email.indexOf('ezfarm') < 0) {
            //admin은 웹전용이라서, window로 이동하는 것이 더 잘됨. //this.props.history.push('/admin');
            window.location = '/admin/login';
        }
        this.setFilter();
        await this.search();
    }

    setFilter = async() => {
        const filterItems = Object.assign({}, this.state.filterItems);

        let orderStatusItems = [
            {
                value:'all',
                label:'전체'
            },
            {
                value:'paid',
                label:'결제완료'
            },
            {
                value:'confirmed',
                label:'출고대기'
            },
            {
                value:'tracking',
                label:'배송중'
            },
            {
                value:'okDate',
                label:'구매확정'
            },
            {
                value:'cancelled',
                label:'취소완료'
            }
        ];
        filterItems.orderStatusItems = orderStatusItems;
        this.setState({
            filterItems: filterItems
        })
    }

    onOrderStatusChange = (e) => {
        const search = Object.assign({}, this.state.search)
        search.searchOrderStatus = e.target.value;
        this.setState({
            search: search
        })
    }

    search = async (searchButtonClicked, orderDetailObj, csOrderSeq) => {
        let allData;
        //1건 독립조회 추가
        if (orderDetailObj) {
            let {data} = await getOneOrderDetail(orderDetailObj);
            console.log(data)
            allData = data;

        } else if(csOrderSeq){
            let {data} = await findCsOrderList(csOrderSeq);
            console.log(data)
            allData = data;
        }
        else {
            //기존 일반 조회
            const searchInfo = this.state.search;
            if(searchButtonClicked) {
                if (!searchInfo.startDate || !searchInfo.endDate) {
                    alert('시작일과 종료일을 선택해주세요')
                    return;
                }
            }

            if(this.gridApi) {
                //ag-grid 레이지로딩중 보이기
                this.gridApi.showLoadingOverlay();
            }
            this.setState({ loading: true });


            const params = {
                startDate:searchInfo.startDate ? moment(searchInfo.startDate).format('YYYYMMDD'):null,
                endDate:searchInfo.endDate ? moment(searchInfo.endDate).format('YYYYMMDD'):null,
                orderStatus:searchInfo.searchOrderStatus,
                searchDate:this.state.searchDate
            };

            console.log(params);
            const { status, data } = await getAllOrderDetailList(params);
            if(status !== 200){
                alert('응답이 실패 하였습니다');
                return;
            }

            allData = data;
        }

        // console.log(allData);

        allData.map(({orderSeq, consumerOkDate, payStatus, trackingNumber, orderConfirm, reqProducerCancel}, index) => {
            const order = {
                orderSeq: orderSeq,
                consumerOkDate: consumerOkDate,
                payStatus: payStatus,
                trackingNumber: trackingNumber,
                orderConfirm: orderConfirm,
                reqProducerCancel: reqProducerCancel
            }

            // let orderStatus = this.getOrderStatus(order);
            let orderDateToString = allData[index].orderDate ? ComUtil.utcToString(allData[index].orderDate,'YYYY-MM-DD HH:mm'):null;
            let expectShippingStartToString = allData[index].expectShippingStart ? ComUtil.utcToString(allData[index].expectShippingStart,'YYYY-MM-DD HH:mm'):null;
            let expectShippingEndToString = allData[index].expectShippingEnd ? ComUtil.utcToString(allData[index].expectShippingEnd,'YYYY-MM-DD HH:mm'):null;

            let hopeDeliveryDateToString = allData[index].hopeDeliveryFlag ? (allData[index].hopeDeliveryDate ? ComUtil.utcToString(allData[index].hopeDeliveryDate,'YYYY-MM-DD'):null):null;

            let consumerOkDateToString = allData[index].consumerOkDate ? ComUtil.utcToString(allData[index].consumerOkDate,'YYYY-MM-DD HH:mm'):null;
            let trackingNumberTimeToString = allData[index].trackingNumberTimestamp ? ComUtil.utcToString(allData[index].trackingNumberTimestamp,'YYYY-MM-DD HH:mm'):null;


            let cardPrice = (allData[index].cardPrice == 0)? null: allData[index].cardPrice;
            let blctToken = (allData[index].blctToken == 0)? null: allData[index].blctToken;

            allData[index].expectShippingStart = expectShippingStartToString
            allData[index].expectShippingEnd = expectShippingEndToString
            allData[index].hopeDeliveryDate = hopeDeliveryDateToString
            allData[index].orderDate = orderDateToString
            // allData[index].orderStatus = orderStatus
            allData[index].consumerOkDate = consumerOkDateToString
            allData[index].trackingNumberTimestamp = trackingNumberTimeToString

            allData[index].cardPrice = cardPrice;
            allData[index].blctToken = blctToken;

        })

        this.setState({
            data: allData,
            loading: false
        })

        //ag-grid api
        if(this.gridApi) {

            //ag-grid 레이지로딩중 감추기
            this.gridApi.hideOverlay()
        }
    }

    getOrderStatus = (order) => {
        let orderStatus = '미확인';

        if(order.csRefundFlag) {
            if(order.payStatus === 'cancelled'){
                return "전표취소";
            }
            return "전표발행";
        }

        if(order.payStatus === 'paid'){
            orderStatus = '결제완료'
            if(order.orderConfirm === 'confirmed') {
                orderStatus = '출고대기'
            } else if (order.orderConfirm === "shipping"){
                orderStatus = "출고완료"
            }
            if(order.trackingNumber) {
                orderStatus = '배송중'
                if(order.progressState === 3){
                    orderStatus = "배송완료"
                }
            }
            if(order.consumerOkDate) {
                orderStatus = '구매확정'
            }
        } else if(order.payStatus === 'scheduled') {
            return '주문예약'
        } else if(order.payStatus === 'revoked') {
            return '주문예약취소'
        } else if(order.payStatus === 'cancelled') {
            orderStatus = '취소완료'
            if(order.refundFlag){
                orderStatus = '환불완료'
            }
        }

        if(order.reqProducerCancel === 2) {
            orderStatus = '환불요청중'
        } else if(order.reqProducerCancel === 1) {
            orderStatus = '취소요청중'
        }

        return orderStatus;
    }

    goodsNmRenderer = ({value, data:rowData}) => {
        return (<span className='text-primary' a href="#" onClick={this.onGoodsNmClick.bind(this, rowData)}><u>{rowData.goodsOptionNm}</u></span>);
    }

    payMethodNmRenderer = ({value, data:rowData}) => {
        if(value == 'blct') {
            return 'bly';
        } else if(value == 'cardBlct') {
            return 'cardBly';
        }
        return value;
    }

    numberRenderer = ({value, data:rowData}) => {
        return (<span>{ComUtil.addCommas(value)}</span>)
    }

    // 상품상세정보 조회
    onGoodsNmClick = (data) => {
        //console.log(data)
        this.setState({
            goodsNo: data.goodsNo,
            isOpen: true,
            modalType: 'goodsInfo'
        })
    }

    farmNmRenderer = ({value, data:rowData}) => {
        return (<span className='text-primary' onClick={this.onFarmNmClick.bind(this, rowData)}><u>{rowData.farmName}</u></span>);
    }

    timeSaleRenderer = ({value, data:item}) => {
        let result = item.timeSaleGoods ? "포텐타임" : ( item.blyTimeGoods? "블리타임" : (item.superRewardGoods? "슈퍼리워드" : "일반상품"));
        if(item.onePlusSubFlag)
            result = "증정품";

        return result;
    }

    expectShippingRenderer = ({value, data:item}) => {
        if(item.hopeDeliveryFlag){
            return value;
        }
        return '';
    }

    // 농가정보 조회
    onFarmNmClick = async (data) => {
        const { data : producerInfo } = await getProducerByProducerNo(data.producerNo);
        this.setState({
            producerInfo: producerInfo,
            producerNo: data.producerNo,
            isOpen: true,
            modalType: 'farmInfo'
        })
    }

    toggle = () => {
        this.setState({
            isOpen: !this.state.isOpen
        })
    }

    onClose = () => {
        this.setState({
            modalType: ''
        })
        this.toggle();
    }

    onNameClick = (data) => {
        this.setState({
            modalType: 'consumerDetail',
            modalValue: data.consumerNo
        }, () => this.toggle())
    }

    consumerNoRenderer = ({value, data:rowData}) => {
        return <Span fg={'primary'} onClick={this.onNameClick.bind(this, rowData)}><u>{rowData.consumerNo}</u></Span>
    }

    nameRenderer = ({value, data:rowData}) => {
        return <Span fg={'primary'} onClick={this.onNameClick.bind(this, rowData)}><u>{rowData.consumerNm}</u></Span>
    }

    onDatesChange = async (data) => {
        const search = Object.assign({}, this.state.search);
        search.startDate = data.startDate;
        search.endDate = data.endDate;
        search.selectedGubun = data.gubun;

        await this.setState({
            search: search
        });
        if(data.isSearch) {
            await this.search();
        }
    }

    copy = ({value}) => {
        ComUtil.copyTextToClipboard(value, '', '');
    }

    //1건 독립조회
    oneIndependentSearch = ()=> {

        const searchField = this.state.independentSearchBy //'phone,'email','consumerNo'등

        const seqListDisc = (searchField === 'orderSeqList' ? '(주문번호는 ,로 구분해주세요)' : '');

        const inputValue = window.prompt(`검색할 주문 ${searchField}${seqListDisc} : `)
        if (inputValue) {
            let orderDetailObj;
            switch (searchField) {
                case 'consumerNo': orderDetailObj = {consumerNo:inputValue};break;
                case 'orderSeqList': orderDetailObj = {orderSeqList:inputValue};break;
                case 'csOrderSeq': orderDetailObj = {csOrderSeq:inputValue};break;
                case 'orderSubGroupNo': orderDetailObj = {orderSubGroupNo:inputValue};break;
                case 'goodsNo': orderDetailObj = {goodsNo:inputValue};break;
                case 'receiverName': orderDetailObj = {receiverName:inputValue};break;
                case 'receiverPhone': orderDetailObj = {receiverPhone:inputValue};break;
                case 'receiverZipNo': orderDetailObj = {receiverZipNo:inputValue};break;
            }
            this.search(false, orderDetailObj)
        }
    }
    onIndependentSearchByChange = (e)=> {
        this.setState({
            independentSearchBy:e.target.value
        })
    }

    reOrderRenderer = ({value, data:rowData}) => {
        const isRefundForReplace = rowData.refundForReplace;

        const orderStatusNm = this.getOrderStatus(rowData);
        const aDate = moment().format('YYYYMMDD');
        const bDate = moment(rowData.scheduleAtTime).format('YYYYMMDD');

        if(rowData.payStatus === 'scheduled') {
            if(rowData.impUid && aDate === bDate) {
                return (
                    <><SmButton onClick={this.reOrder.bind(this, rowData)}>다음날예약처리</SmButton></>
                );
            } else{
                return <span>{orderStatusNm}</span>;
            }
        }else{
            if(rowData.csRefundFlag){
                let csRefundColor = "text-info";
                let csRefundTitle = "+";
                let csRefundTitleCancel = "";
                if(rowData.orderPrice < 0)
                {
                    csRefundTitle = "-";
                    csRefundColor = "text-danger";
                }
                if(rowData.payStatus === 'cancelled'){
                    csRefundColor = "text-secondary";
                    csRefundTitleCancel = <span className={"text-danger"}>(취소완료)</span>
                }
                return(
                    <SmButton className={csRefundColor} onClick={this.csOrderFind.bind(this, rowData)}>
                        {csRefundTitle}{isRefundForReplace ? '대체':''}전표{csRefundTitleCancel}
                    </SmButton>
                );
            }else{
                return <span>{orderStatusNm}</span>;
            }
        }
    };

    csOrderFind = (rowData) => {
        const orderSeq = rowData.orderSeq;
        if(window.confirm("전표연관된 주문내역 검색하시겠습니까?")){
            this.search(false, null, orderSeq);
        }
    }

    reOrder = (rowData) => {
        this.setState({
            selImpUid:rowData.impUid,
            selOrderGroupNo:rowData.orderGroupNo,
            selOrderNo:rowData.orderSeq,
            selScheduleAtTime:rowData.scheduleAtTime,
            selGoodsNm:rowData.goodsNm,
            selConsumerNm:rowData.consumerNm,
            selConsumerEmail:rowData.consumerEmail,
            selConsumerPhone:rowData.consumerPhone,
            selCardPrice:rowData.cardPrice,
            isReOrderModalOpen: true
        });
    };

    // 주문 오류 처 모달 팝업 닫기
    onReOrderPopupClose = (data) => {
        this.setState({
            isReOrderModalOpen: !this.state.isReOrderModalOpen
        });
        if(data && data.refresh){
            this.search();
        }
    };

    onSearchDateOptionChange = (param) => {
        this.setState({
            searchDate: param.value
        })
    }

    render() {
        return(
            <Div p={16}>

                <Div p={10} mb={10} bc={'secondary'}>
                    <Space>
                        <div className="pr-2" style={{width: '150px'}}>
                            <Select
                                // defaultValue={{ label: "전체", value: 0 }}
                                name={'searchDateOption'}
                                options={this.state.searchDateOption}
                                value={this.state.searchDateOption.find(date => date.value === this.state.searchDate)}
                                onChange={this.onSearchDateOptionChange}
                            />
                        </div>
                        <SearchDates
                            isHiddenAll={true}
                            isCurrenYeartHidden={true}
                            gubun={this.state.selectedGubun}
                            startDate={this.state.startDate}
                            endDate={this.state.endDate}
                            onChange={this.onDatesChange}
                        />

                        {
                            this.state.searchDate === 'orderDate' &&
                            <Space>
                                <span> | &nbsp;&nbsp; 주문상태 </span>
                                <span>
                                {
                                    this.state.filterItems.orderStatusItems.map((item, index) =>
                                        <span key={'orderStatusSearchInput_' + index}>
                                            <input type="radio"
                                                   id={'searchOrderStatus' + item.value} name="searchOrderStatus"
                                                   value={item.value}
                                                   checked={item.value === this.state.search.searchOrderStatus}
                                                   onChange={this.onOrderStatusChange}/>
                                            <label key={'orderStatusSearchLabel_' + index}
                                                   htmlFor={'searchOrderStatus' + item.value} className='pl-1 mr-3 mb-0'
                                                   fontSize={'small'}>{item.label}</label>
                                        </span>
                                    )
                                }
                                </span>
                            </Space>
                        }
                        <MenuButton onClick={() => this.search(true)}> 검 색 </MenuButton>
                    </Space>
                </Div>

                <Div p={10} bc={'secondary'} mb={10}>
                    <Space>
                        <Input type='select' name='select' id='independentSearchBy' style={{width: 280}} onChange={this.onIndependentSearchByChange}>
                            <option name='radio1' value="consumerNo">소비자번호[consumerNo]</option>
                            <option name='radio2' value="orderSeqList">주문번호[orderSeqList]</option>
                            <option name='radio3' value="orderSubGroupNo">그룹번호[orderSubGroupNo]</option>
                            <option name='radio4' value="csOrderSeq">(전표찾기)주문번호[csOrderSeq]</option>
                            <option name='radio5' value="goodsNo">상품번호[goodsNo]</option>
                            <option name='radio6' value="receiverName">[받는]사람[receiverName]</option>
                            <option name='radio7' value="receiverPhone">[받는]연락처[receiverPhone]</option>
                            <option name='radio8' value="receiverZipNo">[받는]우편번호[receiverZipNo]</option>
                        </Input>
                        <Button onClick={this.oneIndependentSearch} className={'ml-2'}> 주문 별도조회 (버튼클릭후 조건입력) </Button>
                    </Space>
                </Div>

                {/* filter START */}
                <FilterContainer gridApi={this.gridApi} columnApi={this.columnApi} excelFileName={'주문 목록'}>
                    <FilterGroup>
                        <InputFilter
                            gridApi={this.gridApi}
                            columns={[
                                {field: 'consumerNm', name: '주문자명'},
                                {field: 'goodsNm', name: '상품명'},
                                {field: 'consumerEmail', name: '이메일'},
                                {field: 'consumerPhone', name: '주문자 전화번호'},
                                {field: 'orderSeq', name: '주문번호'},
                                {field: 'consumerNo', name: '소비자번호'},
                                {field: 'farmName', name: '농가명'},
                                {field: 'trackingNumber', name: '운송장번호'},
                                {field: 'pgProvider', name: 'PG구분'},
                                {field: 'orderSubGroupNo', name: '그룹번호'},
                            ]}
                            isRealTime={true}
                        />
                    </FilterGroup>
                    <Hr/>
                    <FilterGroup>
                        <CheckboxFilter
                            gridApi={this.gridApi}
                            field={'directGoods'}
                            name={'상품종류'}
                            data={[
                                {value: '즉시', name: '즉시'},
                                // {value: '예약', name: '예약'},
                                {value: '공동구매', name: '공동구매'},
                            ]}
                        />
                        <CheckboxFilter
                            gridApi={this.gridApi}
                            field={'timeSaleGoods'}
                            name={'상품구분'}
                            data={[
                                {value: '포텐타임', name: '포텐타임'},
                                {value: '슈퍼리워드', name: '슈퍼리워드'},
                                {value: '일반상품', name: '일반상품'},
                                {value: '증정품', name: '증정품'},
                            ]}
                        />
                        <CheckboxFilter
                            gridApi={this.gridApi}
                            field={'orderStatus'}
                            name={'주문상태'}
                            data={[
                                {value: '미확인', name: '미확인'},
                                {value: '주문예약', name: '주문예약'},
                                {value: '주문예약취소', name: '주문예약취소'},
                                {value: '결제완료', name: '결제완료'},
                                {value: '출고대기', name: '출고대기'},
                                {value: '출고완료', name: '출고완료'},
                                {value: '구매확정', name: '구매확정'},
                                {value: '취소완료', name: '취소완료'},
                                {value: '취소요청중', name: '취소요청중'},
                                {value: '환불완료', name: '환불완료'},
                                {value: '전표발행', name: '전표발행'},
                                {value: '전표취소', name: '전표취소'},
                                {value: '배송중', name: '배송중'},
                                {value: '배송완료', name: '배송완료'},
                            ]}
                        />
                        <CheckboxFilter
                            gridApi={this.gridApi}
                            field={'progressState'}
                            name={'주문그룹상태'}
                            data={[
                                {value: '피킹중', name: '피킹중'},
                                {value: '피킹완료', name: '피킹완료'},
                                {value: '배송완료', name: '배송완료'},
                                {value: '배송시작', name: '배송시작'},
                                {value: '주문전체취소', name: '주문전체취소'}
                            ]}
                        />
                        <CheckboxFilter
                            gridApi={this.gridApi}
                            field={'payMethod'}
                            name={'결제수단'}
                            data={[
                                {value: 'bly', name: '블리'},
                                {value: 'cardBly', name: '카드+블리'},
                                {value: 'card', name: '카드'},
                            ]}
                        />
                        <CheckboxFilter
                            gridApi={this.gridApi}
                            field={'vatFlag'}
                            name={'과세여부'}
                            data={[
                                {value: '과세', name: '과세'},
                                {value: '면세', name: '면세'},
                            ]}
                        />
                        <CheckboxFilter
                            gridApi={this.gridApi}
                            field={'usedCouponNo'}
                            name={'쿠폰'}
                            data={[
                                {value: '사용', name: '쿠폰사용'},
                                {value: '미사용', name: '미사용'},
                            ]}
                        />
                    </FilterGroup>
                </FilterContainer>
                {/* filter END */}

                <Flex mb={10}>
                    <Space>

                    </Space>
                    <Right>
                        총 {this.state.data.length} 건
                    </Right>
                </Flex>
                <div className="p-1">
                    <div
                        className="ag-theme-balham"
                        style={{
                            height: '600px'
                        }}
                    >
                        <AgGridReact
                            columnDefs={this.state.columnDefs}  //컬럼 세팅
                            defaultColDef={this.state.defaultColDef}
                            frameworkComponents={this.state.frameworkComponents}
                            overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                            overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                            onGridReady={this.onGridReady.bind(this)}   //그리드 init(최초한번실행)
                            rowData={this.state.data}
                            onCellDoubleClicked={this.copy}
                        >
                        </AgGridReact>
                    </div>
                </div>

                <Modal size="lg" isOpen={this.state.isOpen && this.state.modalType === 'farmInfo'}
                       toggle={this.toggle} >
                    <ModalHeader toggle={this.toggle}>
                        농가정보
                    </ModalHeader>
                    <ModalBody>
                        <ProducerProfileCard {...this.state.producerInfo} />
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={this.toggle}>닫기</Button>
                    </ModalFooter>
                </Modal>

                <Modal size="lg" isOpen={this.state.isOpen && this.state.modalType === 'goodsInfo'}
                       toggle={this.toggle} >
                    <ModalHeader toggle={this.toggle}>
                        상품정보
                    </ModalHeader>
                    <ModalBody>
                        <BizGoodsViewer goodsNo={this.state.goodsNo} />
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={this.toggle}>닫기</Button>
                    </ModalFooter>
                </Modal>

                <Modal size="lg" isOpen={this.state.isOpen && this.state.modalType === 'consumerDetail'}
                       toggle={this.toggle} >
                    <ModalHeader toggle={this.toggle}>
                        소비자 상세 정보
                    </ModalHeader>
                    <ModalBody>
                        <ConsumerDetail consumerNo={this.state.modalValue}
                                        onClose={this.toggle} />
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={this.toggle}>닫기</Button>
                    </ModalFooter>
                </Modal>

                <AdminModalWithNav
                    show={this.state.isReOrderModalOpen}
                    title={'주문 카드 오류 처리'}
                    onClose={this.onReOrderPopupClose}>
                    <OrderScheduleReReg
                        impUid={this.state.selImpUid}
                        orderGroupNo={this.state.selOrderGroupNo}
                        orderNo={this.state.selOrderNo}
                        goodsNm={this.state.selGoodsNm}
                        scheduleAtTime={this.state.selScheduleAtTime}
                        consumerNm={this.state.selConsumerNm}
                        consumerEmail={this.state.selConsumerEmail}
                        consumerPhone={this.state.selConsumerPhone}
                        cardPrice={this.state.selCardPrice}
                        onClose={this.onReOrderPopupClose}
                    />
                </AdminModalWithNav>
            </Div>
        );
    }
}