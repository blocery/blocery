import React, { Component } from 'react'
import { Container, Row, Col, Input, Button, Badge } from 'reactstrap'

import { getAllGoodsSaleList, getAllGoodsNotEvent, getAllGoods, getPotenCouponMaster } from '~/lib/adminApi'

import ComUtil from '~/util/ComUtil'

//ag-grid
import { AgGridReact } from 'ag-grid-react';
import {Div, Span} from "~/styledComponents/shared";
// import 'ag-grid-community/dist/styles/ag-grid.css';
// import 'ag-grid-community/dist/styles/ag-theme-balham.css';

class B2cGoodsSelSearch extends Component{
    constructor(props){
        super(props);
        this.state = {
            // region ===== 상품검색용 ag-grid =====
            columnDefs: [
                {
                    headerName: "",
                    suppressFilter: true,   //no filter
                    suppressSorting: true,  //no sort
                    sortable: false,    //sort false
                    cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                    cellRenderer: "goodsSearchRenderer",
                    width:70,
                    pinned: 'left'
                },
                {
                    headerName: "타입", field: "directGoods", width: 80, sort:"desc",
                    cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                    suppressSizeToFit: true,
                    filterParams: {
                        clearButton: true //클리어버튼
                    },
                    valueGetter: function(params) {
                        if (params.data.directGoods) {
                            return '즉시'
                        }else
                            return '예약'
                    }
                },
                {
                    headerName: "상품No", field: "goodsNo", width: 100, sort:"desc",
                    cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                    suppressSizeToFit: true,
                    filterParams: {
                        clearButton: true //클리어버튼
                    }
                },
                {
                    headerName: "생산자No", field: "producerNo", width: 100,
                    cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                    suppressSizeToFit: true,
                    filterParams: {
                        clearButton: true //클리어버튼
                    }
                },
                {
                    headerName: "생산자명", field: "producerFarmNm", width: 150,
                    cellStyle:ComUtil.getCellStyle({cellAlign: 'left'}),
                    suppressSizeToFit: true,
                    filterParams: {
                        clearButton: true //클리어버튼
                    }
                },
                {
                    headerName: "상품명", field: "goodsNm", width: 300,
                    cellStyle:ComUtil.getCellStyle({cellAlign: 'left'}),
                    suppressSizeToFit: true,
                    filterParams: {
                        clearButton: true //클리어버튼
                    }
                },
                {
                    headerName: "가격", field: "currentPrice", width: 100,
                    cellRenderer: "formatCurrencyRenderer",
                    cellStyle:ComUtil.getCellStyle({cellAlign: 'right'}),
                    suppressSizeToFit: true,
                    filterParams: {
                        clearButton: true //클리어버튼
                    }
                },
                // {
                //     headerName: "즉시구매", field: "directGoods", width: 100,
                //     cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                //     suppressSizeToFit: true,
                //     filterParams: {
                //         clearButton: true //클리어버튼
                //     }
                // },
                {
                    headerName: "판매종료일", field: "saleEnd", width: 180,
                    cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                    suppressSizeToFit: true,
                    valueGetter: function(params) {
                        //console.log("params",params);
                        //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                        let v_saleEnd = params.data.saleEnd ? ComUtil.utcToString(params.data.saleEnd, 'YYYY-MM-DD HH:mm:ss ') : null;
                        return v_saleEnd;
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
                            else if (cellDate < filterLocalDate) {
                                return -1;
                            }
                            else if (cellDate > filterLocalDate) {
                                return 1;
                            }
                        },
                        browserDatePicker: true, //달력
                        clearButton: true //클리어버튼
                    }
                },
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
            components: {
                formatCurrencyRenderer: this.formatCurrencyRenderer,
                formatDateRenderer: this.formatDateRenderer,
                formatDatesRenderer: this.formatDatesRenderer
            },
            frameworkComponents: {
                goodsSearchRenderer:this.goodsSearchRenderer
            },
            // rowHeight: 50,
            rowSelection: 'single',
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
            // endregion ===== 상픔검색용 ag-grid =====

            /* region === 상품검색용 === */
            goodSearchType:'sale',
            searchType: 'goodsNm',
            searchKeyword: '',
            goodsTotalCount: '', //상품검색건수
            goodsResults:null,
            /* endregion === 상품검색용 === */

        }
    }

