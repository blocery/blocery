import React, {useEffect, useMemo, useState} from 'react';
import {getGoodsByTags} from '~/lib/shopApi'
import {AgGridReact} from "ag-grid-react";
import {Button, Copy, Div, Flex, Space, Span, Strong} from "~/styledComponents/shared";
import {useRecoilState} from "recoil";
import {bizGoodsViewerModalState, boardTagModalState} from "~/recoilState";
import BizGoodsViewer from "~/components/common/contents/BizGoodsViewer";
import {useModal} from "~/util/useModal";
import {Modal, ModalBody, ModalHeader} from "reactstrap";
import {color} from "~/styledComponents/Properties";
import HashTagGroupContent from "~/components/admin/hashTagGroupManager/HashTagGroupContent";
import {MenuButton} from "~/styledComponents/shared/AdminLayouts";
import HashTagList from "~/components/common/hashTag/HashTagList";
import ComUtil from "~/util/ComUtil";
import adminApi from "~/lib/adminApi";
import GoodsContent from "~/components/common/contents/BizGoodsViewer";

//해시태그 상품 그룹관리의 오른쪽 그리드
const GoodsListByHashTags = ({groupNo}) => {

    console.log('====render======================')

    const [hashTagGroup, setHashTagGroup] = useState()
    const [tagModalState, setTagModalState] = useRecoilState(boardTagModalState)
    const [rowData, setRowData] = useState([])
    //최초 배포 후 이전 버전의 상품코드가 필요해서
    const [tagsMatchedGoodsNos, setTagsMatchedGoodsNos] = useState('')
    const [gridApi, setGridApi] = useState()
    const [modalOpen, setModalOpen, selected, setSelected, setModalState, toggle] = useModal()

    const [goodsViewerState, setGoodsViewerState] = useRecoilState(bizGoodsViewerModalState)

    useEffect(() => {
        search()
    }, [groupNo])

    //해시태그 변경 후 저장시
    useEffect(() => {
        search()
    }, [goodsViewerState.timestamp])

    const search = async () => {
        if(!groupNo)
            return;

        const {data: hashTagGroup} = await adminApi.getHashTagGroup(groupNo)
        setHashTagGroup(hashTagGroup)

        const {hashTags, localfoodProducerNo} = hashTagGroup

        const {data} = await getGoodsByTags({tags: hashTags, localfoodProducerNo: localfoodProducerNo, isGroupTag: true, isPaging:false, limit:999, page: 1})
        setRowData(data.goodsList)

        //TODO 배포 후 삭제 예정
        //임시..이전 tags 로 매칭된 결과 조회하여 상품번호 보여주기 용도
        const res = await getGoodsByTags({tags: hashTags, localfoodProducerNo: localfoodProducerNo, isGroupTag: false, isPaging:false, limit:999, page: 1})
        setTagsMatchedGoodsNos(res.data.goodsList.map(goods => goods.goodsNo).join(', '))


    }
    const hashTagsRenderer = (params) => {
        // const hashTags = params[0].hashTags
        return (
            <div>
                {
                    params.data.groupTags.map(tag => {
                        // const matched = hashTags.includes(tag)

                        return(
                            <Span key={tag} onClick={onTagClick.bind(this, tag)}
                                  // bc={matched && 'secondary'}
                                  // bg={matched && 'white'}
                                  rounded={5}
                                  px={4}
                                // fg={matched ? 'danger' : 'blue'}
                                  mr={6}>#{tag}</Span>
                        )
                    })
                }
            </div>
        )
    }

    const columnDefs = useMemo(() => [
        {
            headerName: "상품명", field: "goodsNm",width: 200, cellRendererFramework: goodsNmRenderer
        },
        {
            headerName: "해시태그", field: "hashTags",
            flex: 1,
            // cellRenderer: 'hashTagsRenderer',
            cellRendererFramework: hashTagsRenderer,
            // cellRendererParams: () => {
            //     return [{hashTags: hashTagGroup.hashTags}] //cellRenderer에서 props[0] 으로만 접근가능. {} 형식은 지원안됨.
            // }
        },
    ], [])

    const defaultColDef = useMemo(() => ({
        // width: 300,
        resizable: true,
        filter: true,
        sortable: true,
        floatingFilter: true,
        filterParams: {
            newRowsAction: 'keep'
        }
    }));

    const gridOptions = useMemo(() => {
        return {
            getRowHeight: function(params) {
                return 30;
            },
            suppressMovableColumns: true,       //헤더고정시키
            columnDefs: [
                {
                    headerName: "상품번호", field: "goodsNo",width: 100
                },
                {
                    headerName: "상품명", field: "goodsNm",width: 200, cellRendererFramework: goodsNmRenderer
                },
                {
                    headerName: "상품 해시태그", field: "tags",
                    flex: 1,
                    valueGetter: function ({data}) {
                        return data.groupTags.join(' ')
                    },
                    // cellRenderer: 'hashTagsRenderer',
                    cellRendererFramework: hashTagsRenderer,
                    // cellRendererParams: () => {
                    //     return [{hashTags: hashTagGroup.hashTags}] //cellRenderer에서 props[0] 으로만 접근가능. {} 형식은 지원안됨.
                    // }
                },
            ],
            onGridReady: onGridReady.bind(this),              //그리드 init(최초한번실행)
            // onFilterChanged: this.onGridFilterChanged.bind(this),  //필터온체인지 이벤트
            // onCellDoubleClicked: this.copy,
            // onSelectionChanged: this.onSelectionChanged.bind(this),
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
                hashTagsRenderer: hashTagsRenderer
            },
            rowSelection: 'multiple',
            groupSelectsFiltered: true,
            suppressRowClickSelection: false,   //false : 셀 클릭시 체크박스도 체크 true: 셀클릭시 체크박스 체크 안함
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
        }
    }, [])
    // const gridOptions2 = {
    //     getRowHeight: function(params) {
    //         return 30;
    //     },
    //     suppressMovableColumns: true,       //헤더고정시키
    //     columnDefs: [
    //         {
    //             headerName: "상품번호", field: "goodsNo",width: 100
    //         },
    //         {
    //             headerName: "상품명", field: "goodsNm",width: 200, cellRendererFramework: goodsNmRenderer
    //         },
    //         {
    //             headerName: "상품 해시태그", field: "tags",
    //             flex: 1,
    //             valueGetter: function ({data}) {
    //                 return data.groupTags.join(' ')
    //             },
    //             // cellRenderer: 'hashTagsRenderer',
    //             cellRendererFramework: hashTagsRenderer,
    //             // cellRendererParams: () => {
    //             //     return [{hashTags: hashTagGroup.hashTags}] //cellRenderer에서 props[0] 으로만 접근가능. {} 형식은 지원안됨.
    //             // }
    //         },
    //     ],
    //     onGridReady: onGridReady.bind(this),              //그리드 init(최초한번실행)
    //     // onFilterChanged: this.onGridFilterChanged.bind(this),  //필터온체인지 이벤트
    //     // onCellDoubleClicked: this.copy,
    //     // onSelectionChanged: this.onSelectionChanged.bind(this),
    //     defaultColDef: {
    //         // width: 300,
    //         resizable: true,
    //         filter: true,
    //         sortable: true,
    //         floatingFilter: true,
    //         filterParams: {
    //             newRowsAction: 'keep'
    //         }
    //     },
    //     // components: {
    //     //     formatCurrencyRenderer: this.formatCurrencyRenderer,
    //     //     formatDateRenderer: this.formatDateRenderer,
    //     //     formatDatesRenderer: this.formatDatesRenderer,
    //     //     vatRenderer: this.vatRenderer
    //     // },
    //     frameworkComponents: {
    //         hashTagsRenderer: hashTagsRenderer
    //     },
    //     rowSelection: 'multiple',
    //     groupSelectsFiltered: true,
    //     suppressRowClickSelection: false,   //false : 셀 클릭시 체크박스도 체크 true: 셀클릭시 체크박스 체크 안함
    //     overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
    //     overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
    // }
    function onGridReady (params){
        setGridApi(params.api)
    }
    // const onTagClick = (tag) => {
    //     //태그 전체조회 모달 조회
    //     setTagModalState({
    //         tag: tag,
    //         isOpen: true
    //     })
    // }


    const onCellClick = (data) => {

        // setGoodsViewerState({
        //     ...goodsViewerState,
        //     isOpen: true,
        //     hashTagGroup: hashTagGroup,
        //     goodsNo: data.goodsNo
        // })

        setSelected(data.goodsNo)
        toggle()
    }

    function goodsNmRenderer({data}) {
        return(
            <Div fg={'primary'} onClick={onCellClick.bind(this, data)}><u>{data.goodsNm}</u></Div>
        )
    }

    const onTagClick = (tag) => {
        setTagModalState({
            isOpen: true,
            tag: tag
        })
    }

    const copy = ({value}) => {
        ComUtil.copyTextToClipboard(value, '', '')
    }

    const hashTags = useMemo(() => {
        if (hashTagGroup) {
            return hashTagGroup.hashTags.join(', ')
        }
        return null
    }, [hashTagGroup])

    const goodsNos = useMemo(() => {
        console.log("memo===")
        return rowData.map(goods => goods.goodsNo).join(', ')
    }, [rowData])

    if (!groupNo) return null

    return (
        <div>
            <Flex mb={10} alignItems={'flex-end'}>
                <Space>
                    <MenuButton onClick={search}>새로고침</MenuButton>
                </Space>
                {/*<Space ml={'auto'}>*/}
                {/*    {*/}
                {/*        (hashTagGroup && hashTagGroup.hashTags) && <HashTags hashTags={hashTagGroup.hashTags} onClick={copy} />*/}
                {/*    }*/}
                {/*</Space>*/}
            </Flex>


            <Div fontSize={12}>
                <div>
                    그룹태그 : &nbsp;
                    {
                        (hashTagGroup && hashTagGroup.hashTags) && (
                            <Copy fontSize={12} mb={10} onClick={copy.bind(this, {value:hashTags})}>
                                {hashTags}
                            </Copy>
                        )
                    }
                </div>
                <div>
                    ㄴ 그룹태그와 매칭된 상품 :&nbsp;
                    {
                        goodsNos && (
                            <Copy fontSize={12} mb={10} onClick={copy.bind(this, {value:goodsNos})}>
                                {goodsNos}
                            </Copy>
                        )
                    }
                </div>
                <div>
                    ㄴ 상품태그와 매칭된 상품 :&nbsp;
                    {
                        <Copy fontSize={12} mb={10} onClick={copy.bind(this, {value:tagsMatchedGoodsNos})}>
                            {tagsMatchedGoodsNos}
                        </Copy>
                    }
                </div>
            </Div>
            <div
                id="myGrid"
                className="ag-theme-balham"
                style={{
                    height: '700px'
                }}
            >
                <AgGridReact
                    // reactUi={'true'}
                    // columnDefs={columnDefs}
                    // defaultColDef={defaultColDef}
                    {...gridOptions}
                    rowData={rowData}
                    onCellDoubleClicked={copy}
                />
            </div>


            <Modal isOpen={modalOpen} toggle={toggle} centered size={'xl'}>
                <ModalHeader toggle={toggle}>상품 수정</ModalHeader>
                <ModalBody style={{padding: 0}}>
                    <GoodsContent
                        goodsNo={selected && selected}
                        onClose={() => {
                            toggle()
                            search()
                        }}
                    />
                </ModalBody>
            </Modal>


        </div>
    );
};

export default React.memo(GoodsListByHashTags);

const HashTags = React.memo((({hashTags, onClick}) =>
        <Space>
            {
                hashTags.map(value => <Copy key={value} fontSize={12} onClick={onClick.bind(this, ({value}))}>#{value}</Copy>)
            }
        </Space>
))