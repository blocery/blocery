import React, { useState, useEffect } from 'react';
import { Button,  Modal, ModalHeader, ModalBody } from 'reactstrap'

import { ModalConfirm } from '~/components/common/index'
import {delNoticeApi, getNoticeListForAdmin} from '~/lib/adminApi'
import { getLoginAdminUser } from '~/lib/loginApi'
import ComUtil from '~/util/ComUtil'

import { AgGridReact } from 'ag-grid-react';
import { Cell } from '~/components/common'
import NoticeReg from '../noticeReg/NoticeReg'
import FilterContainer from "~/components/common/gridFilter/FilterContainer";
import {Div, FilterGroup, Flex, Hr, Space} from "~/styledComponents/shared";
import InputFilter from "~/components/common/gridFilter/InputFilter";
import CheckboxFilter from "~/components/common/gridFilter/CheckboxFilter";
import {MenuButton} from "~/styledComponents/shared/AdminLayouts";
import moment from "moment-timezone";
import SearchDates from "~/components/common/search/SearchDates";

const NoticeList = (props) => {

    const agGrid = {
        columnDefs: [
            {headerName: "번호", field: "noticeNo", width: 70},
            {headerName: "예약여부", field: "reserved", width: 90,
                valueGetter: function(params) {
                    return (params.data.reserved === 1 ? '예약' : '미예약')
                }},
            {headerName: "날짜", field: "regDate", width: 200,
                valueGetter: function(params) {
                    return (params.data.reserved > 0 ? params.data.reservedDateHHmm : params.data.regDate)
                }},
            {headerName: "사용자구분", field: "userType"},
            {headerName: "공지유형", field: "noticeType", cellRenderer: "typeRenderer"},
            {headerName: "제목", field: "title", cellRenderer: "titleRenderer", width: 300},
            {headerName: "내용", field: "content", width: 700},
            {headername: "삭제", field:"", cellRenderer: "delButtonRenderer", width: 100},
            // {headername: "푸시여부", field: "sendPush", width: 100},
        ],
        defaultColDef: {
            width: 100,
            resizable: true,
            filter: true,
            sortable: true,
            floatingFilter: false,
            filterParams: {
                newRowsAction: 'keep'
            }
        },
        frameworkComponents: {
            titleRenderer: titleRenderer,
            delButtonRenderer: delButtonRenderer,
            typeRenderer: typeRenderer
        },
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
        overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>'
    };

    const [search, setSearch] = useState({
        isSearch:true,
        selectedGubun: 'week', //'week': 최초화면을 오늘(day)또는 1주일(week)로 설정.
        startDate: moment(moment().toDate()).add(-7,"days"),
        endDate: moment(moment().toDate()),
    });

    const [noticeList, setNoticeList] = useState([]);
    const [isOpen, setIsOpen] = useState(false)
    const [noticeData, setNoticeData] = useState(null)
    const [gridApi, setGridApi] = useState(null)
    const [columnApi, setColumnApi] = useState(null)

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
    const onGridReady = (params) => {
        //API init
        setGridApi(params.api)
        setColumnApi(params.columnApi)
    }

    async function checkLogin() {
        let user = await getLoginAdminUser();
        if (!user || user.email.indexOf('ezfarm') < 0) {
            //admin은 웹전용이라서, window로 이동하는 것이 더 잘됨. //this.props.history.push('/admin');
            window.location = '/admin/login';
        }
    }

    const getSearch = async (searchButtonClicked) => {

        if (searchButtonClicked) {
            if (!search.startDate || !search.endDate) {
                alert('시작일과 종료일을 선택해주세요')
                return;
            }
        }
        if (gridApi) {
            //ag-grid 레이지로딩중 보이기
            gridApi.showLoadingOverlay();
        }
        const params = {
            startDate: search.startDate ? moment(search.startDate).format('YYYYMMDD') : null,
            endDate: search.endDate ? moment(search.endDate).format('YYYYMMDD') : null
        };
        const {status, data} = await getNoticeListForAdmin(params)
        if (status !== 200) {
            alert('응답이 실패 하였습니다')
            return
        }
        data.map((item, index) => {
            let regDate = data[index].regDate ? ComUtil.utcToString(data[index].regDate, 'YYYY-MM-DD HH:mm') : null;
            let reservedDateHHmm = data[index].reservedDateHHmm ? ComUtil.utcToString(data[index].reservedDateHHmm, 'YYYY-MM-DD HH:mm') : null;

            data[index].regDate = regDate;
            data[index].reservedDateHHmm = reservedDateHHmm;
            item.sendPush = (item.sendPush) ? true : '';
        });
        setNoticeList(data);

        //ag-grid api
        if(gridApi) {
            //ag-grid 레이지로딩중 감추기
            gridApi.hideOverlay()
        }
    }

    const selectNotice = (noticeData) => {
        setNoticeData(noticeData)
        toggle()
    }

    const regNotice = () => {
        setNoticeData({});
        toggle()
    }

    const regNoticeFinished = () => {
        toggle()
        getSearch();
    }

    function titleRenderer({value, data:rowData}) {
        return (
            <Cell textAlign="left">
                <div onClick={selectNotice.bind(this, rowData)} style={{color: 'blue'}}>
                    <u>{rowData.title}</u>
                </div>
            </Cell>
        );
    }

    function delButtonRenderer({value, data:rowData}) {
        // console.log(rowData);
        return (
            <Cell>
                <div style={{textAlign: 'center'}}>
                    <ModalConfirm title={'공지사항 삭제'} content={<div>선택한 공지사항을 삭제하시겠습니까?</div>} onClick={delNotice.bind(this, rowData.noticeNo)}>
                        <Button block size='sm' color={'info'}>삭제</Button>
                    </ModalConfirm>
                </div>
            </Cell>
        );
    }

    function typeRenderer({value, data:rowData}) {
        return (
            <Cell textAlign="left">
                <div>
                    {rowData.noticeType === 'event' ? '이벤트' :
                        rowData.noticeType === 'check' ?  '점검' :
                            rowData.noticeType === 'etc' ? '기타' : '공지'
                    }
                </div>
            </Cell>
        )
    }

    const delNotice = async(noticeNo, isConfirmed) => {
        if (isConfirmed) {
            await delNoticeApi(noticeNo);
            await getSearch();
        }
    }

    function toggle(){
        setIsOpen(!isOpen)
    }


    const onDatesChange = async (data) => {
        const search = Object.assign({}, search);
        search.startDate = data.startDate;
        search.endDate = data.endDate;
        search.selectedGubun = data.gubun;
        search.isSearch = data.isSearch;
        setSearch(search);
    }

    return (
        <Div p={16}>

            <Flex p={10} mb={10} bc={'secondary'}>
                <Space>
                    <Div>기 간 (등록일)</Div>
                    <SearchDates
                        gubun={search.selectedGubun}
                        startDate={search.startDate}
                        endDate={search.endDate}
                        onChange={onDatesChange}
                    />
                    <MenuButton onClick={() => getSearch(true)}> 검 색 </MenuButton>
                </Space>
            </Flex>

            {/* filter START */}
            <FilterContainer gridApi={gridApi} columnApi={columnApi} excelFileName={'공지사항 목록'}>
                <FilterGroup>
                    <InputFilter
                        gridApi={gridApi}
                        columns={[
                            {field: 'title', name: '제목'},
                            {field: 'content', name: '내용'},
                        ]}
                        isRealTime={true}
                    />
                </FilterGroup>
                <Hr/>
                <FilterGroup>
                    <CheckboxFilter
                        gridApi={gridApi}
                        field={'reserved'}
                        name={'예약여부'}
                        data={[
                            {value: '예약', name: '예약'},
                            {value: '미예약', name: '미예약'},
                        ]}
                    />
                    <CheckboxFilter
                        gridApi={gridApi}
                        field={'userType'}
                        name={'사용자구분'}
                        data={[
                            {value: 'consumer', name: 'consumer'},
                            // {value: 'buyer', name: 'buyer'},
                            {value: 'producer', name: 'producer'},
                            // {value: 'seller', name: 'seller'},
                        ]}
                    />
                </FilterGroup>
            </FilterContainer>
            {/* filter END */}

            <Space mb={10}>
                <MenuButton bg={'green'} onClick={regNotice}>공지사항 등록</MenuButton>
            </Space>

            <div
                className="ag-theme-balham"
                style={{
                    height: '700px'
                }}
            >
                <AgGridReact
                    columnDefs={agGrid.columnDefs}
                    defaultColDef={agGrid.defaultColDef}
                    rowSelection={'single'}  //멀티체크 가능 여부
                    overlayLoadingTemplate={agGrid.overlayLoadingTemplate}
                    overlayNoRowsTempalte={agGrid.overlayNoRowsTemplate}
                    rowData={noticeList}
                    frameworkComponents={agGrid.frameworkComponents}
                    onGridReady={onGridReady}   //그리드 init(최초한번실행)
                />

                <Modal isOpen={isOpen} toggle={toggle} className={''} centered>
                    <ModalHeader toggle={toggle}>공지사항</ModalHeader>
                    <ModalBody>
                        <NoticeReg noticeData={noticeData} onClose={regNoticeFinished}/>
                    </ModalBody>
                </Modal>

            </div>
        </Div>
    )
}

export default NoticeList