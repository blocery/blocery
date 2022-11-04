import React, {useEffect, useMemo, useState} from 'react';
import adminApi from "~/lib/adminApi";
import {Button, Div, Flex, Link, Right, Space, Span} from "~/styledComponents/shared";
import {Modal, ModalBody, ModalHeader} from "reactstrap";
import {color} from "~/styledComponents/Properties";
import HashTagContent from "~/components/admin/hashTag/HashTagContent";
import {useModal} from "~/util/useModal";
import HashTagGroupContent from "~/components/admin/hashTagGroupManager/HashTagGroupContent";
import {AgGridReact} from "ag-grid-react";
import ComUtil from "~/util/ComUtil";
import {hashTagVisiblePageStore} from '~/store'
import {useRecoilState} from "recoil";
import {boardTagModalState} from "~/recoilState";
import GoodsListByHashTags from "~/components/admin/hashTagGroupManager/GoodsListByHashTags";
import {getGoodsByTags} from "~/lib/shopApi";
import {MenuButton} from "~/styledComponents/shared/AdminLayouts";
import HashtagMultiSaveContent from "~/components/admin/goodsList/MultiTagManagerContent";

/*
    int groupNo;                        //유일키
    String visiblePage;                 //해시태그가 노출될 위치 코드 : home, best, contract...
    String groupName;                   //해시태그 노출 그룹명 : "잘 나가요, 이 상품"
    List<HashTag> hashTags;             //해시태그 : 팜토리, 유기농, 친환경, 신뢰
    boolean visibility;                 //화면 노출여부 : true, false
    int sortNum;                        //정렬순서
    Date timestamp;                     //등록일
 */