    //  region ===== 상품검색 팝업 메서드 모음 =====

    //[이벤트] 그리드 로드 후 callback 이벤트
    onGridReady(params) {
        //API init
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    }

    async componentDidMount(){
        this.goodsSearchAPIcall();
    }

    //Ag-Grid Cell 숫자콤마적용 렌더러
    formatCurrencyRenderer = ({value, data:rowData}) => {
        //console.log("rowData",rowData);
        return ComUtil.addCommas(value);
    }
    //Ag-Grid Cell 날짜변환 렌더러
    formatDateRenderer = ({value, data:rowData}) => {
        return (value ? ComUtil.utcToString(value,'YYYY-MM-DD') : '-')
    }
    formatDatesRenderer = ({value, data:rowData}) => {
        return (value ? ComUtil.utcToString(value,'YYYY-MM-DD HH:mm') : '-')
    }

    //Ag-Grid Cell 상품 검색 렌더러
    goodsSearchRenderer = ({value, data:rowData}) => {
        let producerNm = rowData.producerNm;
        let producerFarmNm = rowData.producerFarmNm;
        let producerNo = rowData.producerNo;
        let goodsNm = rowData.goodsNm;
        let goodsNo = rowData.goodsNo;
        return (
            <div style={{textAlign:'center'}}>
                <Button size={'sm'} color="secondary" onClick={() => this.goodsSearchSelected(rowData)} style={{cursor:'pointer'}}>선택</Button>
            </div>
        );
    };

