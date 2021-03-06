import React, { Component, Fragment } from 'react'
import { Button } from 'reactstrap'
import { CopyToClipboard } from 'react-copy-to-clipboard'

import { ProducerFullModalPopupWithNav, ExcelDownload } from '~/components/common'
import ComUtil from '~/util/ComUtil'

import { Webview } from "~/lib/webviewApi";
import { BLCT_TO_WON } from "~/lib/exchangeApi"
import { getConfirmedOrderByProducerNo } from "~/lib/producerApi"
import { getConsumerGoodsByProducerNo } from "~/lib/goodsApi"
import { scOntGetProducerOrderBlctHistory, scOntGetProducerGoodsBlctHistory, scOntGetBalanceOfBlct } from "~/lib/smartcontractApi"

import classNames from 'classnames';

//ag-grid
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/src/styles/ag-grid.scss";
import "ag-grid-community/src/styles/ag-theme-balham.scss";

import Style from './BlctHistory.module.scss'
import { getLoginUserType, getLoginUser } from "~/lib/loginApi";
import {getServerToday} from "~/lib/commonApi";

export default class BlctHistory extends Component {
    constructor(props) {
        super(props);
        this.serverToday=null;
        this.rowHeight=30;
        this.isPcWeb=false;
        this.state = {
            loginUser: '',
            blctBalance: '',    // 잔여 보유적립금
            data: null,
            excelData: {
                columns: [],
                data: []
            },

            columnDefs: this.getColumnDefs(),
            defaultColDef: {
                width: 100,
                resizable: true
            },
            components: {

            },
            frameworkComponents: {

            },
            rowHeight: this.rowHeight,
            rowSelection: 'single',
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
            isPcWeb: this.isPcWeb,

            blctListCnt: 0,

            isOpen: false,
            copied: false,
            orderInfoList: [],       // 사용내역 조회시 필요한 주문정보
            goodsInfoList: [],       // 사용내역 조회시 필요한 상품정보
            blctToWon: ''           // BLCT 환율
        }
    }

    async componentDidMount() {
        await this.getUser();

        let {data:blct} = await scOntGetBalanceOfBlct(this.state.loginUser.account)
        this.setState({ blctBalance: blct })

        this.search();
    }

    getUser = async () => {
        const {data: userType} = await getLoginUserType();
        let loginUser = await getLoginUser();

        if(userType !== 'producer') {
            Webview.openPopup('/login', true);
            return
        }
        this.setState({
            loginUser: loginUser
        })
    }

    // 적립금 내역 조회
    search = async () => {
        if(this.gridApi) {
            //ag-grid 페이지로딩중 보이기
            this.gridApi.showLoadingOverlay();
        }

        let {data:blctToWon} = await BLCT_TO_WON();

        let { data:serverToday } = await getServerToday();
        this.serverToday = serverToday;

        // 로그인한 생산자의 주문목록 조회
        const { data:orderList } = await getConfirmedOrderByProducerNo();
        const { data:goodsList } = await getConsumerGoodsByProducerNo(this.state.loginUser.uniqueNo)  // 로그인된 생산자가 등록한 상품목록 조회

        // 주문목록에서 필요한 필드 뽑아서 orderInfoList에 저장
        let ordersResults = orderList.map((row,i) => {
            return {orderSeq: row.orderSeq, goodsNo: row.goodsNo, orderDate: row.orderDate, goodsNm: row.goodsNm, consumerNm: row.consumerNm, consumerEmail: row.consumerEmail};
        })
        let goodsResults = goodsList.map((row,i) => {
            return {goodsNo: row.goodsNo, goodsNm: row.goodsNm, timestamp: row.timestamp}
        })

        this.setState({
            orderInfoList: ordersResults,
            goodsInfoList: goodsResults,
            blctToWon: blctToWon
        })

        this.getBlctHistory();
    }

