import React, { Component, Fragment } from 'react';
import { Button, FormGroup } from 'reactstrap'
import ComUtil from '~/util/ComUtil'
import { getGoodsQnaListByProducerNo } from '~/lib/producerApi'
import { getLoginProducerUser } from '~/lib/loginApi'
import { ModalWithNav, Cell } from '~/components/common'
import { AgGridReact } from 'ag-grid-react';
import GoodsQnaAnswer from "./WebGoodsQnaAnswer";
import {Div, Flex} from "~/styledComponents/shared";
import moment from "moment-timezone";
import SearchDates from "~/components/common/search/SearchDates";

export default class WebGoodsQnaList extends Component {
    constructor(props) {
        super(props);
        this.serverToday=null;
        this.state = {
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
                statusItems:[]
            },

            searchFilter: {
                itemName: '',
                status: 'ready'
            },

            search: {
                selectedGubun: 'month', //'months': 최초화면을 1달(months)로 설정.
                startDate: moment(moment().toDate()).add(-1,"months"),
                endDate: moment(moment().toDate()),
            },
        }

        this.titleOpenAnswerPopup = "문의답변하기";
    }

    //[이벤트] 그리드 로드 후 callback 이벤트
    onGridReady(params) {
        //API init
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        //console.log("onGridReady");

        this.gridApi.resetRowHeights();
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

    // Ag-Grid column Info
    getColumnDefs () {

        let goodsQnaNoColumn = {
            headerName: "문의번호",
            field: "goodsQnaNo",
            width: 100,
            cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
            filterParams: {
                clearButton: true
            }
        };

        let goodsQueColumn = {
            headerName: "문의", field: "goodsQue",
            suppressFilter: true, //no filter
            suppressSizeToFit: true,
            width: 300,
            autoHeight:true,
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
                headerName: "소비자", field: "consumerName",
                suppressSizeToFit: true,
                width: 100,
                cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
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
                width: 300,
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
        let txtColor = rowData.goodsQnaStat === 'ready' ? 'text-info' : null;
        let v_goodsQnaStatNm = value;
        return (
            <Cell height={this.rowHeight}>
                <Flex justifyContent={'center'}>
                    <Div fg={'green'} mr={10}>({v_goodsQnaStatNm})</Div>
                    {
                        rowData.goodsQnaStat === 'success' ?
                            <Button size={'sm'} color={'secondary'}
                                    onClick={this.openAnswerPopup.bind(this, rowData)}>답변보기</Button>
                            :
                            <Button size={'sm'} color={'info'}
                                    onClick={this.openAnswerPopup.bind(this, rowData)}>답변하기</Button>
                    }

                </Flex>
            </Cell>
        );
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
        //로그인 체크
        const loginInfo = await getLoginProducerUser();
        if(!loginInfo) {
            this.props.history.push('/producer/webLogin')
        }
        this.search()
        this.setFilter()
    }

    //새로고침 버튼
    onRefreshClick = async () => {
        this.search();
    }

    // 주문조회 (search)
    search = async () => {
        if(this.gridApi) {
            //ag-grid 레이지로딩중 보이기
            this.gridApi.showLoadingOverlay();
        }

        // let { data:serverToday } = await getServerToday();
        // this.serverToday = serverToday;
        const searchInfo = Object.assign({},this.state.search)
        const startDate = searchInfo.startDate ? moment(searchInfo.startDate).format('YYYYMMDD'):null;
        const endDate = searchInfo.endDate ? moment(searchInfo.endDate).format('YYYYMMDD'):null;

        const { status, data } = await getGoodsQnaListByProducerNo({status:this.state.searchFilter.status, startDate:startDate, endDate:endDate});
        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return
        }

        console.log(data);

        this.setState({
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
            // {
            //     value:'all',
            //     label:'전체'
            // },
            {
                value:'ready',
                label:'미응답'
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

    //검색 버튼
    onFilterSearchClick = async () => {
        // filter값 적용해서 검색하기
        await this.search();
    }

    onStatusChange = (e) => {
        const filter = Object.assign({}, this.state.searchFilter)

        filter.status = e.target.value;
        this.setState({
            searchFilter: filter
        })
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

    copy = ({value}) => {
        ComUtil.copyTextToClipboard(value, '', '');
    }

    onDatesChange = async (data) => {
        await this.setState({
            search: {
                startDate: data.startDate,
                endDate: data.endDate,
                selectedGubun: data.gubun
            }
        });
    }

    render() {
        const state = this.state
        return(
            <Fragment>
                <FormGroup>
                    <div className='border p-3'>
                        <div className='pt-1 pb-1'>
                            <div className='pb-3 d-flex'>
                                <Div>
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
                            <hr className='p-0 m-0' />
                            <div className='pt-3 d-flex'>
                                <div className='d-flex'>
                                    <div className='d-flex align-items-center'>
                                        <div className='textBoldLarge' fontSize={'small'}>상태 &nbsp;&nbsp; | </div>
                                        <div className='pl-3 align-items-center'>
                                            {
                                                state.filterItems.statusItems.map(item => <>
                                                <input type="radio" id={'orderStatus'+item.value} name="orderStatus" value={item.value} checked={item.value === state.searchFilter.status} onChange={this.onStatusChange} />
                                                <label for={'orderStatus'+item.value} className='pl-1 mr-3 mb-0 pb-0' fontSize={'small'}>{item.label}</label>
                                                </>)
                                            }
                                        </div>
                                    </div>
                                </div>
                                <div className='ml-auto d-flex'>
                                    <Button color={'info'} size={'sm'} onClick={this.onFilterSearchClick}>
                                        <span fontSize={'small'}>검색</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </FormGroup>

                <div className="d-flex pt-3 pb-1">
                    <div className="">
                        총 {this.state.totalListCnt} 개
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
                <ModalWithNav show={this.state.isAnswerModalOpen} title={this.titleOpenAnswerPopup} onClose={this.onAnswerPopupClose} nopadding={true}>
                    <Div className='p-0' style={{width: '100%', minHeight: '400px', maxHeight:'600px'}} overflow={'auto'}>
                        <GoodsQnaAnswer goodsQnaNo={this.state.goodsQnaNo} onClose={this.onAnswerPopupClose} />
                    </Div>
                </ModalWithNav>
            </Fragment>
        );
    }
}