import React, { Component } from 'react';
import { Button } from 'reactstrap'
import ComUtil from '~/util/ComUtil'
import { getLoginAdminUser } from '~/lib/loginApi'
import { getEventInfoList, delEventInfo } from '~/lib/adminApi'
import { ModalConfirm, AdminModalFullPopupWithNav } from '~/components/common'
import EventReg from '~/components/admin/eventList/EventReg'
import { AgGridReact } from 'ag-grid-react';
import { Cell } from '~/components/common'
import {MenuButton} from "~/styledComponents/shared/AdminLayouts";
import {Div, Flex, Right, Space, Span} from "~/styledComponents/shared";
import {Server} from "~/components/Properties";
import moment from "moment-timezone";
import DatePicker from "react-datepicker";
import "react-datepicker/src/stylesheets/datepicker.scss";

export default class EventList extends Component{
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
                    headerName: "이벤트NO", field: "eventNo",
                    suppressSizeToFit: true,
                    filterParams: {
                        clearButton: true //클리어버튼
                    },
                    sortable: true,
                    cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                    width: 150
                },
                {
                    headerName: "타입", field: "eventType",
                    suppressSizeToFit: true,
                    filterParams: {
                        clearButton: true //클리어버튼
                    },
                    sortable: true,
                    cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                    width: 100,
                    valueGetter: function(params) {
                        return params.data.eventType === 1 ? 'listUrl' : 'event';
                    },
                },
                {
                    headerName: "이벤트 타이틀",
                    field: "eventTitle",
                    suppressSizeToFit: true,
                    filterParams: {
                        clearButton: true //클리어버튼
                    },
                    cellStyle:ComUtil.getCellStyle({cellAlign: 'left'}),
                    cellRenderer: "titleRenderer",
                    width: 400
                },
                {
                    headerName: "이벤트 이미지",
                    field: "images",
                    suppressFilter: false,   //no filter
                    suppressSorting: false,  //no sort
                    cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                    cellRenderer:"imageRenderer",
                    width: 120
                },
                {
                    headerName: "이벤트 시작일", field: "startDay",
                    suppressSizeToFit: true,
                    cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                    width: 180,
                    cellRenderer: "formatIntDateRenderer",
                    valueGetter: function(params) {
                        //console.log("params",params);
                        //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                        let v_Date = params.data.startDay ? ComUtil.intToDateString(params.data.startDay, 'YYYY-MM-DD') : null;
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
                    headerName: "이벤트 종료일", field: "endDay",
                    suppressSizeToFit: true,
                    cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                    width: 180,
                    cellRenderer: "formatIntDateRenderer",
                    valueGetter: function(params) {
                        //console.log("params",params);
                        //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                        let v_Date = params.data.endDay ? ComUtil.intToDateString(params.data.endDay, 'YYYY-MM-DD') : null;
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
                    headerName: "이벤트 등록일", field: "timestamp",
                    suppressSizeToFit: true,
                    cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                    width: 180,
                    cellRenderer: "formatDatesRenderer",
                    valueGetter: function(params) {
                        //console.log("params",params);
                        //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                        let v_Date = params.data.timestamp ? ComUtil.utcToString(params.data.timestamp, 'YYYY-MM-DD HH:mm') : null;
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
                    headerName: "이벤트 URL",
                    suppressFilter: true,   //no filter
                    suppressSorting: true,  //no sort
                    cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                    width: 150,
                    cellRenderer: "eventUrlRenderer"
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
                titleRenderer:this.titleRenderer,
                delButtonRenderer:this.delButtonRenderer,
                eventUrlRenderer:this.eventUrlRenderer,
                imageRenderer:this.imageRenderer
            },
            eventNo:"",
            isModalOpen:false
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
        return 75;
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
    formatIntDateRenderer = ({value, data:rowData}) => {
        return (value ? ComUtil.intToDateString(value,'YYYY-MM-DD') : '-')
    };

    titleRenderer = ({value, data:rowData}) => {
        return (
            <Cell textAlign="left">
                <div onClick={this.regEvent.bind(this, rowData.eventNo)} style={{color: 'blue'}}>
                    <u>{rowData.eventTitle}</u>
                </div>
            </Cell>
        );
    };

    //이벤트 이미지 렌더러
    imageRenderer = ({value: images}) => {
        return images.map((image,index) => {
            const src = Server.getThumbnailURL() + image.imageUrl;
            const Style = {
                width: 75, height: 75, paddingRight: '1px'
            };
            return <img key={"mainImage"+index} src={src} style={Style} alt={'이벤트 이미지'}/>
        })
    };

    eventUrlRenderer = ({value, data:rowData}) => {
        return (
            <Cell textAlign="left">
                <div style={{color: 'black'}}>
                    <span>/event?no={rowData.eventNo}</span>
                </div>
            </Cell>
        );
    };

    delButtonRenderer = ({value, data:rowData}) => {
        return (
            <Cell>
                <div className="d-flex" style={{textAlign: 'center'}}>
                    <ModalConfirm title={'삭제'} content={<div>선택한 이벤트를 삭제하시겠습니까?</div>} onClick={this.delEvent.bind(this, rowData.eventNo)}>
                        <Button block size='sm' color={'info'}>삭제</Button>
                    </ModalConfirm>
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
        const { status, data } = await getEventInfoList(params);
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

    delEvent = async(eventNo, isConfirmed) => {
        if (isConfirmed) {
            await delEventInfo(eventNo);
            await this.search();
        }
    };

    regEvent = (eventNo) => {
        let v_eventNo="";
        if(eventNo){
            v_eventNo = eventNo;
        }
        this.setState({
            eventNo:v_eventNo,
            isModalOpen: true
        });
    };

    regModalToggle=()=>{
        this.setState({
            eventNo:"",
            isModalOpen: !this.state.isModalOpen
        });
    };

    //등록 모달 팝업 닫기
    onPopupClose = (data) => {

        this.setState({
            eventNo:"",
            isModalOpen: !this.state.isModalOpen
        });

        if(data && data.refresh){
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
            <MenuButton onClick={onClick}>이벤트 {value} 년</MenuButton>
        );
        return (
            <Div p={16}>

                <Flex mb={10}>
                    <Div>
                        <Space>
                            <MenuButton bg={'green'} onClick={this.regEvent.bind(this,'')}>이벤트 등록</MenuButton>
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
                        <Span fg={'green'} >{this.state.data.length}</Span>개의 이벤트
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
                <AdminModalFullPopupWithNav
                    show={this.state.isModalOpen}
                    title={'이벤트 등록 및 수정'}
                    onClose={this.onPopupClose}>
                    <EventReg
                        eventNo={this.state.eventNo}
                    />
                </AdminModalFullPopupWithNav>

            </Div>
        )
    }
}