    // 주문번호로 SC 조회
    getBlctHistory = async () => {
        const orders = this.state.orderInfoList
        const goods = this.state.goodsInfoList
        const list = []

        const blctListOrder = orders.map(async order => {
            const { data: result } = await scOntGetProducerOrderBlctHistory(order.orderSeq)

            // receiveOrderRewardBlct(+판매보상 blct)
            if(result.receiveOrderRewardBlct > 0){
                const date = order.orderDate
                if(date) {
                    list.push({
                        blct: '+ '+result.receiveOrderRewardBlct,
                        orderSeq: order.orderSeq,
                        date: date,
                        contents: order.goodsNm + ' | 고객명:' + order.consumerNm + '(' + order.consumerEmail + ')',
                        stateName: '소비자 구매확정 보상 적립',
                        gubun: '적립'
                    })
                }
            }

            // receiveReturnOrderDeposit(+걸어뒀던 미배송 보상금 돌려받음)
            if(result.receiveReturnOrderDeposit > 0){
                const date = order.orderDate
                if(date) {
                    list.push({
                        blct: '+ '+result.receiveReturnOrderDeposit,
                        orderSeq: order.orderSeq,
                        date: date,
                        contents: order.goodsNm + ' | 고객명:' + order.consumerNm + '(' + order.consumerEmail + ')',
                        stateName: '구매확정에 따른 미배송 보증금 반환',
                        gubun: '적립'
                    })
                }
            }


        })

        const blctListGoods = goods.map(async good=>{
            const { data:result2 } = await scOntGetProducerGoodsBlctHistory(good.goodsNo)

            // payGoodsDeposit(-판매등록시 거는 미배송 보상금)
            if(result2.payGoodsDeposit > 0){
                const date = good.timestamp
                if(date) {
                    list.push({
                        blct: '- '+result2.payGoodsDeposit,
                        date: date,
                        contents: good.goodsNm + ' 판매등록',
                        stateName: '판매등록(미배송 보증금)',
                        gubun: '사용'
                    })
                }
            }

            // receiveReturnGoodsDeposit(+판매종료시 남은 미배송 보상금 돌려받음)
            if(result2.receiveReturnGoodsDeposit > 0){
                const date = good.timestamp
                if(date) {
                    list.push({
                        blct: '+ '+result2.receiveReturnGoodsDeposit,
                        date: date,
                        contents: good.goodsNm + ' 판매마감',
                        stateName: '잔여 미배송 보증금 반환',
                        gubun: '적립'
                    })
                }
            }
        })

        await Promise.all(blctListOrder)

        ComUtil.sortDate(list, 'date', true);

        if(list.length != 0) {
            this.setState({
                blctListCnt: list.length,
                data: list,
                columnDefs: this.getColumnDefs()
            })
        }
    }