    // 상품 검색용 검색 온체인지
    goodsInputSearchHandleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    };

    //필터링 검색용
    filterByValue(array, value) {
        return array.filter((data) =>  JSON.stringify(data).toLowerCase().indexOf(value.toLowerCase()) !== -1);
    }

    onSearch = () => {
        let v_searchType = this.state.searchType;
        let v_searchKeyword = this.state.searchKeyword;
        if(v_searchType === "goodsNo"){
            if(v_searchKeyword === ""){
                alert("검색입력에 상품번호를 입력해 주세요.")
                return
            }
        } else if(v_searchType === "producerNo"){
            if(v_searchKeyword === ""){
                alert("검색입력에 생산자번호를 입력해 주세요")
                return
            }
        }
        this.goodsSearchAPIcall();
    }

    goodsSearchAPIcall = async () => {

        if(this.gridApi) {
            //ag-grid 레이지로딩중 보이기
            this.gridApi.showLoadingOverlay();
        }

        let v_data_list = null;
        let v_goodsSearchType = this.state.goodSearchType;
        let v_searchType = this.state.searchType;
        let v_searchKeyword = this.state.searchKeyword;

        let v_data = null;

        let parmas = {goodsState:"0",searchType:v_searchType,searchKeyword:v_searchKeyword};
        if(v_goodsSearchType === "all") {
            const {status, data} = await getAllGoodsSaleList(parmas);
            v_data = data;
            if (status !== 200) {
                v_data = null;
            }
        } else if(v_goodsSearchType == "sale") {
            const {status, data} = await getAllGoodsNotEvent(parmas);
            v_data = data;
            if (status !== 200) {
                v_data = null;
            }
        }

        if(v_searchKeyword.length > 0){
            v_data_list = this.filterByValue(v_data, v_searchKeyword);
        }else{
            v_data_list = v_data;
        }

        this.setState({
            goodsTotalCount: v_data_list && v_data_list.length ? v_data_list.length:0,
            goodsResults: v_data_list
        });

        //ag-grid api
        if(this.gridApi) {
            //ag-grid 레이지로딩중 감추기
            this.gridApi.hideOverlay();
        }
    };

    goodsSearchSelected = async (row) => {

        // let result = {
        //     producerNo : row.producerNo,
        //     producerNm : row.producerNm,
        //     producerFarmNm : row.producerFarmNm,
        //     goodsNo : row.goodsNo,
        //     goodsNm : row.goodsNm,
        //
        //     consumerPrice: row.consumerPrice,
        //     currentPrice: row.defaultCurrentPrice,
        //     discountRate: row.defaultDiscountRate,
        //     feeRate: row.feeRate,
        //     packCnt: row.packCnt,
        //     remainedCnt: row.remainedCnt,
        // };

        const {data:couponInfo} = await getPotenCouponMaster(row.goodsNo)
        if(couponInfo) {
            row.potenCouponDiscount = couponInfo.potenCouponDiscount
        }

        this.props.onChange(row);

        // this.props.onChange(result);
    };

    onSelectGoodsSearchType = (e) => {
        this.setState({
            goodSearchType:e.target.selectedOptions[0].value
        });
    };

    onSelectSearchType = (e) => {
        this.setState({
            searchType:e.target.selectedOptions[0].value
        });
    };

    //  endregion ===== 상품검색 팝업 메서드 모음 =====

    render(){

        return(
            <Container fluid>
                <Row>
                    <Col xs={9}>
                        <div className="d-flex">
                            <Input type='select'
                                   name='select'
                                   id='goodSearchType'
                                   className="mr-1"
                                   style={{width:'170px'}}
                                   onChange={this.onSelectGoodsSearchType}>
                                <option name='radio_sale' value='sale' selected={ this.state.goodSearchType  === 'sale' }>이벤트제외한 상품</option>
                                <option name='radio_all' value='all' selected={ this.state.goodSearchType === 'all' }>전체상품</option>
                            </Input>
                            <Input type='select'
                                   name='searchType'
                                   id='searchType'
                                   className="mr-1"
                                   style={{width:'120px'}}
                                   onChange={this.onSelectSearchType}>
                                <option name='radio_search_goodsNm' value='goodsNm' selected={ this.state.searchType  === 'goodsNm' }>상품명</option>
                                <option name='radio_search_goodsNo' value='goodsNo' selected={ this.state.searchType === 'goodsNo' }>상품번호</option>
                                <option name='radio_search_producerNo' value='producerNo' selected={ this.state.searchType === 'producerNo' }>생산자번호</option>
                            </Input>
                            <Input name="searchKeyword" type="text"
                                   placeholder="검색어 입력"
                                   onChange={this.goodsInputSearchHandleChange}/>
                        </div>
                    </Col>
                    <Col xs={3}>
                        {' '}<Button block outline color="secondary" onClick={this.onSearch}>검색</Button>
                    </Col>
                </Row>
                <p/>
                <Row>
                    <Col xs={12}>
                        {
                            this.state.goodSearchType === 'sale' &&
                                <Div fg={'danger'}> 상품등록화면에서 event전용옵션이 설정되어야 검색됩니다.</Div>
                        }
                        <small className="text-muted">검색결과 : <Badge color={'warning'}>{this.state.goodsTotalCount}</Badge> 건{this.state.goodsTotalCount >100 && '(100건 초과 - 필요시 재검색 요망)'}</small>
                        <div
                            id="myGrid"
                            className={"ag-theme-balham"}
                            style={{height:"400px"}}
                        >
                            <AgGridReact
                                // enableSorting={true}                //정렬 여부
                                // enableFilter={true}                 //필터링 여부
                                floatingFilter={true}               //Header 플로팅 필터 여부
                                columnDefs={this.state.columnDefs}  //컬럼 세팅
                                defaultColDef={this.state.defaultColDef}
                                rowSelection={false}  //멀티체크 가능 여부
                                rowHeight={this.state.rowHeight}
                                // enableColResize={true}              //컬럼 크기 조정
                                overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                                overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                                onGridReady={this.onGridReady.bind(this)}   //그리드 init(최초한번실행)
                                rowData={this.state.goodsResults}
                                components={this.state.components}  //custom renderer 지정, 물론 정해져있는 api도 있음
                                frameworkComponents={this.state.frameworkComponents}
                                suppressMovableColumns={true} //헤더고정시키
                            >
                            </AgGridReact>
                        </div>
                    </Col>
                </Row>
            </Container>
        )
    }
}
B2cGoodsSelSearch.propTypes = {
}
B2cGoodsSelSearch.defaultProps = {
}
export default B2cGoodsSelSearch
