import React, { Component, Fragment } from 'react';
import { Container, Row, Col, Button, Badge, FormGroup } from 'reactstrap'
import { getLoginProducerUser } from '~/lib/loginApi'
import {getGoodsByGoodsNo, getProducerFilterGoods, updateGoodsSalesStop, updateSalePaused} from '~/lib/goodsApi'
import { getServerToday } from '~/lib/commonApi'
import { getItems } from '~/lib/adminApi'
import {getProducer, getProducerGoodsRegStopChk} from "~/lib/producerApi";
import Select from 'react-select'
import {ProducerFullModalPopupWithNav, Cell, ModalPopup, ModalConfirm} from '~/components/common'
import { WebDirectGoodsReg, WebDealGoodsReg } from '~/components/producer'
import ComUtil from '~/util/ComUtil'
import { ExcelDownload } from '~/components/common'
import classNames from 'classnames';

import {FaClock, FaBolt, FaLayerGroup} from "react-icons/fa";

//ag-grid
import { AgGridReact } from 'ag-grid-react';
import {Div, Flex, Hr, FilterGroup} from "~/styledComponents/shared";
import InputFilter from "~/components/common/gridFilter/InputFilter";
import CheckboxFilter from "~/components/common/gridFilter/CheckboxFilter";
import FilterContainer from "~/components/common/gridFilter/FilterContainer";

export default class WebGoodsList extends Component {
    constructor(props) {
        super(props);
        this.serverToday=null;
        //this.isPcWeb=false;
        this.state = {
            isGoodsSelectionOpen: false,    //상품종류 선택 팝업
            goodsRegPopupKind: '',                  //상품종류 reservedGoods, directGoods

            //isFarmDiaryOpen: false,
            goodsNo: null,
            data: [],
            excelData: {
                columns: [],
                data: []
            },
            selectedRows: [],
            // 검색용 필터
            searchFilter: {
                itemNo: 0,
                itemName: '',
                directGoods: null,      // 상품구분
                confirm: null,
                saleStopped: null,
                saleEnd: null,
                remainedCnt: null
            },
            items: [],

            gridOptions: {
                columnDefs: this.getColumnDefs(),
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
                    saleCntRenderer: this.saleCntRenderer
                },
                frameworkComponents: {
                    directGoodsRenderer: this.directGoodsRenderer,
                    //goodsTagRenderer: this.goodsTagRenderer,
                    //goodsSttRenderer: this.goodsSttRenderer,
                    //goodsSttActRenderer: this.goodsSttActRenderer,
                    goodsStateRenderer: this.goodsStateRenderer,
                    goodsNameRenderer: this.goodsNameRenderer,
                    optionsNmRenderer: this.optionsNmRenderer,
                    optionsPriceRenderer: this.optionsPriceRenderer
                },
                rowHeight: 50,
                rowSelection: 'multiple',
                suppressRowClickSelection: false,   //false : 셀 클릭시 체크박스도 체크 true: 셀클릭시 체크박스 체크 안함
                overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
                overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
                onGridReady: this.onGridReady.bind(this),   //그리드 init(최초한번실행)
                suppressMovableColumns: true, //헤더고정시키
                onFilterChanged: this.onGridFilterChanged.bind(this),
                onSelectionChanged: this.onSelectionChanged.bind(this),
            },

            //isPcWeb: this.isPcWeb
        }

