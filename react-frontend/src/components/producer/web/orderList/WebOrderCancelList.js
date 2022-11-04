import React, { Component, Fragment } from 'react';
import {getCancelOrderByProducerNo, getProducer} from '~/lib/producerApi'
import { getLoginProducerUser } from '~/lib/loginApi'
import { getServerToday } from '~/lib/commonApi'
import "react-table/react-table.css"
import moment from 'moment-timezone'
import ComUtil from '~/util/ComUtil'
import { Button, FormGroup } from 'reactstrap'
import { ProducerFullModalPopupWithNav, ExcelDownload } from '~/components/common'
import Order from '~/components/producer/web/order'
import { getItems } from '~/lib/adminApi'
import Select from 'react-select'

//ag-grid
import { AgGridReact } from 'ag-grid-react';
import DatePicker from "react-datepicker";
import "react-datepicker/src/stylesheets/datepicker.scss";
import SearchDates from "~/components/common/search/SearchDates";
import {Div} from "~/styledComponents/shared";
import {getCardPgName} from "~/util/bzLogic";

export default class WebOrderCancelList extends Component {
    constructor(props) {
        super(props);
        this.gridRef = React.createRef();
        this.serverToday=null;
        this.state = {
            data: null,
            excelData: {
                columns: [],
                data: []
            },

            columnDefs: this.getColumnDefs(),
            defaultColDef: {
                width: 100,
                resizable: true,
                filter: true,
                sortable: true,
                floatingFilter: false,
                filterParams: {
                    newRowsAction: 'keep'
                }
            },
            components: {
                formatCurrencyRenderer: this.formatCurrencyRenderer,
                formatDateRenderer: this.formatDateRenderer,
                formatDatesRenderer: this.formatDatesRenderer
            },
            frameworkComponents: {
                payStatusRenderer: this.payStatusRenderer,
                orderPayMethodRenderer: this.orderPayMethodRenderer,
                orderAmtRenderer:this.orderAmtRenderer,
                orderSeqRenderer: this.orderSeqRenderer
            },
            rowSelection: 'single',
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
            orderListCnt:0,
            isOpen: false,
            orderSeq: null,

            filterItems: {
                items: [],
                payMethodItems:[],
                orderStatusItems:[],
            },

            searchFilter: {
                selectedGubun: 'day', //'week': 최초화면을 오늘(day)또는 1주일(week)로 설정.
                startDate: moment(moment().toDate()).add(-1,"days"),
                endDate: moment(moment().toDate()),
                year:moment().format('YYYY'),
                itemName: '',
                payMethod: 'all'
            },
        }
    }

    isLocalFoodFarmer = React.createRef();

    getRowHeight(params) {
        return 30;
    }

    //주문상태 명칭 가져오기
    static getPayStatusNm = (data) => {
        let payStatusNm = "";
        if(data.payStatus === "paid"){
            payStatusNm = '결제완료';
        } else if(data.payStatus === "cancelled" || data.payStatus === "revoked"){
            payStatusNm = '주문취소';
        }
        if(data.trackingNumber){
            payStatusNm = "배송중"
        }
        if(data.consumerOkDate){
            payStatusNm = "구매확정"
        }
        return payStatusNm;
    }

    //[이벤트] 그리드 로드 후 callback 이벤트
    onGridReady(params) {
        //API init
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        /*
        //리사이징 기능
        params.api.sizeColumnsToFit();
        window.addEventListener("resize", function() {
            setTimeout(function() {
                params.api.sizeColumnsToFit();
            });
        });
        params.api.sizeColumnsToFit();
        */
    }

