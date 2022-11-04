import React, { Component, Fragment } from 'react'
import {FormGroup, Button, Input, Table} from 'reactstrap'
import { getPaymentLocalProducerFee } from '~/lib/producerApi'
import { getLoginProducerUser } from "~/lib/loginApi";
import ComUtil from '~/util/ComUtil'
import { ExcelDownload } from '~/components/common'
import {Flex, Div, Span, Space, Right} from "~/styledComponents/shared";
import moment from 'moment-timezone'
import {localReplaceText, localReplaceMinusFlag} from "~/util/bzLogic";
import styled from "styled-components";
import {color} from "~/styledComponents/Properties";

//ag-grid
import { AgGridReact } from 'ag-grid-react';
import SearchDates from "~/components/common/search/SearchDates";
import MathUtil from "~/util/MathUtil";
import ExcelUtil from "~/util/ExcelUtil";
import {MenuButton} from "~/styledComponents/shared/AdminLayouts";
const isLocalFoodAdjDeliveryChk = (data) => {
    if(data.producerNo == 157){
        return true;
    }
    return false;
}


const StyledTable = styled.table`
    border: 1px solid ${color.light};

    & tr:first-child {
        background-color: ${color.veryLight};
        color: ${color.darkBlack};
    }

    & tr {
        border-bottom: 1px solid ${color.light};
    }

    & th {
        padding: 8px;
        text-align: center;
        border-right: 1px solid ${color.light};
    }

    & td {
        background-color: ${color.white};
        padding: 10px 20px;
        text-align: center;
        vertical-align: middle;
        border-right: 1px solid ${color.light};
    }
`

