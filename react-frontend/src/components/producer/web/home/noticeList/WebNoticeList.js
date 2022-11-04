import React, { Component, Fragment } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import {MdRefresh} from "react-icons/md";

import { getServerToday } from '~/lib/commonApi'
import ComUtil from '~/util/ComUtil'

import { getLoginProducerUser } from '~/lib/loginApi'
import { getNoticeList } from '~/lib/shopApi'
import { NoticeTemplate } from '~/components/common/templates'

//ag-grid
import { AgGridReact } from 'ag-grid-react';
import {Cell} from "~/components/common";

export default class WebNoticeList extends Component{
    constructor(props) {
        super(props);
        this.serverToday=null;
        this.rowHeight=50;
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
                titleRenderer: this.titleRenderer,
                typeRenderer: this.typeRenderer
            },
            rowSelection: 'single',
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',

            totalListCnt:0,
            notice: '',
            modal: false
        }
    }

    //[이벤트] 그리드 로드 후 callback 이벤트
    onGridReady(params) {
        //API init
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        //console.log("onGridReady");

        this.gridApi.resetRowHeights();
    }

    // Ag-Grid column Info
    getColumnDefs () {

        let columnDefs = [];

        columnDefs = [
            {
                headerName: "No.",
                width: 100,
                cellStyle:this.getCellStyle,
                filterParams: {
                    clearButton: true //클리어버튼
                },
                valueGetter: function(params) {
                    let rowNo = params.node.rowIndex + 1;
                    return rowNo;
                }
            },
            {headerName: "공지유형", field: "noticeType", cellStyle:this.getCellStyle({'cellAlign':'center'}), cellRenderer: "typeRenderer"},
            {
                headerName: "제목", field: "title",
                width: 500,
                cellStyle:this.getCellStyle,
                cellRenderer: "titleRenderer",
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            {
                headerName: "작성일", field: "regDate",
                suppressSizeToFit: true,
                width: 200,
                cellStyle:this.getCellStyle,
                filterParams: {
                    clearButton: true //클리어버튼
                },
                valueGetter: function(params) {
                    //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                    return ComUtil.utcToString(params.data.regDate,'YYYY-MM-DD HH:mm');
                }
            }
        ];

        return columnDefs
    }

    // Ag-Grid Cell 스타일 기본 적용 함수
    getCellStyle ({cellAlign,color,textDecoration,whiteSpace}){
        if(cellAlign === 'left') cellAlign='flex-start';
        else if(cellAlign === 'center') cellAlign='center';
        else if(cellAlign === 'right') cellAlign='flex-end';
        else cellAlign='flex-start';
        return {
            display: "flex",
            alignItems: "center",
            justifyContent: cellAlign,
            color: color,
            textDecoration: textDecoration,
            whiteSpace: whiteSpace
        }
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
    //Ag-Grid Cell 제목 렌더러
    titleRenderer = ({value, data:rowData}) => {
        return (<span className='text-primary' a href="#" onClick={this.onTitleClick.bind(this, rowData)}><u>{rowData.title}</u></span>);
    }
    typeRenderer = ({value, data:rowData}) => {
        return (
            <Cell textAlign="left">
                <div>
                    {rowData.noticeType === 'event' ? '이벤트' :
                        rowData.noticeType === 'check' ?  '점검' :
                            rowData.noticeType === 'etc' ? '기타' : '공지'
                    }
                </div>
            </Cell>
        )
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

    onTitleClick = (data) => {
        this.setState({
            modal: !this.state.modal,
            notice: data
        })
    }


    async componentDidMount() {
        //로그인 체크
        const loginUser = await getLoginProducerUser();
        if(!loginUser){
            this.props.history.push('/producer/webLogin')
        }
        //로그인정보
        this.setState({
            producerNo: loginUser.uniqueNo
        });

        this.search();
    }

    //새로고침 버튼
    onRefreshClick = async () => {
        this.search();
    }

    // 공지사항조회
    search = async () => {
        if(this.gridApi) {
            //ag-grid 레이지로딩중 보이기
            this.gridApi.showLoadingOverlay();
        }

        let { data:serverToday } = await getServerToday();
        this.serverToday = serverToday;

        let dataParams = {
            producerNo:this.state.producerNo
        };
        let params = {userType: 'producer', isPaging: true, limit: 100, page: 1}
        const {status, data} = await getNoticeList(params)
        console.log(data);
        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return
        }
        ComUtil.sortDate(data.noticeList, 'regDate', true);
        this.setState({
            data: data.noticeList,
            totalListCnt: data.totalCount,
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

    modalToggle = () => {
        this.setState(prevState => ({
            modal: !prevState.modal
        }));
    };

    render() {
        return(
            <Fragment>

                <div className='p-2 d-flex align-items-center'>
                    <div> 총 {this.state.totalListCnt} 개 </div>
                    <div className="flex-grow-1 text-right">
                        <Button color={'info'} size={'sm'} onClick={this.onRefreshClick}>
                            <div className="d-flex">
                                <MdRefresh/>새로고침
                            </div>
                        </Button>
                    </div>
                </div>
                <div
                    id="myGrid"
                    className="ag-theme-balham"
                    style={{height:"calc(100vh - 180px)"}}
                >
                    <AgGridReact
                        // enableSorting={true}                //정렬 여부
                        // enableFilter={true}                 //필터링 여부
                        floatingFilter={true}               //Header 플로팅 필터 여부
                        columnDefs={this.state.columnDefs}  //컬럼 세팅
                        defaultColDef={this.state.defaultColDef}
                        rowSelection={this.state.rowSelection}  //멀티체크 가능 여부
                        rowHeight={this.rowHeight}
                        //gridAutoHeight={true}
                        //domLayout={'autoHeight'}
                        // enableColResize={true}              //컬럼 크기 조정
                        overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                        overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                        onGridReady={this.onGridReady.bind(this)}   //그리드 init(최초한번실행)
                        rowData={this.state.data}
                        components={this.state.components}  //custom renderer 지정, 물론 정해져있는 api도 있음
                        frameworkComponents={this.state.frameworkComponents}
                        suppressMovableColumns={true} //헤더고정시키
                        onFilterChanged={this.onGridFilterChanged.bind(this)} //필터온체인지 이벤트
                        // onRowClicked={this.onSelectionChanged.bind(this)}
                        // onRowSelected={this.onRowSelected.bind(this)}
                        // onSelectionChanged={this.onSelectionChanged.bind(this)}
                        // suppressRowClickSelection={true}    //true : 셀 클릭시 체크박스 체크 안됨, false : 셀 클릭시 로우 단위로 선택되어 체크박스도 자동 체크됨 [default 값은 false]
                    >
                    </AgGridReact>
                </div>

                {/* 공지 내용 확인 모달 */}
                <Modal size={'xl'} isOpen={this.state.modal} toggle={this.modalToggle} centered>
                    <ModalHeader toggle={this.modalToggle}>공지사항</ModalHeader>
                    <ModalBody>
                        <NoticeTemplate {...this.state.notice}/>
                    </ModalBody>
                    <ModalFooter>
                        <Button size='sm' color='secondary' onClick={this.modalToggle}>확인</Button>
                    </ModalFooter>
                </Modal>
            </Fragment>
        );
    }
}