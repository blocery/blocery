import React, { Component } from 'react';
import {Button, Input, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'
import ComUtil from '~/util/ComUtil'
import { producerGoodsQnaList, producerClaimQnaStatusAllCount, producerGoodsQnaStatusAllCount } from '~/lib/adminApi'

//ag-grid
import { AgGridReact } from 'ag-grid-react';
import ProducerQnaAnswer from "./ProducerQnaAnswer";
import {Div, FilterGroup, Flex, Hr, Space, Span} from "~/styledComponents/shared";

import SearchDates from '~/components/common/search/SearchDates'
import moment from "moment-timezone";
import ConsumerDetail from "~/components/common/contents/ConsumerDetail";
import {MenuButton, SmButton} from "~/styledComponents/shared/AdminLayouts";

import FilterContainer from "~/components/common/gridFilter/FilterContainer";
import InputFilter from "~/components/common/gridFilter/InputFilter";
import CheckboxFilter from "~/components/common/gridFilter/CheckboxFilter";

export default class ProducerQnaList extends Component {
    constructor(props) {
        super(props);
        this.serverToday=null;
        this.state = {
            selectedGubun: 'month', //'week': 최초화면을 오늘(day)또는 1주일(week)로 설정.
            startDate: moment(moment().toDate()).subtract(1,"month"),
            endDate: moment(moment().toDate()),
            claimStatusMiAllCnt:0,
            claimStatusRequestAllCnt:0,
            claimStatusRejectAllCnt:0,
            claimStatusConfirmAllCnt:0,

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
                goodsQnaStatRenderer: this.goodsQnaStatRenderer,
                nameRenderer: this.nameRenderer,
                preRenderer: this.preRenderer,
            },
            rowSelection: 'single',
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
        }

        this.titleOpenAnswerPopup = "상품답변하기";
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

        let producerNoColumn = {
            headerName: "생산자번호",
            field: "producerNo",
            width: 100,
            cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
            filterParams: {
                clearButton: true
            }
        };
        let producerNameColumn = {
            headerName: "생산자",
            field: "producerName",
            width: 100,
            cellStyle:ComUtil.getCellStyle,
            filterParams: {
                clearButton: true
            }
        };
        let farmNameColumn = {
            headerName: "농장",
            field: "farmName",
            width: 100,
            cellStyle:ComUtil.getCellStyle,
            filterParams: {
                clearButton: true
            }
        };


        let goodsQnaNoColumn = {
            headerName: "문의번호",
            field: "goodsQnaNo",
            width: 110,
            cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
            filterParams: {
                clearButton: true
            }
        };

        let goodsQueColumn = {
            headerName: "상품문의", field: "goodsQue",
            suppressFilter: true, //no filter
            suppressSizeToFit: true,
            minWidth:100, width: 300, resizable: true,
            wrapText: true,
            autoHeight: true,
            cellRenderer: "preRenderer",
            filterParams: {
                clearButton: true //클리어버튼
            }

        };

        let qaClaimProcStatColumn = {
            headerName: "클레임상태", field: "qaClaimProcStat",
            width: 120,
            cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
            // cellRenderer: "goodsQnaStatRenderer",
            filterParams: {
                clearButton: true //클리어버튼
            },

            valueGetter: function(params) {
                //기공된 필터링 데이터로 필터링 되게 적용

                let qaClaimFlag = params.data.qaClaimFlag;
                if(!qaClaimFlag) return "";

                let qaClaimProcStat = params.data.qaClaimProcStat;
                let qaClaimProcStatNm = "미처리";
                if(qaClaimProcStat === "") qaClaimProcStatNm = "미처리";
                else if(qaClaimProcStat === "request") qaClaimProcStatNm = "생산자요청";
                else if(qaClaimProcStat === "confirm") qaClaimProcStatNm = "승인";
                else if(qaClaimProcStat === "reject") qaClaimProcStatNm = "반려";

                return qaClaimProcStatNm;
            }
        }

        let goodsQnaStatColumn = {
            headerName: "상태", field: "goodsQnaStat",
            width: 120,
            cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
            cellRenderer: "goodsQnaStatRenderer",
            filterParams: {
                clearButton: true //클리어버튼
            },

            valueGetter: function(params) {
                //기공된 필터링 데이터로 필터링 되게 적용
                let goodsQnaStat = params.data.goodsQnaStat;
                let goodsQnaStatNm = "";
                if(goodsQnaStat === "ready") goodsQnaStatNm = "미응답";
                else if(goodsQnaStat === "processing") goodsQnaStatNm = "진행중";
                else if(goodsQnaStat === "success") goodsQnaStatNm = "응답";

                return goodsQnaStatNm;
            }
        };

        let columnDefs = [
            goodsQnaNoColumn,
            {
                headerName: "문의타입", field: "qaType",
                suppressSizeToFit: true,
                width: 100,
                cellStyle:ComUtil.getCellStyle,
                filterParams: {
                    clearButton: true //클리어버튼
                },
                valueGetter: function(params) {
                    //  0:상품상세,1:판매자문의,9:고객센터문의
                    if(params.data.qaType === 0){
                        return '상품문의';
                    } else if(params.data.qaType === 1){
                        return '판매자문의';
                    } else if(params.data.qaType === 9){
                        return '고객센터문의';
                    }
                    return '상품문의'
                }
            },
            {
                headerName: "문의유형", field: "qaKind",
                suppressSizeToFit: true,
                width: 100,
                cellStyle:ComUtil.getCellStyle,
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            {
                headerName: "문의종류", field: "qaClaimKind",
                suppressSizeToFit: true,
                width: 100,
                cellStyle:ComUtil.getCellStyle,
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            {
               headerName: "세부사항", field: "qaClaimMethod",
                suppressSizeToFit: true,
                width: 100,
                cellStyle:ComUtil.getCellStyle,
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            {
                headerName: "문의일시", field: "goodsQueDate",
                suppressSizeToFit: true,
                width: 150,
                cellStyle:ComUtil.getCellStyle,
                filterParams: {
                    clearButton: true //클리어버튼
                },
                valueGetter: function(params) {
                    //console.log("params",params);
                    //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                    return ComUtil.utcToString(params.data.goodsQueDate,'YYYY-MM-DD HH:mm');
                }
            },
            qaClaimProcStatColumn,
            goodsQueColumn,
            goodsQnaStatColumn,
            {
                headerName: "소비자번호", field: "consumerNo",
                suppressSizeToFit: true,
                width: 100,
                cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            {
                headerName: "소비자", field: "consumerName",
                cellRenderer: "nameRenderer",
                suppressSizeToFit: true,
                width: 100,
                cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            {
                headerName: "환불금액", field: "refundAmt",
                suppressSizeToFit: true,
                width: 100,
                cellStyle:ComUtil.getCellStyle({cellAlign: 'right'}),
                cellRenderer: 'formatCurrencyRenderer',
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            farmNameColumn,
            {
                headerName: "상품번호", field: "goodsNo",
                width: 100,
                cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            {
                headerName: "상품명", field: "goodsName",
                width: 200,
                cellStyle:ComUtil.getCellStyle,
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            {
                headerName: "판매가", field: "currentPrice",
                width: 100,
                cellStyle:ComUtil.getCellStyle({cellAlign: 'right'}),
                cellRenderer: 'formatCurrencyRenderer',
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            producerNoColumn,
            producerNameColumn,
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
    goodsQnaStatRenderer = ({value, data:rowData}) => {
        const txtColor = rowData.goodsQnaStat === 'ready' ? 'text-info' : null;
        const v_goodsQnaStatNm = value;
        return (
            rowData.goodsQnaStat === 'success' ?
                <>({v_goodsQnaStatNm})<SmButton onClick={this.openAnswerPopup.bind(this, rowData)}>답변보기</SmButton></>
                :
                <>({v_goodsQnaStatNm})<SmButton fg={'danger'} onClick={this.openAnswerPopup.bind(this, rowData)}>답변하기</SmButton></>
        )
    }

    // cellRenderer
    nameRenderer = ({value, data:rowData}) => {
        if(rowData.consumerNo <= 0){
            return <Span>{rowData.consumerName}</Span>
        }
        else if(rowData.consumerNo > 0) {
            return <Span fg={'primary'} onClick={this.onConsumerClick.bind(this, rowData)}><u>{rowData.consumerName}</u></Span>
        }
    }


    preRenderer = ({value,data:rowData})  => {
        const rVal = value.replace(/(?:\r\n|\r|\n)/g, '<br />')
        return (<Div maxHeight={100} minWidth={280} style={{whiteSpace:'pre-line'}} overflow={'auto'}>{value}</Div>)
    }

    getRowHeight = (params) => {
        // assuming 50 characters per line, working how how many lines we need
        const vRowHeightStd = 50; // default 50
        const vRowHeight = (Math.floor(params.data.goodsQue.length / vRowHeightStd) + 1) * vRowHeightStd;
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

        const paramsClaim = {
            startDate:this.state.startDate ? moment(this.state.startDate).format('YYYYMMDD'):null,
            endDate:this.state.endDate ? moment(this.state.endDate).format('YYYYMMDD'):null,
            claimStatus:""
        };
        const {data:claimStatusMiAllCnt} = await producerClaimQnaStatusAllCount(paramsClaim);
        paramsClaim.claimStatus = "request";
        const {data:claimStatusRequestAllCnt} = await producerClaimQnaStatusAllCount(paramsClaim);
        paramsClaim.claimStatus = "reject";
        const {data:claimStatusRejectAllCnt} = await producerClaimQnaStatusAllCount(paramsClaim);
        paramsClaim.claimStatus = "confirm";
        const {data:claimStatusConfirmAllCnt} = await producerClaimQnaStatusAllCount(paramsClaim);


        const {data:statusReadyAllCnt} = await producerGoodsQnaStatusAllCount("ready");
        const {data:statusProcessingAllCnt} = await producerGoodsQnaStatusAllCount("processing");
        const {data:statusSuccessAllCnt} = await producerGoodsQnaStatusAllCount("success");

        const params = {
            startDate:this.state.startDate ? moment(this.state.startDate).format('YYYYMMDD'):null,
            endDate:this.state.endDate ? moment(this.state.endDate).format('YYYYMMDD'):null,
            claimStatus:this.state.searchFilter.claimStatus,
            status:this.state.searchFilter.status
        };

        const { status, data } = await producerGoodsQnaList(params);
        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return
        }

        this.setState({
            claimStatusMiAllCnt:claimStatusMiAllCnt,
            claimStatusRequestAllCnt:claimStatusRequestAllCnt,
            claimStatusRejectAllCnt:claimStatusRejectAllCnt,
            claimStatusConfirmAllCnt:claimStatusConfirmAllCnt,

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

        let statusClaimItems = [
            {
                value:'all',
                label:'전체'
            },
            {
                value:'readyOrRequest',
                label:'미처리or생산자요청'
            },
            {
                value:'ready',
                label:'미처리'
            },
            {
                value:'request',
                label:'생산자요청'
            },
            {
                value:'reject',
                label:'반려'
            },
            {
                value:'confirm',
                label:'승인'
            }
        ];
        filterItems.statusClaimItems = statusClaimItems;

        let statusItems = [
            {
                value:'all',
                label:'전체'
            },
            {
                value:'readyOrProcessing',
                label:'미응답or진행중'
            },
            {
                value:'ready',
                label:'미응답'
            },
            {
                value:'processing',
                label:'진행중'
            },
            {
                value:'success',
                label:'응답'
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
    openAnswerPopup = (goodsQna) => {
        let titleOpenAnswerPopup = goodsQna.goodsQnaStat === 'ready' ? '문의답변하기' : '문의답변보기'
        this.titleOpenAnswerPopup = titleOpenAnswerPopup;
        this.setState({
            goodsQnaNo: goodsQna.goodsQnaNo
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

                        <div className='d-flex justify-content-center align-items-center textBoldLarge' fontSize={'small'}>클레임상태</div>
                        <Input type='select' name='claimStatus' id='claimStatus' style={{width: 170}} value={state.searchFilter.claimStatus} onChange={this.onClaimStatusChange}>
                            {
                                state.filterItems.statusClaimItems && state.filterItems.statusClaimItems.map((item,index) =>
                                    <option name={'claimStatus_'+item.value+'_'+index} value={item.value}>{item.label}</option>
                                )
                            }
                        </Input>

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
                <FilterContainer gridApi={this.gridApi} columnApi={this.gridColumnApi} excelFileName={'소비자 문의 조회'}>
                    <FilterGroup>
                        <InputFilter
                            gridApi={this.gridApi}
                            columns={[
                                {field: 'qaKind', name: '문의유형'},
                                {field: 'qaClaimKind', name: '문의종류'},
                                {field: 'qaClaimMethod', name: '세부사항'},
                            ]}
                            isRealTime={true}
                        />
                    </FilterGroup>
                    <Hr/>
                    <FilterGroup>
                        <CheckboxFilter
                            gridApi={this.gridApi}
                            field={'qaClaimProcStat'}
                            name={'클레임상태'}
                            data={[
                                {value: '미처리', name: '미처리'},
                                {value: '생산자요청', name: '생산자요청'},
                                {value: '반려', name: '반려'},
                                {value: '승인', name: '승인'}
                            ]}
                        />
                        <CheckboxFilter
                            gridApi={this.gridApi}
                            field={'goodsQnaStat'}
                            name={'상태'}
                            data={[
                                {value: '미응답', name: '미응답'},
                                {value: '진행중', name: '진행중'},
                                {value: '응답', name: '응답'}
                            ]}
                        />
                    </FilterGroup>
                </FilterContainer>
                {/* filter END */}


                <Div mb={10} textAlign={'right'}>
                    현재 page {this.state.totalListCnt} 건 | 클레임(미처리 {this.state.claimStatusMiAllCnt} / 요청 {this.state.claimStatusRequestAllCnt} / 반려 {this.state.claimStatusRejectAllCnt} / 승인 {this.state.claimStatusConfirmAllCnt}) | 전체(미응답 {this.state.statusReadyAllCnt > 0 ? <span style={{color:'red'}}>{this.state.statusReadyAllCnt}</span>:0} / 진행중 {this.state.statusProcessingAllCnt} /응답 {this.state.statusSuccessAllCnt})
                </Div>

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
                    >
                    </AgGridReact>
                </div>

                <Modal size="xl" isOpen={this.state.isAnswerModalOpen}
                       toggle={this.onAnswerPopupClose} >
                    <ModalHeader toggle={this.onAnswerPopupClose}>
                        {this.titleOpenAnswerPopup}
                    </ModalHeader>
                    <ModalBody>
                        <ProducerQnaAnswer
                            goodsQnaNo={this.state.goodsQnaNo}
                            onClose={this.onAnswerPopupClose} />
                    </ModalBody>
                    <ModalFooter>
                        {/*<Button color="secondary" onClick={this.onAnswerPopupClose}>닫기</Button>*/}
                    </ModalFooter>
                </Modal>

                <Modal size="lg" isOpen={this.state.modal}
                       toggle={this.toggle} >
                    <ModalHeader toggle={this.toggle}>
                        소비자 상세 정보
                    </ModalHeader>
                    <ModalBody>
                        <ConsumerDetail consumerNo={this.state.consumer ? this.state.consumer.consumerNo : null}
                                        onClose={this.toggle} />
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={this.toggle}>닫기</Button>
                    </ModalFooter>
                </Modal>
            </Div>
        );
    }
}