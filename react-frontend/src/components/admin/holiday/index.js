import React, { Component, useState, useEffect, useMemo, useCallback } from 'react';
import { Button, Modal, ModalHeader, ModalBody } from 'reactstrap'
import {delHoliday, getHolidayList} from '~/lib/adminApi'
import { getLoginAdminUser } from '~/lib/loginApi'
import { AgGridReact } from 'ag-grid-react';
import { Cell } from '~/components/common'
import HolidayReg from './HolidayReg'
import FilterContainer from "~/components/common/gridFilter/FilterContainer";
import {Div, FilterGroup, Flex, Hr, Space} from "~/styledComponents/shared";
import InputFilter from "~/components/common/gridFilter/InputFilter";
import AdminLayouts, {MenuButton} from "~/styledComponents/shared/AdminLayouts";
import moment from "moment-timezone";
import SearchDates from "~/components/common/search/SearchDates";
import AgGridUtil from "~/util/AgGridUtil";
import BtnCellRenderer from "~/components/common/agGridRenderers/BtnCellRenderer";

const HoliDayList = (props) => {

    const [gridApi, setGridApi] = useState(null)
    const [gridColumnApi, setGridColumnApi] = useState(null)
    const defaultColDef = useMemo(() => {
        return {
            width: 100,
            resizable: true,
            filter: true,
            sortable: true,
            floatingFilter: false,
            filterParams: {
                newRowsAction: 'keep'
            }
        };
    }, []);

    const [columnDefs, setColumnDefs] = useState([
        {headerName: "키", field: "key", width: 150, cellStyle:AgGridUtil.getCellStyle({cellAlign: 'left'})},
        {
            headerName: "생산자번호", field: "producerNo", width: 150,
            cellStyle:AgGridUtil.getCellStyle({cellAlign: 'left'})
        },
        {
            headerName: "생산자명", field: "producerName", width: 150,
            cellStyle:AgGridUtil.getCellStyle({cellAlign: 'left'}),
            valueGetter: function(params) {
                let producerName = "";
                if(params.data.producerNo > 0) {
                    if (params.data.producerInfo) {
                        producerName = params.data.producerInfo.farmName;
                    }
                }else{
                    producerName = "전체";
                }
                return producerName;
            }
        },
        {
            headerName: "날짜", field: "yyyymmdd", width: 200,
            cellStyle:AgGridUtil.getCellStyle({cellAlign: 'left'}),
            cellRenderer: "titleRenderer"
        },
        {headerName: "비고", field: "desc", width: 300,cellStyle:AgGridUtil.getCellStyle({cellAlign: 'left'})},
        {
            headerName: "삭제", field:"delete",
            cellRenderer: "btnCellRenderer",
            cellRendererParams: {
                label: "삭제",
                clicked: function(data) {
                    //alert(`${data.key} was clicked`);
                    onCellDelClick(data);
                }
            },
            width: 100,
            cellStyle:AgGridUtil.getCellStyle({cellAlign: 'left'})
        },
    ])

    const [search, setSearch] = useState({
        isSearch:true,
        selectedGubun: 'all',//'1year', //'week': 최초화면을 오늘(day)또는 1주일(week)로 설정.
        startDate: "", //moment(moment().startOf('year').toDate()),
        endDate: "",//moment(moment().toDate()),
    });

    const [holidayList, setHolidayList] = useState([]);
    const [isOpen, setIsOpen] = useState(false)
    const [holidayData, setHolidayData] = useState(null)


    useEffect(() => {
        async function fetch(){
            await checkLogin();
            await getSearch();
        }

        fetch()

    }, []);

    useEffect(() => {
        async function fetch() {
            if(search.isSearch) {
                await getSearch();
            }
        }
        fetch();
    }, [search]);

    //[이벤트] 그리드 로드 후 callback 이벤트
    // const onGridReady = (params) => {
    //
    // }
    const onGridReady = useCallback((params) => {
        //API init
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
    }, []);

    async function checkLogin() {
        let user = await getLoginAdminUser();
        if (!user || user.email.indexOf('ezfarm') < 0) {
            //admin은 웹전용이라서, window로 이동하는 것이 더 잘됨. //this.props.history.push('/admin');
            window.location = '/admin/login';
        }
    }

    const getSearch = async (searchButtonClicked) => {

        const searchData = Object.assign({}, search);

        if (searchButtonClicked) {
            if (!searchData.startDate || !searchData.endDate) {
                alert('시작일과 종료일을 선택해주세요')
                return;
            }
        }
        if (gridApi) {
            //ag-grid 레이지로딩중 보이기
            gridApi.showLoadingOverlay();
        }

        let params = {
            startDate: searchData.startDate ? moment(searchData.startDate).format('YYYYMMDD') : null,
            endDate: searchData.endDate ? moment(searchData.endDate).format('YYYYMMDD') : null
        };
        console.log("params===",params)
        const {status, data} = await getHolidayList(params);
        if (status !== 200) {
            alert('응답이 실패 하였습니다')
            return
        }
        console.log("getHolidayList",data)
        setHolidayList(data);

        //ag-grid api
        if(gridApi) {
            //ag-grid 레이지로딩중 감추기
            gridApi.hideOverlay()
        }
    }

    const selectHoliday = (data) => {
        setHolidayData(data)
        toggle()
    }

    const regHoliday = () => {
        setHolidayData({});
        toggle()
    }

    const regHolidayFinished = async () => {
        toggle()
        await getSearch();
    }

    function TitleRenderer ({value, data:rowData}) {
        return (
            <Cell textAlign="left">
                <div onClick={selectHoliday.bind(this, rowData)} style={{color: 'blue'}}>
                    <u>{rowData.yyyymmdd}</u>
                </div>
            </Cell>
        );
    }

     const onCellDelClick = async (data) => {
        const code = `${data.key} 삭제하시겠습니까?`;
        if (window.confirm(code)) {
            await delHoliday(data.key);
            await getSearch();
        }
    }

    function toggle(){
        setIsOpen(!isOpen)
    }


    const onDatesChange = (data) => {
        console.log("onDatesChange===",data)
        const newSearch = Object.assign({}, search);
        newSearch.startDate = data.startDate;
        newSearch.endDate = data.endDate;
        newSearch.selectedGubun = data.gubun;
        newSearch.isSearch = data.isSearch;
        setSearch(prev => ({...prev, ...newSearch}));
    }

    function handleStateChange (data) {
        console.log("handleStateChange===",data)
        /**
         * setState...
         */
    }

    return (
        <Div p={16}>
            <Flex p={10} mb={10} bc={'secondary'}>
                <Space>
                    <Div>기 간</Div>
                    <SearchDates
                        gubun={search.selectedGubun}
                        startDate={search.startDate||null}
                        endDate={search.endDate||null}
                        onChange={onDatesChange}
                    />
                    <MenuButton onClick={() => getSearch(true)}> 검 색 </MenuButton>
                </Space>
            </Flex>

            {/* filter START */}
            <FilterContainer gridApi={gridApi} columnApi={gridColumnApi} excelFileName={'공휴일 목록'}>
                <FilterGroup>
                    <InputFilter
                        gridApi={gridApi}
                        columns={[
                            {field: 'producerNo', name: '생산자번호'},
                            {field: 'desc', name: '비고'},
                        ]}
                        isRealTime={true}
                    />
                </FilterGroup>
            </FilterContainer>
            {/* filter END */}

            <Space mb={10}>
                <MenuButton bg={'green'} onClick={regHoliday}>공휴일 등록</MenuButton>
                 (일요일은 기본휴일. 휴일 등록시 : 휴일 전날 16시까지 주문가능 - 옥천로컬)
            </Space>

            <div
                className="ag-theme-balham"
                style={{
                    height: '700px'
                }}
            >
                <AgGridReact
                    rowData={holidayList}
                    columnDefs={columnDefs}
                    rowSelection={'single'}  //멀티체크 가능 여부
                    rowHeight={40}
                    defaultColDef={defaultColDef}
                    overlayLoadingTemplate={'<span class="ag-overlay-loading-center">...로딩중입니다...</span>'}
                    overlayNoRowsTempalte={'<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>'}
                    frameworkComponents={{
                        titleRenderer:TitleRenderer,
                        btnCellRenderer:BtnCellRenderer,
                    }}
                    onGridReady={onGridReady}   //그리드 init(최초한번실행)
                />

                <Modal isOpen={isOpen} toggle={toggle} size={'lg'} centered>
                    <ModalHeader toggle={toggle}>공휴일</ModalHeader>
                    <ModalBody>
                        <HolidayReg data={holidayData} onClose={regHolidayFinished}/>
                    </ModalBody>
                </Modal>

            </div>
        </Div>
    )
}
export default HoliDayList