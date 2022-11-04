import React, { Component, Fragment, useRef, useEffect } from 'react';
import {
    getOrderWithoutCancelByProducerNo,
    getProducer,
    setOrderConfirm,
    setOrdersTrackingNumber
} from '~/lib/producerApi'
import {getLoginAdminUser, getLoginProducerUser} from '~/lib/loginApi'
import { getServerToday } from '~/lib/commonApi'
import "react-table/react-table.css"
import moment from 'moment-timezone'
import ComUtil from '~/util/ComUtil'
import ExcelUtil from '~/util/ExcelUtil'
import {Button, FormGroup, Modal, Input, ModalHeader, ModalBody, ModalFooter, Table} from 'reactstrap'
import { ProducerFullModalPopupWithNav } from '~/components/common'
import Order from '~/components/producer/web/order'
import OrderGoodsCsRefund from '~/components/producer/web/order/OrderGoodsCsRefund'
import OrderCsRefund from '~/components/producer/web/order/OrderCsRefund'
import { getItems,getTransportCompany } from '~/lib/adminApi'
import {Div, FilterGroup, Flex, Hr, JustListSpace, ListSpace, Space} from '~/styledComponents/shared'
import Select from 'react-select'
import {color} from "~/styledComponents/Properties";
//ag-grid
import { AgGridReact } from 'ag-grid-react';
import "react-datepicker/src/stylesheets/datepicker.scss";
import SearchDates from "~/components/common/search/SearchDates";
import FilterContainer from "~/components/common/gridFilter/FilterContainer";
import InputFilter from "~/components/common/gridFilter/InputFilter";
import CheckboxFilter from "~/components/common/gridFilter/CheckboxFilter";
import {getCardPgName} from "~/util/bzLogic";
import AdminLayouts from "~/styledComponents/shared/AdminLayouts";
import ReqCreditModalContent from "~/components/producer/web/orderList/ReqCreditModalContent";

const PROGRESS_STATE = {
    0: '-',
    1: '피킹중',
    2: '피킹완료',
    3: '배송완료',
    4: '배송시작',
    99: '주문전체취소'
}

//배치처리 후 잘못된 내용을 수동으로 요청하는 것(0이 아니란건 배치가 한번은 돌았다는 의미)
//payStatus !== 'cancelled' 일때 : 요청실패나 미요청 일때만 외상요청 가능
//payStatus === 'cancelled' 일때 : 취소요청 실패 일때만 외상 취소요청만 가능
export const ON_CREDIT = {
    [-1]: {label: '요청실패', color: color.danger},
    [0]: {label: '요청불가', color: color.black},
    [1]: {label: '요청중', color: color.black},
    [2]: {label: '외상완료', color: color.black},
    [-91]: {label: '취소실패', color: color.danger},
    [91]: {label: '취소요청중', color: color.black},
    [92]: {label: '취소완료', color: color.black},
}

export default class WebOrderList extends Component {
    constructor(props) {
        super(props);
        this.gridRef = React.createRef();
        this.serverToday=null;
        this.state = {
            isExcelUploadModal:false,
            isExcelUploadFileData:false,
            excelUploadData:null,
            buttonVisible: false,

            isGoodsCsRefundModal:false,
            isCsRefundModal:false,
            isReqCreditModal: false,//외상요청 모달

            data: [],
            selectedRows: [],

            gridOptions: {
                getRowHeight: function(params) {
                    return 30;
                },
                // enableColResize: true,              //컬럼 크기 조정
                // enableSorting: true,                //정렬 여부
                // enableFilter: true,                 //필터링 여부
                // floatingFilter: true,               //Header 플로팅 필터 여부
                suppressMovableColumns: true,       //헤더고정시키
                columnDefs: this.getColumnDefs(),
                onGridReady: this.onGridReady.bind(this),              //그리드 init(최초한번실행)
                onFilterChanged: this.onGridFilterChanged.bind(this),  //필터온체인지 이벤트
                onCellDoubleClicked: this.copy,
                onSelectionChanged: this.onSelectionChanged.bind(this),
                // onRowSelected:(params) => {
                //     if (['revoked', 'cancelled'].includes(params.data.payStatus)) {
                //         params.node.setSelected(false);
                //     }
                //     // if(params.data.yourProperty && params.node.isSelected())
                //     //     params.node.setSelected(false);
                // },
                defaultColDef: {
                    width: 100,
                    resizable: true,
                    filter: true,
                    sortable: true,
                    floatingFilter: true,
                    filterParams: {
                        newRowsAction: 'keep'
                    }
                },
                components: {
                    formatCurrencyRenderer: this.formatCurrencyRenderer,
                    formatDateRenderer: this.formatDateRenderer,
                },
                frameworkComponents: {
                    payStatusRenderer: this.payStatusRenderer,
                    orderPayMethodRenderer: this.orderPayMethodRenderer,
                    orderAmtRenderer:this.orderAmtRenderer,
                    orderSeqRenderer: this.orderSeqRenderer,
                    payoutAmountRenderer: this.payoutAmountRenderer
                },
                rowSelection: 'multiple',
                groupSelectsFiltered: true,
                suppressRowClickSelection: false,   //false : 셀 클릭시 체크박스도 체크 true: 셀클릭시 체크박스 체크 안함
                overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
                overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
            },

            orderListCnt:0,
            isOpen: false,
            orderSeq: null,
            producerNo: null,
            isTempProdAdmin: false,

            filterItems: {
                items: [],
                payMethodItems:[],
                orderStatusItems:[],
            },
            searchFilter: {
                // year:moment().format('YYYY'),
                itemName: '',
                payMethod: 'all',
                orderStatus:'all'
            },

            transportCompany: [],

            search: {
                searchConsumerOkDate: false,
                selectedGubun: 'week', //'week': 최초화면을 오늘(day)또는 1주일(week)로 설정.
                startDate: moment(moment().toDate()).add(-7,"days"),
                endDate: moment(moment().toDate()),
            },
        };
        this.excelFile = React.createRef();
        this.componentRef = React.createRef();
    }

    isLocalFoodFarmer = React.createRef()

    //주문상태 명칭 가져오기
    static getPayStatusNm = (data) => {

        let payStatusNm = "";
        if(data.csRefundFlag) {
            if(data.payStatus === 'cancelled'){
                return "전표취소";
            }
            return "전표발행";
        }
        if(data.payStatus === "paid"){
            payStatusNm = '결제완료';
            if (data.orderConfirm === "confirmed") {
                payStatusNm = "출고대기"
            } else if (data.orderConfirm === "shipping") {
                payStatusNm = "출고완료"
            }
            if (data.trackingNumber) {
                payStatusNm = "배송중"
                if(data.progressState === 3){
                    payStatusNm = "배송완료"
                }
            }
            if (data.consumerOkDate) {
                payStatusNm = "구매확정"
            }
        } else if(data.payStatus === "scheduled"){
            return '주문예약';
        } else if(data.payStatus === "revoked" ){
            return '주문예약취소';
        } else if(data.payStatus === "cancelled"){
            payStatusNm = '주문취소';
            if(data.refundFlag){
                payStatusNm = '환불';
            }
        }

        if(data.reqProducerCancel === 1) {
            payStatusNm = "취소요청중"
        } else if (data.reqProducerCancel === 2) {
            payStatusNm = "환불요청중"
        }

        return payStatusNm;
    }

    //[이벤트] 그리드 로드 후 callback 이벤트
    onGridReady(params) {
        //API init
        this.gridApi = params.api;
        this.columnApi = params.columnApi;
    }

