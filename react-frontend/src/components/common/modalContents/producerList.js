import React, {useEffect, useRef, useState} from 'react';
import {AgGridReact} from "ag-grid-react";
import {getAllProducerList} from '~/lib/adminApi'
import {Button, Div} from "~/styledComponents/shared";
import ComUtil from "~/util/ComUtil";

const producerList = ({onClose = () => null}) => {

    const gridRef = useRef();
    const [rowData, setRowData] = useState([]);

    const gridOptions = {
        // enableSorting: true,                //정렬 여부
        // enableFilter: true,                 //필터링 여부
        // enableColResize: true,              //컬럼 크기 조정
        floatingFilter: true,               //Header 플로팅 필터 여부
        rowHeight: 35,
        columnDefs: [
            {headerName: "선택", field: "producerNo", cellRenderer: "selectRenderer", pinned: 'left'},
            {
                headerName: "생산자No", field: "producerNo", width: 90,
                filter: true,
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            {
                headerName: "생산자", field: "farmName", width: 140,
                filter: true,
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            {
                headerName: "업종", field: "shopBizType", width: 140,
                filter: true,
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            {
                headerName: "전화번호", field: "shopPhone", width: 140,
                filter: true,
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            {
                headerName: "담당", field: "charger", width: 140,
                filter: true,
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            {
                headerName: "담당자번호", field: "chargerPhone", width: 140,
                filter: true,
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            {
                headerName: "수수료율%", field: "producerFeeRate", width: 140,
                filter: true,
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
        ],
        rowSelection: 'multiple',
        suppressRowClickSelection: false,   //false : 셀 클릭시 체크박스도 체크 true: 셀클릭시 체크박스 체크 안함
        frameworkComponents: {
            selectRenderer: selectRenderer
        },
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
        overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
        onCellDoubleClicked: onCellCopyClick
    }

    useEffect(() => {
        search()
    }, [])

    const search = async () => {

        const {api} = gridRef.current;

        if (api) {
            //ag-grid 레이지로딩중 보이기
            api.showLoadingOverlay();
        }

        const {data} = await getAllProducerList()
        setRowData(data)

        //ag-grid api
        if(api) {
            //ag-grid 레이지로딩중 감추기
            api.hideOverlay()

            if(!data){
                api.showNoRowsOverlay();
            }
        }
    }

    function selectRenderer({value, data}) {
        return <Button
            py={2}
            bg={'green'} fg={'white'} px={10}
            onClick={onClose.bind(this, data)}
        >{data.farmName}</Button>
    }

    function onCellCopyClick ({value}) {
        ComUtil.copyTextToClipboard(value, '', '');
    }

    return (
        <Div>
            <div
                className="ag-theme-balham"
                style={{
                    height: '550px'
                }}
            >
                <AgGridReact
                    ref={gridRef}
                    {...gridOptions}
                    rowData={rowData}
                />
            </div>
        </Div>
    );
};
export default producerList;