import React, { Component } from 'react';
import { Button} from 'reactstrap'
import ComUtil from '~/util/ComUtil'
import { getLoginAdminUser } from '~/lib/loginApi'
import { getMdPickList, delMdPick, hideMdPick } from '~/lib/adminApi'
import { ModalConfirm, AdminModalFullPopupWithNav } from '~/components/common'
import { AgGridReact } from 'ag-grid-react';
import { Cell } from '~/components/common'
import { Server } from '../../Properties'
import moment from 'moment-timezone'
import {Div, Flex, Right, Space, Span} from "~/styledComponents/shared";
import {MenuButton} from "~/styledComponents/shared/AdminLayouts";
import DatePicker from "react-datepicker";
import "react-datepicker/src/stylesheets/datepicker.scss";
import {B2cMdPickReg} from '~/components/admin/b2cMdPick'

export default class B2cMdPick extends Component{
    constructor(props) {
        super(props);
        this.gridRef = React.createRef();
        this.state = {
            search: {
                year:moment().format('YYYY')
            },
            loading: false,
            data: [],
            columnDefs: [
                {
                    headerName: "기획전ID", field: "mdPickId",
                    suppressSizeToFit: true,
                    filterParams: {
                        clearButton: true //클리어버튼
                    },
                    sortable: true,
                    cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                    width: 150
                },
                {
                    headerName: "메인 이미지",
                    field: "mdPickMainImages",
                    suppressFilter: true,   //no filter
                    suppressSorting: true,  //no sort
                    cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                    cellRenderer:"mainImageRenderer",
                    width: 120
                },
                {
                    headerName: "기획전명",
                    field: "mdPickNm",
                    suppressSizeToFit: true,
                    filterParams: {
                        clearButton: true //클리어버튼
                    },
                    cellStyle:ComUtil.getCellStyle({cellAlign: 'left'}),
                    cellRenderer: "titleRenderer",
                    width: 250
                },
                {
                    headerName: "기획전 시작일", field: "mdPickStartDate",
                    suppressSizeToFit: true,
                    cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                    width: 180,
                    cellRenderer: "formatDatesRenderer",
                    valueGetter: function(params) {
                        //console.log("params",params);
                        //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                        let v_Date = params.data.mdPickStartDate ? ComUtil.utcToString(params.data.mdPickStartDate, 'YYYY-MM-DD HH:mm') : null;
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
                    headerName: "기획전 종료일", field: "mdPickEndDate",
                    suppressSizeToFit: true,
                    cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                    width: 180,
                    cellRenderer: "formatDatesRenderer",
                    valueGetter: function(params) {
                        //console.log("params",params);
                        //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                        let v_Date = params.data.mdPickEndDate ? ComUtil.utcToString(params.data.mdPickEndDate, 'YYYY-MM-DD HH:mm') : null;
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
                    headerName: "상품수",
                    field: "mdPickGoodsCnt",
                    suppressSizeToFit: true,
                    filterParams: {
                        clearButton: true //클리어버튼
                    },
                    cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                    cellRenderer: "goodsCntRenderer",
                    width: 100
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
                mainImageRenderer: this.mainImageRenderer,
                titleRenderer:this.titleRenderer,
                goodsCntRenderer:this.goodsCntRenderer,
                delButtonRenderer:this.delButtonRenderer
            },
            mdPickId:"",
            mdPickModalTitle:"",
            isMdPickRegModalOpen:false
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

    //메인 이미지 렌더러
    mainImageRenderer = ({value: images}) => {
        return images.map((image,index) => {
            const src = Server.getThumbnailURL() + image.imageUrl;
            const Style = {
                width: 75, height: 75, paddingRight: '1px'
            };
            return <img key={"mainImage"+index} src={src} style={Style} alt={'기획전 목록 이미지'}/>
        })
    };

    titleRenderer = ({value, data:rowData}) => {
        return (
            <Cell textAlign="left">
                <div onClick={this.regMdPick.bind(this, rowData.mdPickId)} style={{color: 'blue'}}>
                    <u>{rowData.mdPickNm}</u>
                </div>
            </Cell>
        );
    };

    goodsCntRenderer = ({value, data:rowData}) => {
        let goodsCnt = rowData.mdPickGoodsList.length;
        return (
            <Cell textAlign="center">
                <span>{goodsCnt}개</span>
            </Cell>
        );
    };

    delButtonRenderer = ({value, data:rowData}) => {

        const now = ComUtil.utcToString(moment(), "YYYY-MM-DDThh:mm:ss");
        let validPick = ComUtil.compareDate(rowData.mdPickEndDate, now);
        let notYetPick = ComUtil.compareDate(rowData.mdPickStartDate, now);

        return (
            <Cell>
                <div className="d-flex" style={{textAlign: 'center'}}>
                    {(rowData.hideFromHome == true) ?
                        <ModalConfirm title={'홈화면에 노출'} content={<div>선택한 기획전을 홈화면에 노출하시겠습니까?</div>} onClick={this.showMdPickHome.bind(this, rowData.mdPickId)}>
                            <Button className="mr-3" size='sm' color={'info'}>홈화면숨김중</Button>
                        </ModalConfirm>
                        :
                        (validPick < 0) ?
                            <Button disabled={true} className="mr-3" size='sm' color={'secondary'}>기간종료</Button>
                            :
                            <ModalConfirm title={'홈화면에서 숨김'} content={<div>선택한 기획전을 홈화면에서 숨김처리 하시겠습니까?</div>} onClick={this.hideMdPickHome.bind(this, rowData.mdPickId)}>
                                {(notYetPick >= 0) ?
                                    <Button className="mr-3" size='sm' color={'info'}>시작 전</Button>
                                    :
                                    <Button className="mr-3" size='sm' color={'info'}>홈화면출력중</Button>
                                }
                            </ModalConfirm>
                    }

                    <ModalConfirm title={'기획전 삭제'} content={<div>선택한 기획전을 삭제하시겠습니까?</div>} onClick={this.delMdPick.bind(this, rowData.mdPickId)}>
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
        const { status, data } = await getMdPickList(params);
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

    delMdPick = async(mdPickId, isConfirmed) => {
        if (isConfirmed) {
            await delMdPick(mdPickId);
            await this.search();
        }
    };

    hideMdPickHome = async(mdPickId, isConfirmed) => {
        if (isConfirmed) {
            await hideMdPick(mdPickId, true);
            await this.search();
        }
    };
    showMdPickHome = async(mdPickId, isConfirmed) => {
        if (isConfirmed) {
            await hideMdPick(mdPickId, false);
            await this.search();
        }
    };


    regMdPick = (mdPickId) => {
        let v_mdPickId="";
        let v_title = "기획전 등록";
        if(mdPickId){
            v_title = "기획전 수정";
            v_mdPickId = mdPickId;
        }
        this.setState({
            mdPickId:v_mdPickId,
            mdPickModalTitle:v_title,
            isMdPickRegModalOpen: true
        });
    };

    regMdPickModalToggle=()=>{
        this.setState({
            mdPickId:"",
            mdPickModalTitle:"",
            isMdPickRegModalOpen: !this.state.isMdPickRegModalOpen
        });
    };

    //기획전 등록 모달 팝업 닫기
    onMdPickPopupClose = (data) => {

        this.setState({
            mdPickId:"",
            mdPickModalTitle:"",
            isMdPickRegModalOpen: !this.state.isMdPickRegModalOpen
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
            <MenuButton onClick={onClick}>기획전 {value} 년</MenuButton>
        );
        return (
            <Div p={16}>

                <Flex mb={10}>
                    <Div>
                        <Space>
                            <MenuButton bg={'green'} onClick={this.regMdPick.bind(this,'')}>기획전 등록</MenuButton>
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
                        <Span fg={'green'} >{this.state.data.length}</Span>개의 기획전
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
                    show={this.state.isMdPickRegModalOpen}
                    title={this.state.mdPickModalTitle}
                    onClose={this.onMdPickPopupClose}>
                    <B2cMdPickReg
                        mdPickId={this.state.mdPickId}
                    />
                </AdminModalFullPopupWithNav>
            </Div>
        )
    }
}