const HashTagGroupManager = (props) => {
    const [tagModalState, setTagModalState] = useRecoilState(boardTagModalState)
    const [modalOpen, , selected, setSelected, , toggle] = useModal()
    const [hashTagModalOpen, , hashTagSelected, setHashTagSelected, , hashTagToggle] = useModal()
    const [gridApi, setGridApi] = useState()
    const [rowData, setRowData] = useState([])


    const [selectedGroupNo, setSelectedGroupNo] = useState()

    const onRowClick = ({data}) => {
        setSelectedGroupNo(data.groupNo)
    }

    const gridOptions = {
        getRowHeight: function(params) {
            return 30;
        },
        // enableColResize: true,              //컬럼 크기 조정
        // enableSorting: true,                //정렬 여부
        // enableFilter: true,                 //필터링 여부
        // floatingFilter: true,               //Header 플로팅 필터 여부
        suppressMovableColumns: true,       //헤더고정시키
        columnDefs: [
            {
                headerName: "노출페이지", field: "visiblePage",width: 100, valueGetter: function ({data}){
                    const item = hashTagVisiblePageStore.find(store => store.value === data.visiblePage)
                    console.log({item})
                    if (item) return item.label
                    return ''
                }
            },
            {
                headerName: "제목", field: "groupName",width: 130, cellRenderer: 'groupNameRenderer'
            },
            {
                headerName: "그룹 해시태그", field: "hashTags", cellRenderer: 'hashTagsRenderer', flex:1
            },
            {
                headerName: "노출여부", field: "visibility", width: 70, valueGetter: function ({data}){
                    return data.visibility ? '예' : '아니오'
                }
            },
            {
                headerName: "순서", field: "sortNum", width: 70,
            },
            {
                headerName: "등록일", field: "timestamp", width: 100, hide: true,
                valueGetter: function ({data}){
                    return ComUtil.utcToString(data.timestamp, "YYYY-MM-DD HH:mm:ss")
                },
                // ,
                //     headerCheckboxSelection: true,
                //     headerCheckboxSelectionFilteredOnly: true,  //전체 체크시 필터된 것만 체크
                //     checkboxSelection: true,
            },
            {
                headerName: "상품개수", field: "appliedGoodsCount", width: 90//, cellRendererFramework: AppliedGoodsCountRenderer
            },
        ],
        onGridReady: onGridReady.bind(this),              //그리드 init(최초한번실행)
        // onFilterChanged: this.onGridFilterChanged.bind(this),  //필터온체인지 이벤트
        // onCellDoubleClicked: this.copy,
        // onSelectionChanged: this.onSelectionChanged.bind(this),
        onRowClicked: onRowClick.bind(this),
        defaultColDef: {
            // width: 300,
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
            groupNameRenderer: groupNameRenderer,
            hashTagsRenderer: hashTagsRenderer
        },
        rowSelection: 'multiple',
        groupSelectsFiltered: true,
        suppressRowClickSelection: false,   //false : 셀 클릭시 체크박스도 체크 true: 셀클릭시 체크박스 체크 안함
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
        overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
    }
    function onGridReady (params){
        setGridApi(params.api)
    }


    function groupNameRenderer({data}) {
        return (
            <Div fg={'primary'} onClick={onGroupNameClick.bind(this, data.groupNo)}>
                <u>{data.groupName}</u>
            </Div>
        )
    }


    function hashTagsRenderer({data}) {
        return (
            <div>
                {
                    data.hashTags.map(tag =>
                        <Span key={tag} onClick={onTagClick.bind(this, tag)} mr={6}>#{tag}</Span>
                    )
                }
            </div>
        )
    }

    const onTagClick = (tag) => {
        //태그 전체조회 모달 조회
        setTagModalState({
            tag: tag,
            isOpen: true
        })
    }

    const onGroupNameClick = (groupNo) => {
        setSelected(groupNo)
        toggle()
    }

    useEffect(() => {
        search()
    }, [])
    const search = async () => {
        const {data} = await adminApi.getAllHashTagGroupList()
        console.log({data: data})

        setRowData(data)
    }

    const onClose = () => {
        toggle()
        search()
    }
    const copy = ({value}) => {
        ComUtil.copyTextToClipboard(value, '', '')
    }
    const confirmClose = () => {
        if (!window.confirm('창을 닫으시겠습니까?')) {
            return false
        }

        hashTagToggle()
    }
    return (
        <Div p={16}>

            <Flex alignItems={'flex-start'}>
                <Div width={'50%'}>
                    <Flex mb={10} alignItems={'flex-end'}>
                        <Space>
                            <MenuButton onClick={search}>새로고침</MenuButton>
                            <MenuButton bg={'green'} onClick={toggle}>신규등록</MenuButton>
                            <MenuButton bg={'green'} onClick={hashTagToggle}>해시태그 일괄등록</MenuButton>
                            <MenuButton ><Link to={'/admin/shop/goods/goodsList'}>상품목록 바로가기</Link></MenuButton>
                        </Space>
                        <Space ml={'auto'}>

                        </Space>
                    </Flex>

                    <div
                        id="myGrid"
                        className="ag-theme-balham"
                        style={{
                            width: '100%',
                            height: '700px'
                        }}
                    >
                        <AgGridReact
                            // reactUi={"true"}
                            {...gridOptions}
                            rowData={rowData}
                            onCellDoubleClicked={copy}
                        />
                    </div>
                </Div>
                <Div flexGrow={1} pl={10}>


                    <GoodsListByHashTags groupNo={selectedGroupNo}
                        // hashTags={selectedRow ? selectedRow.hashTags : []}
                    />


                </Div>

            </Flex>
            <Modal isOpen={modalOpen} toggle={toggle} size={'lg'}>
                <ModalHeader toggle={toggle}>#해시태그 그룹 등록</ModalHeader>
                <ModalBody style={{background: color.veryLight}}>
                    <HashTagGroupContent groupNo={selected} onClose={onClose}/>
                </ModalBody>
            </Modal>
            <Modal isOpen={hashTagModalOpen} toggle={confirmClose} centered size={'xl'}>
                <ModalHeader toggle={hashTagToggle}>해시태그 일괄 등록/수정</ModalHeader>
                <ModalBody style={{padding: 0}}>
                    <HashtagMultiSaveContent goodsList={[]}/>
                </ModalBody>
            </Modal>

        </Div>
    );
};


export default HashTagGroupManager;