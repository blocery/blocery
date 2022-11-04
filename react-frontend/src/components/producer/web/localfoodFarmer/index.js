import React, {useEffect, useState} from 'react'
import {Button, FilterGroup, Hr, Span} from "~/styledComponents/shared";
import Style from "~/components/producer/web/regularShop/WebRegularShopList.module.scss";
import {AgGridReact} from "ag-grid-react";
import classNames from 'classnames';
import {useModal} from "~/util/useModal";
import {getLocalfoodFarmerList, getProducer} from "~/lib/producerApi";
import {Modal, ModalBody, ModalHeader} from "reactstrap";
import LocalfoodFarmerContent from "~/components/producer/web/localfoodFarmer/LocalfoodFarmerContent";
import ComUtil from "~/util/ComUtil";
import InputFilter from "~/components/common/gridFilter/InputFilter";
import CheckboxFilter from "~/components/common/gridFilter/CheckboxFilter";
import FilterContainer from "~/components/common/gridFilter/FilterContainer";

const LocalfoodFarmer = () => {
    const [gridApi, setGridApi] = useState();
    const [columnApi, setColumnApi] = useState();

    const [producerInfo, setProducerInfo] = useState(null)
    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal()
    const [isNew, setIsNew] = useState(false)

    const [dataList, setDataList] = useState([]);

    const onGridReady = params => {
        setGridApi(params.api);
        setColumnApi(params.columnApi);
    };

    const [selectedLocalfoodFarmerNo, setSelectedLocalfoodFarmerNo] = useState(0)

    const agGrid = {
        columnDefs: [
            {headerName: "바코드번호", field: "localFarmerNo", width: 100},
            {headerName: "농가/상호명", field: "farmName", width: 150},
            {headerName: "생산자/대표자명", field: "farmerName", width: 200, cellRenderer: "nameRenderer"},
            {headerName: "연락처", field: "phoneNum",width: 150},
            {headerName: "주요농가", field: "starred",width: 90,  valueGetter: function(params) {return params.data.starred ? 'O':'X'}},
            {headerName: "사용유무", field: "deleted",width: 90, valueGetter: function(params) {return params.data.deleted ? '사용안함':'사용'}},
            {headerName: "등록상품수", field: "goodsCount",width: 100},
            {headerName: "바코드비율(%)", field: "barcodeRatio", width: 100},
            {headerName: "우선순위", field: "priority", width: 100},
            {headerName: "수수료(%)", field: "feeRate", width: 100},
            {headerName: "자동반영일", field: "modDay", width: 100, valueGetter: function(params) {return ComUtil.intToDateString(params.data.modDay)} },
            {headerName: "주요품목", field: "mainItems", width: 100},
            {headerName: "한줄소개", field: "desc", width: 250},
            {headerName: "주소", field: "address", width: 250},
            {headerName: "등록일", field: "timestamp",width: 150, valueGetter: function(params) {return ComUtil.utcToString(params.data.timestamp, 'YYYY-MM-DD HH:mm')} },

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
            nameRenderer: nameRenderer,
            starredRenderer: starredRenderer,
            deletedRenderer: deletedRenderer,
        },
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
        overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
    }

    useEffect(() => {
        async function fetch() {
            let {data:producer} = await getProducer();
            console.log(producer)
            setProducerInfo(producer)
        }
        fetch()

        search();
    }, [])

    const search = async () => {
        const {data:localfoodFarmer} = await getLocalfoodFarmerList();
        setDataList(localfoodFarmer)

    }

    const toggle = async () => {
        setIsNew(false)
        setModalState(!modalOpen)
        await search();
    }

    // 신규추가 클릭
    const onNewClick = () => {
        setSelectedLocalfoodFarmerNo(0)
        setIsNew(true)
        setModalState(!modalOpen)
    }

    function nameRenderer ({value, data:rowData}) {
        return <Span fg={'primary'} onClick={onTitleClick.bind(this, rowData.localfoodFarmerNo)}><u>{value}</u></Span>
    }

    function starredRenderer ({value, data:rowData}) {
        return <Span>{value ? 'O':'X'}</Span>
    }

    function deletedRenderer ({value, data:rowData}) {
        return <Span>{value?'사용안함':'사용'}</Span>
    }

    const onTitleClick = (localfoodFarmerNo) => {
        setSelectedLocalfoodFarmerNo(localfoodFarmerNo)
        setModalOpen(true)
    }

    if(producerInfo && !producerInfo.localfoodFlag) return null;

    return (
        <div className='m-4'>
            <div className='d-flex mb-3'>
                <h5>로컬푸드 농가</h5>
                <div className='ml-auto'><Button px={10} bc={'secondary'} onClick={onNewClick}>추가</Button></div>
            </div>


            <FilterContainer gridApi={gridApi} columnApi={columnApi} excelFileName={'로컬푸드농가'}>
                <FilterGroup>
                    <InputFilter
                        gridApi={gridApi}
                        columns={[
                            {field: 'localFarmerNo', name: '바코드번호', width: 80},
                            {field: 'farmName', name: '농가/상호명'},
                            {field: 'farmerName', name: '생산자/대표자명' },
                        ]}
                        isRealTime={true}
                    />
                </FilterGroup>
                <FilterGroup>
                    <CheckboxFilter
                        gridApi={gridApi}
                        field={'deleted'}
                        name={'사용유무'}
                        data={[
                            {value: '사용', name: '사용'},
                            {value: '사용안함', name: '사용안함'}
                        ]}
                    />
                </FilterGroup>
            </FilterContainer>

            <div
                id="myGrid"
                className={classNames('ag-theme-balham',Style.agGridDivCalc)}
            >
                <AgGridReact
                    columnDefs={agGrid.columnDefs}  //컬럼 세팅
                    defaultColDef={agGrid.defaultColDef}
                    rowSelection={agGrid.rowSelection}  //멀티체크 가능 여부
                    getRowHeight={50}
                    overlayLoadingTemplate={agGrid.overlayLoadingTemplate}
                    overlayNoRowsTemplate={agGrid.overlayNoRowsTemplate}
                    onGridReady={onGridReady.bind(this)}   //그리드 init(최초한번실행)
                    rowData={dataList}
                    components={agGrid.components}  //custom renderer 지정, 물론 정해져있는 api도 있음
                    frameworkComponents={agGrid.frameworkComponents}
                    suppressMovableColumns={true} //헤더고정시키
                >
                </AgGridReact>
            </div>

            <Modal size="lg" isOpen={modalOpen} toggle={toggle} >
                <ModalHeader toggle={toggle}>로컬농가 등록/수정</ModalHeader>
                <ModalBody>
                    <LocalfoodFarmerContent localfoodFarmerNo={selectedLocalfoodFarmerNo} toggle={toggle} isNew={isNew} />
                </ModalBody>
            </Modal>


        </div>
    )
}

export default LocalfoodFarmer