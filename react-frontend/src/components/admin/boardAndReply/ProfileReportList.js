import React, {useEffect, useState} from 'react';
import ComUtil from '~/util/ComUtil'
import {profileReportList} from '~/lib/adminApi'

//ag-grid
import { AgGridReact } from 'ag-grid-react';
import {Div, Flex, Space, Span} from "~/styledComponents/shared";
import moment from "moment-timezone";

import {getLoginAdminUser} from "~/lib/loginApi";
import {Server} from "~/components/Properties";
import {MenuButton} from "~/styledComponents/shared/AdminLayouts";
import {useModal} from "~/util/useModal";
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import ReportInfoViewContent from "~/components/admin/boardAndReply/ReportInfoViewContent";

const ProfileReportList = (props) => {
    const [reportModalOpen, setReportModalOpen, reportSelected, setReportSelected, setReportModalState] = useModal()
    const [gridApi, setGridApi] = useState(null);
    const [search, setSearch] = useState({
        isSearch:false,
        selectedGubun: 'day', //'week': 최초화면을 오늘(day)또는 1주일(week)로 설정.
        startDate: moment(moment().toDate()),
        endDate: moment(moment().toDate()),
        processed:false
    });
    const [dataList, setDataList] = useState([]);

    const agGrid = {
        columnDefs: [
            {
                headerName: "사용자번호", field: "targetConsumerNo",width: 120,
                cellStyle:ComUtil.getCellStyle({cellAlign: 'center'})
            },
            {
                headerName: "닉네임", field: "nickname",width: 150
            },
            {
                headerName: "프로필사진", field: "image",width: 150,
                cellRenderer: "ImageRenderer"
            },
            {
                headerName: "신고건수", field: "reportCount", width: 100,
                cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                cellRenderer: "reportRenderer"
            },
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
            ImageRenderer: ImageRenderer,
            reportRenderer: reportRenderer
        },
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
        overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
    };

    function ImageRenderer ({value: image}) {
        if(!image) return null;

        const src = Server.getImageURL() + image.imageUrl;
        const Style = {
            width: 50, height: 50, paddingRight: '1px'
        };
        return <img key={"profileImage"} src={src} style={Style} alt={'프로필사진'}/>
    }

    function reportRenderer ({value, data:rowData}) {
        return <Span fg={'primary'} onClick={onReportClick.bind(this, rowData)}><u>{value}</u></Span>
    }

    //[이벤트] 그리드 로드 후 callback 이벤트 API init
    const onGridReady = params => {
        setGridApi(params.api);
        if(gridApi)
            gridApi.resetRowHeights();
    };

    const getRowHeight = (params) => {
        return 50;
    }

    useEffect(() => {
        async function fetch() {
            const user = await getLoginAdminUser();
            if (!user || user.email.indexOf('ezfarm') < 0) {
                //admin은 웹전용이라서, window로 이동하는 것이 더 잘됨. //this.props.history.push('/admin');
                window.location = '/admin/login';
            }

            await getSearch();
        }
        fetch();

    }, []);

    useEffect(() => {
        if(search.isSearch){
            getSearch();
        }
    },[search]);

    const getSearch = async (searchButtonClicked) => {


        if(gridApi) {
            //ag-grid 레이지로딩중 보이기
            gridApi.showLoadingOverlay();
        }

        const { status, data } = await profileReportList()

        if(status !== 200){
            alert('응답이 실패 하였습니다')
            return
        }
        setDataList(data);

        //ag-grid api
        if(gridApi) {
            //ag-grid 레이지로딩중 감추기
            gridApi.hideOverlay()

            //ag-grid 높이 리셋 및 렌더링
            // Following line dymanic set height to row on content
            gridApi.resetRowHeights();
        }
    }

    const onReportClick = (data) => {
        setReportSelected(data)
        reportModalToggle()
    }
    const reportModalToggle = () => {
        setReportModalState(!reportModalOpen)
    }

    const copy = ({value}) => {
        ComUtil.copyTextToClipboard(value, '', '');
    }

    return (
        <Div p={16}>

            <Flex p={10} mb={10} bc={'secondary'}>
                <Space>
                    <MenuButton className="ml-3" color="primary" onClick={() => getSearch(true)}> 검 색 </MenuButton>
                </Space>
            </Flex>


            <div className="d-flex p-1">
                <div className="flex-grow-1 text-right">총 {dataList.length}명</div>
            </div>


            <div
                className="ag-theme-balham"
                style={{
                    height: '700px'
                }}
            >
                <AgGridReact
                    columnDefs={agGrid.columnDefs}  //컬럼 세팅
                    rowSelection={'multiple'}
                    getRowHeight={getRowHeight}
                    defaultColDef={agGrid.defaultColDef}
                    overlayLoadingTemplate={agGrid.overlayLoadingTemplate}
                    overlayNoRowsTemplate={agGrid.overlayNoRowsTemplate}
                    onGridReady={onGridReady}   //그리드 init(최초한번실행)
                    suppressRowClickSelection={false}
                    rowData={dataList}
                    frameworkComponents={agGrid.frameworkComponents}
                    onCellDoubleClicked={copy}
                >
                </AgGridReact>
            </div>

            {
                reportModalOpen && <Modal
                    size={'lg'} isOpen={reportModalOpen}
                    toggle={reportModalToggle}>
                    <ModalHeader toggle={reportModalToggle}>
                        신고내역
                    </ModalHeader>
                    <ModalBody>
                        {
                            reportModalOpen && <ReportInfoViewContent type={'Profile'} data={reportSelected}/>
                        }
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={reportModalToggle}>닫기</Button>
                    </ModalFooter>
                </Modal>
            }
        </Div>
    )
}
export default ProfileReportList