import React, {useEffect, useState} from 'react';
import {getCouponMasterList} from "~/lib/adminApi";
import ComUtil from "~/util/ComUtil";
import {AgGridReact} from "ag-grid-react";
import {Cell} from "~/components/common";
import {Div} from "~/styledComponents/shared";

const CouponList = ({onClose}) => {

    const [rowData, setRowData] = useState([])
    const [gridApi, setGridApi] = useState()
    useEffect(() => {
        search()
    }, [])

    function onGridReady (params){
        setGridApi(params.api)
    }

    const gridOptions = {
        getRowHeight: function(params) {
            return 30;
        },
        // enableColResize: true,              //컬럼 크기 조정
        // enableSorting: true,                //정렬 여부
        // enableFilter: true,                 //필터링 여부
        // floatingFilter: true,               //Header 플로팅 필터 여부
        suppressMovableColumns: true,       //헤더고정시키
        columnDefs: [
            {
                headerName: "쿠폰NO", field: "masterNo", width: 100,
                suppressFilter: true,   //no filter
                suppressSorting: true,  //no sort
                // cellStyle:this.getCellStyle({cellAlign: 'center'})
            },
            {
                headerName: "발급위치", field: "couponType", width: 120,
                // cellStyle:this.getCellStyle({cellAlign: 'center'}),
                valueGetter: function(params) {
                    //console.log("params",params);
                    let v_couponTypeName = '';
                    if(params.data.couponType === 'memberJoin'){
                        v_couponTypeName = '회원가입';
                    } else if(params.data.couponType === 'memberJoinProdGoods'){
                        v_couponTypeName = '회원가입생산자상품';
                    } else if(params.data.couponType === 'goodsBuyReward'){
                        v_couponTypeName = '구매보상';
                    } else if(params.data.couponType === 'specialCoupon'){
                        v_couponTypeName = '스페셜쿠폰';
                    } else if(params.data.couponType === 'potenCoupon'){
                        v_couponTypeName = '포텐타임쿠폰';
                    }
                    return v_couponTypeName;
                }
            },
            {
                headerName: "쿠폰명", field: "couponTitle", width: 150,
                // cellStyle:this.getCellStyle({cellAlign: 'left'}),
                cellRenderer: "couponTitleRenderer",
            },
            {
                headerName: "메모", field: "couponMemo", width: 150,
                // cellStyle:this.getCellStyle({cellAlign: 'left'}),
            },
            {
                headerName: "발급기간", field: "issuedDate",
                suppressFilter: true,   //no filter
                suppressSorting: true,  //no sort
                // cellStyle:this.getCellStyle({cellAlign: 'center'}),
                width: 200,
                valueGetter: function(params) {
                    // console.log("params",params);
                    let v_Date = '-';
                    if(params.data.startDay > 0) {
                        v_Date = ComUtil.intToDateString(params.data.startDay, 'YYYY.MM.DD') + '~' + ComUtil.intToDateString(params.data.endDay, 'YYYY.MM.DD')
                    }
                    return v_Date;
                }
            },
            {
                headerName: "상품명", field: "goodsNm",
                // cellStyle:this.getCellStyle({cellAlign: 'left'}),
                width: 200,
                valueGetter: function(params) {
                    if(params.data.potenCouponGoodsNo > 0) {
                        return params.data.potenCouponGoodsNm;
                    } else if(params.data.targetGoods.length > 0) {
                        if(params.data.targetGoods.length === 1) {
                            return params.data.targetGoods[0].goodsNm;
                        } else {
                            return params.data.targetGoods[0].goodsNm+`외 `+ ComUtil.toNum(params.data.targetGoods.length-1)+`건`;
                        }
                    } else {
                        return '-';
                    }
                }
            },
            {
                headerName: "원화금액", field: "fixedWon", width: 120,
                // cellStyle:this.getCellStyle({cellAlign: 'center'}),
                valueGetter: function(params) {
                    if(params.data.fixedWon > 0){
                        return ComUtil.toCurrency(params.data.fixedWon) + ' 원'
                    }
                    return '-'
                }
            },
            {
                headerName: "할인금액(BLY)", field: "couponBlyAmount", width: 120,
                // cellStyle:this.getCellStyle({cellAlign: 'center'}),
                valueGetter: function(params) {
                    if(params.data.couponBlyAmount > 0){
                        return ComUtil.toCurrency(params.data.couponBlyAmount) + ' BLY'
                    }
                    return '-'
                }
            },
            {
                headerName: "포텐할인율(%)", field: "potenCouponDiscount", width: 140,
                // cellStyle:this.getCellStyle({cellAlign: 'center'}),
                valueGetter: function(params) {
                    if(params.data.potenCouponDiscount > 0){
                        return ComUtil.toCurrency(params.data.potenCouponDiscount) + ' %'
                    }
                    return '-'
                }
            },
            // {
            //     headerName: "할인율(%)", field: "couponDiscountRate", width: 100,
            //     cellStyle:this.getCellStyle({cellAlign: 'center'}),
            //     valueGetter: function(params) {
            //         if(params.data.couponDiscountRate > 0){
            //             return ComUtil.toCurrency(params.data.couponDiscountRate) + ' %'
            //         }
            //         return '-'
            //     }
            // },
            {
                headerName: "총 수량", field: "totalCount", width: 100,
                // cellStyle:this.getCellStyle({cellAlign: 'center'}),
            },
            {
                headerName: "발급 수량", field: "remainCount", width: 100,
                suppressFilter: true,   //no filter
                suppressSorting: true,  //no sort
                // cellStyle:this.getCellStyle({cellAlign: 'center'}),
                valueGetter: function(params) {
                    const v_totalCount = params.data.totalCount || 0;
                    const v_remainCount = params.data.remainCount || 0;
                    return (v_totalCount - v_remainCount);
                }
            },
            {
                headerName: "남은 수량", field: "remainCount", width: 100,
                // cellStyle:this.getCellStyle({cellAlign: 'center'}),
            },
            {
                headerName: "최소주문금액", field: "minAmount", width: 120,
                // cellStyle:this.getCellStyle({cellAlign: 'center'}),
                valueGetter: function(params) {
                    if(params.data.fixedWon > 0){
                        return ComUtil.toCurrency(params.data.fixedWon) + ' 원';
                    }
                    if(params.data.minOrderBlyAmount > 0){
                        return ComUtil.toCurrency(params.data.minOrderBlyAmount) + ' BLY';
                    }
                    return '없음';
                }
            },
            {
                headerName: "비고",
                suppressFilter: true,   //no filter
                suppressSorting: true,  //no sort
                // cellStyle:this.getCellStyle({cellAlign: 'center'}),
                width: 250,
                // cellRenderer: "buttonRenderer"
            },
        ],
        onGridReady: onGridReady.bind(this),              //그리드 init(최초한번실행)
        // onFilterChanged: this.onGridFilterChanged.bind(this),  //필터온체인지 이벤트
        // onCellDoubleClicked: this.copy,
        // onSelectionChanged: this.onSelectionChanged.bind(this),
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
        // components: {
        //     formatCurrencyRenderer: this.formatCurrencyRenderer,
        //     formatDateRenderer: this.formatDateRenderer,
        //     formatDatesRenderer: this.formatDatesRenderer,
        //     vatRenderer: this.vatRenderer
        // },
        frameworkComponents: {
            couponTitleRenderer: couponTitleRenderer,
            // writingIdRenderer: writingIdRenderer,
        },
        rowSelection: 'multiple',
        groupSelectsFiltered: true,
        suppressRowClickSelection: false,   //false : 셀 클릭시 체크박스도 체크 true: 셀클릭시 체크박스 체크 안함
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
        overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
    }

    const search = async () => {
        const params = {
            startDate: null,
            endDate: null,
            needTotalWon: false
        }
        const { status, data } = await getCouponMasterList(params);
        setRowData(data.filter(item => item.couponType === 'specialCoupon' && item.fixedWon > 0))
        console.log({data})
    }

    const onCouponTitleClick = (couponMaster) => {
        onClose(couponMaster)
    }

    function couponTitleRenderer({data}) {
        return <Div fg={'primary'} onClick={onCouponTitleClick.bind(this, data)}>{data.couponTitle}</Div>
    }

    return (
        <div
            id="myGrid"
            className="ag-theme-balham"
            style={{
                height: '700px'
            }}
        >
            <AgGridReact
                {...gridOptions}
                rowData={rowData}
            />
        </div>
    );
};

export default CouponList;