    // Ag-Grid column Info
    getColumnDefs () {

        // 주문일자 field
        let orderDateColumn = {
            headerName: "주문일시", field: "orderDate",
            width: 170,
            suppressSizeToFit: true,
            cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
            headerCheckboxSelection: true,
            headerCheckboxSelectionFilteredOnly: true,  //전체 체크시 필터된 것만 체크
            checkboxSelection: true,
            // checkboxSelection: function(params) {
            //     if (!['revoked', 'cancelled'].includes(params.data.payStatus)) {
            //         return true;
            //     }
            //     return false;
            // },
            valueGetter: function(params) {
                //console.log("params",params);
                //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                return ComUtil.utcToString(params.data.orderDate, 'YYYY-MM-DD HH:mm');
            },
            filter: "agDateColumnFilter",
            filterParams: {
                comparator: function (filterLocalDateAtMidnight, cellValue) {
                    let dateAsString = cellValue;
                    if (dateAsString == null) return -1;
                    let filterLocalDate = ComUtil.utcToString(filterLocalDateAtMidnight);
                    let cellDate = ComUtil.utcToString(dateAsString);

                    if (filterLocalDate == cellDate) {
                        return 0;
                    }
                    if (cellDate < filterLocalDate) {
                        return -1;
                    }
                    if (cellDate > filterLocalDate) {
                        return 1;
                    }
                },
                browserDatePicker: true, //달력
                clearButton: true //클리어버튼
            }
        };

        // 주문상태 field
        let payStatusColumn = {
            headerName: "주문상태", field: "payStatus",
            width: 100,
            cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
            cellRenderer: "payStatusRenderer",
            filterParams: {
                clearButton: true //클리어버튼
            },
            valueGetter: function(params) {
                return WebOrderList.getPayStatusNm(params.data)
            }
        };

        // 주문그룹상태 field
        let progressStateColumn = {
            headerName: "주문그룹상태", field: "progressState",
            width: 120,
            cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
            filterParams: {
                clearButton: true //클리어버튼
            },
            valueGetter: function(params) {
                return PROGRESS_STATE[params.data.progressState];
            },
            hide: !this.isLocalFoodFarmer.current
        };

        // 전표비고 field
        let payCsRefundDescColumn = {
            headerName: "전표비고", field: "csRefundDesc",
            width: 100,
            cellStyle:ComUtil.getCellStyle({cellAlign: 'left'}),
            //hide:true,
            filterParams: {
                clearButton: true //클리어버튼
            }
        };

        // 묶음번호 field
        let orderSubGroupNoColumn = {
            headerName: "그룹번호", field: "orderSubGroupNo",
            width: 80,
            cellStyle: ComUtil.getCellStyle,
            filterParams: {
                clearButton: true
            },
            // valueGetter: function(params) {
            //     const orderSubGroupNo = params.data.orderSubGroupNo||0;
            //     const subGroupListSize = params.data.subGroupListSize||0;
            //     if(subGroupListSize > 1){
            //         return Math.abs(orderSubGroupNo).toString(16).toUpperCase();
            //     }
            //     return "";
            // }
        };

        // 주문번호 field
        let orderSeqColumn = {
            headerName: "주문번호", field: "orderSeq",
            sort:"desc",
            width: 100,
            cellStyle: ComUtil.getCellStyle,
            cellRenderer: "orderSeqRenderer",
            filterParams: {
                clearButton: true
            }
        };
        //onCredit;             //옥천전용 외상처리 상태: -1요청실패,   1:요청OK,   2: 확인API콜완료, -91:취소요청 실패, 91:취소요청OK, 92:취소API콜확인 완료)
        let onCreditColumn = { headerName: "외상처리상태", field: "onCredit", width: 100, cellStyle: function ({data}) {

                return {
                    color: ON_CREDIT[data.onCredit].color
                }
            }, valueGetter: function (params) {
                return ON_CREDIT[params.data.onCredit].label
            }, filterParams: { clearButton: true } };

        let consumerNameColumn = {
            headerName: "주문자", field: "consumerNm",
            suppressSizeToFit: true,
            width: 100,
            cellStyle:ComUtil.getCellStyle,
            filterParams: {
                clearButton: true //클리어버튼
            }
        };

        // 예약 즉시 구분
        let directGoodsColumn = {
            headerName: "구분", field: "directGoods",
            suppressSizeToFit: true,
            width: 80,
            cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
            valueGetter: function ({data}) {
                return data.directGoods ? '즉시' : (data.dealGoods ? "공동구매" : "예약")
            },
            filterParams: {
                clearButton: true //클리어버튼
            }
        };

        let goodsNameColumn = {
            headerName: "상품명", field: "goodsOptionNm",
            width: 350,
            cellStyle:ComUtil.getCellStyle,
            filterParams: {
                clearButton: true //클리어버튼
            }
        };

        let orderCountColumn = {
            headerName: "주문수량", field: "orderCnt",
            width: 100,
            cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
            filterParams: {
                clearButton: true //클리어버튼
            },
            valueGetter: function(params) {
                // console.log(params.data.partialRefundCount);
                return (params.data.partialRefundCount > 0 ? `${params.data.orderCnt} (+부분환불 ${params.data.partialRefundCount}건)` : params.data.orderCnt);
            }
        };
        let partialRefundCountColumn = {
            headerName: "부분환불", field: "partialRefundCount",
            width: 100,
            cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
            filterParams: {
                clearButton: true //클리어버튼
            },
            hide: true,
            valueGetter: function(params) {
                return params.data.partialRefundCount || ''
            }
        };


        // 주문금액 field
        let orderAmtColumn = {
            headerName: "결제금액", field: "adminOrderPrice",
            suppressSizeToFit: true,
            width: 100,
            cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
            cellRenderer: "orderAmtRenderer",
            filterParams: {
                clearButton: true //클리어버튼
            }
        };

        let vatColumn = {
            headerName: "부가세", field: "vatFlag",
            suppressSizeToFit: true,
            width: 80,
            cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
            valueGetter: function ({data}) {
                return data.vatFlag ? '과세' : '면세'
            },
            filterParams: {
                clearButton: true //클리어버튼
            }
        };

        // 주문 결제방법 field
        let orderPayMethodColumn = {
            headerName: "결제수단", field: "payMethod",
            suppressSizeToFit: true,
            width: 100,
            cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
            cellRenderer: "orderPayMethodRenderer",
            filterParams: {
                clearButton: true //클리어버튼
            }
        };

        let receiverNameColumn = {
            headerName: "수령자명", field: "receiverName",
            suppressSizeToFit: true,
            width: 100,
            cellStyle:ComUtil.getCellStyle,
            filterParams: {
                clearButton: true //클리어버튼
            }
        };


        // 구매확정일자 field
        let consumerOkDateColumn = {
            headerName: "구매확정일시", field: "consumerOkDate",
            width: 150,
            suppressSizeToFit: true,
            cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
            valueGetter: function(params) {
                return ComUtil.utcToString(params.data.consumerOkDate, 'YYYY-MM-DD HH:mm');
            },
            filter: "agDateColumnFilter",
        };


        // 정산금액 field
        let payoutAmtColumn = {
            headerName: "정산금액", field: "simplePayoutAmount",
            suppressSizeToFit: true,
            width: 100,
            cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
            cellRenderer: "payoutAmountRenderer",
            filterParams: {
                clearButton: true //클리어버튼
            }
        };


        let expectShippingStartColumn = {
            headerName: "예상배송시작일", field: "expectShippingStart",
            width: 120,
            suppressSizeToFit: true,
            cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
            cellRenderer: "formatDateRenderer",
            valueGetter: function(params) {
                //console.log("params",params);
                //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                return (params.data.expectShippingStart ? params.data.expectShippingStart : '')
            }
        };

        let expectShippingEndColumn = {
            headerName: "예상배송종료일", field: "expectShippingEnd",
            width: 120,
            suppressSizeToFit: true,
            cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
            cellRenderer: "formatDateRenderer",
            valueGetter: function(params) {
                //console.log("params",params);
                //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                return (params.data.expectShippingEnd ? params.data.expectShippingEnd : '')
            }
        };

        let hopeDeliveryDateColumn = {
            headerName: "희망수령일", field: "hopeDeliveryDate",
            width: 120,
            suppressSizeToFit: true,
            cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
            cellRenderer: "formatDateRenderer",
            valueGetter: function(params) {
                //console.log("params",params);
                //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                if(params.data.hopeDeliveryFlag){
                    return (params.data.hopeDeliveryDate ? params.data.hopeDeliveryDate : '');
                }
                return '';
            }
        };

