import React, { Component } from 'react';
import { Button} from 'reactstrap'
import ComUtil from '~/util/ComUtil'
import { getLoginAdminUser } from '~/lib/loginApi'
import { getTimeSaleAdminList, delTimeSale } from '~/lib/adminApi'
import moment from 'moment-timezone'
import { ModalConfirm,  AdminModalWithNav } from '~/components/common'
import { B2cTimeSaleReg } from '~/components/admin/b2cTimeSale'
import TimeSaleRenderer from './TimeSaleRenderer';
import { AgGridReact } from 'ag-grid-react';
import { Cell } from '~/components/common'
import { Server } from '../../Properties'

import DatePicker from "react-datepicker";
import "react-datepicker/src/stylesheets/datepicker.scss";
import {Div, Flex, Right, Space, Span} from "~/styledComponents/shared";
import {MenuButton} from "~/styledComponents/shared/AdminLayouts";

export default class B2cTimeSaleList extends Component{
    constructor(props) {
        super(props);
        this.gridRef = React.createRef();
        this.state = {
            search: {
                year:moment().format('YYYY')
            },
            data: [],
            columnDefs: [
                {
                    headerName: "포텐타임 시작일", field: "timeSaleStart", sort:"desc",
                    suppressSizeToFit: true,
                    cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                    width: 180,
                    cellRenderer: "formatDatesRenderer",
                    valueGetter: function(params) {
                        //console.log("params",params);
                        //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                        let v_Date = params.data.timeSaleStart ? ComUtil.utcToString(params.data.timeSaleStart, 'YYYY-MM-DD HH:mm') : null;
                        return v_Date;
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
                {
                    headerName: "포텐타임 종료일", field: "timeSaleEnd",
                    suppressSizeToFit: true,
                    cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                    width: 180,
                    cellRenderer: "formatDatesRenderer",
                    valueGetter: function(params) {
                        //console.log("params",params);
                        //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                        let v_Date = params.data.timeSaleEnd ? ComUtil.utcToString(params.data.timeSaleEnd, 'YYYY-MM-DD HH:mm') : null;
                        return v_Date;
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
                {
                    headerName: "생산자No", field: "producerNo",
                    cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                    width: 80
                },
                {
                    headerName: "생산자명", field: "producerFarmNm",
                    cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                    width: 100
                },
                {
                    headerName: "상품이미지",
                    field: "goodsImages",
                    suppressFilter: true,   //no filter
                    suppressSorting: true,  //no sort
                    cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                    cellRenderer:"goodsImageRenderer",
                    width: 120
                },
                {
                    headerName: "상품No", field: "goodsNo",
                    cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                    width: 80
                },
                {
                    headerName: "상품명",
                    field: "googNm",
                    suppressSizeToFit: true,
                    filterParams: {
                        clearButton: true //클리어버튼
                    },
                    cellStyle:ComUtil.getCellStyle({cellAlign: 'left'}),
                    cellRenderer: "titleRenderer",
                    width: 250
                },
                {
                    headerName: "우선순위", field: "timeSalePriority",
                    cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                    width: 80
                },
                {
                    headerName: "소비자가",
                    field: "timeSaleConsumerPrice",
                    suppressSizeToFit: true,
                    filterParams: {
                        clearButton: true //클리어버튼
                    },
                    cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                    cellRenderer: "timeSaleConsumerPriceRenderer",
                    width: 100
                },
                {
                    headerName: "판매가",
                    field: "timeSaleCurrentPrice",
                    suppressSizeToFit: true,
                    filterParams: {
                        clearButton: true //클리어버튼
                    },
                    cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                    cellRenderer: "timeSaleCurrentPriceRenderer",
                    width: 100
                },
                {
                    headerName: "정산가", field: "currentPrice",
                    cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                    cellRenderer: "settlementPriceRenderer",
                    width: 100
                },
                {
                    headerName: "포텐타임가",
                    field: "timeSalePrice",
                    suppressSizeToFit: true,
                    filterParams: {
                        clearButton: true //클리어버튼
                    },
                    cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                    cellRenderer: "TimeSaleRenderer",
                    width: 100
                },
                {
                    headerName: "상태", field: "status",
                    //suppressFilter: true,   //no filter
                    //suppressSorting: true,  //no sort
                    suppressSizeToFit: true,
                    cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                    width: 150,
                    cellRenderer: "timeSaleStateRenderer",
                    filterParams: {
                        clearButton: true //클리어버튼
                    },
                    valueGetter: function(params) {
                        return B2cTimeSaleList.getTimeSaleStateNm(params.data)
                    }
                },
                {
                    headerName: "비고",
                    suppressFilter: true,   //no filter
                    suppressSorting: true,  //no sort
                    cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                    width: 150,
                    cellRenderer: "delButtonRenderer"
                },
            ],
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
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
            components: {
                formatDateRenderer: this.formatDateRenderer,
                formatDatesRenderer: this.formatDatesRenderer
            },
            frameworkComponents: {
                goodsImageRenderer: this.goodsImageRenderer,
                titleRenderer:this.titleRenderer,
                timeSaleConsumerPriceRenderer:this.timeSaleConsumerPriceRenderer,
                timeSaleCurrentPriceRenderer:this.timeSaleCurrentPriceRenderer,
                settlementPriceRenderer:this.settlementPriceRenderer,
                supportPriceRenderer:this.supportPriceRenderer,
                TimeSaleRenderer:TimeSaleRenderer,
                timeSaleStateRenderer:this.timeSaleStateRenderer,
                delButtonRenderer:this.delButtonRenderer
            },
            timeSaleGoodsNo:"",
            timeSaleModalTitle:"",
            isTimeSaleModalOpen:false

        };
    }

    componentDidMount = async () => {
        let user = await getLoginAdminUser();
        if (!user || user.email.indexOf('ezfarm') < 0) {
            //admin은 웹전용이라서, window로 이동하는 것이 더 잘됨. //this.props.history.push('/admin');
            window.location = '/admin/login';
        }

        //리스트 조회
        this.search();

    };

    //[이벤트] 그리드 로드 후 callback 이벤트
    // onGridReady(params) {
    //     //API init
    //     this.gridApi = params.api;
    //     this.gridColumnApi = params.columnApi;
    // }

    getRowHeight(params) {
        return 50;
    }

    //Ag-Grid Cell 숫자콤마적용 렌더러
    formatCurrencyRenderer = ({value, data:rowData}) => {
        //console.log("rowData",rowData);
        return ComUtil.addCommas(value);
    };
    //Ag-Grid Cell 날짜변환 렌더러
    formatDateRenderer = ({value, data:rowData}) => {
        return (value ? ComUtil.utcToString(value,'YYYY-MM-DD') : '-')
    };
    formatDatesRenderer = ({value, data:rowData}) => {
        return (value ? ComUtil.utcToString(value,'YYYY-MM-DD HH:mm') : '-')
    };

    //상품 이미지 렌더러
    goodsImageRenderer = ({value: images}) => {
        const src = Server.getThumbnailURL() + images[0].imageUrl;
        const Style = {
            width: 75, height: 75, paddingRight: '1px'
        };
        return (<img key={"mainImage0"} src={src} style={Style} alt={'상품 이미지'}/>);
        //
        // return images.map((image,index) => {
        //     const src = Server.getThumbnailURL() + image.imageUrl;
        //     const Style = {
        //         width: 75, height: 75, paddingRight: '1px'
        //     };
        //     return <img key={"mainImage"+index} src={src} style={Style} alt={'상품 이미지'}/>
        // })
    };

    titleRenderer = ({value, data:rowData}) => {
        const stateNm = B2cTimeSaleList.getTimeSaleStateNm(rowData);

        //2022.05 googNm-> 관리자용 goodsEventOptionNm    (예전상품이면 goodsNm, eventFlag상품이면 + eventOptionName.)
        const goodsEventOptionNm = (rowData.eventOptionName && rowData.eventOptionName!==rowData.goodsNm)? rowData.goodsNm + ' [' + rowData.eventOptionName + ']': rowData.goodsNm;
        return (
            <Cell textAlign="left">
                {
                    stateNm=="종료" && (
                        <div style={{color: 'dark'}}>
                            {goodsEventOptionNm}
                        </div>
                    )
                }
                {
                    stateNm!="종료" && (
                        <div onClick={this.regTimeSale.bind(this, rowData.goodsNo)} style={{color: 'blue'}}>
                            <u>{goodsEventOptionNm}</u>
                        </div>
                    )
                }
            </Cell>
        );
    };

    //소비자가
    timeSaleConsumerPriceRenderer = ({value, data:rowData}) => {
        return (
            <span>{ComUtil.addCommas(rowData.consumerPrice)}원</span>
        );
    };

    //판매가
    timeSaleCurrentPriceRenderer = ({value, data:rowData}) => {
        if(rowData.goodsNm === rowData.eventOptionName){
            return (<span>{ComUtil.addCommas(rowData.defaultCurrentPrice)}원({Math.round(rowData.defaultDiscountRate,0)}%)</span>);
        }else{
            return (<span>{ComUtil.addCommas(rowData.eventOptionPrice)}원</span>);
        }
    };

    //정산가
    settlementPriceRenderer = ({value, data:rowData}) => {
        return (
            <span>
                {/*{ComUtil.addCommas(rowData.timeSalePrice * ((100 - rowData.timeSaleFeeRate) / 100) + ComUtil.toNum(rowData.timeSaleSupportPrice))}원*/}
                {ComUtil.addCommas((rowData.timeSalePrice * ((100 - rowData.timeSaleFeeRate) / 100)).toFixed(0))}원
            </span>
        )
    }

    //상태 명칭 가져오기
    static getTimeSaleStateNm = (data) => {

        let nowDate = moment().toDate();
        let nowDateTime = moment(nowDate).format('YYYY-MM-DDTHH:mm');

        let v_timeSaleStartDate = data.timeSaleStart;
        let v_timeSaleStartDateTime = moment(v_timeSaleStartDate).format('YYYY-MM-DDTHH:mm');
        let v_timeSaleEndDate = data.timeSaleEnd;
        let v_timeSaleEndDateTime = moment(v_timeSaleEndDate).format('YYYY-MM-DDTHH:mm');

        let stateNm = "예정";
        if(
            moment(v_timeSaleStartDateTime).format('x') < moment(nowDateTime).format('x') &&
            moment(v_timeSaleEndDateTime).format('x') > moment(nowDateTime).format('x')
        ){
            stateNm = "진행중";
        }
        if(
            moment(v_timeSaleEndDateTime).format('x') < moment(nowDateTime).format('x')
        ){
            stateNm = "종료";
        }
        return stateNm;
    }

    timeSaleStateRenderer = ({value, data:rowData}) => {
        const stateNm = B2cTimeSaleList.getTimeSaleStateNm(rowData);
        return (
            <span>
                {stateNm}
            </span>
        );
    };


    delButtonRenderer = ({value, data:rowData}) => {
        const stateNm = B2cTimeSaleList.getTimeSaleStateNm(rowData);
        return (
            <Cell>
                <div style={{textAlign: 'center'}}>
                    {
                        stateNm != '종료' && (
                            <ModalConfirm title={'포텐타임 삭제'} content={<div>선택한 포텐타임을 삭제하시겠습니까?</div>} onClick={this.onDelTimeSale.bind(this, rowData.goodsNo)}>
                                <Button block size='sm' color={'info'}>삭제</Button>
                            </ModalConfirm>
                        )
                    }
                </div>
            </Cell>
        );
    };


    search = async () => {
        const {api} = this.gridRef.current;
        if (api) {
            //ag-grid 레이지로딩중 보이기
            api.showLoadingOverlay();
        }
        const searchInfo = this.state.search;
        const params = {
            year:searchInfo.year
        };
        const { status, data } = await getTimeSaleAdminList(params);
        //console.log("getTimeSaleListAll==",data)
        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return
        }
        this.setState({
            data: data
        });
        //ag-grid api
        if(api) {
            //ag-grid 레이지로딩중 감추기
            api.hideOverlay()
        }
    };

    onDelTimeSale = async(goodsNo, isConfirmed) => {
        if (isConfirmed) {
            await delTimeSale(goodsNo);
            await this.search();
        }
    };

    regTimeSale = (goodsNo) => {
        let v_goodsNo = null;
        let v_title = "포텐타임 등록";
        if(goodsNo){
            v_title = "포텐타임 수정";
            v_goodsNo = goodsNo;
        }
        this.setState({
            timeSaleGoodsNo:v_goodsNo,
            timeSaleModalTitle:v_title,
            isTimeSaleModalOpen: true
        });
    };

    regMdPickModalToggle=()=>{
        this.setState({
            isTimeSaleModalOpen: !this.state.isTimeSaleModalOpen
        });
    };

    //타임세일 등록(수정) 모달 팝업 닫기
    onTimeSalePopupClose = (data) => {

        this.setState({
            isTimeSaleModalOpen: !this.state.isTimeSaleModalOpen
        });

        if (data && data.refresh) {
            this.search();
        }
    };

    onSearchDateChange = async (date) => {
        //console.log("",date.getFullYear())
        const search = Object.assign({}, this.state.search);
        search.year = date.getFullYear();
        await this.setState({search:search});
        await this.search();
    }

    render() {
        const ExampleCustomDateInput = ({ value, onClick }) => (
            <MenuButton onClick={onClick}>포텐타임 {value} 년</MenuButton>
        );
        return (
            <Div p={16}>

                <Flex mb={10}>
                    <Div>
                        <Space>
                            <MenuButton bg={'green'} onClick={this.regTimeSale.bind(this,'')}>포텐타임 등록</MenuButton>
                            <DatePicker
                                selected={new Date(moment().set('year',this.state.search.year))}
                                onChange={this.onSearchDateChange}
                                showYearPicker
                                dateFormat="yyyy"
                                customInput={<ExampleCustomDateInput />}
                            />
                            <MenuButton onClick={this.search}>검색</MenuButton>
                        </Space>
                    </Div>
                    <Right>
                        <Span fg={'green'} >{this.state.data.length}</Span>개의 포텐타임
                    </Right>
                </Flex>


                <div
                    className="ag-theme-balham"
                    style={{
                        height: '550px'
                    }}
                >
                    <AgGridReact
                        ref={this.gridRef}
                        columnDefs={this.state.columnDefs}  //컬럼 세팅
                        defaultColDef={this.state.defaultColDef}
                        getRowHeight={this.getRowHeight}
                        overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                        overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                        // onGridReady={this.onGridReady.bind(this)}   //그리드 init(최초한번실행)
                        rowData={this.state.data}
                        components={this.state.components}
                        frameworkComponents={this.state.frameworkComponents}
                    >
                    </AgGridReact>

                </div>
                <AdminModalWithNav
                    show={this.state.isTimeSaleModalOpen}
                    title={this.state.timeSaleModalTitle}
                    onClose={this.onTimeSalePopupClose}>
                    <B2cTimeSaleReg
                        timeSaleGoodsNo={this.state.timeSaleGoodsNo}
                    />
                </AdminModalWithNav>
            </Div>
        )
    }
}
