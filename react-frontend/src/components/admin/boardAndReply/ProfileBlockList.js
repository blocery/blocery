import React, {useEffect, useState} from 'react';
import ComUtil from '~/util/ComUtil'
import {profileBlockList, profileBlindingBlock, profileNotBlindingBlock} from '~/lib/adminApi'

//ag-grid
import { AgGridReact } from 'ag-grid-react';
import {Div, Flex, Space, Span} from "~/styledComponents/shared";
import moment from "moment-timezone";

import {getLoginAdminUser} from "~/lib/loginApi";
import {useModal} from "~/util/useModal";
import {Server} from "~/components/Properties";
import {MenuButton} from "~/styledComponents/shared/AdminLayouts";

const ProfileBlockList = (props) => {

    const [gridApi, setGridApi] = useState(null);
    const [search, setSearch] = useState({
        isSearch:false,
        selectedGubun: 'day', //'week': 최초화면을 오늘(day)또는 1주일(week)로 설정.
        startDate: moment(moment().toDate()),
        endDate: moment(moment().toDate()),
        processed:false
    });
    const [dataList, setDataList] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);


    const agGrid = {
        columnDefs: [
            {
                headerName: "사용자번호", field: "targetConsumerNo",width: 120,
                cellStyle:ComUtil.getCellStyle({cellAlign: 'center'})
            },
            {
                headerName: "닉네임", field: "nickname",width: 150,
                headerCheckboxSelection: true,
                headerCheckboxSelectionFilteredOnly: true,  //전체 체크시 필터된 것만 체크
                checkboxSelection: true,
            },
            {
                headerName: "프로필사진", field: "image",width: 150,
                cellRenderer: "ImageRenderer"
            },
            {
                headerName: "이전닉네임(복구용)", field: "bliendNickname",width: 150,
            },
            {
                headerName: "이전프로필사진(복구용)", field: "bliendImage",width: 150,
                cellRenderer: "ImageRenderer"
            },
            {
                headerName: "차단건수", field: "blockCount", width: 100,
                cellStyle:ComUtil.getCellStyle({cellAlign: 'center'})
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
            ImageRenderer: ImageRenderer
        },
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
        overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
    };

    function ImageRenderer ({value: image}) {
        if(!image) return null;
        //return images.map((image,index) => {
            const src = Server.getImageURL() + image.imageUrl;
            const Style = {
                width: 50, height: 50, paddingRight: '1px'
            };
            return <img key={"profileImage"} src={src} style={Style} alt={'프로필사진'}/>
        //})
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

        const { status, data } = await profileBlockList()

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

    const copy = ({value}) => {
        ComUtil.copyTextToClipboard(value, '', '');
    }

    const onSelectionChanged = (event) => {
        updateSelectedRows();
    }
    const updateSelectedRows = () => {
        setSelectedRows(gridApi.getSelectedRows())
    }

    const onDeleteClick = async () => {
        const res = selectedRows
        const processedList = []

        //블라인드 대상만 정리
        res.map((profileItem) => {
            processedList.push({targetConsumerNo:profileItem.targetConsumerNo})
        })
        if (window.confirm(`${processedList.length}건을 블라인드 차단 하시겠습니까?`)) {
            try{
                //delete(deleted = true 로 업데이트)
                await Promise.all(processedList.map(item => profileBlindingBlock({targetConsumerNo:item.targetConsumerNo})))
                alert(`${processedList.length}건이 블라인드 차단 되었습니다.`)
                setSelectedRows([])
                await getSearch()
            }catch (err){
                alert('에러가 발생하였습니다. 다시 시도해 주세요.')
            }
        }
    }

    const onNotDeleteClick = async () => {
        const res = selectedRows
        const processedList = []

        //블라인드된 대상만 정리
        res.map((profileItem) => {
            processedList.push({targetConsumerNo:profileItem.targetConsumerNo})
        })
        if (window.confirm(`${processedList.length}건을 블라인드 차단 복구 하시겠습니까?`)) {
            try{
                await Promise.all(processedList.map(item => profileNotBlindingBlock({targetConsumerNo:item.targetConsumerNo})))
                alert(`${processedList.length}건이 블라인드 차단 복구 되었습니다.`)
                setSelectedRows([])
                await getSearch()
            }catch (err){
                alert('에러가 발생하였습니다. 다시 시도해 주세요.')
            }
        }
    }

    return (
        <Div p={16}>

            <Flex p={10} mb={10} bc={'secondary'}>
                <Space>
                    <MenuButton className="ml-3" color="primary" onClick={() => getSearch(true)}> 검 색 </MenuButton>
                </Space>
            </Flex>


            <div className="d-flex p-1">
                <div>
                    {
                        (selectedRows.length > 0) &&
                            <MenuButton bg={'danger'} fg={'white'} onClick={onDeleteClick}>{selectedRows.length}건 블라인드</MenuButton>
                    }
                    {
                        (selectedRows.length > 0) &&
                            <MenuButton ml={10} bg={'green'} fg={'white'} onClick={onNotDeleteClick}>{selectedRows.length}건 블라인드 복구</MenuButton>
                    }
                </div>
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
                    onSelectionChanged={onSelectionChanged}
                >
                </AgGridReact>
            </div>

        </Div>
    )
}
export default ProfileBlockList