        let trackingNumberColumn = {
            headerName: "송장번호", field: "trackingNumber",
            width: 120,
            suppressSizeToFit: true,
            cellStyle:ComUtil.getCellStyle({cellAlign: 'center'})
        };

        let columnDefs = [
            orderDateColumn,
            payStatusColumn,
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
            progressStateColumn,
            payCsRefundDescColumn,
            {headerName: "고유번호", field: "localKey", width: 70, hide: !this.isLocalFoodFarmer.current},
            orderSubGroupNoColumn,
            orderSeqColumn,
            onCreditColumn,
            consumerNameColumn,
            directGoodsColumn,
            {headerName: "로컬농부명", field: "localFarmerName", width: 100, cellStyle:ComUtil.getCellStyle({whiteSpace: 'normal'}), hide: !this.isLocalFoodFarmer.current},
            goodsNameColumn,
            {headerName: "옵션번호", field: "optionIndex", width: 70, hide: !this.isLocalFoodFarmer.current},
            orderCountColumn,
            partialRefundCountColumn,
            orderAmtColumn,
            vatColumn,
            orderPayMethodColumn,
            receiverNameColumn,
            consumerOkDateColumn,
            payoutAmtColumn,
            expectShippingStartColumn,
            expectShippingEndColumn,
            hopeDeliveryDateColumn,
            trackingNumberColumn
        ];

