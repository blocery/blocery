import React, { useState, useEffect, useRef } from 'react'
import { getConsumerAbusers } from '~/lib/adminApi'
import { getLoginAdminUser } from '~/lib/loginApi'
import ComUtil from '~/util/ComUtil'
import {Button, Input, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'
import { AgGridReact } from 'ag-grid-react';
import {Div, FilterGroup, Flex, Hr, Right, Space, Span} from "~/styledComponents/shared";
import ConsumerDetail from "~/components/common/contents/ConsumerDetail";
import BlctRenderer from "~/components/common/agGridRenderers/BlctRenderer";
import ExcelUtil from "~/util/ExcelUtil";
import {MenuButton} from "~/styledComponents/shared/AdminLayouts";
import FilterContainer from "~/components/common/gridFilter/FilterContainer";
import InputFilter from "~/components/common/gridFilter/InputFilter";
import CheckboxFilter from "~/components/common/gridFilter/CheckboxFilter";
import moment from "moment-timezone";

const WrappedBlctRenderer = ({data:rowData}) => {
    const d = {
        account:rowData.consumerAccount || null
    };
    return <BlctRenderer data={d} />;
}
const AbsuerList = (props) => {

    // React reference
    const gridRef = useRef();

    const [gridApi, setGridApi] = useState(null);
    const [columnApi, setColumnApi] = useState(null);

    const [isOpen, setIsOpen] = useState(false);
    const [modalValue, setModalValue] = useState(null);
    const [data, setData] = useState(null);

    const [searchData, setSearchData]= useState({
        abuserStat: "B/H/C"
    })

    const agGrid = {
        columnDefs: [
            {headerName: "소비자번호", field: "consumerNo",width: 100},
            {headerName: "이름", field: "name", cellRenderer: "nameRenderer",width: 100},
            {headerName: "email", field: "email", width: 150},
            {headerName: "phone", field: "phone", width: 100},
            {headerName: "차단", field: "blocked", width: 90},
            {headerName: "해킹", field: "hackerFlag", width: 90},
            {
                headerName: "커뮤니티", field: "communityAbuserFlag", width: 90,
                valueGetter: function (params){
                    if(params.data.communityPermanentlyFlag){
                        return true;
                    }
                    else if(params.data.communityAbuserFlag){
                        return true;
                    }
                    return false;
                }
            },
            {
                headerName: "커뮤니티제한일자", field: "communityAbuserDay", width: 150,
                valueGetter: function (params){
                    if(params.data.communityPermanentlyFlag){
                        return '영구정지';
                    }
                    else if (params.data.communityAbuserFlag) {
                        return `${moment(params.data.communityAbuserDay, 'YYYYMMDD').format('YY.MM.DD') } ~ ${moment(params.data.communityAbuserDay, 'YYYYMMDD').add(+14, 'days').format('YY.MM.DD')}`
                    }
                    return ''
                }
            },
            {headerName: "소비자안내메시지", field: "userMessage", width: 150},
            {headerName: "관리자메모", field: "memo", width: 150},
            {
                headerName: "등록일", field: "regDate", width: 150,
                valueGetter: function(params) {
                    //기공된 필터링 데이터로 필터링 되게 적용
                    return params.data.regDate ? ComUtil.utcToString(params.data.regDate, 'YY.MM.DD HH:mm'):null;
                }
            },
            {
                headerName: "수정일", field: "modDate", width: 150,
                valueGetter: function(params) {
                    return params.data.modDate ? ComUtil.utcToString(params.data.modDate, 'YY.MM.DD HH:mm'):null;
                }
            },
            {headerName: "IP", field: "ip", width: 150},
            {headerName: "송금주소", field: "account", width: 150},
            {
                headerName: "구분", field: "authType", width: 100,
                valueGetter: function(params) {
                    //기공된 필터링 데이터로 필터링 되게 적용
                    return params.data.authType == 1 ? '카카오' : '일반';
                }
            },
            {headerName: "카카오ID", field: "authId", width: 100, cellRenderer: "authIdRenderer"},
            {headerName: "소비자지갑주소", field: "consumerAccount", width: 200 },
            {headerName: "BLY", field: "bly", cellRenderer: "wrappedBlctRenderer", width: 150},
            {
                headerName: "탈퇴일", field: "stoppedDate", width: 100,
                valueGetter: function(params) {
                    //기공된 필터링 데이터로 필터링 되게 적용
                    return params.data.stoppedDate ? ComUtil.intToDateString(params.data.stoppedDate,"YY.MM.DD"):null;
                }
            },
            {
                headerName: "가입일", field: "timestamp", width: 150,
                valueGetter: function(params) {
                    //기공된 필터링 데이터로 필터링 되게 적용
                    return params.data.timestamp ? ComUtil.utcToString(params.data.timestamp, 'YY.MM.DD HH:mm'):null;
                }
            }
        ],
        defaultColDef: {
            width: 130,
            resizable: true,
            filter: true,
            sortable: true,
            floatingFilter: true,
            filterParams: {
                newRowsAction: 'keep'
            }
        },
        frameworkComponents: {
            emailRenderer: emailCellRenderer,
            nameRenderer: nameCellRenderer,
            authIdRenderer: authIdCellRenderer,
            wrappedBlctRenderer: WrappedBlctRenderer
        },
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
        overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
    };

    //[이벤트] 그리드 로드 후 callback 이벤트 API init
    const onGridReady = e => {
        setGridApi(e.api);
        setColumnApi(e.columnApi);
    };

    // 디드마운트
    useEffect(() => {
        async function fetch(){
            let user = await getLoginAdminUser();
            if (!user || user.email.indexOf('ezfarm') < 0) {
                //admin은 웹전용이라서, window로 이동하는 것이 더 잘됨. //this.props.history.push('/admin');
                window.location = '/admin/login';
            }

            await search();
        }
        fetch()
    }, [])

    const search = async () => {

        // api and columnApi on the gridRef object
        const {api, columnApi} = gridRef.current;

        if(api) {
            //ag-grid 레이지로딩중 보이기
            api.showLoadingOverlay();
        }
        const params = {
            abuserStat: searchData.abuserStat
        }
        const { status, data } = await getConsumerAbusers(params)
        if(status !== 200){
            alert('응답이 실패 하였습니다')
            return
        }
        setData(data);

        //ag-grid api
        if(api) {
            //ag-grid 레이지로딩중 감추기
            api.hideOverlay()
        }
    }

    const onNameClick = (data) => {
        // console.log({data})
        setModalValue(data.consumerNo);
        toggle();
    }

    const toggle = () => {
        const vIsOpen = !isOpen
        setIsOpen(vIsOpen)
        if (!isOpen) {
            //search();
        }
    }

    //// cellRenderer
    function nameCellRenderer ({value, data:rowData}) {
        return <Span fg={'primary'} onClick={onNameClick.bind(this, rowData)}><u>{rowData.name}</u></Span>
    }

    function emailCellRenderer ({value, data:rowData}) {
        return (<span><u>{rowData.email}</u></span>);
    }

    function authIdCellRenderer ({value, data:rowData}) {
        return (rowData.authType == 1? <span className='text-danger'>{rowData.authId}</span> : <span></span>)
    }

    const getFilterData = () => {
        if(!gridApi){ return [] }
        //필터링된 데이터 push
        let sortedData = [];
        gridApi.forEachNodeAfterFilterAndSort(function(node, index) {
            sortedData.push(node.data);
        });
        return sortedData;
    }
    const onExcelDownLoad = () => {
        const columns = [
            '소비자번호', '이름', '이메일', '전화번호','차단여부', '해커여부',
            '소비자안내메시지','관리자메모','등록일','수정일','IP','송금주소',
            '소비자지갑주소', '탈퇴일', '가입일'
        ]
        //필터링된 데이터
        let sortedData = getFilterData();
        //console.log(sortedData);
        const oData = sortedData.map((item ,index)=> {
            return [
                item.consumerNo, item.name, item.email, item.phone, item.blocked, item.hackerFlag,
                item.userMessage, item.memo,
                item.regDate ? ComUtil.utcToString(item.regDate, 'YYYY-MM-DD HH:mm'):null,
                item.modDate ? ComUtil.utcToString(item.modDate, 'YYYY-MM-DD HH:mm'):null,
                item.ip, item.account,
                item.consumerAccount,
                item.stoppedDate ? ComUtil.intToDateString(item.stoppedDate,"YYYY-MM-DD"):null,
                item.timestamp ? ComUtil.utcToString(item.timestamp, 'YYYY-MM-DD HH:mm'):null
            ]
        })
        const dataExcel = [{
            columns: columns,
            data: oData
        }];
        ExcelUtil.download("어뷰저조회", dataExcel);
    }

    const copy = ({value}) => {
        ComUtil.copyTextToClipboard(value, '', '');
    }

    // 조회할 change
    const onStateChange = async (e) => {
        setSearchData({abuserStat:e.target.value})
    }

    // if(data.length <= 0) return null;
    return (
        <Div p={16}>

            <Flex p={10} mb={10} bc={'secondary'}>
                <Space>
                    <Input type='select' name='select' style={{width: 200}} id='abuserStat' onChange={onStateChange}>
                        <option name='radioBorHorC' value='B/H/C' selected>차단/해킹/커뮤니티제제</option>
                        <option name='radioBorH' value='B/H'>차단/해킹</option>
                        <option name='radioBandH' value='B&H'>차단&해킹</option>
                        <option name='radioB' value='B'>차단</option>
                        <option name='radioH' value='H'>해킹</option>
                        <option name='radioC' value='C'>커뮤니티제제</option>
                        <option name='radioS' value='S'>탈퇴</option>
                        <option name='radioAll' value='ALL'>전체</option>
                    </Input>
                    <MenuButton onClick={search}>검색</MenuButton>
                </Space>
            </Flex>

            {/* filter START */}
            <FilterContainer gridApi={gridApi} columnApi={columnApi} excelFileName={'어뷰저 목록'}>
                <FilterGroup>
                    <InputFilter
                        gridApi={gridApi}
                        columns={[
                            {field: 'consumerNo', name: '소비자번호'},
                            {field: 'name', name: '소비자명'},
                            {field: 'email', name: '이메일'},
                            {field: 'phone', name: '연락처'},
                            {field: 'ip', name: '접속IP'},
                        ]}
                        isRealTime={true}
                    />
                </FilterGroup>
                <Hr/>
                <FilterGroup>
                    <CheckboxFilter
                        gridApi={gridApi}
                        field={'blocked'}
                        name={'차단여부'}
                        data={[
                            {value: true, name: 'true'},
                            {value: false, name: 'false'},
                        ]}
                    />
                    <CheckboxFilter
                        gridApi={gridApi}
                        field={'hackerFlag'}
                        name={'해킹여부'}
                        data={[
                            {value: true, name: 'true'},
                            {value: false, name: 'false'},
                        ]}
                    />
                    <CheckboxFilter
                        gridApi={gridApi}
                        field={'communityAbuserFlag'}
                        name={'커뮤니티 제제 여부'}
                        data={[
                            {value: true, name: 'true'},
                            {value: false, name: 'false'},
                        ]}
                    />
                </FilterGroup>
            </FilterContainer>
            {/* filter END */}

            <Flex mb={10}>
                <Div>
                    <MenuButton onClick={onExcelDownLoad}>엑셀 다운로드</MenuButton>
                </Div>
                <Right>총 {data && data.length}명</Right>
            </Flex>

            <div
                className="ag-theme-balham"
                style={{
                    height: '550px'
                }}
            >
                <AgGridReact
                    ref={gridRef}
                    columnDefs={agGrid.columnDefs}  //컬럼 세팅
                    rowSelection={'multiple'}
                    defaultColDef={agGrid.defaultColDef}
                    overlayLoadingTemplate={agGrid.overlayLoadingTemplate}
                    overlayNoRowsTemplate={agGrid.overlayNoRowsTemplate}
                    onGridReady={onGridReady}   //그리드 init(최초한번실행)
                    rowData={data}
                    frameworkComponents={agGrid.frameworkComponents}
                    onCellDoubleClicked={copy}
                >
                </AgGridReact>
            </div>
            <Modal size="lg" isOpen={isOpen}
                   toggle={toggle} >
                <ModalHeader toggle={toggle}>
                    소비자 상세 정보
                </ModalHeader>
                <ModalBody>
                    <ConsumerDetail consumerNo={modalValue} onClose={toggle} />
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={toggle}>닫기</Button>
                </ModalFooter>
            </Modal>
        </Div>
    )
}
export default AbsuerList;
