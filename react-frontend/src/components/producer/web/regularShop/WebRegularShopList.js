import React, { Component, PropTypes, Fragment } from 'react';
import { Button, FormGroup } from 'reactstrap'
import ComUtil from '~/util/ComUtil'
import { getProducer, getRegularShopListByProducerNo } from '~/lib/producerApi'
import { getLoginUser, getLoginUserType } from '~/lib/loginApi'
import { getServerToday } from '~/lib/commonApi'
import { Webview } from '~/lib/webviewApi'
import { Refresh } from '@material-ui/icons'
import classNames from 'classnames';
import Style from './WebRegularShopList.module.scss'
//ag-grid
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

export default class WebRegularShopList extends Component {
    constructor(props) {
        super(props);
        this.serverToday=null;
        this.rowHeight=50;
        this.state = {
            data: null,
            columnDefs: this.getColumnDefs(),
            defaultColDef: {
                width: 100,
                resizable: true
            },
            components: {
                formatCurrencyRenderer: this.formatCurrencyRenderer,
                formatDateRenderer: this.formatDateRenderer
            },
            frameworkComponents: {
                //goodsQnaStatRenderer: this.goodsQnaStatRenderer,
                //goodsQnaMobileRenderer: this.goodsQnaMobileRenderer
            },
            rowSelection: 'single',
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',

            totalListCnt:0,
            totalCountOrder: 0,
            totalOrderPrice: 0
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
            {
                headerName: "이름", field: "consumerName",
                width: 120,
                cellStyle:this.getCellStyle,
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            {
                headerName: "이메일아이디", field: "consumerEmail",
                width: 200,
                cellStyle:this.getCellStyle,
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            {
                headerName: "휴대전화번호", field: "consumerPhone",
                width: 200,
                cellStyle:this.getCellStyle,
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            {
                headerName: "단골 등록일", field: "shopRegDate",
                suppressSizeToFit: true,
                width: 200,
                cellStyle:this.getCellStyle,
                filterParams: {
                    clearButton: true //클리어버튼
                },
                valueGetter: function(params) {
                    //console.log("params",params);
                    //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                    return ComUtil.utcToString(params.data.shopRegDate,'YYYY-MM-DD HH:MM');
                }
            },
            {
                headerName: "구매건수", field: "consumerBuyCnt",
                width: 100,
                cellStyle:this.getCellStyle({cellAlign: 'right'}),
                cellRenderer: 'formatCurrencyRenderer',
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            {
                headerName: "구매금액", field: "consumerBuyAmt",
                width: 150,
                cellStyle:this.getCellStyle({cellAlign: 'right'}),
                cellRenderer: 'formatCurrencyRenderer',
                filterParams: {
                    clearButton: true //클리어버튼
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
        const {data: userType} = await getLoginUserType();
        //console.log('userType',this.props.history)
        if(userType == 'consumer') {
            //소비자용 메인페이지로 자동이동.
            Webview.movePage('/home/1');
        } else if (userType == 'producer') {
            let loginUser = await getProducer();
            if(!loginUser){
                this.props.history.push('/producer/webLogin')
            }
        } else {
            this.props.history.push('/producer/webLogin')
        }

        //로그인정보
        const loginUser = await getLoginUser();
        this.setState({
            producerNo: loginUser.uniqueNo
        });

        this.search()
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

        let { data:serverToday } = await getServerToday();
        this.serverToday = serverToday;

        let dataParams = {
            producerNo:this.state.producerNo
        };
        const { status, data } = await getRegularShopListByProducerNo(dataParams.producerNo);
        //console.log(status);
        console.log(data);
        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return
        }

        let totalCountOrder = 0;
        let totalOrderPrice = 0;
        data.map(item => {
            totalCountOrder = totalCountOrder + item.consumerBuyCnt;
            totalOrderPrice = totalOrderPrice + item.consumerBuyAmt;
        })


        this.setState({
            data: data,
            totalListCnt: data.length,
            columnDefs: this.getColumnDefs(),
            totalCountOrder: totalCountOrder,
            totalOrderPrice: totalOrderPrice
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

    render() {
        return(
            <Fragment>
                <FormGroup>
                    <div className='border p-3'>
                        <div className='d-flex text-secondary small'>
                            <span className='ml-2'>총 단골수</span>
                            <span className='ml-2'>{this.state.totalListCnt} 명</span>
                            <span className='ml-4'>|</span>
                            <span className='ml-4'>총 구매건수 </span>
                            <span className='ml-2'>{ComUtil.addCommas(this.state.totalCountOrder)} 건</span>
                            <span className='ml-4'>|</span>
                            <span className='ml-4'>총 구매금액 </span>
                            <span className='ml-2'>{ComUtil.addCommas(this.state.totalOrderPrice)} 원</span>
                        </div>
                    </div>
                </FormGroup>

                <div className='p-2 d-flex align-items-center'>
                    <div> 총 {this.state.totalListCnt} 개 </div>
                    <div className="flex-grow-1 text-right">
                        <Button color={'info'} size={'sm'} onClick={this.onRefreshClick}>
                            <div className="d-flex">
                                <Refresh fontSize={'small'}/>새로고침
                            </div>
                        </Button>
                    </div>
                </div>
                <div
                    id="myGrid"
                    className={classNames('ag-theme-balham',Style.agGridDivCalc)}
                >
                    <AgGridReact
                        enableSorting={true}                //정렬 여부
                        enableFilter={true}                 //필터링 여부
                        floatingFilter={true}               //Header 플로팅 필터 여부
                        columnDefs={this.state.columnDefs}  //컬럼 세팅
                        defaultColDef={this.state.defaultColDef}
                        rowSelection={this.state.rowSelection}  //멀티체크 가능 여부
                        rowHeight={this.rowHeight}
                        //gridAutoHeight={true}
                        //domLayout={'autoHeight'}
                        enableColResize={true}              //컬럼 크기 조정
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
            </Fragment>
        );
    }
}