        return columnDefs
    }

    onSelectionChanged = (event) => {
        this.updateSelectedRows()
    }

    // getSelectedRows = () => {
    //     console.log({gridApi: this.gridApi})
    //
    //     let selectedRows;
    //     selectedRows = this.gridApi.getSelectedRows();
    //     console.log(selectedRows);
    //     ///than you can map your selectedRows
    //     selectedRows.map((row) => {
    //         console.log(row);
    //         console.log(row.data);
    //     });
    //
    //
    // }

    //Ag-Grid Cell 숫자콤마적용 렌더러
    formatCurrencyRenderer = ({value, data:rowData}) => {
        //console.log("rowData",rowData);
        return ComUtil.addCommas(value);
    }
    //Ag-Grid Cell 날짜변환 렌더러
    formatDateRenderer = ({value, data:rowData}) => {
        return (value ? ComUtil.utcToString(value,'YYYY-MM-DD') : '-')
    }

    payoutAmountRenderer = ({value, data:rowData}) => {
        return rowData.consumerOkDate ? (<span>{ComUtil.addCommas(rowData.simplePayoutAmount)} 원</span>) : (<span> - </span>)
    }

    //Ag-Grid Cell 주문 결제 방법 렌더러
    orderPayMethodRenderer = ({value, data:rowData}) => {
        let payMethodTxt = rowData.payMethod === "card" ?  getCardPgName(rowData.pgProvider): rowData.payMethod === "cardBlct" ? getCardPgName(rowData.pgProvider)+"+BLY결제" : "BLY결제";
        return (<span>{payMethodTxt}</span>);
    }

    //Ag-Grid Cell 주문금액 렌더러
    orderAmtRenderer = ({value, data:rowData}) => {

        //202104 orderPrice로 수정.
        return (<span>{ComUtil.addCommas(rowData.adminOrderPrice)} 원</span>);

        // let orderAmount = rowData.cardPrice + "원";
        // switch (rowData.payMethod) {
        //     case "blct":
        //         orderAmount = rowData.blctToken + "BLY";
        //         break;
        //
        //     case "cardBlct":
        //         orderAmount = rowData.cardPrice + "원 + " + rowData.blctToken + "BLY";
        //         break;
        // }
        //
        // return (<span>{orderAmount}</span>);

    }

    orderSeqRenderer = ({value, data:rowData}) => {
        if(rowData.csRefundFlag){
            return  (<span className='text-primary'>{rowData.orderSeq}</span>);
        }
        return (<span className='text-primary' onClick={this.onOrderSeqClick.bind(this, rowData)}><u>{rowData.orderSeq}</u></span>);
    }

    onOrderSeqClick = (data) => {
        this.setState({
            orderSeq: data.orderSeq,
            isOpen: true
        })
    }

    //Ag-Grid Cell 주문상태 렌더러
    payStatusRenderer = ({value, data:rowData}) => {
        let val = WebOrderList.getPayStatusNm(rowData);

        let txtColor = '';
        if(rowData.consumerOkDate) {
            txtColor = 'text-secondary';
        } else if(rowData.trackingNumber) {
            txtColor = 'text-info';
        }
        const isRefundForReplace = rowData.refundForReplace;
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
                csRefundTitleCancel = <span className={"text-danger"}>(취소)</span>
            }
            return (<span className={csRefundColor}>{csRefundTitle}{isRefundForReplace ? '대체':''}전표{csRefundTitleCancel}</span>)
        }

        if(rowData.payStatus === 'scheduled'){
            return (<span>주문예약</span>)
        }
        else if(rowData.payStatus === 'revoked'){
            return (<span>주문예약취소</span>)
        }

        return (rowData.payStatus === 'paid' && !rowData.trackingNumber && !rowData.orderConfirm && rowData.reqProducerCancel === 0 ?
            <Button size='sm' onClick={this.onClickOrderConfirm.bind(this, rowData)}>주문확인</Button> : <span className={val === '주문취소' ? 'text-danger' : txtColor}>{val}</span>)
    }

    // 주문확인 클릭
    onClickOrderConfirm = async (rowData) => {
        if(window.confirm("주문을 확인처리하시겠습니까?")){
            let params = {
                orderSeq: rowData.orderSeq,
                orderConfirm: "confirmed"
            }
            const {status, data} = await setOrderConfirm(params)
            console.log({data: data})

            if(status === 200) {

                const {resCode, errMsg, retData} = data
                if(resCode === 0) {
                    alert(retData)
                } else {
                    alert(errMsg);
                }

                this.search();

            }else{
                alert('네트워크 에러가 발생 하였습니다.')
                return
            }
        }
    }

    onOrderGoodsRefundClick = async () => {
        this.setState({
            isGoodsCsRefundModal: true
        })
    }

    // 체크박스 선택후 취소전표발행 클릭
    onCheckedOrderRefundClick = async () => {
        const rows = this.state.selectedRows;
        if (rows.length !== 1) {
            alert('전표발행 가능한 건이 없습니다.')
            return
        }

        const item = rows[0]

        if (['revoked', 'cancelled'].includes(item.payStatus)) {
            alert('취소된 건은 전표발행 할 수 없습니다.')
            return
        }

        // const csRefundFlagRows = rows.filter((item) => item.csRefundFlag === true)
        // if (csRefundFlagRows.length > 0) {
        //     alert('전표발행한 주문내역입니다.')
        //     return
        // }

        const orderSeqs = rows.map((item ,index)=>{
            return item.orderSeq;
        });

        this.setState({
            orderSeq: orderSeqs[0],
            isCsRefundModal: true
        })
    }


    // 체크박스 선택후 주문확인 클릭
    onCheckedOrderConfirmClick = async (isConfirmed) => {

        if(isConfirmed){

            const rows = this.state.selectedRows;

            const updateRows = rows.filter((item) => item.orderConfirm === null)
            if (updateRows.length <= 0) {
                alert('주문확인 가능한 건이 없습니다.')
                return
            }

            const cancelRows = rows.filter((item) => item.payStatus === 'cancelled')
            if (cancelRows.length > 0) {
                alert('주문취소 건이 존재합니다.')
                return
            }

            if (!window.confirm(`[${updateRows.length}건 가능] 주문확인 하시겠습니까?`)) {
                return
            }


            const promises = updateRows.map((item ,index)=>
                setOrderConfirm({
                    orderSeq: item.orderSeq,
                    orderConfirm: "confirmed"
                })
            )

            const res = await Promise.all(promises)

            let isSuccess = true;

            res.map(({data}) => {
                if (data.resCode !== 0) {
                    isSuccess = false
                }
            })

            if (isSuccess) {
                alert(`${updateRows.length}건 주문확인 되었습니다`)
            }else {
                alert('주문 확인 처리 실패된 항목이 있습니다. 다시 시도해주세요.');
            }

            await this.search();
        }
    }

    //외상 & 취소 요청
    onCheckedReqCreditClick = () => {
        this.reqCreditModalToggle()
    }

    updateSelectedRows = () => {
        const {api} = this.gridRef.current;
        if(api) {
            this.setState({
                selectedRows: this.gridApi.getSelectedRows()
            })
        }
    }

    //Ag-Grid 주문상태 필터링용 온체인지 이벤트 (엑셀데이터 동기화)
    onGridFilterChanged () {
        this.setFilterData();
    }

    async componentDidMount(){

        let adminUser = await getLoginAdminUser();
        let isTempProdAdmin = false;
        if(adminUser && adminUser.email === "tempProducer@ezfarm.co.kr") {
            isTempProdAdmin = true;
        }

        //로그인 체크
        const loginUser = await getLoginProducerUser();
        if(!loginUser){
            this.props.history.push('/producer/webLogin')
        }
        const {data: producer} = await getProducer();
        this.isLocalFoodFarmer.current = producer.localfoodFlag;

        let gridOption = Object.assign({},this.state.gridOptions);
        gridOption = {
            ...gridOption,
            columnDefs: this.getColumnDefs()
        }

        this.setState({
            producerNo: loginUser.uniqueNo,
            isTempProdAdmin: isTempProdAdmin,
            gridOptions: gridOption
        });

        this.setFilter();
        this.search()
    }


    searchData = async () => {
        let { data:serverToday } = await getServerToday();
        this.serverToday = serverToday;
        const filter = Object.assign({},this.state.searchFilter)
        const searchInfo = Object.assign({},this.state.search)

        const startDate = searchInfo.startDate ? moment(searchInfo.startDate).format('YYYYMMDD'):null;
        const endDate = searchInfo.endDate ? moment(searchInfo.endDate).format('YYYYMMDD'):null;

        return await getOrderWithoutCancelByProducerNo(filter.itemName, filter.payMethod, filter.orderStatus, startDate, endDate, searchInfo.searchConsumerOkDate);
    }

    // 주문조회 (search)
    search = async () => {

        const {api} = this.gridRef.current;

        if(api) {
            //ag-grid 레이지로딩중 보이기
            api.showLoadingOverlay();
        }

        const { status, data } = await this.searchData();
        console.log({data});
        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return
        }

        let vRowData = null;
        if(data && data.length > 0){
            vRowData = data;
        }

        this.setState({
            data: vRowData,
            orderListCnt: vRowData ? vRowData.length:0,
        }, () => {
            this.updateSelectedRows()
        });

        //ag-grid api
        if(api){
            //ag-grid 레이지로딩중 감추기
            api.hideOverlay();

            //ag-grid 높이 리셋 및 렌더링
            api.resetRowHeights();

            if(!vRowData){
                api.showNoRowsOverlay();
            }
        }
    }

    setFilter = async() => {
        const filterItems = Object.assign({}, this.state.filterItems);

        const { data } = await getItems(true);
        let items = data.map(item => {
            return{
                value: item.itemName,
                label: item.itemName
            }
        })

        items.splice(0,0,{
            value: '',
            label: '대분류 선택'
        })

        let payMethodItems = [
            {
                value:'all',
                label:'전체'
            },
            {
                value:'card',
                label:'카드결제'
            },
            {
                value:'blct',
                label:'BLY결제'
            },
            {
                value:'cardBlct',
                label:'카드+BLY결제'
            }
        ];

        let orderStatusItems = [
            {
                value:'all',
                label:'전체'
            },
            {
                value:'allWithCancel',
                label:'전체(취소포함)'
            },
            {
                value:'paid',
                label:'결제완료'
            },
            {
                value:'tracking',
                label:'배송중'
            },
            {
                value:'okDate',
                label:'구매확정'
            }
        ];

        filterItems.items = items;
        filterItems.payMethodItems = payMethodItems;
        filterItems.orderStatusItems = orderStatusItems;

        this.setState({
            filterItems: filterItems
        })
    }

    getSearchConsumerOkDateOptions = () => {
        return [{value:false, label:'주문일기준'},{value:true, label:'구매확정일 기준'}]
    }

    toggle = () => {
        this.setState({
            isOpen: !this.state.isOpen
        })
    }

    setFilterData (){
        if(!this.gridApi) return;
        let filterData = this.getFilterData();
        this.setState({
            orderListCnt: filterData.data ? filterData.data.length:0
        })
    }
    getFilterData = () => {
        if(!this.gridApi){ return [] }
        //필터링된 데이터 push
        let sortedData = [];
        this.gridApi.forEachNodeAfterFilterAndSort(function(node, index) {
            if(node.data.orderSeq) {
                sortedData.push(node.data);
            }
        });
        return sortedData;
    }

    getExcelData = async () => {
        if(!this.gridApi){ return [] }

        const columns = [
            '주문일시','주문상태','전표비고',
            '그룹번호',
            '주문번호',
            '택배사', '택배사코드', '송장번호',
            '주문자','주문자이메일', '주문자연락처',
            '구분','상품명','옵션명','주문수량',
            '결제금액', '부가세', '결제수단',
            '수령자명','수령자연락처','우편번호','수령자주소',
            '배송메세지', '공동현관출입번호',
            '예상배송시작일', '예상배송종료일',
            '희망수령일'
        ];

        //필터링된 데이터
        //let sortedData = this.getFilterData();
        const { status, data:sortedData } = await this.searchData();
        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return
        }

        //필터링 된 데이터에서 sortedData._original 로 접근하여 그리드에 바인딩 원본 값을 가져옴
        const data = sortedData.map((item ,index)=> {

            let v_rowNo = index+1;
            let v_orderDate = ComUtil.utcToString(item.orderDate,'YYYY-MM-DD HH:mm');
            let payStatusNm = WebOrderList.getPayStatusNm(item);
            let vatFlag = item.vatFlag ? "과세" : "면세";

            let wrapOrderNo = item.orderSubGroupNo||"";
            // const orderSubGroupNo = item.orderSubGroupNo||0;
            // const subGroupListSize = item.subGroupListSize||0;
            // if(subGroupListSize > 1){
            //     wrapOrderNo = Math.abs(orderSubGroupNo).toString(16).toUpperCase();
            // }룹

            let v_receiverAddrInfo = "";
            // if(item.receiverZipNo){
            //     v_receiverAddrInfo = "("+item.receiverZipNo+")";
            // }
            v_receiverAddrInfo = v_receiverAddrInfo + item.receiverAddr+" "+item.receiverAddrDetail;

            let v_directGoodsNm = item.directGoods ? "즉시" : (item.dealGoods ? "공동구매" : "예약");

            //202104 orderPrice로 노출
            let v_orderAmount = item.adminOrderPrice;
            // let v_orderAmount = item.cardPrice + "원";
            // switch (item.payMethod) {
            //     case "blct":
            //         v_orderAmount = item.blctToken + "BLY";
            //         break;
            //
            //     case "cardBlct":
            //         v_orderAmount = item.cardPrice + "원 + " + item.blctToken + "BLY";
            //         break;
            // }

            let payMethodNm = item.payMethod === "card" ? getCardPgName(item.pgProvider) : item.payMethod === "cardBlct" ? getCardPgName(item.pgProvider)+"+BLY결제":"BLY결제";

            let v_expectShippingStart = item.expectShippingStart ? ComUtil.utcToString(item.expectShippingStart):"";
            let v_expectShippingEnd = item.expectShippingEnd ? ComUtil.utcToString(item.expectShippingEnd):"";

            let v_hopeDeliveryDate = item.hopeDeliveryFlag ? (item.hopeDeliveryDate ? ComUtil.utcToString(item.hopeDeliveryDate):""):"";

            let v_goodsNm = item.optionName ? item.optionName:item.goodsNm;
            return [
                v_orderDate, payStatusNm, item.csRefundDesc,
                wrapOrderNo,
                item.orderSeq,
                item.transportCompanyName, item.transportCompanyCode,item.trackingNumber,
                item.consumerNm,item.consumerEmail, item.consumerPhone,
                v_directGoodsNm, item.goodsOptionNm, v_goodsNm, item.orderCnt,
                v_orderAmount, vatFlag, payMethodNm,
                item.receiverName, item.receiverPhone, item.receiverZipNo, v_receiverAddrInfo,
                item.deliveryMsg, item.commonEnterPwd,
                v_expectShippingStart, v_expectShippingEnd,
                v_hopeDeliveryDate
            ]
        });

        return [{
            columns: columns,
            data: data
        }]
    }

    //저장 하였을 경우는 창을 닫지 않고, X 버튼을 눌렀을때만 닫도록 한다 (20.09.22.lydia 저장했을 때에도 창 닫히도록 수정)
    onClose = async (isSaved) => {
        // if(isSaved) {
        //     let data = {};
        //     data.orderSeq = this.state.orderSeq;
        //     data.orderConfirm = "shipping";
        //
        //     const modified = await setOrderConfirm(data)
        //
        //     if(modified.data.resCode === 0) {
        //         this.search();
        //         this.toggle()
        //     } else {
        //         alert(modified.data.errMsg);
        //         return false;
        //     }
        // } else {
        this.search();
        this.toggle()
        // }
        //isSaved ? this.search() : this.toggle()
    }

    //검색 버튼
    onFilterSearchClick = async () => {
        // filter값 적용해서 검색하기
        await this.search();
    }

    // 초기화 버튼
    onInitClick= async() => {
        const filter = Object.assign({}, this.state.searchFilter)

        filter.itemName = '';
        filter.payMethod = 'all';
        filter.orderStatus = 'all';

        this.setState({
            searchFilter: filter
        });

        await this.search();
    }

    onItemChange = (data) => {
        const filter = Object.assign({}, this.state.searchFilter)

        if(data.label==='대분류 선택') {
            filter.itemName = ''
        } else {
            filter.itemName = data.label
        }

        this.setState({
            searchFilter: filter
        })
    }

    onPayMethodChange = (e) => {
        const filter = Object.assign({}, this.state.searchFilter)

        filter.payMethod = e.target.value;

        this.setState({
            searchFilter: filter
        })
    }

    onOrderStatusChange = (e) => {
        const filter = Object.assign({}, this.state.searchFilter)

        filter.orderStatus = e.target.value;

        this.setState({
            searchFilter: filter
        })

    }

    isGoodsCsRefundModalToggle = () => {
        this.setState(prevState => ({
            isGoodsCsRefundModal: !prevState.isGoodsCsRefundModal
        }));
    };

    onGoodsCsRefundPopupClose = (isSaved) => {
        if(isSaved) {
            this.search();
            this.isGoodsCsRefundModalToggle()
        } else {
            this.isGoodsCsRefundModalToggle()
        }
    }

    isCsRefundModalToggle = () => {
        this.setState(prevState => ({
            isCsRefundModal: !prevState.isCsRefundModal
        }));
    };

    onCsRefundPopupClose = (isSaved) => {
        if(isSaved) {
            this.search();
            this.isCsRefundModalToggle()
        } else {
            this.isCsRefundModalToggle()
        }
    }

    onExcelDownload = async () => {
        let excelDataList = await this.getExcelData();

        let v_headers = excelDataList[0].columns;
        let v_data = excelDataList[0].data;

        ExcelUtil.downloadForAoa("orderList",v_headers,v_data);
    }

    excelUploadModalToggle = () => {
        this.setState(prevState => ({
            isExcelUploadModal: !prevState.isExcelUploadModal
        }));
    };

    //외상요청 모달
    reqCreditModalToggle = () => {
        this.setState(prevState => ({
            isReqCreditModal: !prevState.isReqCreditModal
        }));
    };


    //
    onTrackingNumberInfoExcelUpload = async () => {
        await this.getTransportCompany()
        this.excelUploadModalToggle();
    }

    //송장내역 엑셀 다운로드
    onTrackingNumberInfoExcelDownload = async () => {

        // 송장내역 필요한 데이터 다시 검색
        const { data:trackingTargetList } = await this.searchData();

        const v_Headers = [
            '주문일시',
            '주문상태',
            '묶음번호',
            '주문번호',
            '택배사코드','송장번호',
            '주문자',
            '구분', '상품명', '옵션명',
            '주문수량','결제금액', '결제수단',
            '수령자명','수령자연락처','배송지주소','배송메세지','공동현관출입번호',
            '예상배송시작일', '예상배송종료일',
            '희망수령일'
        ];

        const v_Columns = [
            "orderDate",
            "payStatusNm",
            "wrapOrderNo",
            "orderSeq",
            "transportCompanyCode","trackingNumber",
            "consumerNm",
            "directGoodsNm", "goodsNm", "optionNm",
            "orderCnt", "orderAmount", "payMethodNm",
            "receiverName","receiverPhone", "receiverAddrInfo","deliveryMsg","commonEnterPwd",
            "expectShippingStart","expectShippingEnd",
            "hopeDeliveryDate"
        ];

        let v_dataList = trackingTargetList;
        let v_data = v_dataList.filter((row,index) => {
            if(row.payStatus == 'paid') {
                if (row.trackingNumber == "" || row.trackingNumber == null) {
                    return row
                }
            }
        });
        ComUtil.sortNumber(v_data, 'orderSeq', true);//주문일시의 엯순.

        let excelDataList = [];
        v_data.map((item ,index)=> {
            let v_payStatusNm = WebOrderList.getPayStatusNm(item);
            let v_payMethodNm = item.payMethod === "card" ? getCardPgName(item.pgProvider) : item.payMethod === "cardBlct" ? getCardPgName(item.pgProvider)+"+BLY결제":"BLY결제";

            let v_receiverAddrInfo = "";
            if(item.receiverZipNo){
                v_receiverAddrInfo = "("+item.receiverZipNo+")";
            }
            v_receiverAddrInfo = v_receiverAddrInfo + item.receiverAddr+" "+item.receiverAddrDetail;

            let v_orderDate = ComUtil.utcToString(item.orderDate,'YYYY-MM-DD HH:mm');

            let wrapOrderNo = item.orderSubGroupNo||"";
            // const orderSubGroupNo = item.orderSubGroupNo||0;
            // const subGroupListSize = item.subGroupListSize||0;
            // if(subGroupListSize > 1){
            //     wrapOrderNo = Math.abs(orderSubGroupNo).toString(16).toUpperCase();
            // }

            let v_directGoodsNm = item.directGoods ? "즉시" : (item.dealGoods ? "공동구매" : "예약");

            //202104 orderPrice로 노출
            let v_orderAmount = item.adminOrderPrice;
            // let v_orderAmount = item.cardPrice + "원";
            // switch (item.payMethod) {
            //     case "blct":
            //         v_orderAmount = item.blctToken + "BLY";
            //         break;
            //
            //     case "cardBlct":
            //         v_orderAmount = item.cardPrice + "원 + " + item.blctToken + "BLY";
            //         break;
            // }

            let v_expectShippingStart = item.expectShippingStart ? ComUtil.utcToString(item.expectShippingStart):"";
            let v_expectShippingEnd = item.expectShippingEnd ? ComUtil.utcToString(item.expectShippingEnd):"";

            let v_hopeDeliveryDate = item.hopeDeliveryFlag ? (item.hopeDeliveryDate ? ComUtil.utcToString(item.hopeDeliveryDate):""):"";

            let v_goodsNm = item.optionName ? item.optionName:item.goodsNm;

            excelDataList.push({
                orderDate:v_orderDate,
                payStatusNm:v_payStatusNm,
                wrapOrderNo:wrapOrderNo,
                orderSeq:item.orderSeq,
                transportCompanyName:item.transportCompanyName,
                transportCompanyCode:item.transportCompanyCode,
                trackingNumber:item.trackingNumber,
                consumerNm:item.consumerNm,
                directGoodsNm:v_directGoodsNm,
                goodsNm:item.goodsOptionNm,
                optionNm:v_goodsNm,
                orderCnt:item.orderCnt,
                orderAmount:v_orderAmount,
                payMethodNm:v_payMethodNm,
                receiverName:item.receiverName,
                receiverPhone:item.receiverPhone,
                receiverAddrInfo:v_receiverAddrInfo,
                deliveryMsg:item.deliveryMsg,
                commonEnterPwd:item.commonEnterPwd,
                expectShippingStart:v_expectShippingStart,
                expectShippingEnd:v_expectShippingEnd,
                hopeDeliveryDate:v_hopeDeliveryDate
            });
        });

        ExcelUtil.downloadForJson("trackingNumberOrderList",v_Headers,v_Columns, excelDataList);
    }

    getTransportCompany = async () => {
        const { status, data } = await getTransportCompany();
        this.setState({
            transportCompany: data
        })
    }

    onTrackingCompanyInfoExcelDownload = async () => {
        //택배사 코드 정보 조회
        // const { status, data } = await getTransportCompany();
        // if(status !== 200){
        //     alert('택배사 정보 조회가 실패하였습니다');
        //     return
        // }
        // const filter = Object.assign({},this.state.searchFilter)

        const transportCompany = Object.assign([], this.state.transportCompany);

        const v_Headers = ['택배사','택배사코드'];
        const v_Columns = ["transportCompanyName","transportCompanyCode"];
        let excelDataList = [];
        transportCompany.map((item ,index)=> {
            excelDataList.push({
                transportCompanyName:item.transportCompanyName,
                transportCompanyCode:item.transportCompanyCode
            });
        });
        ExcelUtil.downloadForJson("transportCompanyInfo",v_Headers,v_Columns, excelDataList);
    }

    //송장내역 엑셀 파일 유무 체크
    onTrackingNumberExcelExportChk = () => {
        let selectedFile = this.excelFile.current.files[0];
        if(selectedFile){
            this.setState({
                isExcelUploadFileData:true
            });
        }else{
            this.setState({
                isExcelUploadFileData:false
            });
        }
    }

    //송장내역 엑셀 업로드
    //송장내역 엑셀 업로드 저장
    onTrackingNumberInfoExcelUploadSave = () => {
        let selectedFile = this.excelFile.current.files[0];
        ExcelUtil.excelExportJson(selectedFile,this.handleExcelData);
    }
    handleExcelData = async (jsonData) => {

        let selectedFile = this.excelFile.current.files[0];
        if(!selectedFile){
            alert("파일을 선택해 주세요.");
            return false;
        }

        let excelData = jsonData;

        //주문번호,택배사코드,송장번호 빈값 체크리스트
        let orderSeqValidateChk = 0;
        let transportCompanyCodeValidateChk = 0;
        let trackingNumberValidateChk = 0;
        excelData.some(function (items) {
            if(items["주문번호"] == ""){
                orderSeqValidateChk += 1;
                return true;//break
            }
            if(items["택배사코드"] == ""){
                transportCompanyCodeValidateChk += 1;
                return true;//break
            }
            if(items["송장번호"] == ""){
                trackingNumberValidateChk += 1;
                return true;//break
            }
        });
        if(orderSeqValidateChk > 0){
            alert("주문번호가 입력이 안된 항목이 존재합니다!");
            return false;
        }
        if(transportCompanyCodeValidateChk > 0){
            alert("택배사코드가 입력이 안된 항목이 존재합니다!");
            return false;
        }
        if(trackingNumberValidateChk > 0){
            alert("송장번호가 입력이 안된 항목이 존재합니다!");
            return false;
        }
        let excelUploadData = [];
        excelData.map((item ,index)=> {
            if(item["주문번호"] != "" && item["택배사코드"] != "" && item["송장번호"] != ""){
                excelUploadData.push({
                    producerNo:this.state.producerNo,
                    orderSeq:item["주문번호"],
                    transportCompanyCode:item["택배사코드"].toString().trim(),
                    trackingNumber:item["송장번호"].toString().trim().replace(/\-/g,'')
                });
            }
        });

        //주문 송장 입력 처리 api
        let params = {
            orderTrackingNumberInfoList:excelUploadData
        };
        const { status, data } = await setOrdersTrackingNumber(params);
        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return
        }
        const trackingTotalCount = excelUploadData && excelUploadData.length;

        if(data >= 0){

            const trackingSuccessCount = data;

            alert("전체 "+trackingTotalCount+" 개중 "+trackingSuccessCount+" 처리되었습니다!");

            this.setState({
                isExcelUploadModal:false
            });
            this.search();
        }else{
            if(data == -8){
                alert("생산자 로그인 정보가 다릅니다! 다시 로그인 하거나 새로고침 하십시오! ");
                return;
            }
        }
    }

    // onSearchDateChange = async (date) => {
    //     //console.log("",date.getFullYear())
    //     const filter = Object.assign({},this.state.searchFilter)
    //     filter.year = date.getFullYear();
    //     await this.setState({searchFilter:filter});
    //     await this.search();
    // }

    copy = ({value}) => {
        ComUtil.copyTextToClipboard(value, '', '');
    }

    onDatesTypeChange = async (data) => {
        console.log(data)

        await this.setState({
            search: {
                searchConsumerOkDate: data.value,
                startDate: this.state.search.startDate,
                endDate: this.state.search.endDate,
                selectedGubun: this.state.search.gubun
            }
        });
    }

    onDatesChange = async (data) => {
        await this.setState({
            search: {
                searchConsumerOkDate: this.state.search.searchConsumerOkDate,
                startDate: data.startDate,
                endDate: data.endDate,
                selectedGubun: data.gubun
            }
        });
    }

    render() {
        const state = this.state;
        return(
            <Fragment>
                <FormGroup>
                    <div className='border p-3'>
                        <div className='pb-3 d-flex'>
                            <div className='d-flex'>
                                <div className='d-flex'>
                                    <div className='d-flex justify-content-center align-items-center textBoldLarge' fontSize={'small'}>상품분류</div>
                                    <div className='pl-3' style={{width:200}}>
                                        <Select
                                            zIndex={999}
                                            options={state.filterItems.items}
                                            value={state.filterItems.items.find(item => item.value === state.searchFilter.itemName)}
                                            onChange={this.onItemChange}
                                        />
                                    </div>
                                </div>
                                <div className='ml-3 d-flex'>
                                    <div className='d-flex justify-content-center align-items-center textBoldLarge' fontSize={'small'}> | &nbsp; &nbsp; 결제수단  </div>
                                    <div className='pl-3 pt-2 '>
                                        {
                                            state.filterItems.payMethodItems.map( (item,index) => <>
                                                <input key={'payMethodSearchInput_'+index} type="radio" id={'payMethod'+item.value} name="payMethod" value={item.value} checked={item.value === state.searchFilter.payMethod} onChange={this.onPayMethodChange} />
                                                <label key={'payMethodSearchLabel_'+index} for={'payMethod'+item.value} className='mb-0 pl-1 mr-3' fontSize={'small'}>{item.label}</label>
                                            </>)
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr className='p-0 m-0' />
                        <div className='pt-3 pb-3 d-flex'>
                            <div className='d-flex'>
                                <div className='pl-3' style={{width:200}}>
                                    <Select
                                        zIndex={999}
                                        options={this.getSearchConsumerOkDateOptions()}
                                        //defaultValue={ {value:false, label:'주문일기준'} }
                                        value={this.getSearchConsumerOkDateOptions().find(item => item.value === state.search.searchConsumerOkDate)}
                                        onChange={this.onDatesTypeChange}
                                    />
                                </div>
                                {/*<div className='d-flex justify-content-center align-items-center textBoldLarge' fontSize={'small'}> 기 간 (주문일) </div>*/}
                                <Div ml={10} >
                                    <SearchDates
                                        isHiddenAll={true}
                                        isCurrenYeartHidden={true}
                                        gubun={this.state.search.selectedGubun}
                                        startDate={this.state.search.startDate}
                                        endDate={this.state.search.endDate}
                                        onChange={this.onDatesChange}
                                    />
                                </Div>
                            </div>
                        </div>
                        <hr className='p-0 m-0' />
                        <div className='pt-3 d-flex'>
                            <div>
                                <span className='textBoldLarge' fontSize={'small'}>주문상태 &nbsp;&nbsp; | </span>
                                <span className='pl-3'>
                                    {
                                        state.filterItems.orderStatusItems.map((item,index) => <>
                                            <input key={'orderStatusSearchInput_'+index} type="radio" id={'orderStatus'+item.value} name="orderStatus" value={item.value} checked={item.value === state.searchFilter.orderStatus} onChange={this.onOrderStatusChange} />
                                            <label key={'orderStatusSearchLabel_'+index} for={'orderStatus'+item.value} className='pl-1 mr-3' fontSize={'small'}>{item.label}</label>
                                        </>)
                                    }
                                </span>
                            </div>
                            <div className='ml-auto d-flex'>
                                <Button color={'info'} size={'sm'} onClick={this.onFilterSearchClick}>
                                    {/*<div className="d-flex">*/}
                                    <span fontSize={'small'}>검색</span>
                                    {/*</div>*/}
                                </Button>

                                <Button color={'secondary'} size={'sm'} className='ml-2' onClick={this.onInitClick}>
                                    {/*<div className="d-flex">*/}
                                    <span fontSize={'small'}>초기화 </span>
                                    {/*</div>*/}
                                </Button>

                            </div>
                        </div>
                    </div>
                </FormGroup>

                <FilterContainer gridApi={this.gridApi} columnApi={this.columnApi} excelFileName={'주문 목록'}>
                    <FilterGroup>
                        <InputFilter
                            gridApi={this.gridApi}
                            columns={[
                                {field: 'orderSeq', name: '주문번호', width: 80},
                                {field: 'consumerNm', name: '주문자'},
                                {field: 'goodsNm', name: '상품명' },
                                {field: 'receiverName', name: '수령자명'},
                                {field: 'trackingNumber', name: '송장번호', width: 150},
                            ]}
                            isRealTime={true}
                        />
                    </FilterGroup>
                    <Hr/>
                    <FilterGroup>
                        <CheckboxFilter
                            gridApi={this.gridApi}
                            field={'payStatus'}
                            name={'주문상태'}
                            data={[
                                {value: '미배송', name: '미배송'},
                                {value: '주문예약', name: '주문예약'},
                                {value: '주문예약취소', name: '주문예약취소'},
                                {value: '결제완료', name: '결제완료'},
                                {value: '주문취소', name: '주문취소'},
                                {value: '환불', name: '환불'},
                                {value: '출고대기', name: '출고대기'},
                                {value: '출고완료', name: '출고완료'},
                                {value: '배송중', name: '배송중'},
                                {value: '구매확정', name: '구매확정'},
                                {value: '취소요청중', name: '취소요청중'},
                                {value: '환불요청중', name: '환불요청중'},
                            ]}
                        />
                        {
                            this.isLocalFoodFarmer.current &&
                            <CheckboxFilter
                                gridApi={this.gridApi}
                                field={'progressState'}
                                name={'주문그룹상태'}
                                data={[
                                    {value: '피킹중', name: '피킹중'},
                                    {value: '피킹완료', name: '피킹완료'},
                                    {value: '배송시작', name: '배송시작'},
                                    {value: '배송완료', name: '배송완료'},
                                    {value: '주문전체취소', name: '주문전체취소'}
                                ]}
                            />
                        }
                        <CheckboxFilter
                            gridApi={this.gridApi}
                            field={'payMethod'}
                            name={'결제수단'}
                            data={[
                                {value: 'card', name: '카드'},
                                {value: 'cardBlct', name: '카드+BLY'},
                                {value: 'bly', name: '블리'},

                            ]}
                        />
                        <CheckboxFilter
                            gridApi={this.gridApi}
                            field={'directGoods'}
                            name={'상품구분'}
                            data={[
                                {value: '즉시', name: '즉시'},
                                {value: '공동구매', name: '공동구매'},
                            ]}
                        />
                        {/*<CheckboxFilter*/}
                        {/*    gridApi={this.gridApi}세*/}
                        {/*    field={'timeSaleGoods'}*/}
                        {/*    name={'상품구분'}*/}
                        {/*    data={[*/}
                        {/*        {value: '일반상품', name: '일반상품'},*/}
                        {/*        {value: '슈퍼리워드', name: '슈퍼리워드'},*/}
                        {/*        {value: '포텐타임', name: '포텐타임'},*/}
                        {/*        {value: '블리타임', name: '블리타임'},*/}
                        {/*    ]}*/}
                        {/*/>*/}
                        {/*<CheckboxFilter*/}
                        {/*    gridApi={this.gridApi}*/}
                        {/*    field={'usedCouponNo'}*/}
                        {/*    name={'쿠폰'}*/}
                        {/*    data={[*/}
                        {/*        {value: '쿠폰사용', name: '쿠폰사용'},*/}
                        {/*        {value: '-', name: '미사용'},*/}
                        {/*    ]}*/}
                        {/*/>*/}
                        <CheckboxFilter
                            gridApi={this.gridApi}
                            field={'vatFlag'}
                            name={'과세여부'}
                            data={[
                                {value: '과세', name: '과세'},
                                {value: '면세', name: '면세'},
                            ]}
                        />
                    </FilterGroup>
                </FilterContainer>


                <div className="d-flex pt-1 pb-1">
                    <div>총 {this.state.data ? ComUtil.addCommas(this.state.data.length) : 0} 개</div>
                    <div className='d-flex ml-auto'>
                        <Space>
                            {/*{*/}
                            {/*    this.state.isTempProdAdmin &&*/}
                            {/*        (<AdminLayouts.MenuButton bg={'danger'} onClick={this.onOrderGoodsRefundClick}>[상품]수동전표발행</AdminLayouts.MenuButton>)*/}
                            {/*}*/}
                            {
                                (this.state.isTempProdAdmin && this.state.selectedRows.length == 1) &&
                                (<AdminLayouts.MenuButton bg={'danger'} onClick={this.onCheckedOrderRefundClick}>[주문]수동전표발행</AdminLayouts.MenuButton>)
                            }
                            {
                                this.state.selectedRows.length > 0 && (
                                    <AdminLayouts.MenuButton bg={'green'} onClick={this.onCheckedOrderConfirmClick}>{this.state.selectedRows.length}건 주문확인</AdminLayouts.MenuButton>
                                )
                            }
                            {
                                this.state.selectedRows.length > 0 && (
                                    <AdminLayouts.MenuButton bg={'green'} onClick={this.onCheckedReqCreditClick}>외상&취소 요청</AdminLayouts.MenuButton>
                                )
                            }
                            <AdminLayouts.MenuButton onClick={this.onExcelDownload}>
                                엑셀 다운로드
                            </AdminLayouts.MenuButton>
                            <AdminLayouts.MenuButton onClick={this.onTrackingNumberInfoExcelUpload}>
                                주문내역(송장) 엑셀 업로드
                            </AdminLayouts.MenuButton>
                        </Space>

                    </div>
                </div>
                <div
                    id="myGrid"
                    className={'ag-theme-balham'}
                    style={{
                        height: "calc(100vh - 180px)"
                    }}
                >
                    <AgGridReact
                        ref={this.gridRef}
                        {...this.state.gridOptions}
                        rowData={this.state.data}
                    >
                    </AgGridReact>
                </div>

                {/*주문정보 모달 */}
                <ProducerFullModalPopupWithNav show={this.state.isOpen} title={'주문정보'} onClose={this.onClose}>
                    <Order orderSeq={this.state.orderSeq}/>
                </ProducerFullModalPopupWithNav>

                {/*(상품) 전표 모달 */}
                <Modal size="lg" isOpen={this.state.isGoodsCsRefundModal}
                       toggle={this.isGoodsCsRefundModalToggle} >
                    <ModalHeader toggle={this.isGoodsCsRefundModalToggle}>
                    </ModalHeader>
                    <ModalBody>
                        <OrderGoodsCsRefund
                            onClose={this.onGoodsCsRefundPopupClose}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary"
                                onClick={this.isGoodsCsRefundModalToggle}>취소</Button>
                    </ModalFooter>
                </Modal>

                {/*(주문) 전표 모달 */}
                <Modal size="lg" isOpen={this.state.isCsRefundModal}
                       toggle={this.isCsRefundModalToggle} >
                    <ModalHeader toggle={this.isCsRefundModalToggle}>
                    </ModalHeader>
                    <ModalBody>
                        <OrderCsRefund
                            orderSeq={this.state.orderSeq}
                            onClose={this.onCsRefundPopupClose}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary"
                                onClick={this.isCsRefundModalToggle}>취소</Button>
                    </ModalFooter>
                </Modal>

                {/*송장 엑셀 업로드 모달 */}
                <Modal size="lg" isOpen={this.state.isExcelUploadModal}
                       toggle={this.excelUploadModalToggle} >
                    <ModalHeader toggle={this.excelUploadModalToggle}>
                        <span>주문내역(송장) 엑셀 업로드</span><br/>
                        <div className="d-flex">
                            <div className="p-2 mb-0">
                                <Button color={'info'} size={'sm'} onClick={this.onTrackingNumberInfoExcelDownload}>
                                    주문내역(송장번호 입력 대상 내역) 엑셀 다운로드
                                </Button>
                                <small>(파일 업로드시 필요)</small>
                            </div>
                            <div className="p-2 mb-0">
                                <Button color={'info'} size={'sm'} onClick={this.onTrackingCompanyInfoExcelDownload}>
                                    택배사 코드 정보 엑셀 다운로드
                                </Button>
                            </div>
                        </div>
                        <small>* 위 엑셀다운로드 양식 처럼 주문번호,택배사코드,송장번호를 입력하셔서 업로드 하시면 됩니다.</small><br/>
                        <small>* 위 엑셀다운로드 양식은 주문번호 기준으로 내림차순으로 정렬됩니다.</small><br/>
                        <small>* 엑셀데이터가 100건 이상일 경우 나눠서 업로드 해주세요!(데이터가 많을경우 오래 걸릴수 있습니다)</small>
                    </ModalHeader>
                    <ModalBody>
                        <div className="d-flex justify-content-center mb-3">
                            <div>
                                주문번호/택배사코드/송장번호 를 입력해 주셔야 합니다!<br/>
                                <div className="ml-3 mb-2">
                                    {
                                        state.transportCompany.map( (item,index) => <>
                                            - {item.transportCompanyName} : {item.transportCompanyCode} <br/>
                                        </>)
                                    }
                                </div>
                                엑셀에 송장번호 등록 시 '-'를 제외한 숫자만 입력해주세요('-'입력 시 조회 불가)
                            </div>
                        </div>
                        <div className="d-flex justify-content-center">
                            <div>
                                <FormGroup>
                                    <Input
                                        type="file"
                                        id="excelFile" name="excelFile"
                                        accept={'.xlsx'}
                                        innerRef={this.excelFile}
                                        onChange={this.onTrackingNumberExcelExportChk}
                                    />
                                </FormGroup>
                            </div>
                            <div>
                                <Button color={'info'}
                                        disabled={!state.isExcelUploadFileData}
                                        onClick={this.onTrackingNumberInfoExcelUploadSave}>
                                    주문내역(송장번호) 업로드
                                </Button>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary"
                                onClick={this.excelUploadModalToggle}>취소</Button>

                    </ModalFooter>
                </Modal>

                <Modal size="xl" isOpen={this.state.isReqCreditModal}
                       toggle={this.reqCreditModalToggle} >
                    <ModalHeader toggle={this.reqCreditModalToggle}>
                    </ModalHeader>
                    <ModalBody>
                        <ReqCreditModalContent data={this.state.selectedRows} />
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary"
                                onClick={this.reqCreditModalToggle}>닫기</Button>

                    </ModalFooter>
                </Modal>

            </Fragment>
        );
    }
}