import React, { Component } from 'react';
import {Button, Input, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'
import ComUtil from '~/util/ComUtil'
import {
    localFarmerQnaList,
    localFarmerQnaStatusAllCount,
    setLocalFarmerQnaAnswerByLocalFarmerQnaNoAuto
} from '~/lib/adminApi'

//ag-grid
import { AgGridReact } from 'ag-grid-react';
import LocalFarmerQnaAnswer from "./LocalFarmerQnaAnswer";
import {Div, FilterGroup, Flex, Hr, Right, Space, Span} from "~/styledComponents/shared";

import SearchDates from '~/components/common/search/SearchDates'
import moment from "moment-timezone";
import {MenuButton, SmBasicButton, SmButton} from "~/styledComponents/shared/AdminLayouts";
import FilterContainer from "~/components/common/gridFilter/FilterContainer";
import InputFilter from "~/components/common/gridFilter/InputFilter";
import CheckboxFilter from "~/components/common/gridFilter/CheckboxFilter";
import {toast} from "react-toastify";
import {BlocerySpinner} from "~/components/common";


export default class LocalFarmerQnaList extends Component {
    constructor(props) {
        super(props);
        this.serverToday=null;
        this.state = {
            selectedGubun: 'month', //'week': 최초화면을 오늘(day)또는 1주일(week)로 설정.
            startDate: moment(moment().toDate()).subtract(1,"month"),
            endDate: moment(moment().toDate()),

            statusReadyAllCnt:0,
            statusProcessingAllCnt:0,
            statusSuccessAllCnt:0,

            data: null,
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
                formatDateRenderer: this.formatDateRenderer
            },
            frameworkComponents: {
                localFarmerQnaStatRenderer: this.localFarmerQnaStatRenderer,
                preRenderer: this.preRenderer,
            },
            rowSelection: 'multiple',
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',

            totalListCnt:0,

            isAnswerModalOpen: false,
            goodsQnaNo: null,
            filterItems: {
                items: [],
                claimStatusItems:[],
                statusItems:[]
            },

            searchFilter: {
                itemName: '',
                claimStatus: 'all',
                status: 'readyOrProcessing'
            },
            processLoading:false,
            selectedRows: []
        }

        this.titleOpenAnswerPopup = "요청응답";
    }

    //[이벤트] 그리드 로드 후 callback 이벤트
    onGridReady(params) {
        //API init
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;

        //ag-grid 높이 리셋 및 렌더링
        // Following line dymanic set height to row on content
        this.gridApi.resetRowHeights();
    }

    // Ag-Grid column Info
    getColumnDefs () {
        let columnDefs = [
            {
                headerName: "문의번호",
                field: "localFarmerQnaNo",
                width: 120,
                cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                filterParams: {
                    clearButton: true
                },
                headerCheckboxSelection: true,
                headerCheckboxSelectionFilteredOnly: true,  //전체 체크시 필터된 것만 체크
                checkboxSelection: true,
            },
            {
                headerName: "문의요청", field: "qaKind",
                suppressSizeToFit: true,
                width: 150,
                cellStyle:ComUtil.getCellStyle,
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            {
                headerName: "요청내용", field: "localFarmerQns",
                suppressFilter: true, //no filter
                suppressSizeToFit: true,
                minWidth:100, width: 300, resizable: true,
                wrapText: true,
                autoHeight: true,
                cellRenderer: "preRenderer",
                filterParams: {
                    clearButton: true //클리어버튼
                }

            },
            {
                headerName: "문의일시", field: "localFarmerQnaDate",
                suppressSizeToFit: true,
                width: 150,
                cellStyle:ComUtil.getCellStyle,
                filterParams: {
                    clearButton: true //클리어버튼
                },
                valueGetter: function(params) {
                    //console.log("params",params);
                    //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                    return ComUtil.utcToString(params.data.localFarmerQnaDate,'YYYY-MM-DD HH:mm');
                }
            },
            {
                headerName: "상태", field: "localFarmerQnaStat",
                width: 150,
                cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                cellRenderer: "localFarmerQnaStatRenderer",
                filterParams: {
                    clearButton: true //클리어버튼
                },

                valueGetter: function(params) {
                    //기공된 필터링 데이터로 필터링 되게 적용
                    let localFarmerQnaStat = params.data.localFarmerQnaStat;
                    let localFarmerQnaStatNm = "";
                    if(localFarmerQnaStat === "ready") localFarmerQnaStatNm = "요청";
                    else if(localFarmerQnaStat === "processing") localFarmerQnaStatNm = "진행중";
                    else if(localFarmerQnaStat === "success") localFarmerQnaStatNm = "처리완료";

                    return localFarmerQnaStatNm;
                }
            },
            {
                headerName: "로컬푸드",
                field: "producerName",
                width: 150,
                cellStyle:ComUtil.getCellStyle,
                filterParams: {
                    clearButton: true
                }
            },
            {
                headerName: "로컬생산자번호",
                field: "localFarmerNo",
                width: 150,
                cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                filterParams: {
                    clearButton: true
                }
            },
            {
                headerName: "농가",
                field: "farmerName",
                width: 150,
                cellStyle:ComUtil.getCellStyle,
                filterParams: {
                    clearButton: true
                }
            },
            {
                headerName: "농장",
                field: "farmName",
                width: 150,
                cellStyle:ComUtil.getCellStyle,
                filterParams: {
                    clearButton: true
                }
            },
        ];

        return columnDefs
    }

    //Ag-Grid Cell 숫자콤마적용 렌더러
    formatCurrencyRenderer = ({value, data:rowData}) => {
        //console.log("rowData",rowData);
        return ComUtil.addCommas(value);
    }
    //Ag-Grid Cell 날짜변환 렌더러
    formatDateRenderer = ({value, data:rowData}) => {
        return (value ? ComUtil.utcToString(value) : '미지정')
    }

    //Ag-Grid Cell 상품문의상태 렌더러
    localFarmerQnaStatRenderer = ({value, data:rowData}) => {
        const v_goodsQnaStatNm = value;
        return (
            rowData.localFarmerQnaStat === 'success' ?
                <><SmBasicButton bg={'secondary'} fg={'white'} onClick={this.openAnswerPopup.bind(this, rowData)}>처리완료</SmBasicButton></>
                :
                <Space>
                    <SmBasicButton bg={'green'} fg={'white'} onClick={this.openAnswerPopup.bind(this, rowData)}>요청처리</SmBasicButton>
                    <SmBasicButton bg={'green'} fg={'white'} onClick={this.autoLocalFarmerReq.bind(this, rowData)}>자동요청처리</SmBasicButton>
                </Space>
        )
    }

    // cellRenderer

    preRenderer = ({value,data:rowData})  => {
        const rVal = value.replace(/(?:\r\n|\r|\n)/g, '<br />')
        return (<Div maxHeight={100} minWidth={280} style={{whiteSpace:'pre-line'}} overflow={'auto'}>{value}</Div>)
    }

    getRowHeight = (params) => {
        // assuming 50 characters per line, working how how many lines we need
        const vRowHeightStd = 50; // default 50
        const vRowHeight = (Math.floor(params.data.localFarmerQns.length / vRowHeightStd) + 1) * vRowHeightStd;
        if(vRowHeight > vRowHeightStd){
            return 100;
        } else{
            return vRowHeight;
        }
    }

    //Ag-Grid 주문상태 필터링용 온체인지 이벤트 (데이터 동기화)
    onGridFilterChanged () {
        //필터링된 데이터 push
        let sortedData = [];
        this.gridApi.forEachNodeAfterFilterAndSort(function(node, index) {
            sortedData.push(node.data);
        });

        this.setState({
            totalListCnt: sortedData.length
        });
    }

    async componentDidMount(){
        this.search()
        this.setFilter()
    }

    onConsumerClick = (data) => {
        this.setState({
            modal: true,
            consumer: data
        })
    }

    toggle = async () => {
        this.setState(prevState => ({
            modal: !prevState.modal
        }));
    }

    onSelectionChanged = () => {
        this.updateSelectedRows()
    }

    updateSelectedRows = () => {
        this.setState({
            selectedRows: this.gridApi.getSelectedRows()
        })
    }

    getAvailableRows = async () => {
        //그리드 체크된 목록
        const sRows = this.gridApi.getSelectedRows()
        //db 조회
        // const promises = sRows.map(item => confirmProducerCancel(item.orderSeq))
        // const res = await Promise.all(promises)
        // const dbRows = res.map(({data}) => data)
        //필터링
        return sRows.filter(item => item.localFarmerQnaNo !== 0 && item.localFarmerQnaStat !== 'success');
    }

    onMultiAutoLocalFarmerReq = async () => {
        //체크된 목록 중 업데이트
        const updateRows = await this.getAvailableRows()

        if (updateRows.length <= 0){
            alert('자동요청처리할 건이 없습니다')
            return
        }

        if (!window.confirm(`${ComUtil.addCommas(updateRows.length)}건을 자동요청처리 하시겠습니까?`)) {
            return
        }
        this.setState({processLoading:true});
        await updateRows.reduce( async (promise, item) => {
            await promise;
            await setLocalFarmerQnaAnswerByLocalFarmerQnaNoAuto(item.localFarmerQnaNo);
        }, {});

        toast.success('자동요청처리 되었습니다.');
        this.setState({processLoading:false});
        this.search();
    }

    autoLocalFarmerReq = async (rawData) => {
        if(window.confirm("문의번호"+rawData.localFarmerQnaNo+"를 자동요청처리를 하시겠습니까?")){
            const { status, data } = await setLocalFarmerQnaAnswerByLocalFarmerQnaNoAuto(rawData.localFarmerQnaNo);
            if(status !== 200){
                toast.error('저장중 에러가 발생하였습니다.');
                return
            }
            toast.success('자동요청처리 되었습니다.');
            this.search();
        }
    }

    // 주문조회 (search)
    search = async (searchButtonClicked) => {

        if(searchButtonClicked) {
            if (!this.state.startDate || !this.state.endDate) {
                alert('시작일과 종료일을 선택해주세요')
                return;
            }
        }

        if(this.gridApi) {
            //ag-grid 레이지로딩중 보이기
            this.gridApi.showLoadingOverlay();
        }

        const {data:statusReadyAllCnt} = await localFarmerQnaStatusAllCount("ready");
        const {data:statusProcessingAllCnt} = await localFarmerQnaStatusAllCount("processing");
        const {data:statusSuccessAllCnt} = await localFarmerQnaStatusAllCount("success");

        const params = {
            startDate:this.state.startDate ? moment(this.state.startDate).format('YYYYMMDD'):null,
            endDate:this.state.endDate ? moment(this.state.endDate).format('YYYYMMDD'):null,
            status:this.state.searchFilter.status
        };

        const { status, data } = await localFarmerQnaList(params);
        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return
        }

        this.setState({
            statusReadyAllCnt:statusReadyAllCnt,
            statusProcessingAllCnt:statusProcessingAllCnt,
            statusSuccessAllCnt:statusSuccessAllCnt,

            data: data,
            totalListCnt: data.length,
            columnDefs: this.getColumnDefs()
        })

        //ag-grid api
        if(this.gridApi){
            //ag-grid 레이지로딩중 감추기
            this.gridApi.hideOverlay();

            //ag-grid 높이 리셋 및 렌더링
            // Following line dymanic set height to row on content
            this.gridApi.resetRowHeights();

        }
    }

    setFilter = async() => {
        const filterItems = Object.assign({}, this.state.filterItems);
        let statusItems = [
            {
                value:'all',
                label:'전체'
            },
            {
                value:'readyOrProcessing',
                label:'요청or진행중'
            },
            {
                value:'ready',
                label:'요청'
            },
            {
                value:'processing',
                label:'진행중'
            },
            {
                value:'success',
                label:'처리완료'
            }
        ];
        filterItems.statusItems = statusItems;

        this.setState({
            filterItems: filterItems
        })
    }

    onClaimStatusChange = (e) => {
        const filter = Object.assign({}, this.state.searchFilter)
        filter.claimStatus = e.target.value;
        this.setState({
            searchFilter: filter
        })
        this.search();
    }

    onStatusChange = (e) => {
        const filter = Object.assign({}, this.state.searchFilter)
        filter.status = e.target.value;
        this.setState({
            searchFilter: filter
        })
        this.search();
    }

    isAnswerModalOpenToggle = () => {
        this.setState({
            isAnswerModalOpen: !this.state.isAnswerModalOpen
        })
    }
    openAnswerPopup = (localFarmerQna) => {
        let titleOpenAnswerPopup = '요청';
        if(localFarmerQna.localFarmerQnaStat === 'success'){
            titleOpenAnswerPopup = '처리완료';
        }
        this.titleOpenAnswerPopup = titleOpenAnswerPopup;
        this.setState({
            localFarmerQnaNo: localFarmerQna.localFarmerQnaNo
        })
        this.isAnswerModalOpenToggle()
    }
    // 답변내용 저장 하였을 경우는 조회 및 닫기
    // X 버튼을 눌렀을경우 닫기
    onAnswerPopupClose = (isSaved) => {
        if(isSaved) {
            this.search();
            this.isAnswerModalOpenToggle();
        }else {
            this.isAnswerModalOpenToggle();
        }
    }

    onDatesChange = async (data) => {
        await this.setState({
            startDate: data.startDate,
            endDate: data.endDate,
            selectedGubun: data.gubun
        });
        if(data.isSearch) {
            await this.search();
        }
    }

    copy = ({value}) => {
        ComUtil.copyTextToClipboard(value, '', '');
    }

    render() {
        const state = this.state
        return(
            <Div p={16}>

                {
                    this.state.processLoading && <BlocerySpinner/>
                }

                <Flex p={10} mb={10} bc={'secondary'}>
                    <Space>
                        <div className='d-flex justify-content-center align-items-center textBoldLarge' fontSize={'small'}>기 간 (작성일)</div>
                        <SearchDates
                            isHiddenAll
                            isCurrenYeartHidden
                            gubun={this.state.selectedGubun}
                            startDate={this.state.startDate}
                            endDate={this.state.endDate}
                            onChange={this.onDatesChange}
                        />

                        <div className='d-flex justify-content-center align-items-center textBoldLarge' fontSize={'small'}>상태 </div>
                        <Input type='select' name='orderStatus' id='orderStatus' style={{width: 150}} value={state.searchFilter.status} onChange={this.onStatusChange}>
                            {
                                state.filterItems.statusItems.map((item,index) =>
                                    <option name={'orderStatus_'+item.value+'_'+index} value={item.value}>{item.label}</option>
                                )
                            }
                        </Input>

                        <MenuButton onClick={() => this.search(true)}> 검 색 </MenuButton>
                    </Space>
                </Flex>

                {/* filter START */}
                <FilterContainer gridApi={this.gridApi} columnApi={this.gridColumnApi} excelFileName={'로컬푸드 생산자 요청 문의 조회'}>
                    <FilterGroup>
                        <InputFilter
                            gridApi={this.gridApi}
                            columns={[
                                {field: 'qaKind', name: '문의요청'},
                                {field: 'localFarmerQns', name: '요청내용'}
                            ]}
                            isRealTime={true}
                        />
                    </FilterGroup>
                    <Hr/>
                    <FilterGroup>
                        <CheckboxFilter
                            gridApi={this.gridApi}
                            field={'localFarmerQnaStat'}
                            name={'상태'}
                            data={[
                                {value: '요청', name: '요청'},
                                {value: '진행중', name: '진행중'},
                                {value: '처리완료', name: '처리완료'}
                            ]}
                        />
                    </FilterGroup>
                </FilterContainer>
                {/* filter END */}


                <Flex mb={10} minHeight={33}>
                    <Space>
                        {
                            (this.state.selectedRows.length > 0) && (
                                <MenuButton bg={'green'} onClick={this.onMultiAutoLocalFarmerReq}>
                                    {this.state.selectedRows.length}건 자동요청처리
                                </MenuButton>
                            )
                        }
                    </Space>
                    <Right>
                        현재 page {this.state.totalListCnt} 건 | 전체(요청 {this.state.statusReadyAllCnt > 0 ? <span style={{color:'red'}}>{this.state.statusReadyAllCnt}</span>:0} / 진행중 {this.state.statusProcessingAllCnt} /처리완료 {this.state.statusSuccessAllCnt})
                    </Right>
                </Flex>

                <div
                    className="ag-theme-balham"
                    style={{height:"calc(100vh - 180px)"}}
                >
                    <AgGridReact
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
                        onFilterChanged={this.onGridFilterChanged.bind(this)} //필터온체인지 이벤트
                        onCellDoubleClicked={this.copy}
                        onSelectionChanged={this.onSelectionChanged.bind(this)}
                    >
                    </AgGridReact>
                </div>

                <Modal size="xl" isOpen={this.state.isAnswerModalOpen}
                       toggle={this.onAnswerPopupClose} >
                    <ModalHeader toggle={this.onAnswerPopupClose}>
                        {this.titleOpenAnswerPopup}
                    </ModalHeader>
                    <ModalBody>
                        <LocalFarmerQnaAnswer
                            localFarmerQnaNo={this.state.localFarmerQnaNo}
                            onClose={this.onAnswerPopupClose} />
                    </ModalBody>
                    <ModalFooter>
                        {/*<Button color="secondary" onClick={this.onAnswerPopupClose}>닫기</Button>*/}
                    </ModalFooter>
                </Modal>

            </Div>
        );
    }
}