        //상품보기,상품수정,신규상품 타이틀 명칭 용
        // this.goodsPopTitle = "신규상품";
    }

    isLocalFoodFarmer = React.createRef()

    onSelectionChanged = (event) => {
        this.updateSelectedRows()
    }
    updateSelectedRows = () => {
        this.setState({
            selectedRows: this.gridApi.getSelectedRows()
        })
    }

    //[이벤트] 그리드 로드 후 callback 이벤트
    onGridReady(params) {
        //API init
        this.gridApi = params.api;
        this.columnApi = params.columnApi;

        //로드시 기본 정렬
        const defaultSortModel = [
            {
                colId: "timestamp",
                sort: "desc"
            },
        ];
        params.api.setSortModel(defaultSortModel);
    }

    // Ag-Grid column Info
    getColumnDefs () {
        let columnDefs = [
            // {headerName: "상태/수정", field: "", width: 80, suppressSizeToFit: true, cellStyle:this.getCellStyle({cellAlign: 'center'}), suppressMenu:"false",suppressSorting:"false", cellRenderer: 'goodsSttActRenderer'},
            {
                headerName: "구분", field: "directGoods", width: 70, cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}), suppressSizeToFit: true,
                valueGetter: function ({data}) {
                    return data.goodsKind === 0 ? '예약' : (data.goodsKind === 1 ? '즉시' : '공동구매')
                },
                cellRenderer: 'directGoodsRenderer'
            },
            {
                headerName: "상품No", field: "goodsNo", width: 110, cellStyle:ComUtil.getCellStyle({whiteSpace: 'normal'}), suppressSizeToFit: true,
                headerCheckboxSelection: true,
                headerCheckboxSelectionFilteredOnly: true,  //전체 체크시 필터된 것만 체크
                checkboxSelection: true,
            },
            {headerName: "로컬농부명", field: "localFarmerName", width: 100, cellStyle:ComUtil.getCellStyle({whiteSpace: 'normal'}), hide: !this.isLocalFoodFarmer.current, suppressSizeToFit: true},
            {
                headerName: "묶음배송", field: "producerWrapDelivered", width: 90, cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                valueGetter: function(params) {
                    return params.data.producerWrapDelivered ? "O" : "-";
                }, suppressSizeToFit: true
            },
            // {headerName: "묶음배송", field: "producerWrapDelivered", width: 50, cellStyle:ComUtil.getCellStyle({whiteSpace: 'normal'}), hide: !this.isLocalFoodFarmer.current,
            //     valueGetter: function(params) {
            //         return params.data.producerWrapDelivered?"O":"";
            //     }, suppressSizeToFit: true
            // },
            {headerName: "개체인식", field: "objectUniqueFlag", width: 50, cellStyle:ComUtil.getCellStyle({whiteSpace: 'normal'}), hide: !this.isLocalFoodFarmer.current,
                valueGetter: function(params) {
                    return params.data.objectUniqueFlag?"O":"";
                }, suppressSizeToFit: true
            },
            {headerName: "재고연동", field: "localGoodsNo", width: 50, cellStyle:ComUtil.getCellStyle({whiteSpace: 'normal'}), hide: !this.isLocalFoodFarmer.current,
                valueGetter: function(params) {
                    return params.data.localGoodsNo?"O":"";
                }, suppressSizeToFit: true
            },
            {
                headerName: "상품명", field: "goodsNm", width: 220,
                cellStyle:ComUtil.getCellStyle({whiteSpace: 'normal'}),
                cellRenderer: 'goodsNameRenderer', suppressSizeToFit: true
            },
            {
                headerName: "인증마크", field: "authMarkInfo", width: 90, cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                valueGetter: function(params) {
                    return params.data.authMarkInfo && params.data.authMarkInfo.length;
                }, suppressSizeToFit: true
            },
            {
                headerName: "옵션수", field: "optionsCnt", width: 80, cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                valueGetter: function(params) {
                    return params.data.options.length;
                }, suppressSizeToFit: true
            },

            {
                headerName: "옵션명", field: "optionsNames", width: 300, cellStyle:ComUtil.getCellStyle({whiteSpace: 'normal'}),
                cellRenderer: 'optionsNmRenderer',
                valueGetter: function(params) {
                    let optionNames = '';
                    if(params.data.options.length > 1) {
                        params.data.options.map(item => {
                            optionNames = optionNames + item.optionName + ' // ';
                        })
                        optionNames = optionNames.substring(0,optionNames.length-4)
                    }
                    return optionNames;
                }, suppressSizeToFit: true},
            {headerName: "소비자가", field: "consumerPrice", width: 90, cellStyle:ComUtil.getCellStyle({cellAlign: 'right'}), cellRenderer: 'formatCurrencyRenderer', suppressSizeToFit: true},
            {
                headerName: "판매가", field: "defaultCurrentPrice", width: 150, cellStyle:ComUtil.getCellStyle({cellAlign: 'right',color:'red', whiteSpace: 'normal'}),
                cellRenderer: 'optionsPriceRenderer',
                valueGetter: function(params) {
                    const objectUniqueFlag = params.data.objectUniqueFlag||false;
                    let optionPrice = params.data.defaultCurrentPrice;
                    if(objectUniqueFlag){
                        let firstOptionPrice = '';
                        let lastOptionPrice = '';
                        if (params.data.options) {
                            if (params.data.options.length == 1) {
                                firstOptionPrice = params.data.options[0].optionPrice;
                                optionPrice = firstOptionPrice;
                            } else if (params.data.options.length > 1) {
                                firstOptionPrice = params.data.options[0].optionPrice;
                                optionPrice = firstOptionPrice;
                                if (params.data.options.length >= 2) {
                                    lastOptionPrice = params.data.options[params.data.options.length - 1].optionPrice;
                                    if (firstOptionPrice != lastOptionPrice) {
                                        optionPrice = firstOptionPrice + ' ~ ' + lastOptionPrice
                                    }
                                }
                            }
                        }
                    }else {
                        if (params.data.options) {
                            if(params.data.options.length == 1) {
                                optionPrice =  params.data.options[0].optionPrice;
                            } else if (params.data.options.length > 1) {
                                optionPrice = '';
                                params.data.options.map(item => {
                                    optionPrice = optionPrice + item.optionPrice + ' // ';
                                })
                                optionPrice = optionPrice.substring(0, optionPrice.length - 4)
                            }
                        }
                    }
                    return optionPrice;
                }, suppressSizeToFit: true},

            {headerName: "부가세", field: "vatFlag", width:80,
                valueGetter: function(params) {
                    return params.data.vatFlag ? "과세" : "면세";
                },suppressSizeToFit: true},
            {headerName: "대분류", field: "itemName", width: 80, suppressSizeToFit: true},
            {headerName: "중분류", field: "itemKindName", width: 80, suppressSizeToFit: true},
            {headerName: "상품상태", field: "confirm", width: 90, cellRenderer: 'goodsStateRenderer', suppressSizeToFit: true},
            {headerName: "수량", field: "packCnt", width: 70, cellStyle:ComUtil.getCellStyle({cellAlign: 'right'}), suppressSizeToFit: true, cellRenderer: 'formatCurrencyRenderer'},
            {headerName: "판매", field: "saleCnt", width: 70, cellStyle:ComUtil.getCellStyle({cellAlign: 'right'}), suppressSizeToFit: true, cellRenderer: 'saleCntRenderer'},
            {headerName: "재고", field: "remainedCnt", width: 70, cellStyle:ComUtil.getCellStyle({cellAlign: 'right'}), suppressSizeToFit: true, cellRenderer: 'formatCurrencyRenderer'},
            {
                sort:'desc', headerName: "등록일시", field: "timestamp", width: 140, cellStyle:ComUtil.getCellStyle({whiteSpace: 'normal'}),
                valueGetter: function(params){
                    const date = params.data.timestamp ? ComUtil.utcToString(params.data.timestamp, 'YYYY.MM.DD HH:mm') : null;
                    return date;
                }, suppressSizeToFit: true
            },
            {
                sort:'desc', headerName: "수정일시", field: "modDate", width: 140, cellStyle:ComUtil.getCellStyle({whiteSpace: 'normal'}),
                valueGetter: function(params){
                    if(params.data.modDate)
                        return ComUtil.utcToString(params.data.modDate, 'YYYY.MM.DD HH:mm')
                    return ''
                }, suppressSizeToFit: true
            },
        ];

        return columnDefs
    }

    //Ag-Grid Cell 상품명 렌더러
    goodsNameRenderer = ({value, data:rowData}) => {

        // 예약상품 수정 기능 막음 (더이상 예약상품 사용안함)
        if(rowData.goodsKind === 0){
            return (<span>{rowData.goodsNm}</span>);
        }

        return (<span a href="#" onClick={this.onGoodsClick.bind(this, rowData)}><u>{rowData.goodsNm}</u></span>);
    }

    //Ag-Grid Cell 예약/즉시판매상품 여부 렌더러
    directGoodsRenderer = ({value, data:rowData}) => {
        return value === '즉시' ? <FaBolt className={'text-warning'}/> : (value === '공동구매'?<FaLayerGroup className={'text-danger'} /> : <FaClock className={'text-info'} />)
    }
    //Ag-Grid Cell 숫자콤마적용 렌더러
    formatCurrencyRenderer = ({value, data:rowData}) => {
        //console.log("rowData",rowData);
        return ComUtil.addCommas(value);
    }
    //Ag-Grid Cell 날짜변환 렌더러
    formatDateRenderer = ({value, data:rowData}) => {
        return (value ? ComUtil.utcToString(value, 'YY.MM.DD') : '-')
    }
    //Ag-Grid Cell 판매수량 렌더러 (=수량-재고)
    saleCntRenderer = ({value, data:rowData}) => {
        //console.log("rowData",rowData);
        return ComUtil.addCommas(rowData.packCnt - rowData.remainedCnt);
    }
    
    //Ag-Grid cell 상품상태(판매중, 판매기한만료, 판매중단) 렌더러
    goodsStateRenderer = ({data:rowData}) => {
        const status = this.getStatus(rowData)
        return <div>{status}</div>
    }

    getStatus(rowData) {
        let toDate = this.serverToday;
        let saleDateEnd = rowData.saleEnd ? ComUtil.utcToString(rowData.saleEnd) : null;

        let status;

        if (!rowData.confirm) {
            status = '임시저장'
        } else {
            status = '판매중'
            if (rowData.salePaused) {
                status = '일시중지'
            }
            if (rowData.saleStopped) {
                status = '영구판매종료'
            }
            if (rowData.remainedCnt <= 0) {
                status += '|품절'
            }

            if (saleDateEnd) {
                let newResult = saleDateEnd.replace(/\./gi, "-")
                let diffSaleResult = ComUtil.compareDate(newResult, toDate);
                if (diffSaleResult === -1) {
                    status += '|판매기한만료'
                }
            }
        }
        return status
    }

    optionsNmRenderer = ({value, data:rowData}) => {
        const options = rowData.options;
        let optionNames = '';
        if(options && options.length > 1) {
            let firstOptionName = '';
            let lastOptionName = '';
            firstOptionName = options[0].optionName;
            optionNames = firstOptionName;
            if(options.length >= 2) {
                lastOptionName = options[options.length - 1].optionName;
                if(firstOptionName != lastOptionName) {
                    optionNames = firstOptionName + ' ~ ' + lastOptionName
                }
            }
        }
        return (<span>{optionNames}</span>);
    }

    optionsPriceRenderer = ({value, data:rowData}) => {
        const options = rowData.options;
        let optionPrice = rowData.defaultCurrentPrice;
        if(options){
            if(options.length == 1) {
                optionPrice = options[0].optionPrice;
            } else if(options.length > 1) {
                let firstOptionPrice = '';
                let lastOptionPrice = '';
                firstOptionPrice = options[0].optionPrice;
                optionPrice = firstOptionPrice;
                if(options.length >= 2) {
                    lastOptionPrice = options[options.length - 1].optionPrice;
                    if (firstOptionPrice != lastOptionPrice) {
                        optionPrice = firstOptionPrice + ' ~ ' + lastOptionPrice
                    }
                }
            }
        }

        return (<span>{optionPrice}</span>);
    }

    defaultCurrentPriceRenderer = ({data:rowData}) => {
        //rowData.defaultCurrentPrice
        //const status = this.getStatus(rowData)
        // return <div>{status}</div>
    }

    onGridFilterChanged() {
        // this.setExcelData();
    }

    componentDidMount = async() => {
        await this.checkLogin()

        const {data: producer} = await getProducer();
        this.isLocalFoodFarmer.current = producer.localfoodFlag;
        const gridOptions = Object.assign({}, this.state.gridOptions)
        gridOptions.columnDefs = this.getColumnDefs()
        this.setState({
            gridOptions
        }, () => {
            this.search()
        })
    }

    checkLogin = async () => {
        //로그인 체크
        const loginInfo = await getLoginProducerUser();
        //console.log('userType',this.props.history)
        if(!loginInfo) {
            this.props.history.push('/producer/webLogin')
        }
    }

    search = async () => {

        if(this.gridApi) {
            //ag-grid 레이지로딩중 보이기
            this.gridApi.showLoadingOverlay();
        }

        let { data:serverToday } = await getServerToday();
        this.serverToday = serverToday;

        const filter = this.state.searchFilter;
        const { status, data } = await getProducerFilterGoods(filter.itemNo, filter.directGoods, filter.confirm, filter.saleStopped, filter.saleEnd, filter.remainedCnt, filter.salePaused);

        console.log({data});

        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return;
        }

        this.getItemsName();

        //PC용으로 화면을 크게 그릴때 사용
        //let isPcWeb = ComUtil.isPcWeb();//window.innerWidth > 760// ComUtil.isPcWeb();

        //let rowHeight = (isPcWeb?50:220);
        //this.isPcWeb = isPcWeb;
        //this.rowHeight = rowHeight;

        this.setState({
            data: data,
            //isPcWeb: isPcWeb,
            //rowHeight: rowHeight,
            // columnDefs: this.getColumnDefs()
        });

        //ag-grid api
        if(this.gridApi){
            //ag-grid 레이지로딩중 감추기
            this.gridApi.hideOverlay();

            //ag-grid 높이 리셋 및 렌더링
            this.gridApi.sizeColumnsToFit();

            // this.setExcelData(data);

            //ag-grid 높이 리셋 및 렌더링
            // Following line dymanic set height to row on content
            this.gridApi.resetRowHeights();
        }
    }

    goodsRegStopChk = async () => {
        const loginInfo = await getLoginProducerUser();
        const {data:isGoodsRegStopChk} = await getProducerGoodsRegStopChk(loginInfo.uniqueNo)
        if(isGoodsRegStopChk === true){
            alert("사용 중이신 계정이 서비스 이용 제한 상태입니다.\n" +
                "계속 이용하고자 하실 경우 샵블리 관리자에 문의하시기 바랍니다.\n" +
                "031-8090-3108")
            return false;
        }
        return true
    }

    //신규상품(상품종류 선택 팝업)
    onNewGoodsClick = async () => {

        if(!await this.goodsRegStopChk()) return

        this.setState({
            isGoodsSelectionOpen: true,
            goodsNo: null
        })
        //Webview.openPopup(`/producer/goodsReg`)
    }

    //상품등록팝업 페이지
    onGoodsPopupClick = async (gb) => {

        if(!await this.goodsRegStopChk()) return

        switch (gb){
            case 'reservedGoods' :
                this.setState({
                    isGoodsSelectionOpen: false,
                    isDirectGoodsOpen: false,
                });
                break
            case 'directGoods' :
                this.setState({
                    isGoodsSelectionOpen: false,
                    isDirectGoodsOpen: true,
                });
                break
            case 'dealGoods' :
                this.setState({
                    isGoodsSelectionOpen: false,
                    isDirectGoodsOpen: false,
                    isDealGoodsOpen: true
                })
        }
    }
    //상품수정
    onGoodsClick = (data) => {

        // let title = data.confirm ? '상품보기' : '상품수정';
        // this.goodsPopTitle = title;
        this.setState({
            isDirectGoodsOpen: data.directGoods === true,
            isDealGoodsOpen: data.dealGoods === true,
            goodsNo: data.goodsNo,
            directGoods: data.directGoods
        })
        // Webview.openPopup(`/producer/goodsReg?goodsNo=${data.goodsNo}`)
    }
    onFarmDiaryClick = (data) => {
        console.log(data)
        this.setState({
            //isFarmDiaryOpen: true,
            goodsNo: data.goodsNo
        })
        //Webview.openPopup(`/producer/diaryReg?goodsNo=${data.goodsNo}`)
    }
    //상품수정 후 refresh
    callbackGoods = (result) => {
        const {url, param} = JSON.parse(result.data);
    }
    //주문
    onOrderClick = () => {

    }
    //주문 확인 후 refresh
    callbackOrder = () => {

    }

    //상품종류선택 팝업 닫힐때
    onGoodsSelectionPopupClose = () => {
        this.setState({
            isGoodsSelectionOpen: false
        })
    }

    //상품 팝업 닫기
    onGoodsRegPopupClose = (data) => {
        this.search();
        this.setState({
            // isGoodsSelectionOpen: false,
            isDirectGoodsOpen: null,
            isDealGoodsOpen: null,
        });
    }

    // 상품 품목명 가져오기
    getItemsName = async () => {
        const {status, data } = await getItems(true)
        const itemList = data.map(item => ({
            value: item.itemNo,
            label: item.itemName
        }))

        const result = Object.assign([], itemList)

        result.unshift({value:0,label:"전체"})

        this.setState({
            items: result
        })
    }

    // 상품분류 filter
    onItemChange = (data) => {
        const filter = Object.assign({}, this.state.searchFilter)

        filter.itemNo = data.value
        filter.itemName = data.label

        this.setState({
            searchFilter: filter
        })

    }

    // 상품구분 filter
    // onGubunChange = (e) => {
    //     const filter = Object.assign({}, this.state.searchFilter)
    //     if (e.target.value === '2') {         // 전체
    //         filter.directGoods = null
    //     } else if (e.target.value === '1') {  // 즉시
    //         filter.directGoods = true
    //     } else {        // 예약
    //         filter.directGoods = false
    //     }
    //
    //     this.setState({
    //         searchFilter: filter
    //     })
    // }

    // 상품상태 filter
    onStateChange = (e) => {
        const filter = Object.assign({}, this.state.searchFilter)
        if (e.target.value === '0') {           // 전체
            filter.confirm = null
            filter.saleStopped = null
            filter.saleEnd = null
            filter.remainedCnt = null
            filter.salePaused = null
        } else if (e.target.value === '1') {    // 판매중
            filter.confirm = true
            filter.saleStopped = false
            filter.saleEnd = null
            filter.remainedCnt = null
            filter.salePaused = null
        } else if (e.target.value === '2') {    // 품절
            filter.confirm = null
            filter.saleStopped = null
            filter.saleEnd = null
            filter.remainedCnt = true
            filter.salePaused = null
        } else if (e.target.value === '3') {    // 영구판매종료
            filter.confirm = null
            filter.saleStopped = true
            filter.saleEnd = null
            filter.remainedCnt = null
            filter.salePaused = null
        } else if (e.target.value === '4') {    // 판매기한만료
            filter.confirm = null
            filter.saleStopped = null
            filter.saleEnd = true
            filter.remainedCnt = null
            filter.salePaused = null
        } else if (e.target.value === '5') {    // 임시저장
            filter.confirm = false
            filter.saleStopped = null
            filter.saleEnd = null
            filter.remainedCnt = null
            filter.salePaused = null
        } else {                                // 일시중지
            filter.confirm = null
            filter.saleStopped = null
            filter.saleEnd = false
            filter.remainedCnt = null
            filter.salePaused = true
        }

        this.setState({
            searchFilter: filter
        })
    }

    // 검색 버튼 클릭
    onSearchClick = async () => {
        console.log(this.state.searchFilter)
        await this.search();
    }

    //일시중지, 영구판매종료, 판매재개 일괄처리
    onCheckedActionClick = async (action) => {

        const selectedRows = this.gridApi.getSelectedRows()

        const promises = selectedRows.map(({goodsNo}) => getGoodsByGoodsNo(goodsNo))

        const result = await Promise.all(promises)

        //필터 처리
        const goodsList =
            this.getListFromPromised(result)
                .filter(goods =>
                    goods.confirm === true &&       //노출된 상품
                    goods.saleStopped !== true      //현재 판매중인 상품만 필더
                )

        //TODO data 를 푸시 해서 아래에서 판별 해야함

        //판매중단
        if (action === 'stop') {

            const len = goodsList.length
            if (len <= 0) {
                alert('영구판매종료 가능한 상품이 없습니다.')
                return
            }

            if (!window.confirm(`[${len}개 상품 가능] 영구판매종료 하시겠습니까?`)) {
                return
            }

            //TODO update
            //노출된 상품, 판매중인 상품은 모두 판매중지
            await this.doSaleStop(goodsList)
            alert(`${len}개 상품이 영구판매종료 되었습니다.`);
        }
        //일시중지
        else if (action === 'pause') {
            const list = goodsList.filter(goods =>
                goods.directGoods === true &&       //즉시상품만
                goods.salePaused === false          //일시중지가 아닌것만
            )

            const len = list.length
            if (len <= 0) {
                alert('일시중지 가능한 상품이 없습니다.')
                return
            }

            if (!window.confirm(`[${list.length}개 상품 가능] 일시중지 하시겠습니까?`)) {
                return
            }

            this.doSalePauseOrContinue(list, true)
            alert(`${list.length}개 상품이 일시중지 되었습니다.`);
        }
        //판매재개
        else if (action === 'continue') {

            if(!await this.goodsRegStopChk()) return

            const list = goodsList.filter(goods =>
                goods.directGoods === true &&       //즉시상품만
                goods.salePaused === true          //일시중지인 것만
            )

            const len = list.length
            if (len <= 0) {
                alert('판매재개 가능한 상품이 없습니다.')
                return
            }


            if (!window.confirm(`[${list.length}개 상품 가능] 판매재개 하시겠습니까?`)) {
                return
            }

            this.doSalePauseOrContinue(list, false)
            alert(`${list.length}개 상품이 판매재개 되었습니다.`);
        }

        this.search()

    }

    //판매중단
    doSaleStop = async (goodsList) => {
        const promises = goodsList.map(goods => updateGoodsSalesStop(goods.goodsNo))
        await Promise.all(promises)
    }

    doSalePauseOrContinue = async (goodsList, salePaused) => {
        const promises = goodsList.map(goods => updateSalePaused(goods.goodsNo, salePaused))
        await Promise.all(promises)
    }

    getListFromPromised = (result) => {
        return result.map(({data}) => data)
    }

    copy = ({value}) => {
        ComUtil.copyTextToClipboard(value, '', '');
    }

    render() {
        const state = this.state
        return(
            <Fragment>
                <FormGroup>
                    <div className='border p-3'>
                        <div className='pb-3 d-flex'>
                            <div className='d-flex'>
                                <div className='d-flex justify-content-center align-items-center textBoldLarge f3'>상품분류</div>
                                <div className='pl-3' style={{width:200}}>
                                    <Select
                                        defaultValue={{ label: "전체", value: 0 }}
                                        options={state.items}
                                        value={state.items.find(item => item.value === state.items.value)}
                                        onChange={this.onItemChange}
                                    />
                                </div>
                            </div>
                            {/*<div className='d-flex justify-content-center align-items-center'>*/}
                            {/*    <div className='pl-5 textBoldLarge f3'>상품구분</div>*/}
                            {/*    <div className='pl-3 pt-2'>*/}
                            {/*        <input defaultChecked type="radio" id="gubunAll" name="gubun" value={'2'} onChange={this.onGubunChange} />*/}
                            {/*        <label for="gubunAll" className='pl-1 mr-3'>전체</label>*/}
                            {/*        <input type="radio" id="gubunDirect" name="gubun" onChange={this.onGubunChange} value={'1'} />*/}
                            {/*        <label for="gubunDirect" className='pl-1 mr-3'>즉시</label>*/}
                            {/*        <input type="radio" id="gubunReserve" name="gubun" onChange={this.onGubunChange} value={'0'} />*/}
                            {/*        <label for="gubunReserve" className='pl-1'>예약</label>*/}
                            {/*    </div>*/}
                            {/*</div>*/}
                        </div>

                        <hr className='p-0 m-0' />

                        <div className='pt-3 d-flex'>
                            <span className='textBoldLarge f3'>상품상태</span>
                            <span className='pl-3'>
                                <input defaultChecked type="radio" id="stateAll" name="state" value={'0'} onChange={this.onStateChange} />
                                <label for="stateAll" className='pl-1 mr-3'>전체</label>
                                <input type="radio" id="state1" name="state" onChange={this.onStateChange} value={'1'} />
                                <label for="state1" className='pl-1 mr-3'>판매중</label>
                                <input type="radio" id="state2" name="state" onChange={this.onStateChange} value={'2'} />
                                <label for="state2" className='pl-1 mr-3'>품절</label>
                                <input type="radio" id="state3" name="state" onChange={this.onStateChange} value={'3'} />
                                <label for="state3" className='pl-1 mr-3'>영구판매종료</label>
                                <input type="radio" id="state4" name="state" onChange={this.onStateChange} value={'4'} />
                                <label for="state4" className='pl-1 mr-3'>판매기한만료</label>
                                <input type="radio" id="state5" name="state" onChange={this.onStateChange} value={'5'} />
                                <label for="state5" className='pl-1 mr-3'>임시저장</label>
                                <input type="radio" id="state6" name="state" onChange={this.onStateChange} value={'6'} />
                                <label for="state6" className='pl-1'>일시중지</label>
                            </span>
                            <Button className='ml-auto' color='info' size='sm' onClick={this.onSearchClick}>검색</Button>
                        </div>
                    </div>
                </FormGroup>

                <FilterContainer gridApi={this.gridApi} columnApi={this.columnApi} excelFileName={'상품 목록'}>
                    <FilterGroup>
                        <InputFilter
                            gridApi={this.gridApi}
                            columns={[
                                {field: 'goodsNo', name: '상품번호'},
                                {field: 'goodsNm', name: '상품명'},
                            ]}
                            isRealTime={true}
                        />
                    </FilterGroup>
                    <Hr/>
                    <Flex p={10}>
                        <CheckboxFilter
                            gridApi={this.gridApi}
                            field={'directGoods'}
                            name={'상품구분'}
                            data={[
                                {value: '즉시', name: '즉시'},
                                //숨겨도 될듯 {value: '예약', name: '예약'},
                                {value: '공동구매', name: '공동구매'},
                            ]}
                        />
                    </Flex>
                </FilterContainer>

                <div className='d-flex mb-1 align-items-center'>
                    <div>총 {this.state.data ? ComUtil.addCommas(this.state.data.length) : 0} 개</div>
                    <div className={'d-flex ml-auto'}>
                        {
                            this.state.selectedRows.length > 0 && (
                                <Flex>
                                    <Button className='mr-1' size={'sm'} onClick={this.onCheckedActionClick.bind(this, 'stop')}>{this.state.selectedRows.length}건 영구판매종료</Button>
                                    <Button className='mr-1' size={'sm'} onClick={this.onCheckedActionClick.bind(this, 'pause')}>{this.state.selectedRows.length}건 일시중지</Button>
                                    <Button className='mr-1' size={'sm'} onClick={this.onCheckedActionClick.bind(this, 'continue')}>{this.state.selectedRows.length}건 판매재개</Button>
                                </Flex>
                            )
                        }

                        <div><Button className='mr-1' color={'info'} size={'sm'} onClick={this.onNewGoodsClick}>신규상품</Button></div>
                        {/*<div>*/}
                        {/*    <ExcelDownload data={this.state.excelData} fileName="goodsList" />*/}
                        {/*</div>*/}
                    </div>
                </div>

                <div
                    id="myGrid"
                    style={{
                        height: "calc(100vh - 180px)"
                    }}
                    className='ag-theme-balham'
                >
                    <AgGridReact
                        {...this.state.gridOptions}
                        rowData={this.state.data}
                        onCellDoubleClicked={this.copy}
                    >
                    </AgGridReact>
                </div>
                {
                    this.state.isGoodsSelectionOpen && (
                        <ModalPopup
                            title={'상품종류 선택'}
                            onClick={this.onGoodsSelectionPopupClose}
                            showFooter={false}
                            content={
                                <div>
                                    <Container className={''}>
                                        <Row>
                                            {/*<Col xs={6}>*/}
                                            {/*    <Button className={'mb-2'} color={'info'} size={'lg'} block onClick={this.onGoodsPopupClick.bind(this, 'reservedGoods')}><FaClock />예약 상품</Button>*/}
                                            {/*    <div className={'small text-center text-secondary f6'}>*/}
                                            {/*        <div className={'mb-2'}>*/}
                                            {/*            - 채소 등과 같이 <b className={'text-info'}>재배기간 동안 주문을 받고 수확/출하 후 일괄 발송하는 상품</b>입니다.*/}
                                            {/*        </div>*/}
                                            {/*        <div>*/}
                                            {/*            - 판매기간 동안 <b className={'text-info'}>단계별 할인가</b>를 적용할 수 있습니다.*/}
                                            {/*        </div>*/}
                                            {/*    </div>*/}
                                            {/*</Col>*/}
                                            <Col xs={6}>
                                                <Button className={'mb-2'} color={'warning'} size={'lg'} block onClick={this.onGoodsPopupClick.bind(this, 'directGoods')}><FaBolt />즉시 상품</Button>
                                                <div className={'small text-center text-secondary f6'}>
                                                    <div className={'mb-2'}>
                                                        - 상품이 판매가 되면  <b className={'text-warning'}>즉시 발송하는 상품</b>으로 소비자와 판매가를 입력할 수 있습니다.
                                                    </div>
                                                    <div>
                                                        - 미리 가공된 상품 등 <b className={'text-warning'}>바로 발송이 가능한 경우</b> 선택해 주세요.
                                                    </div>
                                                    <br/>
                                                </div>
                                            </Col>
                                            <Col xs={6}>
                                                <Button className={'mb-2'} color={'info'} size={'lg'} block onClick={this.onGoodsPopupClick.bind(this, 'dealGoods')}><FaClock />쑥쑥-계약재배</Button>
                                                <div className={'small text-center text-secondary f6'}>
                                                    <div className={'mb-2'}>
                                                        - 채소 등과 같이 <b className={'text-info'}>재배기간 동안 주문을 받고 수확/출하 후 일괄 발송하는 상품</b>입니다.
                                                    </div>
                                                    <div>
                                                        <b className={'text-info'}>※ 샵블리와 사전에 논의된 계약재배 상품만 등록 가능합니다.</b>
                                                    </div>
                                                    <br/>
                                                </div>
                                            </Col>

                                        </Row>
                                    </Container>
                                </div>
                            }/>
                    )
                }


                {
                    this.state.isDirectGoodsOpen != null && (
                        this.state.isDirectGoodsOpen ? (
                            <ProducerFullModalPopupWithNav show={true} title={this.state.goodsNo ? '즉시판매 상품보기' : '즉시판매 상품등록'} onClose={this.onGoodsRegPopupClose}>
                                <WebDirectGoodsReg goodsNo={this.state.goodsNo}/>
                            </ProducerFullModalPopupWithNav>
                        ) : //this.state.isDealGoodsOpen ?
                            (
                            <ProducerFullModalPopupWithNav show={true} title={this.state.goodsNo ? '공동구매 상품보기' : '공동구매 상품등록'} onClose={this.onGoodsRegPopupClose}>
                                <div>
                                    {
                                        this.state.goodsNo? <WebDealGoodsReg goodsNo={this.state.goodsNo} /> : <WebDealGoodsReg goodsNo={0} />
                                    }
                                </div>
                            </ProducerFullModalPopupWithNav>
                            ) //:
                                // (
                                //     <ProducerFullModalPopupWithNav show={true} title={this.state.goodsNo ? '예약판매 상품보기' : '예약판매 상품등록'} onClose={this.onGoodsRegPopupClose}>
                                //         <div>
                                //             {
                                //                 this.state.goodsNo? <WebGoodsReg goodsNo={this.state.goodsNo} /> : <WebGoodsReg goodsNo={0} />
                                //             }
                                //         </div>
                                //     </ProducerFullModalPopupWithNav>
                                // )
                    )
                }
            </Fragment>
        )
    }
}