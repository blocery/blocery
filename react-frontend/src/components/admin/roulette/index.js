import React, {useState, useEffect, Suspense} from 'react';
import {AgGridReact} from "ag-grid-react";
import {Badge, Button, Col, Container, Input, Modal, ModalBody, ModalFooter, ModalHeader, Row} from "reactstrap";
import {useModal} from "~/util/useModal";
import {Div, FilterGroup, Flex, Hr, Right, Space} from "~/styledComponents/shared";
import RouletteContent from './RouletteContent'
import RouletteGaegeunList from './RouletteGaegeunList'
import {color} from "~/styledComponents/Properties";
import adminApi from "~/lib/adminApi";
import ComUtil from "~/util/ComUtil";
import InputFilter from "~/components/common/gridFilter/InputFilter";
import CheckboxFilter from "~/components/common/gridFilter/CheckboxFilter";
import FilterContainer from "~/components/common/gridFilter/FilterContainer";
import {MenuButton} from "~/styledComponents/shared/AdminLayouts";
import {getLoginAdminUser} from "~/lib/loginApi";
import DatePicker from "react-datepicker";
import moment from "moment-timezone";

const RouletteManage = (props) => {

    //등록/수정 모달
    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal()
    const [gaegeunModalOpen, setGaegeunModalOpen, gaegeunSelected, setGaegeunSelected, setGaegeunModalState] = useModal()

    const [searchData, setSearchData] = useState({
        year:moment().format('YYYY'),
        month:"00",//moment().format('MM')
    })

    const [rowData, setRowData] = useState([])
    const [gridApi, setGridApi] = useState()
    const [columnApi, setColumnApi] = useState()

    useEffect(() => {
        async function fetch() {

            const user = await getLoginAdminUser();
            if (!user || user.email.indexOf('ezfarm') < 0) {
                //admin은 웹전용이라서, window로 이동하는 것이 더 잘됨. //this.props.history.push('/admin');
                window.location = '/admin/login';
            }
        }
        fetch();
    }, [])

    useEffect(() => {
        search();
    }, [gridApi])

    useEffect(() => {
        search();
    }, [searchData])

    const onGridReady = async (params) => {
        setGridApi(params.api)
        setColumnApi(params.columnApi)
    }

    const toggle = () => {
        setModalState(!modalOpen)
    }

    const gaegeunToggle = () => {
        setGaegeunModalState(!gaegeunModalOpen)
    }

    const gridOptions = {
        // enableColResize: true,              //컬럼 크기 조정
        // enableSorting: true,                //정렬 여부
        // enableFilter: true,                 //필터링 여부
        // floatingFilter: true,               //Header 플로팅 필터 여부
        suppressMovableColumns: true,       //헤더고정시키
        columnDefs: [
            {headerName: "룰렛ID", field: "yyyymm",width: 100},
            {headerName: "제목", field: "title",width: 300, cellRenderer: "titleRenderer"},
            {
                headerName: "룰렛수", field: "itemsCnt",width: 100,
                cellStyle:ComUtil.getCellStyle({cellAlign: 'center'})
            },
            {
                headerName: "리워드수", field: "rewardsCnt",width: 100,
                cellStyle:ComUtil.getCellStyle({cellAlign: 'center'})
            },
            {
                headerName: "참여룰렛수", field: "consumerRouletteCnt",width: 100,
                cellStyle:ComUtil.getCellStyle({cellAlign: 'center'})
            },
            {
                headerName: "참여자수", field: "consumerCnt",width: 100,
                cellStyle:ComUtil.getCellStyle({cellAlign: 'center'})
            },
            {
                headerName: "개근자수", field: "consumerGaeGeunCnt",width: 100,
                cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                cellRenderer: "gaegeunRenderer"
            },
        ],
        rowHeight: 30,
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
            titleRenderer: titleRenderer,
            gaegeunRenderer: gaegeunRenderer
        },
        groupSelectsFiltered: true,
        suppressRowClickSelection: false,   //false : 셀 클릭시 체크박스도 체크 true: 셀클릭시 체크박스 체크 안함
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
        overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
    }

    function titleRenderer ({value, data}) {
        return(
            <Div fg={'primary'} onClick={onRowClick.bind(this, data.yyyymm)}>
                {value}
            </Div>
        )
    }

    function gaegeunRenderer ({value, data}) {
        return(
        <Space>
            <MenuButton bg={'green'} onClick={onGaegeunRowClick.bind(this, data.yyyymm)}>조회</MenuButton>
        </Space>
        )
    }

    const onRowClick = (rouletteId) => {
        setSelected(rouletteId)
        toggle()
    }

    const onGaegeunRowClick = (rouletteId) => {
        setGaegeunSelected(rouletteId)
        gaegeunToggle()
    }

    const onSearchClick = async () => {
        await search();
    }

    const search = async () => {
        if (gridApi) {
            //ag-grid 레이지로딩중 보이기
            gridApi.showLoadingOverlay();
        }
        const params = {
            yearMonth:searchData.year+""+searchData.month,
        };
        console.log("param",params)
        const {data} = await adminApi.rouletteManageList(params);
        setRowData(data)

        //ag-grid api
        if(gridApi) {
            //ag-grid 레이지로딩중 감추기
            gridApi.hideOverlay()
        }
    }

    const onClose = (isSearch) => {
        toggle();
        if (isSearch){
            search()
        }
    }

    const onSearchDateChange = async (date) => {
        const searchInfo = Object.assign({}, searchData);
        searchInfo.year = date.getFullYear();
        setSearchData(searchInfo)
    }

    // 조회할 월
    const onSearchDateMonthChange = async (e) => {
        const searchInfo = Object.assign({}, searchData);
        searchInfo.month = e.target.value;
        setSearchData(searchInfo)
    }

    const ExampleCustomDateInput = ({ value, onClick }) => (
        <Button
            color="secondary"
            active={true}
            onClick={onClick}>검색 {value} 년</Button>
    );

    return (
        <Div p={16}>
            <Div p={10} mb={10} bc={'secondary'}>
                <Space>
                    <DatePicker
                        selected={new Date(moment().set('year',searchData.year))}
                        onChange={onSearchDateChange}
                        showYearPicker
                        dateFormat="yyyy"
                        customInput={<ExampleCustomDateInput />}
                    />
                    <Input type='select'
                           name='searchMonth'
                           id='searchMonth'
                           style={{width: 100}}
                           onChange={onSearchDateMonthChange}
                           value={searchData.month}
                    >
                        <option name='month' value=''>전체</option>
                        <option name='month' value='00'>현재월~</option>
                        <option name='month' value='01'>01월</option>
                        <option name='month' value='02'>02월</option>
                        <option name='month' value='03'>03월</option>
                        <option name='month' value='04'>04월</option>
                        <option name='month' value='05'>05월</option>
                        <option name='month' value='06'>06월</option>
                        <option name='month' value='07'>07월</option>
                        <option name='month' value='08'>08월</option>
                        <option name='month' value='09'>09월</option>
                        <option name='month' value='10'>10월</option>
                        <option name='month' value='11'>11월</option>
                        <option name='month' value='12'>12월</option>
                    </Input>
                    <MenuButton onClick={onSearchClick}>검색</MenuButton>
                </Space>
            </Div>
            <FilterContainer gridApi={gridApi} columnApi={columnApi} excelFileName={'룰렛관리'}>
                <FilterGroup>
                    <InputFilter
                        gridApi={gridApi}
                        columns={[
                            {field: 'yyyymm', name: '룰렛ID', width: 100},
                            {field: 'title', name: '제목', width: 300},
                            {field: 'itemsCnt', name: '룰렛수', width: 100},
                            {field: 'rewardsCnt', name: '리워드수', width: 100},
                            {field: 'consumerCnt', name: '참여자수', width: 10},
                            {field: 'consumerGaeGeunCnt', name: '개근자수', width: 100},
                        ]}
                        isRealTime={true}
                    />
                </FilterGroup>
                {/*<Hr/>*/}
                {/*<FilterGroup>*/}
                {/*    <CheckboxFilter*/}
                {/*        gridApi={gridApi}*/}
                {/*        field={'displayFlag'}*/}
                {/*        name={'노출여부'}*/}
                {/*        data={[*/}
                {/*            {value: '공개', name: '공개'},*/}
                {/*            {value: '비공개', name: '비공개'},*/}
                {/*        ]}*/}
                {/*    />*/}
                {/*</FilterGroup>*/}
            </FilterContainer>

            <Flex mb={10}>
                <Space>
                    <MenuButton bg={'green'} onClick={toggle}>룰렛 생성</MenuButton>
                </Space>
                <Right>

                </Right>
            </Flex>

            <div
                id="myGrid"
                className="ag-theme-balham"
                style={{
                    height: '550px'
                }}
            >
                <AgGridReact
                    {...gridOptions}
                    rowData={rowData}
                    onGridReady={onGridReady}   //그리드 init(최초한번실행)
                />
            </div>


            <Modal isOpen={modalOpen} toggle={toggle} size={'xl'}>
                <ModalHeader toggle={toggle}>룰렛 생성 / 수정</ModalHeader>
                <ModalBody style={{background: color.veryLight}}>
                    {
                        modalOpen && <RouletteContent rouletteId={selected} onClose={onClose}/>
                    }
                </ModalBody>
            </Modal>

            <Modal
                isOpen={gaegeunModalOpen}
                toggle={gaegeunToggle}
                size="xl"
                style={{maxWidth: '900px', width: '80%'}}
                centered>
                <ModalHeader toggle={gaegeunToggle}>룰렛 개근 리스트 - {gaegeunSelected}</ModalHeader>
                <ModalBody>
                    <Suspense fallback={null}>
                        <RouletteGaegeunList yyyymm={gaegeunSelected} onClose={gaegeunToggle} />
                    </Suspense>
                </ModalBody>
            </Modal>

        </Div>
    );
};

export default RouletteManage;