    // Ag-Grid column Info
    getColumnDefs () {

        // 처리상태 field
        let payStatusColumn = {
            headerName: "처리상태", field: "payStatus",
            width: 100,
            cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
            //cellRenderer: "payStatusRenderer",
            suppressMenu: "false",
            filterParams: {
                clearButton: true //클리어버튼
            },
            valueGetter: function(params) {
                return WebOrderCancelList.getPayStatusNm(params.data)
            }
        };

        // 주문번호 field
        let orderSeqColumn = {
            headerName: "주문번호", field: "orderSeq",
            width: 100,
            cellStyle: ComUtil.getCellStyle,
            cellRenderer: "orderSeqRenderer",
            filterParams: {
                clearButton: true
            }
        };

        // 주문 취소일자 field
        let orderCancelDateColumn = {
            headerName: "취소일시", field: "orderCancelDate",
            width: 150,
            suppressSizeToFit: true,
            cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
            cellRenderer: "formatDatesRenderer",
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

        // 주문일자 field
        let orderDateColumn = {
            headerName: "주문일시", field: "orderDate",
            width: 150,
            suppressSizeToFit: true,
            cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
            cellRenderer: "formatDatesRenderer",
            /*filterParams: {
                clearButton: true //클리어버튼
            },*/
            valueGetter: function(params) {
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

        // 주문 결제방법 field
        let orderPayMethodColumn = {
            headerName: "결제수단", field: "payMethod",
            suppressSizeToFit: true,
            width: 120,
            cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
            cellRenderer: "orderPayMethodRenderer",
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


        // 주문금액 field
        let orderAmtColumn = {
            headerName: "결제금액", field: "adminOrderPrice",
            suppressSizeToFit: true,
            width: 140,
            cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
            cellRenderer: "orderAmtRenderer",
            filterParams: {
                clearButton: true //클리어버튼
            }
        };

        let consumerNameColumn = {
            headerName: "주문자", field: "consumerNm",
            suppressSizeToFit: true,
            width: 100,
            cellStyle:ComUtil.getCellStyle,
            filterParams: {
                clearButton: true //클리어버튼
            }
        };

        let goodsNameColumn = {
            headerName: "상품명", field: "goodsNm",
            width: 150,
            cellStyle:ComUtil.getCellStyle,
            filterParams: {
                clearButton: true //클리어버튼
            }
        };

        let orderCountColumn = {
            headerName: "주문수량", field: "orderCnt",
            width: 120,
            cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
            // cellRenderer: 'formatCurrencyRenderer',
            filterParams: {
                clearButton: true //클리어버튼
            },
            valueGetter: function(params) {
                // console.log(params.data.partialRefundCount);
                return (params.data.partialRefundCount > 0 ? `${params.data.orderCnt} (+부분환불 ${params.data.partialRefundCount}건)` : params.data.orderCnt);
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

        let expectShippingStartColumn = {
            headerName: "예상배송시작일", field: "expectShippingStart",
            width: 120,
            suppressSizeToFit: true,
            cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
            cellRenderer: "formatDateRenderer",
            valueGetter: function(params) {
                //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                return (params.data.expectShippingStart ? ComUtil.utcToString(params.data.expectShippingStart) : '')
            }
        };

        let expectShippingEndColumn = {
            headerName: "예상배송종료일", field: "expectShippingEnd",
            width: 120,
            suppressSizeToFit: true,
            cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
            cellRenderer: "formatDateRenderer",
            valueGetter: function(params) {
                //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                return (params.data.expectShippingEnd ? ComUtil.utcToString(params.data.expectShippingEnd) : '')
            }
        };

        let columnDefs = [
            orderDateColumn,
            orderCancelDateColumn,
            {headerName: "주문그룹번호", field: "orderSubGroupNo", width: 100},
            orderSeqColumn,
            consumerNameColumn,
            directGoodsColumn,
            {headerName: "로컬농부명", field: "localFarmerName", width: 100, cellStyle:ComUtil.getCellStyle({whiteSpace: 'normal'}), hide: !this.isLocalFoodFarmer.current},
            goodsNameColumn,
            {
                headerName: "환불여부", field: "refundFlag", width: 120,
                valueGetter: function(params) {
                    //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                    return (params.data.refundFlag ? '환불' : '')
                }
            },
            {headerName: "[생산자]주문취소사유", field: "dpCancelReason", width: 120},
            {headerName: "[소비자]주문취소사유", field: "cancelReason", width: 120},
            orderCountColumn,
            orderAmtColumn,
            orderPayMethodColumn,
            payStatusColumn,
            receiverNameColumn,
            expectShippingStartColumn,
            expectShippingEndColumn
        ];

        return columnDefs
    }

    //Ag-Grid Cell 숫자콤마적용 렌더러
    formatCurrencyRenderer = ({value, data:rowData}) => {
        return ComUtil.addCommas(value);
    }
    //Ag-Grid Cell 날짜변환 렌더러
    formatDateRenderer = ({value, data:rowData}) => {
        return (value ? ComUtil.utcToString(value,'YYYY-MM-DD') : '-')
    }
    formatDatesRenderer = ({value, data:rowData}) => {
        return (value ? ComUtil.utcToString(value,'YYYY-MM-DD HH:mm') : '-')
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

        // return (<span>{orderAmount}</span>);

        // let orderAmtTxt = rowData.payMethod === "card" ?  rowData.orderPrice + "원" : rowData.blctToken + "BLCT";
        // let orderAmtSubTxt = rowData.payMethod === "card" ?  rowData.blctToken + "BLCT" : rowData.orderPrice + "원";
        // return (<span>{orderAmtTxt}({orderAmtSubTxt})</span>);
    }

    orderSeqRenderer = ({value, data:rowData}) => {
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

        let txtColor = 'text-warning';
        if(rowData.consumerOkDate) {
            txtColor = 'text-secondary';
        } else if(rowData.trackingNumber){
            txtColor = 'text-info';
        }

        let val = WebOrderCancelList.getPayStatusNm(rowData);
        return (<span className={txtColor}>{val}</span>);
    }

    //Ag-Grid 주문상태 필터링용 온체인지 이벤트 (엑셀데이터 동기화)
    onGridFilterChanged () {
        this.setExcelData();
    }

    async componentDidMount(){
        //로그인 체크
        const loginUser = await getLoginProducerUser();
        if(!loginUser){
            this.props.history.push('/producer/webLogin')
        }

        const {data: producer} = await getProducer();
        this.isLocalFoodFarmer.current = producer.localfoodFlag;

        this.setFilter();
        this.search()
    }

    // 주문조회 (search)
    search = async () => {

        const {api} = this.gridRef.current;

        if(api) {
            //ag-grid 레이지로딩중 보이기
            api.showLoadingOverlay();
        }

        let { data:serverToday } = await getServerToday();
        this.serverToday = serverToday;

        const filter = Object.assign({},this.state.searchFilter);
        const startDate = filter.startDate ? moment(filter.startDate).format('YYYYMMDD'):null;
        const endDate = filter.endDate ? moment(filter.endDate).format('YYYYMMDD'):null;

        const { status, data } = await getCancelOrderByProducerNo(startDate, endDate, filter.itemName, filter.payMethod);
        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return
        }
        //const excelData = this.getExcelData();

        console.log(data);

        let vRowData = null;
        if(data && data.length > 0){
            vRowData = data;
        }

        this.setState({
            data: vRowData,
            orderListCnt: vRowData ? data.length:0,
            columnDefs: this.getColumnDefs()
        })

        //ag-grid api
        if(api){
            //ag-grid 레이지로딩중 감추기
            api.hideOverlay();

            //ag-grid 높이 리셋 및 렌더링
            api.resetRowHeights();

            if(!vRowData){
                api.showNoRowsOverlay();
            }

            this.setExcelData();
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


    toggle = () => {
        this.setState({
            isOpen: !this.state.isOpen
        })
    }

    setExcelData() {
        const {api} = this.gridRef.current;
        if(!api) return;

        let excelData = this.getExcelData();
        this.setState({
            excelData: excelData,
            orderListCnt: excelData[0].data.length
        })
    }

    getExcelData = () => {
        const {api} = this.gridRef.current;
        if(!api){ return [] }

        /*
        const columns = this.state.columnDefs.map((element)=> {
            return element.headerName;
        });
        */
        const columns = [
            '번호',
            '주문상태', '결제구분',
            '주문번호', '상품명', '주문수량', '[받는]사람', '[받는]연락처', '[받는]주소', '[받는]우편번호','배송메세지', '택배사', '송장번호',
            '주문시간', '취소시간', '체결가격', '배송비', '수수료',
            '포장단위', '포장 양', '판매개수', '품목명',
            '주문자명', '주문자이메일', '주문자연락처',
            '예상배송시작일', '예상배송종료일'
        ]

        /*
        if(typeof this.reactTable.getResolvedState !== 'function'){ return [] }
        const sortedData = this.reactTable.getResolvedState().sortedData;    //필터링 된 데이터
        */

        //필터링된 데이터 push
        let sortedData = [];
        api.forEachNodeAfterFilterAndSort(function(node, index) {
            if(node.data.orderSeq) {
                sortedData.push(node.data);
            }
        });

        //필터링 된 데이터에서 sortedData._original 로 접근하여 그리드에 바인딩 원본 값을 가져옴
        const data = sortedData.map((item ,index)=> {
            let payStatusNm = WebOrderCancelList.getPayStatusNm(item);
            let payMethodNm = item.payMethod === "card" ? "카드결제" : item.payMethod === "cardBlct" ? "카드+BLY결제":"BLY결제";
            return [
                index+1,
                payStatusNm, payMethodNm,
                item.orderSeq, item.goodsNm, item.orderCnt, item.receiverName, item.receiverPhone, `${item.receiverAddr} ${item.receiverAddrDetail || ''}`, item.zipNo,item.deliveryMsg, item.transportCompanyName, item.trackingNumber,
                ComUtil.utcToString(item.orderDate,'YYYY-MM-DD HH:mm'), ComUtil.utcToString(item.orderCancelDate,'YYYY-MM-DD HH:mm'),
                item.adminOrderPrice, item.deliveryFee, item.bloceryOnlyFee+item.consumerReward+item.producerReward,
                item.packUnit, item.packAmount, item.packCnt, item.itemName,
                item.consumerNm, item.consumerEmail, item.consumerPhone,
                ComUtil.utcToString(item.expectShippingStart), ComUtil.utcToString(item.expectShippingEnd)
            ]
        })

        return [{
            columns: columns,
            data: data
        }]
    }

    //저장 하였을 경우는 창을 닫지 않고, X 버튼을 눌렀을때만 닫도록 한다
    onClose = (isSaved) => {
        isSaved ? this.search() : this.toggle()
    }

    //검색 버튼
    onFilterSearchClick = async () => {
        // filter값 적용해서 검색하기
        await this.search();
    }

    // 초기화 버튼
    onInitClick= async() => {
        const filter = Object.assign({}, this.state.searchFilter)

        filter.year = moment().format('YYYY');
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

    onSearchDateChange = async (date) => {
        //console.log("",date.getFullYear())
        const filter = Object.assign({},this.state.searchFilter)
        filter.year = date.getFullYear();
        await this.setState({searchFilter:filter});
        await this.search();
    }

    copy = ({value}) => {
        ComUtil.copyTextToClipboard(value, '', '');
    }

    onDatesChange = async (data) => {
        const filter = Object.assign({},this.state.searchFilter)
        filter.startDate = data.startDate;
        filter.endDate = data.endDate;
        filter.selectedGubun = data.gubun;
        await this.setState({searchFilter:filter});
        await this.search();
    }

    render() {
        const state = this.state
        return (
            <Fragment>
                <FormGroup>
                    <div className='border p-3'>
                        <div className='pb-3 d-flex'>
                            <div className='d-flex'>
                                <Div ml={10} >
                                    <SearchDates
                                        isHiddenAll={true}
                                        isCurrenYeartHidden={true}
                                        gubun={state.searchFilter.selectedGubun}
                                        startDate={state.searchFilter.startDate}
                                        endDate={state.searchFilter.endDate}
                                        onChange={this.onDatesChange}
                                    />
                                </Div>
                            </div>
                        </div>
                        <hr className='p-0 m-0' />
                        <div className='pt-3 d-flex'>
                            <div className='ml-3 d-flex'>
                                <div className='d-flex justify-content-center align-items-center textBoldLarge' fontSize={'small'}>상품분류</div>
                                <div className='pl-3' style={{width:200}}>
                                    <Select
                                        options={state.filterItems.items}
                                        value={state.filterItems.items.find(item => item.value === state.searchFilter.itemName)}
                                        onChange={this.onItemChange}
                                    />
                                </div>
                            </div>
                            <div className='ml-3 d-flex'>
                                <div className='d-flex justify-content-center align-items-center textBoldLarge' fontSize={'small'}>결제수단 &nbsp; &nbsp; | </div>
                                <div className='pl-3 pt-2 '>
                                    {
                                        state.filterItems.payMethodItems.map(item => <>
                                        <input type="radio" id={'payMethod'+item.value} name="payMethod" value={item.value} checked={item.value === state.searchFilter.payMethod} onChange={this.onPayMethodChange} />
                                        <label for={'payMethod'+item.value} className='mb-0 pl-1 mr-3' fontSize={'small'}>{item.label}</label>
                                        </>)
                                    }
                                </div>
                            </div>
                            <div className='ml-auto d-flex'>
                                <div className='d-flex justify-content-center align-items-center'>
                                    <Button color={'info'} size={'sm'} onClick={this.onFilterSearchClick}>
                                        <span fontSize={'small'}>검색</span>
                                    </Button>
                                    <Button color={'secondary'} size={'sm'} className='ml-2' onClick={this.onInitClick}>
                                        <span fontSize={'small'}>초기화 </span>
                                    </Button>
                                </div>
                            </div>
                        </div>

                    </div>
                </FormGroup>


                <div className="d-flex pt-1 pb-1">
                    <div className="flex-grow-1">
                        총 {this.state.orderListCnt} 개
                    </div>
                    <ExcelDownload data={this.state.excelData}
                                   fileName="orderCancelList"
                        />
                </div>
                <div
                    id="myGrid"
                    style={{
                        height: "calc(100vh - 180px)"
                    }}
                    className='ag-theme-balham'
                >
                    <AgGridReact
                        ref={this.gridRef}
                        columnDefs={this.state.columnDefs}  //컬럼 세팅
                        defaultColDef={this.state.defaultColDef}
                        rowSelection={this.state.rowSelection}  //멀티체크 가능 여부
                        getRowHeight={this.getRowHeight}
                        overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                        overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                        onGridReady={this.onGridReady.bind(this)}   //그리드 init(최초한번실행)
                        rowData={this.state.data}
                        components={this.state.components}  //custom renderer 지정, 물론 정해져있는 api도 있음
                        frameworkComponents={this.state.frameworkComponents}
                        suppressMovableColumns={true} //헤더고정시키
                        onFilterChanged={this.onGridFilterChanged.bind(this)} //필터온체인지 이벤트
                        onCellDoubleClicked={this.copy}
                    >
                    </AgGridReact>
                </div>
                <ProducerFullModalPopupWithNav show={this.state.isOpen} title={'주문정보'} onClose={this.onClose}>
                    <Order orderSeq={this.state.orderSeq}/>
                </ProducerFullModalPopupWithNav>
            </Fragment>
        )
    }

}