export default class WebCalculate157Fee extends Component {
    constructor(props) {
        super(props);
        this.summaryGridRef = React.createRef();
        this.gridRef = React.createRef();
        this.state = {
            btnSearchLoading: false,
            loginUser: null,
            isSearchDataExist:false,
            search: {
                selectedGubun: '', //'week': 최초화면을 오늘(day)또는 1주일(week)로 설정.
                startDate: moment(moment().toDate()).add(-7,"days"),
                endDate: moment(moment().toDate()).add(-1,"days"),
                isConsumerOk: 'N',
            },
            selectedRows: [],
            tipOpen: false,
            dataOrigin: null,
            summaryData: [],
            data: null,
            excelData: {
                columns: [],
                data: []
            },
            excelDtlData: {
                columns: [],
                data: []
            },
            totalData:{
                totalSumConsumerGoodsPrice:0,
                totalSumGoodsPrice:0,
                totalSumTotalFeeRateMoney:0,
                totalSumDeliveryFee:0,
                totalSumSupportPrice:0,
                totalSumSimplePayoutAmount:0,
            },
            columnSummaryDefs: [
                {headerName: "농가번호", field: "sumLocalFarmerNo", width: 110},
                {headerName: "농가명", field: "sumLocalFarmerNm", width: 200},
                {headerName: "판매건수", field: "orderCount", width: 100},
                {headerName: '판매금액',width: 150, field: 'sumConsumerGoodsPrice', cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}},
                {headerName: '판매수수료',width: 130, field: 'sumTotalFeeRateMoney', cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}},
                {headerName: '수수료(%)',width: 130, field: 'localFarmerFeeRate', filterParams:{clearButton: true}},
                {headerName: '정산금액',width: 150, field: 'sumSimplePayoutAmount', cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}},
                {headerName: '입금은행',width: 150, field: 'bankName', filterParams:{clearButton: true},
                    valueGetter: function(params) {
                        return params.data.bankName ? params.data.bankName : '-';}
                    },
                {headerName: '계좌번호',width: 150, field: 'acntNo', filterParams:{clearButton: true},
                    valueGetter: function(params) {
                        return params.data.acntNo ? params.data.acntNo : '-';}
                },
                {headerName: '예금주',width: 150, field: 'acntName', filterParams:{clearButton: true},
                    valueGetter: function(params) {
                        return params.data.acntName ? params.data.acntName : '-';}
                }
            ],
            columnDefs: [
                {
                    headerName: '주문일',width: 140, field: 'orderDate', filterParams:{clearButton: true},
                    valueGetter: function(params) {
                        return ComUtil.utcToString(params.data.orderDate,'YYYY-MM-DD HH:mm');
                    }
                },
                {
                    headerName: '확정일',width: 140, field: 'consumerOkDate', filterParams:{clearButton: true},
                    valueGetter: function(params) {
                        return ComUtil.utcToString(params.data.consumerOkDate,'YYYY-MM-DD HH:mm');
                    }
                },
                {headerName: '주문번호',width: 100, field: 'orderSeq', filterParams:{clearButton: true}},
                {headerName: '주문자',width: 120, field: 'consumerNm', filterParams:{clearButton: true}},
                {
                    headerName: '구분', width: 90, field: 'consumerNm', filterParams:{clearButton: true},
                    valueGetter: function(params) {
                        return localReplaceText(params.data)
                    }
                },
                // {headerName: '로컬농가No',width: 120, field: 'localfoodFarmerNo', cellStyle:{"textAlign":"left", 'background-color': '#f1fff1'}, filterParams:{clearButton: true}},
                {headerName: '로컬농가No',width: 100, field: 'localFarmerNo', filterParams:{clearButton: true}},
                {headerName: '로컬농가',width: 130, field: 'localFarmName', filterParams:{clearButton: true}},
                {headerName: '상품번호',width: 90, field: 'goodsNo', filterParams:{clearButton: true}},
                {headerName: '품목',width: 250, field: 'goodsNm', filterParams:{clearButton: true}},
                {
                    headerName: '환불여부',width: 110, field: 'refundFlag', filterParams:{clearButton: true},
                    valueGetter: function(params) {
                        return params.data.refundFlag? "환불" : (params.data.partialRefundCount > 0 ? `(+부분환불 ${params.data.partialRefundCount}건)` : "-");
                    }
                },
                {
                    headerName: '판매금액',width: 110, field: 'totalGoodsPrice', cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true},
                },
                {headerName: '판매수수료',width: 100, field: 'localFeeAmount', cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}},
                {headerName: '수수료(%)',width: 100, field: 'localFarmerFeeRate', filterParams:{clearButton: true}},
                {
                    headerName: '정산금액',
                    width: 110, field: 'localPayoutAmount', cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true},
                },
            ],
            defaultColDef: {
                width: 130,
                resizable: true,
                filter: true,
                sortable: true,
                floatingFilter: false,
                filterParams: {
                    newRowsAction: 'keep'
                }
            },
            frameworkComponents: {
                // checkModifyRenderer: this.checkModifyRenderer,
            },
            components: {
                formatCurrencyRenderer: this.formatCurrencyRenderer,
            },
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 정산 내역이 없습니다.</span>',
        }
    }

    async componentDidMount() {
        await this.getUser();

        const {api:summaryGridApi} = this.summaryGridRef.current;
        if(summaryGridApi) {
            //ag-grid 레이지로딩중 감추기
            summaryGridApi.hideOverlay()
        }
    }

    getUser = async() => {
        //로그인 체크
        const loginUser = await getLoginProducerUser();
        if(!loginUser) {
            this.props.history.push('/producer/webLogin')
        }
        this.setState({
            loginUser: loginUser
        })
    }

    formatCurrencyRenderer = ({value, data:rowData}) => {
        return ComUtil.addCommas(value);
    }

    //[이벤트] 그리드 로드 후 callback 이벤트
    onSummaryGridReady(e) {
        //API init
        this.summaryGridApi = e.api;
        //this.summeryGridColumnApi = params.columnApi;
    }

    //[이벤트] 그리드 로드 후 callback 이벤트
    onGridReady(params) {
        //API init
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    }

    makeTitleText = () => {
        return "샵블리 " + this.makeMonthText();
    }

    makeMonthText = () => {
        const title = moment(this.state.search.startDate).format("YYMMDD")+"_"+moment(this.state.search.endDate).format("YYMMDD")+"내역";
        return title;
    }

    onRefreshClick = async() => {
        const startDate = moment(this.state.search.startDate);
        const endDate = moment(this.state.search.endDate);
        const daysCnt = endDate.diff(startDate, 'days');
        if(daysCnt > 31){
            alert("31일 이상으로 검색을 하실 수 없습니다. 한달안으로 검색조건을 변경하세요.")
            return;
        }
        this.search();
    }

    search = async() => {
        const {api:summaryGridApi} = this.summaryGridRef.current;
        if (summaryGridApi) {
            //ag-grid 레이지로딩중 보이기
            summaryGridApi.showLoadingOverlay();
        }
        this.setState({btnSearchLoading: true})
        const startDate = this.state.search.startDate ?  moment(this.state.search.startDate).format("YYYYMMDD"):null;
        const endDate = this.state.search.endDate ?  moment(this.state.search.endDate).format("YYYYMMDD"):null;

        let {data:dataRaw} = await getPaymentLocalProducerFee(startDate, endDate);
        console.log(dataRaw);
        const data = dataRaw.filter(item => !localReplaceMinusFlag(item));    // -전표, -대체 숨기기
        let isSearchDataExist = data.length > 0;
        const list = data;
        const localfoodFarmerListObj = [];
        const localfoodFarmerSumObj = [];


        // 농가번호로 키 생성
        list.map(item => {
            const key = item.localfoodFarmerNo;
            if(!localfoodFarmerListObj[key])
                localfoodFarmerListObj[key] = []

            localfoodFarmerListObj[key] = localfoodFarmerListObj[key].concat(item)
        });

        //console.log("localfoodFarmerListObj",localfoodFarmerListObj)

        let totalSumConsumerGoodsPrice = 0;
        let totalSumGoodsPrice = 0;
        let totalSumTotalFeeRateMoney = 0;
        let totalSumSupportPrice = 0;
        let totalSumSimplePayoutAmount = 0;

        Object.keys(localfoodFarmerListObj).map(localfoodFarmerkey => {
            let localFarmerNo = "";
            let localFarmerNm = "";
            const list = localfoodFarmerListObj[localfoodFarmerkey];
            let sumConsumerGoodsPrice = 0;
            let sumTotalGoodsPrice = 0;
            let sumTotalFeeRateMoney = 0;
            let sumTotalSupportPrice = 0;
            let sumSimplePayoutAmount = 0;
            let orderCount = 0;
            list.map(itemOD => {
                // localFarmerNo = itemOD.localfoodFarmerNo;
                localFarmerNo = itemOD.localFarmerNo; //2209 바코드로 수정.
                localFarmerNm = itemOD.localFarmName;
                let consumerGoodsPrice = itemOD.totalGoodsPrice; // + itemOD.adminDeliveryFee;

                sumConsumerGoodsPrice = sumConsumerGoodsPrice + consumerGoodsPrice;
                sumTotalGoodsPrice = sumTotalGoodsPrice + itemOD.totalGoodsPrice;
                // 포텐타임의 경우에만 더해야함.
                if(itemOD.timeSaleGoods) {
                    sumTotalSupportPrice = sumTotalSupportPrice + MathUtil.roundHalf(MathUtil.multipliedBy(itemOD.usedCouponBlyAmount,itemOD.orderBlctExchangeRate));
                }
                sumTotalFeeRateMoney = sumTotalFeeRateMoney + itemOD.localFeeAmount;
                sumSimplePayoutAmount = sumSimplePayoutAmount + itemOD.localPayoutAmount;

                orderCount++;

            })
            /*
            summaryTotalSupportPrice:0,
            summaryTotalFeeRateMoney:0,
            summarySimplePayoutAmount:0,
            * */
            totalSumConsumerGoodsPrice = totalSumConsumerGoodsPrice + sumConsumerGoodsPrice;
            totalSumGoodsPrice = totalSumGoodsPrice + sumTotalGoodsPrice;
            totalSumTotalFeeRateMoney = totalSumTotalFeeRateMoney + sumTotalFeeRateMoney;
            totalSumSupportPrice = totalSumSupportPrice + sumTotalSupportPrice;
            totalSumSimplePayoutAmount = totalSumSimplePayoutAmount + sumSimplePayoutAmount;

            const itemData = {
                sumLocalFarmerNo:localFarmerNo,
                sumLocalFarmerNm:localFarmerNm,
                sumConsumerGoodsPrice:sumConsumerGoodsPrice,
                sumTotalGoodsPrice:sumTotalGoodsPrice,
                sumTotalSupportPrice:sumTotalSupportPrice,
                sumTotalFeeRateMoney:sumTotalFeeRateMoney,
                sumSimplePayoutAmount:sumSimplePayoutAmount,
                orderCount: orderCount,
                acntNo: list[0].acntNo,
                bankName: list[0].bankName,
                acntName: list[0].acntName,
                localFarmerFeeRate: list[0].localFarmerFeeRate
            }
            localfoodFarmerSumObj.push(itemData)
        });
        //console.log("localfoodFarmerSumObj",localfoodFarmerSumObj)
        this.setState({
            btnSearchLoading: false,
            isSearchDataExist: isSearchDataExist,
            totalData: {
                totalSumConsumerGoodsPrice,
                totalSumGoodsPrice,
                totalSumTotalFeeRateMoney,
                totalSumSupportPrice,
                totalSumSimplePayoutAmount,
            },
            summaryData: localfoodFarmerSumObj,
            dataOrigin:data,
            // data: data
        })

        this.setExcelData();

        if(summaryGridApi) {
            //ag-grid 레이지로딩중 감추기
            summaryGridApi.hideOverlay();

            if(localfoodFarmerListObj && localfoodFarmerListObj.length == 0){
                summaryGridApi.showNoRowsOverlay();
            }
        }
    }


    setExcelData = () => {
        if(!this.summaryGridApi)
            return;

        const excelData = this.getExcelData();
        this.setState({
            excelData: excelData,
        })
    }

    getExcelData = () => {
        const columns = [
            '농가번호', '농가명','판매건수',
            '판매금액',
            '판매수수료', '수수료(%)',
            '정산금액', '입금은행','계좌번호','예금주'
        ]

        const excelData = this.state.summaryData.map((item) => {
            return [
                item.sumLocalFarmerNo, item.sumLocalFarmerNm,item.orderCount,
                item.sumConsumerGoodsPrice,
                item.sumTotalFeeRateMoney, item.localFarmerFeeRate,
                item.sumSimplePayoutAmount, item.bankName, item.acntNo, item.acntName
            ]
        });

        // console.log(JSON.stringify(excelData));
        return [{
            columns: columns,
            data: excelData,
        }]
    }

    onExcelDownloadDtl = () => {
        const selectedRows = this.state.selectedRows;
        let title = "";
        if(selectedRows != null){
            title = `${selectedRows[0].sumLocalFarmerNm}_${selectedRows[0].sumLocalFarmerNo}_${selectedRows[0].sumVatFlag}`;
        }
        const title2 = moment(this.state.search.startDate).format("YYMMDD")+"_"+moment(this.state.search.endDate).format("YYMMDD")+"내역";
        const fileName =  "샵블리 " + title + " " + title2;

        const excelData = this.getExcelDtlData();
        ExcelUtil.download(fileName, excelData)
    }

    getExcelDtlData = () => {

        let columns = [
            '주문일', '확정일', '주문번호', '주문자','구분',
            '로컬농가No', '로컬농가',
            '상품번호', '품목', '환불여부',
            '판매금액',
            '판매수수료', '수수료(%)',
            '정산금액'
        ]

        const paramData = {
            producerNo:this.state.loginUser.uniqueNo
        }

        const excelData = this.state.data.map((orderDetail) => {
            const consumerOkDate = ComUtil.utcToString(orderDetail.consumerOkDate,'YYYY-MM-DD HH:mm');
            const orderDate = ComUtil.utcToString(orderDetail.orderDate,'YYYY-MM-DD HH:mm');
            const refundFlag = orderDetail.refundFlag ? "환불" : "-";

            // let localfoodFarmerNo = "";
            let localFarmerNo = orderDetail.localFarmerNo;
            let localFarmName = orderDetail.localFarmName;
            let gubun = localReplaceText(orderDetail)

            return [
                orderDate, consumerOkDate, orderDetail.orderSeq, orderDetail.consumerNm, gubun,
                localFarmerNo, localFarmName,
                orderDetail.goodsNo, orderDetail.goodsNm, refundFlag,
                orderDetail.totalGoodsPrice,
                orderDetail.localFeeAmount, orderDetail.localFarmerFeeRate,
                orderDetail.localPayoutAmount,
            ]
        });

        // console.log(JSON.stringify(excelData));
        return [{
            columns: columns,
            data: excelData,
        }]
    }

    toggleTip = () => {
        this.setState({
            tipOpen: !this.state.tipOpen
        })
    }

    copy = ({value}) => {
        ComUtil.copyTextToClipboard(value, '', '');
    }

    onDayClick = async (dayTp) => {
        const vSearch = Object.assign({}, this.state.search);
        const firstDay = moment(moment().toDate()).startOf("month").add(-1,"days").startOf("month");
        const endDay = moment(moment().toDate()).startOf("month").add(-1, "days").endOf('month');
        let startDate = null;
        let endDate = null;
        if(dayTp === 'month'){
            startDate = firstDay;
            endDate = endDay;
        } else if(dayTp === 'first'){
            startDate = firstDay;
            endDate = moment(firstDay.toDate()).add(14,"days");
        } else if(dayTp === 'last'){
            startDate = moment(firstDay.toDate()).add(15,"days");
            endDate = endDay;
        }
        await this.setState({
            search: {
                startDate: startDate,
                endDate: endDate,
                selectedGubun: '',
                isConsumerOk:vSearch.isConsumerOk
            }
        });
    }

    onDatesChange = async (data) => {
        const vSearch = Object.assign({}, this.state.search);
        await this.setState({
            search: {
                startDate: data.startDate,
                endDate: data.endDate,
                selectedGubun: data.gubun,
                isConsumerOk:vSearch.isConsumerOk
            }
        });
    }

    onSelectionChanged = () => {
        const selectedRows = this.summaryGridApi.getSelectedRows();
        // console.log("selectedRows=====",selectedRows)
        if(selectedRows != null) {

            const localFarmerNo = selectedRows[0] && selectedRows[0].sumLocalFarmerNo;
            // console.log("localFarmerNo=====", localFarmerNo)
            const dataOrigin = Object.assign([], this.state.dataOrigin)
            const dataSorted = dataOrigin.filter(
                item => item.localFarmerNo === localFarmerNo
            )
            // console.log("dataSorted=====", dataSorted)
            this.setState({
                selectedRows: selectedRows,
                data: dataSorted
            })
        }
    }

    // 확정유무
    onSearchIsConsumerOkChange = async (e) => {
        const vSearch = Object.assign({}, this.state.search);
        vSearch.isConsumerOk = e.target.value;
        await this.setState({
            search: vSearch
        });
        //await this.search();
    }

    render() {
        const state = this.state
        return (
            <Fragment>
                <FormGroup>
                    <div className='px-3 py-1 mt-1 d-flex align-items-center'>
                        <div className='pt-1 pb-1 d-flex'>
                            <SearchDates
                                btnAllHidden={true}
                                isHiddenAll={true}
                                isCurrenYeartHidden={true}
                                gubun={state.search.selectedGubun}
                                startDate={state.search.startDate}
                                endDate={state.search.endDate}
                                onChange={this.onDatesChange}
                            />
                        </div>
                        <div className='ml-3'>
                            <Input type='select'
                                   name='searchIsConsumerOk'
                                   id='searchIsConsumerOk'
                                   onChange={this.onSearchIsConsumerOkChange}
                                   value={this.state.search.isConsumerOk}
                            >
                                <option name='isConsumerOk' value='N'>주문일기준</option>
                                {/*<option name='isConsumerOk' value='Y'>구매확정일기준</option>*/}
                            </Input>
                        </div>

                        <div className="ml-3">
                            <Button color={'info'} size={'sm'} onClick={this.onRefreshClick} disabled={this.state.btnSearchLoading}>
                                <span fontSize={'small'}>검색</span>
                            </Button>
                        </div>

                        <div className='d-flex ml-auto'>
                            {
                                state.isSearchDataExist &&
                                    <div className="ml-5 mr-3">
                                        <ExcelDownload data={state.excelData}
                                                       fileName={this.makeTitleText()}
                                                       sheetName={this.makeTitleText()}
                                                       button={
                                                           <Button color={'info'} size={'sm'} style={{width: '100px'}}>
                                                               <div className="d-flex">
                                                                   엑셀 다운로드
                                                               </div>
                                                           </Button>
                                                       }/>
                                    </div>
                            }
                        </div>
                    </div>

                    {
                        this.state.isSearchDataExist &&
                        <div className='p-3'>
                        <StyledTable >
                            <thead>
                            <tr>
                                <th>정산기간</th>
                                <th>판매금액</th>
                                <th>판매수수료</th>
                                <th>정산금액</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>{moment(state.search.startDate).format("YYYY-MM-DD")} ~ {moment(state.search.endDate).format("YYYY-MM-DD")}</td>
                                <td>{ComUtil.addCommas(state.totalData.totalSumGoodsPrice)}</td>
                                <td>{ComUtil.addCommas(state.totalData.totalSumTotalFeeRateMoney)}</td>
                                <td><Span bold>{ComUtil.addCommas(state.totalData.totalSumSimplePayoutAmount)} </Span></td>
                            </tr>
                            </tbody>
                        </StyledTable>
                        </div>
                    }

                    <div
                        className="ag-theme-balham mt-3 mb-3 ml-2 mr-2"
                        style={{
                            height: '500px'
                        }}
                    >

                        <AgGridReact
                            ref={this.summaryGridRef}
                            columnDefs={state.columnSummaryDefs}  //컬럼 세팅
                            defaultColDef={state.defaultColDef}
                            overlayLoadingTemplate={state.overlayLoadingTemplate}
                            overlayNoRowsTemplate={state.overlayNoRowsTemplate}
                            onGridReady={this.onSummaryGridReady.bind(this)}   //그리드 init(최초한번실행)
                            rowData={state.summaryData}
                            components={state.components}
                            frameworkComponents={state.frameworkComponents}
                            suppressMovableColumns={true} //헤더고정시키
                            onCellDoubleClicked={this.copy}
                            rowSelection={'single'}
                            onSelectionChanged={this.onSelectionChanged.bind(this)}
                            suppressRowClickSelection={false}
                        >
                        </AgGridReact>
                    </div>

                    {
                        (state.selectedRows && state.selectedRows.length > 0) &&
                        <Div p={16}>
                            <div
                                className="ag-theme-balham mt-3 mb-3 ml-2 mr-2"
                                style={{
                                    height: '500px'
                                }}
                            >
                                <Flex>
                                    <Div>
                                        {`${state.selectedRows[0].sumLocalFarmerNm} (${state.selectedRows[0].sumLocalFarmerNo})`}
                                    </Div>
                                    <Right>
                                        <Flex>
                                            <Space>
                                                <Div>
                                                    판매금액:<Span>{ComUtil.addCommas(state.selectedRows[0].sumConsumerGoodsPrice)} </Span>
                                                    판매 수수료:<Span>{ComUtil.addCommas(state.selectedRows[0].sumTotalFeeRateMoney)} </Span>
                                                    업체지급금액:<Span bold>{ComUtil.addCommas(state.selectedRows[0].sumSimplePayoutAmount)} </Span>

                                                </Div>
                                                <Div pb={5}>
                                                    <MenuButton onClick = {this.onExcelDownloadDtl}>
                                                        <div className="d-flex">엑셀 다운로드</div>
                                                    </MenuButton>
                                                </Div>
                                            </Space>
                                        </Flex>
                                    </Right>
                                </Flex>
                                <AgGridReact
                                    ref={this.gridRef}
                                    columnDefs={state.columnDefs}  //컬럼 세팅
                                    defaultColDef={state.defaultColDef}
                                    overlayLoadingTemplate={state.overlayLoadingTemplate}
                                    overlayNoRowsTemplate={state.overlayNoRowsTemplate}
                                    onGridReady={this.onGridReady.bind(this)}   //그리드 init(최초한번실행)
                                    rowData={state.data}
                                    components={state.components}
                                    frameworkComponents={state.frameworkComponents}
                                    suppressMovableColumns={true} //헤더고정시키
                                    onCellDoubleClicked={this.copy}
                                >
                                </AgGridReact>
                            </div>
                        </Div>
                    }

                </FormGroup>
            </Fragment>
        )
    }
}