    onGridReady(params) {
        this.gridApi = params.api;
        this.gridColumnApi = params.ColumnApi;
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
                headerName: "구분", field: "gubun",
                width: 100,
                cellStyle:this.getCellStyle,
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            {
                headerName: "일시", field: "date",
                width: 150,
                cellStyle:this.getCellStyle,
                valueGetter: function(params) {
                    //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                    return ComUtil.utcToString(params.data.date, 'YYYY-MM-DD HH:MM');
                },
                filter: "agDateColumnFilter",
                filterParams: {
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
                }
            },
            {
                headerName: "금액(BLCT)", field: "blct",
                width: 100,
                cellStyle:this.getCellStyle,
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            {
                headerName: "항목", field: "stateName",
                width: 200,
                cellStyle:this.getCellStyle,
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            {
                headerName: "내용", field: "contents", // 상품명, 고객명
                width: 280,
                cellStyle:this.getCellStyle,
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },

        ]
        return columnDefs
    }

    //Ag-Grid Cell 숫자콤마적용 렌더러
    formatCurrencyRenderer = ({value, data:rowData}) => {
        return ComUtil.addCommas(value);
    }
    //Ag-Grid Cell 날짜변환 렌더러
    formatDateRenderer = ({value, data:rowData}) => {
        return (value ? ComUtil.utcToString(value) : '미지정')
    }

    //Ag-Grid Cell 구분 렌더러
    gubunRenderer = ({value, data:rowData}) => {

    }

    // Ag-Grid Cell 스타일 기본 적용 함수
    getCellStyle({cellAlign,color,textDecoration,whiteSpace}) {
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

    //Ag-Grid 필터링용 온체인지 이벤트(데이터 동기화)


    onCopy = () => {
        this.setState({copied: true})
        alert('클립보드에 복사되었습니다.')
    }

    toggle = () => {
        this.setState({
            isOpen: !this.state.isOpen
        })
    }

    onClose = (isSaved) => {
        isSaved? this.search() : this.toggle()
    }

    render() {
        if(!this.state.blctToWon) return null;

        const account = ''+this.state.loginUser.account
        const accountHead = account.substring(0,7)
        const accountTail = account.substring(account.length-7, account.length)

        return (
            <div>
                <div className='p-1'>
                    <div className='m-2 d-flex border'>
                        <div className='d-flex justify-content-center align-items-center'>
                            <div className='p-2 f3'>보유적립금</div>
                            <div className='p-2'>{this.state.blctBalance}BLCT / {ComUtil.addCommas(ComUtil.roundDown(this.state.blctBalance * this.state.blctToWon, 2))}원</div>
                            <div className='p-2 text-secondary f6'>* 1 BLCT = {this.state.blctToWon}원</div>
                        </div>
                        <div className='d-flex justify-content-center align-items-center text-right'>
                            <div className='p-2 f3'>Public Account</div>
                            <div className='p-2'>
                                <CopyToClipboard text={account} onCopy={this.onCopy}>
                                    <Button outline size='sm'>{accountHead} ... {accountTail}</Button>
                                </CopyToClipboard>

                            </div>
                        </div>
                    </div>
                    <div className='pl-1 d-flex'>
                        {/*<div>*/}
                            {/*<ExcelDownload data={this.state.excelData}*/}
                                           {/*button={<Button color={'success'} size={'sm'} block>*/}
                                               {/*<div className='d-flex'>*/}
                                                   {/*엑셀 다운로드*/}
                                               {/*</div>*/}
                                           {/*</Button>}/>*/}
                        {/*</div>*/}
                        <div className='flex-grow-1 text-right'>
                            {this.state.blctListCnt} 건
                        </div>
                    </div>
                </div>

                <div
                    id="myGrid"
                    className={classNames('ag-theme-balham', Style.agGridDivCalc)}
                >
                    <AgGridReact
                        enableSorting={true}                //정렬 여부
                        enableFilter={true}                 //필터링 여부
                        floatingFilter={false}               //Header 플로팅 필터 여부
                        columnDefs={this.state.columnDefs}  //컬럼 세팅
                        defaultColDef={this.state.defaultColDef}
                        rowSelection={this.state.rowSelection}  //멀티체크 가능 여부
                        rowHeight={this.state.rowHeight}
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
                        //onFilterChanged={this.onGridFilterChanged.bind(this)} //필터온체인지 이벤트
                        // onRowClicked={this.onSelectionChanged.bind(this)}
                        // onRowSelected={this.onRowSelected.bind(this)}
                        // onSelectionChanged={this.onSelectionChanged.bind(this)}
                        // suppressRowClickSelection={true}    //true : 셀 클릭시 체크박스 체크 안됨, false : 셀 클릭시 로우 단위로 선택되어 체크박스도 자동 체크됨 [default 값은 false]
                    >
                    </AgGridReact>
                </div>
                <ProducerFullModalPopupWithNav show={this.state.isOpen} title={'적립금관리'} onClose={this.onClose}>

                </ProducerFullModalPopupWithNav>

            </div>
        );
    }
}