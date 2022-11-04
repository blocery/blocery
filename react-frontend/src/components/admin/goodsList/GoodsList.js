import React, { Component, Fragment, useState } from 'react';
import {Button, Input, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup} from 'reactstrap'
import "react-table/react-table.css"
import { getAllGoodsList, updateGoodsDeleteFlag } from '~/lib/adminApi'
import { getLoginAdminUser } from '~/lib/loginApi'
import { updateSalePaused, updateGiftSet, updateFeeRate } from '~/lib/goodsApi'
import {ExcelDownload, ModalConfirm, ProducerFullModalPopupWithNav} from '~/components/common'
import { AgGridReact } from 'ag-grid-react';
import ComUtil from "~/util/ComUtil";
import ExcelUtil from "~/util/ExcelUtil";
import {getGoodsByGoodsNo} from "~/lib/goodsApi";
import Checkbox from "~/components/common/checkboxes/Checkbox";
import {Flex, Div, Button as StyledButton, Hr, FilterGroup, Span, Space, Right} from "~/styledComponents/shared";
import {MenuButton, SmButton} from "~/styledComponents/shared/AdminLayouts";
import InputFilter from "~/components/common/gridFilter/InputFilter";
import CheckboxFilter from "~/components/common/gridFilter/CheckboxFilter";
import FilterContainer from "~/components/common/gridFilter/FilterContainer";
import GoodsContent from "~/components/common/contents/BizGoodsViewer";
import GoodsAuthMarksContent from "~/components/common/contents/BizGoodsAuthMarkViewer";
import HashtagMultiSaveContent from './MultiTagManagerContent'
import SearchDates from "~/components/common/search/SearchDates";
import moment from "moment-timezone";
import {color} from "~/styledComponents/Properties";
import {WebDealGoodsReg, WebDirectGoodsReg} from "~/components/producer";
import AgGridUtil from "~/util/AgGridUtil";

const ROW_MAX_HEIGHT = 18*5

export default class GoodsList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            excelData: {
                columns: [],
                data: []
            },
            selectedRows: [],
            isOpen: false,
            modalType: '',
            goodsNo: null,

            isExcelUploadModal: false,
            isExcelUploadFileData: false,
            excelUploadData: [],
            gridOptions: {
                //
                // enableSorting: true,                //정렬 여부
                // enableFilter: true,                 //필터링 여부
                // enableColResize: true,              //컬럼 크기 조정
                getRowHeight: this.getRowHeight,
                columnDefs: [
                    {
                        headerName: "상품번호", field: "goodsNo", sort:"desc",
                        headerCheckboxSelection: true,
                        headerCheckboxSelectionFilteredOnly: true,  //전체 체크시 필터된 것만 체크
                        checkboxSelection: true,
                    },
                    {headerName: "생산자No", field: "producerNo", width: 90},
                    {headerName: "생산자", field: "producerFarmNm", width: 140},
                    {
                        headerName: "종류", field: "directGoods", width: 90,
                        valueGetter: function(params) {
                            return (params.data.goodsKind === 0 ? '예약':params.data.goodsKind === 1 ? '즉시' : '공동구매')
                            // return (params.data.directGoods?'즉시':'예약')
                        }
                    },
                    {headerName: "상품명", field: "goodsNm", width: 300,
                        // onCellClicked: this.onGoodsNmClick, cellStyle: AgGridUtil.cellStyleClick
                    },
                    {
                        headerName: "묶음배송", field: "producerWrapDelivered", width: 90,
                        valueGetter: function(params) {
                            return params.data.producerWrapDelivered ? "O" : "-";
                        }
                    },
                    {
                        headerName: "인증서류", field: "authFiles", width: 100,
                        valueGetter: function(params) {
                            return params.data.authFiles && params.data.authFiles.length;
                        },
                        cellRenderer: "authMarkFileRenderer"
                    },
                    {
                        headerName: "인증마크", field: "authMarkInfo", width: 100,
                        valueGetter: function(params) {
                            return params.data.authMarkInfo && params.data.authMarkInfo.length;
                        },
                        cellRenderer: "authMarkRenderer"
                    },
                    {
                        headerName: "new상품정보고시", field: "newGoodsInfo", width: 100,
                        valueGetter: function(params) {
                            return (params.data.newGoodsInfo.length > 0 ? 'Y':'N')
                        }
                    },
                    {
                        headerName: "옵션명", field: "options", width: 300,
                        cellRenderer: 'optionsNmRenderer',
                        valueGetter: function(params) {
                            const objectUniqueFlag = params.data.objectUniqueFlag;
                            let optionNames = '';
                            if(objectUniqueFlag){
                                if(params.data.options && params.data.options.length > 1) {
                                    let firstOptionName = '';
                                    let lastOptionName = '';
                                    firstOptionName = params.data.options[0].optionName;
                                    optionNames = firstOptionName;
                                    if(params.data.options.length >= 2) {
                                        lastOptionName = params.data.options[params.data.options.length - 1].optionName;
                                        if(firstOptionName != lastOptionName) {
                                            optionNames = firstOptionName + ' ~ ' + lastOptionName
                                        }
                                    }
                                }
                            }else {
                                if (params.data.options.length > 1) {
                                    params.data.options.map(item => {
                                        optionNames = optionNames + item.optionName + ' // ';
                                    })
                                    optionNames = optionNames.substring(0, optionNames.length - 4)
                                }
                            }
                            return optionNames;
                        }
                    },
                    {
                        headerName: "옵션수(전체/노출/숨김)", field: "optionsCnt", width: 80,
                        valueGetter: function(params) {
                            return params.data.options.length;
                        },
                        cellRenderer: "optionsCntRenderer"
                    },

                    {
                        headerName: "옵션총재고", field: "remainedCnt", width: 80,
                    },
                    {
                        headerName: "옵션재고", field: "optionInfo", width: 300,
                        // resizable: true,
                        wrapText: true,
                        // autoHeight: true,
                        // valueGetter: function ({data}){
                        //     if (!data.groupTags) return ''
                        //     return data.groupTags.map(tag => '#'+tag)
                        // },
                        cellRenderer: "optionInfoRenderer"
                    },
                    {
                        headerName: "#그룹 해시태그", field: "groupTags", width: 300,
                        valueGetter: function ({data}){
                            if (!data.groupTags) return ''
                            return data.groupTags.map(tag => '#'+tag)
                        },
                        cellRenderer: "groupTagsRenderer"
                    },
                    {
                        headerName: "#상품 해시태그", field: "tags", width: 300,
                        valueGetter: function ({data}){
                            if (!data.tags) return ''
                            return data.tags.map(tag => '#'+tag)
                        },
                        cellRenderer: "tagsRenderer"
                    },
                    {headerName: "선물세트", field: "specialTag", width: 110, cellRenderer: "giftSetRenderer"},
                    {
                        headerName: "판매일시중지", field: "salePaused", width: 110,
                        valueGetter: function ({data}) {
                            if (data.confirm) {
                                if (data.salePaused) {
                                    return '일시중지'
                                }else if (data.saleStopped){
                                    return '판매중단'
                                }else {
                                    return '판매중'
                                }
                            }else {
                                return '임시저장'
                            }
                        },
                        cellRenderer: "goodsPausedRenderer"
                    },
                    {headerName: "품목", field: "itemName", width: 80},
                    {headerName: "품종", field: "itemKindName", width: 100},
                    {headerName: "품목수수료(%)", field: "itemFeeRate", width: 100},
                    {headerName: "상품수수료(%)", field: "goodsFeeRate", width: 100, cellRenderer: "feeRateRenderer"},
                    {
                        headerName: "적용수수료(%)", field: "defaultFeeRate", width: 100,
                        valueGetter: function(params) {
                            return ComUtil.roundDown(params.data.defaultFeeRate, 3);
                        }
                    },
                    {headerName: "상품가격", field: "consumerPrice", width: 100},
                    {
                        headerName: "판매가격", field: "currentPrice", width: 150,
                        cellRenderer: 'optionsPriceRenderer',
                        valueGetter: function(params) {
                            const objectUniqueFlag = params.data.objectUniqueFlag||false;
                            let optionPrice = params.data.defaultCurrentPrice;
                            if(objectUniqueFlag){
                                let firstOptionPrice = '';
                                let lastOptionPrice = '';
                                if(params.data.options){
                                    if(params.data.options.length == 1) {
                                        firstOptionPrice = params.data.options[0].optionPrice;
                                        optionPrice = firstOptionPrice;
                                    } else if(params.data.options.length > 1) {
                                        firstOptionPrice = params.data.options[0].optionPrice;
                                        optionPrice = firstOptionPrice;
                                        if(params.data.options.length >= 2) {
                                            lastOptionPrice = params.data.options[params.data.options.length - 1].optionPrice;
                                            if (firstOptionPrice != lastOptionPrice) {
                                                optionPrice = firstOptionPrice + ' ~ ' + lastOptionPrice
                                            }
                                        }
                                    }
                                }
                            }else {
                                if(params.data.options) {
                                    if(params.data.options.length == 1) {
                                        optionPrice =  params.data.options[0].optionPrice;
                                    } else if (params.data.options.length > 1) {
                                        optionPrice = '';
                                        params.data.options.map(item => {
                                            optionPrice = optionPrice + item.optionPrice + ' // ';
                                        })
                                        optionPrice = optionPrice.substring(0, optionPrice.length - 4)
                                    }
                                }
                            }

                            return optionPrice;
                        }
                    },
                    {
                        headerName: "할인율", field: "discountRate", width: 90,
                        valueGetter: function(params) {
                            return ComUtil.roundDown(params.data.discountRate,2)
                        }
                    },
                    {
                        headerName: "타임세일진행중", field: "inTimeSalePeriod", width: 120,
                        valueGetter: function(params) {
                            return (params.data.inTimeSalePeriod ? '진행중' : '')
                        }
                    },
                    {
                        headerName: "부가세", field: "vatFlag", width: 80,
                        valueGetter: function(params) {
                            return (params.data.vatFlag ? "과세" : "면세")
                        }
                    },
                    {
                        headerName: "판매종료일", field: "saleEnd", width: 130,
                        valueGetter: function(params) {
                            return ComUtil.utcToString(params.data.saleEnd)
                        }
                    },
                    {
                        headerName: "등록일", field: "timestamp", width: 130,
                        valueGetter: function(params) {
                            return ComUtil.utcToString(params.data.timestamp)
                        }
                    },
                    {
                        headerName: "최종수정일", field: "modDate", width: 130,
                        valueGetter: function(params) {
                            return ComUtil.utcToString(params.data.modDate)
                        }
                    },
                ],
                defaultColDef: {
                    width: 110,
                    resizable: true,
                    filter: true,
                    sortable: true,
                    floatingFilter: false,
                    filterParams: {
                        newRowsAction: 'keep'
                    }
                },
                rowSelection: 'multiple',
                suppressRowClickSelection: false,   //false : 셀 클릭시 체크박스도 체크 true: 셀클릭시 체크박스 체크 안함
                frameworkComponents: {
                    goodsPausedRenderer: this.goodsPausedRenderer,
                    optionsCntRenderer:this.optionsCntRenderer,
                    optionsNmRenderer: this.optionsNmRenderer,
                    optionsPriceRenderer: this.optionsPriceRenderer,
                    optionInfoRenderer: this.optionInfoRenderer,
                    groupTagsRenderer: this.groupTagsRenderer,
                    tagsRenderer: this.tagsRenderer,
                    giftSetRenderer: this.giftSetRenderer,
                    feeRateRenderer: this.feeRateRenderer,
                    authMarkFileRenderer: this.authMarkFileRenderer,
                    authMarkRenderer: this.authMarkRenderer
                },
                overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
                overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
                onCellDoubleClicked: this.copy,
                onGridReady: this.onGridReady.bind(this),              //그리드 init(최초한번실행)
                onSelectionChanged: this.onSelectionChanged.bind(this),
            },
            goodsState: "0",
            deleted: false,

            goodsTagsModalOpen: false,
            goodsAuthMarkModalOpen: false,
            selectedRow: null,
            multiTagSaveModalOpen: false,

            search:{
                selectedGubun: 'week', //'week': 최초화면을 오늘(day)또는 1주일(week)로 설정.
                startDate: moment(moment().toDate()).add(-15,"day"),
                endDate: moment(moment().toDate()),
                modDateSearch: 'N',
            },
        }

        this.excelFile = React.createRef();
    }

    //TODO 상품수정 모달 띄우기 => 생산자 상품수정 만들 필요 있음
    onGoodsNmClick = ({data}) => {
        this.setState({
            isOpen: true,
            modalType: 'goodsMod',
        })
    }

    getRowHeight = (params) => {
        // assuming 50 characters per line, working how how many lines we need
        const length = params.data.options.filter(option => !option.deleted).length
        const minHeight = 18;
        const rowHeight = length * minHeight

        if(rowHeight <= 30){
            return 30   ;
        }else if (rowHeight > ROW_MAX_HEIGHT){
            return ROW_MAX_HEIGHT
        } else{
            return rowHeight;
        }
    }

    async componentDidMount() {
        let user = await getLoginAdminUser();
        if (!user || user.email.indexOf('ezfarm') < 0) {
            //admin은 웹전용이라서, window로 이동하는 것이 더 잘됨. //this.props.history.push('/admin');
            window.location = '/admin/login';
        }

        await this.search(this.state.goodsState);
    }

    onSelectionChanged = (event) => {
        this.updateSelectedRows()
    }
    updateSelectedRows = () => {
        this.setState({
            selectedRows: this.gridApi.getSelectedRows()
        })
    }

    //// cell Renderer
    // 선물세트 등록 여부 렌더러
    groupTagsRenderer = ({data}) => {
        return (
            <Flex>
                <SmButton mr={6} onClick={this.selectedRowChange.bind(this, data)}>변경</SmButton>
                {/*<TagChangeButton onClick={this.selectedRowChange.bind(this, data)}>변경</TagChangeButton>*/}
                {/*<Div bg={'white'} py={3} bc={'secondary'} fontSize={12} lineHeight={12} px={5} mr={6} onClick={this.selectedRowChange.bind(this, data)}>변경</Div>*/}
                {
                    data.groupTags && data.groupTags.map(tag =>
                        <Span key={tag}
                            // onClick={onTagClick.bind(this, tag)}
                              fg={'blue'}
                              mr={6}>#{tag}</Span>
                    )
                }
            </Flex>
        )
    }
    tagsRenderer = ({data}) => {
        return (
            <Flex>
                <SmButton mr={6} onClick={this.selectedRowChange.bind(this, data)}>변경</SmButton>
                {/*<TagChangeButton onClick={this.selectedRowChange.bind(this, data)}>변경</TagChangeButton>*/}
                {/*<Div bg={'white'} py={3} bc={'secondary'} fontSize={12} lineHeight={12} px={5} mr={6} onClick={this.selectedRowChange.bind(this, data)}>변경</Div>*/}
                {
                    data.tags && data.tags.map(tag =>
                        <Span key={tag}
                            // onClick={onTagClick.bind(this, tag)}
                              fg={'blue'}
                              mr={6}>#{tag}</Span>
                    )
                }
            </Flex>
        )
    }
    authMarkFileRenderer = ({data}) => {
        return (
            <Flex>
                {
                    data.authFiles && data.authFiles.filter(file=>file!=null).length > 0 ?
                        <Span fg={'blue'} mr={6}>{data.authFiles.filter(file=>file!=null).length}</Span>
                        :
                        <Span fg={'secondary'} mr={6}>0</Span>
                }
            </Flex>
        )
    }

    authMarkRenderer = ({data}) => {
        return (
            <Flex>
                <SmButton mr={6} onClick={this.selectedAuthMarkRowChange.bind(this, data)}>변경</SmButton>
                {
                    data.authMarkInfo && data.authMarkInfo.length > 0 ?
                        <Span fg={'blue'} mr={6}>{data.authMarkInfo.length}</Span>
                        :
                        <Span fg={'secondary'} mr={6}>0</Span>
                }
            </Flex>
        )
    }

    optionsCntRenderer = ({data}) => {

        const realOptionSize = Number(data.realOptionSize)
        const hiddenOptionSize = data.options.length - realOptionSize
        return (
            <>
                <Span>{data.options.length} / </Span>
                <Span fg={'blue'}>{realOptionSize} / </Span>
                <Span fg={'danger'}>{hiddenOptionSize}</Span>
            </>
        )

        return (
            <Flex>
                {
                    data.options && data.options.length > 0 ?
                        <Span fg={'blue'} mr={6}>{data.options.length}</Span>
                        :
                        <Span fg={'secondary'} mr={6}>0</Span>
                }
            </Flex>
        )
    }

    optionsNmRenderer = ({value, data:rowData}) => {
        const objectUniqueFlag = rowData.objectUniqueFlag;
        const options = rowData.options;
        let optionNames = '';
        if(options && options.length > 1) {
            let firstOptionName = '';
            let lastOptionName = '';
            firstOptionName = options[0].optionName;
            optionNames = firstOptionName;
            if(options.length >= 2) {
                lastOptionName = options[options.length - 1].optionName;
                if(firstOptionName != lastOptionName) {
                    optionNames = firstOptionName + ' ~ ' + lastOptionName
                }
            }
        }
        return (<span>{optionNames}</span>);
    }

    optionsPriceRenderer = ({value, data:rowData}) => {
        const options = rowData.options;
        let optionPrice = rowData.defaultCurrentPrice;
        let firstOptionPrice = '';
        let lastOptionPrice = '';
        if(options) {
            if (options.length == 1) {
                optionPrice = options[0].optionPrice;
            } else if (options.length > 1) {
                firstOptionPrice = options[0].optionPrice;
                optionPrice = firstOptionPrice;
                if (options.length >= 2) {
                    lastOptionPrice = options[options.length - 1].optionPrice;
                    if (firstOptionPrice != lastOptionPrice) {
                        optionPrice = firstOptionPrice + ' ~ ' + lastOptionPrice
                    }
                }
            }
        }
        return (<span>{optionPrice}</span>);
    }

    optionInfoRenderer = ({data}) => {
        return (
            <OptionInfoList options={data.options} />
        )
        return(
            <div
                style={{overflow: 'auto', maxHeight: ROW_MAX_HEIGHT}}
            >
                {
                    data.options.filter(o => !o.deleted).map((option, index) =>
                        <Flex
                            lineHeight={'18px'}
                            alignItems={'flex-start'}
                            // style={{height: 18, lineHeight: '18px'}}
                        >
                            <div>[{index+1}]</div>
                            <Div mx={6} minWidth={30} fg={option.remainedCnt <= 0 ? 'danger' : 'black'} bold
                                // style={{minWidth: 70, color: option.remainedCnt <= 0 ? color.danger : 'black'}}
                            >{option.remainedCnt}</Div>
                            <span>{option.optionName}</span>
                        </Flex>
                    )
                }
            </div>
        )
    }

    giftSetRenderer = ({value, data:rowData}) => {

        //삭제된 상품만 보기 모드에서는 수정 불가능 하도록
        if (this.state.deleted) {
            return '-'
        }

        return ( rowData.specialTag !== 1 ?
                <ModalConfirm title={'선물세트 등록'} content={<div>해당 상품을 선물세트로 등록하시겠습니까?</div>} onClick={this.onClickGiftReg.bind(this, rowData)}>
                    <SmButton >세트등록</SmButton>
                </ModalConfirm>
                :
                <ModalConfirm title={'선물세트 등록 해지'} content={<div>해당 상품을 선물세트에서 제외하시겠습니까??</div>} onClick={this.onClickGiftReg.bind(this, rowData)}>
                    <SmButton fg={'danger'}>세트제외</SmButton>
                </ModalConfirm>
        )
    }

    // 선물세트로 등록
    onClickGiftReg = async (rowData, confirmed) => {

        //삭제된 상품만 보기 모드에서는 수정 불가능 하도록
        if (this.state.deleted) {
            return '-'
        }

        if(confirmed) {
            const goodsNo = rowData.goodsNo;
            let specialTag;

            if(rowData.specialTag !== 1) {
                specialTag = 1
            } else {
                specialTag = 0
            }

            const modified = await updateGiftSet(goodsNo, specialTag);
            if(modified.data === true) {
                this.search(this.state.goodsState);
            }
        }
    }

    // 판매일시중지 여부 렌더러
    goodsPausedRenderer = ({value, data:rowData}) => {

        //삭제된 상품만 보기 모드에서는 수정 불가능 하도록
        if (this.state.deleted) {
            return '-'
        }

        // 즉시상품 && 판매중(품절/판매종료 아닌경우)일때만 버튼 노출
        return ( rowData.directGoods && rowData.confirm ?
            rowData.salePaused ?
                <ModalConfirm title={'상지품 판매재개'} content={<div>해당 상품 판매를 재개하시겠습니까?</div>} onClick={this.onClickSalePaused.bind(this, rowData)}>
                    <SmButton>판매재개</SmButton>
                </ModalConfirm>
                : <ModalConfirm title={'상품 판매 일시중지'} content={<div>해당 상품 판매를 일시중지 하시겠습니까?</div>} onClick={this.onClickSalePaused.bind(this, rowData)}>
                    <SmButton fg={'danger'}>일시중지</SmButton>
                </ModalConfirm>
            : '-')
    }

    //수수료 입력
    feeRateRenderer = ({value, data:rowData}) => {
        return (
            <div className={'d-flex'}>
                <span>{ComUtil.roundDown(rowData.goodsFeeRate,3)}</span> &nbsp;
                <div className={'ml-auto'}>
                    <SmButton bg={'white'} onClick={this.onClickSetFeeRate.bind(this, rowData)}>수정</SmButton>
                </div>
            </div>
        )
    }

    onClickSetFeeRate = async (rowData) => {
        const feeRate = window.prompt("수정할 수수료를 입력해주세요. (0:카테고리수수료 적용, -1:수수료없음)")
        if (!feeRate) {
            return
        }

        if(!window.confirm(`수수료를 수정하시겠습니까?`)) {
            return false
        } else {
            if (rowData.dealGoods && parseFloat(feeRate) === -1) {
                alert('공동구매상품은 수수료가 꼭 필요합니다. ')
                return false;
            }

            const {data:modified} = await updateFeeRate(rowData.goodsNo, parseFloat(feeRate))

            if(modified === true) {
                alert('수수료 수정이 완료되었습니다.')
                this.search(this.state.goodsState);
            }
        }
    }

    onClickSalePaused = async (rowData, confirmed) => {
        if(confirmed) {
            const goodsNo = rowData.goodsNo;
            let salePaused;

            if(rowData.salePaused === true) {
                salePaused = false
            } else {
                salePaused = true
            }

            const modified = await updateSalePaused(goodsNo, salePaused);

            if(modified.data === true) {
                this.search(this.state.goodsState);
            }
        }
    }

    setExcelData = () => {
        let excelData = this.getExcelData();
        //console.log("excelData",excelData)
        this.setState({
            excelData: excelData
        })
    }
    getExcelData = () => {
        const columns = [
            '상품번호', '생산자No', '생산자', '상품명', '옵션수', '수수료',
            '상품가격', '판매가격', '할인율', '타임세일진행중', '판매지원금', '부가세', '예약상품', '판매종료', '등록일', '최종수정일'
        ]
        //필터링 된 데이터에서 sortedData._original 로 접근하여 그리드에 바인딩 원본 값을 가져옴
        const data = this.state.data.map((item ,index)=> {

            let saleEnd = ComUtil.utcToString(item.saleEnd);
            let discountRate = ComUtil.roundDown(item.discountRate,2);
            let inTimeSalePeriod = (item.inTimeSalePeriod) ? '진행중' : '';
            let timeSaleSupportPrice = (item.inTimeSalePeriod) ? item.timeSaleSupportPrice : 0;
            let noDirectGoods = (item.directGoods)?'즉시':'예약';
            let vatFlag = item.vatFlag ? "과세" : "면세";
            let timestamp = ComUtil.utcToString(item.timestamp)
            let modDate = ComUtil.utcToString(item.modDate)

            return [
                item.goodsNo, item.producerNo, item.producerFarmNm, item.goodsNm, item.options.length, item.defaultFeeRate,
                item.consumerPrice, item.currentPrice, discountRate, inTimeSalePeriod, timeSaleSupportPrice, vatFlag, noDirectGoods, saleEnd,
                timestamp, modDate
            ]
        })


        let excelData = data.sort((a, b) => {
            return parseInt(b[0]) - parseInt(a[0]);
        })

        return [{
            columns: columns,
            data: excelData
        }]
    }

    excelUploadModalToggle = () => {
        this.setState(prevState => ({
            isExcelUploadModal: !prevState.isExcelUploadModal
        }));
    }

    // 엑셀업로드
    onFeeRateExcelUploadSave = () => {
        let selectedFile = this.excelFile.current.files[0];
        ExcelUtil.excelExportJson(selectedFile, this.handleExcelData);
    }
    handleExcelData = async (jsonData) => {
        let selectedFile = this.excelFile.current.files[0];
        if(!selectedFile){
            alert("파일을 선택해 주세요.");
            return false;
        }
        let excelData = jsonData;

        // 빈값 체크리스트
        let feeRateValidateChk = 0;
        let otherFileChk = 0;
        excelData.some(function (items) {
            if(items["수수료"] == ""){
                feeRateValidateChk += 1;
                return true;//break
            }
            // 다른 파일 업로드 시도시
            if(!items["수수료"] && !items["상품번호"]) {
                otherFileChk += 1;
                return true;
            }
        });
        if(otherFileChk > 0) {
            alert("올바른 형식의 파일인지 확인해주시기 바랍니다.");
            return false;
        }

        let excelUploadData = [];
        excelData.map((item ,index)=> {
            if(item["상품번호"]){
                excelUploadData.push({
                    goodsNo:item["상품번호"],
                    feeRate:item["수수료"]
                });
            }
        });

        let modified = false;
        excelUploadData.map(async(item) => {
            const {data:modifiedOne} = await updateFeeRate(item.goodsNo, parseFloat(item.feeRate))

            if(modifiedOne === true){
                modified = true
            }
        })

        this.setState({
            isExcelUploadModal: false
        })

        this.search(this.state.goodsState);
    }

    cancelExcelModal = () => {
        this.setState(prevState => ({
            isExcelUploadModal: !prevState.isExcelUploadModal,
            isExcelUploadFileData: false,
            excelUploadData: []
        }));
    }

    // 수수료 일괄수정
    updateAllFeeRate = () => {
        this.excelUploadModalToggle();
    }

    //수수료 엑셀 파일 유무 체크
    onFeeRateExcelExportChk = () => {
        let selectedFile = this.excelFile.current.files[0];
        if(selectedFile){
            this.setState({
                isExcelUploadFileData:true
            });
        }else{
            this.setState({
                isExcelUploadFileData:false
            });
        }
    }

    // 조회할 상품상태 change
    onStateChange = async (e) => {

        const goodsState = e.target.value

        this.setState({
            goodsState: goodsState
        })

        this.search(goodsState)

        return
    }

    search = async (goodsState, deleted) => {
        if (this.gridApi) {
            //ag-grid 레이지로딩중 보이기
            this.gridApi.showLoadingOverlay();
        }

        const params = {
            startDate: this.state.search.startDate !== null ? moment(this.state.search.startDate).format('YYYYMMDD') : null,
            endDate: this.state.search.endDate !== null ? moment(this.state.search.endDate).format('YYYYMMDD') : null,
            modDateSearch: this.state.search.modDateSearch === 'Y',
            goodsState: goodsState,
            deleted: deleted
        };

        const res = await getAllGoodsList(params);

        this.setState({
            data: res.data,
            selectedRows: []
        })
        //console.log({res})
        this.setExcelData();

        //ag-grid api
        if(this.gridApi) {
            //ag-grid 레이지로딩중 감추기
            this.gridApi.hideOverlay()
        }
    }

    copy = ({value}) => {
        ComUtil.copyTextToClipboard(value, '', '');
    }

    //[이벤트] 그리드 로드 후 callback 이벤트
    onGridReady(params) {
        //API init
        this.gridApi = params.api;
        this.columnApi = params.columnApi;
    }

    //일시중지 클릭
    onGoodsPausedClick = async () => {
        const promises = this.state.selectedRows.map((goods) => getGoodsByGoodsNo(goods.goodsNo))
        const res = await Promise.all(promises)

        const goodsNoList = []

        //즉시상품이며, 일시중지 안된 상품만 필터링
        res.map(({data:goods}) => {
            if (goods.goodsKind === 1 && goods.salePaused === false) {
                goodsNoList.push(goods.goodsNo)
            }
        })

        if (window.confirm(`즉시상품 ${goodsNoList.length}건을 일시중지 하시겠습니까?`)) {
            try{
                await Promise.all(goodsNoList.map(goodsNo => updateSalePaused(goodsNo, true)))
                alert(`즉시상품 ${goodsNoList.length}건이 일시중지 되었습니다.`)
                this.search(this.state.goodsState, this.state.deleted)

            }catch (err){
                alert('에러가 발생하였습니다. 다시 시도애 주세요.')
            }
        }
    }
    onGoodsUnPausedClick = async () => {
        const promises = this.state.selectedRows.map((goods) => getGoodsByGoodsNo(goods.goodsNo))
        const res = await Promise.all(promises)

        const goodsNoList = []

        //즉시상품이며, 일시중지 된 상품만 필터링
        res.map(({data:goods}) => {
            if (goods.goodsKind === 1 && goods.salePaused === true) {
                goodsNoList.push(goods.goodsNo)
            }
        })

        if (window.confirm(`즉시상품 ${goodsNoList.length}건을 판매재개 하시겠습니까?`)) {
            try{
                await Promise.all(goodsNoList.map(goodsNo => updateSalePaused(goodsNo, false)))
                alert(`즉시상품 ${goodsNoList.length}건이 판매재개 되었습니다.`)
                this.search(this.state.goodsState, this.state.deleted)

            }catch (err){
                alert('에러가 발생하였습니다. 다시 시도애 주세요.')
            }
        }
    }



    //삭제 클릭
    onDeleteClick = async () => {
        const promises = this.state.selectedRows.map((goods) => getGoodsByGoodsNo(goods.goodsNo))
        const res = await Promise.all(promises)

        const goodsNoList = []

        //판매중단된 상품만 필터링
        res.map(({data:goods}) => {
            if (goods.saleStopped) {
                goodsNoList.push(goods.goodsNo)
            }
        })

        if (window.confirm(`${goodsNoList.length}건을 삭제 하시겠습니까? 삭제 후 복원 가능 합니다.`)) {
            try{
                //delete(deleted = true 로 업데이트)
                await Promise.all(goodsNoList.map(goodsNo => updateGoodsDeleteFlag({goodsNo, deleted:true})))
                alert(`${goodsNoList.length}건이 삭제 되었습니다.`)
                this.search(this.state.goodsState, this.state.deleted)

            }catch (err){
                alert('에러가 발생하였습니다. 다시 시도애 주세요.')
            }
        }
    }

    //삭제된 상품 복원하기
    onRestoreClick = async () => {
        const promises = this.state.selectedRows.map((goods) => getGoodsByGoodsNo(goods.goodsNo))
        const res = await Promise.all(promises)

        const goodsNoList = []

        //삭제된 상품만 필터링
        res.map(({data:goods}) => {
            if (goods.deleted) {
                goodsNoList.push(goods.goodsNo)
            }
        })

        if (window.confirm(`${goodsNoList.length}건을 복원 하시겠습니까?`)) {
            try{

                //delete(deleted = true 로 업데이트)
                await Promise.all(goodsNoList.map(goodsNo => updateGoodsDeleteFlag({goodsNo, deleted: false})))

                alert(`${goodsNoList.length}건이 복원 되었습니다.`)

                this.search(this.state.goodsState, this.state.deleted)

            }catch (err){
                alert('에러가 발생하였습니다. 다시 시도애 주세요.')
            }
        }
    }

    onCheckboxChange = ({target}) => {
        const {checked} = target
        this.setState({
            deleted: checked
        })

        this.search(this.state.goodsState, checked)
    }

    selectedRowChange = (row) => {
        console.log({row})
        this.setState({
            selectedRow: row
        }, () => {
            this.goodsTagsModalToggle()
        })
    }

    goodsTagsModalToggle = () => {
        this.setState({goodsTagsModalOpen: !this.state.goodsTagsModalOpen})
    }

    onGoodsTagsModalClose = () => {
        this.goodsTagsModalToggle()
        this.search(this.state.goodsState, this.state.deleted)
    }

    selectedAuthMarkRowChange = (row) => {
        console.log({row})
        this.setState({
            selectedRow: row
        }, () => {
            this.goodsAuthMarkModalToggle()
        })
    }

    goodsAuthMarkModalToggle = () => {
        this.setState({goodsAuthMarkModalOpen: !this.state.goodsAuthMarkModalOpen})
    }
    onGoodsAuthMarkModalClose = () => {
        this.goodsAuthMarkModalToggle()
        this.search(this.state.goodsState, this.state.deleted)
    }

    multiTagSaveModalToggle = () => {
        this.setState(prevState => ({
            multiTagSaveModalOpen: !prevState.multiTagSaveModalOpen
        }));
    }

    confirmClose = () => {
        if (!window.confirm('창을 닫으시겠습니까?')) {
            return false
        }

        this.multiTagSaveModalToggle()

        return true
    }

    onDatesChange = async (data) => {
        const vSearch = Object.assign({}, this.state.search);
        vSearch.startDate = data.startDate;
        vSearch.endDate = data.endDate;
        vSearch.selectedGubun = data.gubun;
        await this.setState({
            search: vSearch
        });
    }

    // 등록일 수정일 기준 선택
    onSearchModDateChange = async (e) => {
        const vSearch = Object.assign({}, this.state.search);
        vSearch.modDateSearch = e.target.value;
        await this.setState({
            search: vSearch
        });
    }

    //상품등록팝업 페이지
    onGoodsPopupClick = async (gb) => {

        switch (gb){
            case 'reservedGoods' :
                this.setState({
                    isGoodsSelectionOpen: false,
                    isDirectGoodsOpen: false,
                });
                break
            case 'directGoods' :
                this.setState({
                    isGoodsSelectionOpen: false,
                    isDirectGoodsOpen: true,
                });
                break
            case 'dealGoods' :
                this.setState({
                    isGoodsSelectionOpen: false,
                    isDirectGoodsOpen: false,
                    isDealGoodsOpen: true
                })
        }
    }


    render() {
        return(
            <Div p={16}>

                <div className="mt-2 mb-2">
                    <Flex bc={'secondary'} m={3} p={7}>
                        <Div pl={10} pr={20} py={1}> 기 간 </Div>
                        <Div ml={10} >
                            <Flex>
                                <SearchDates
                                    gubun={this.state.search.selectedGubun}
                                    startDate={this.state.search.startDate}
                                    endDate={this.state.search.endDate}
                                    isHiddenAll={true}
                                    isCurrenYeartHidden={true}
                                    isNotOnSearch={true}
                                    onChange={this.onDatesChange}
                                />

                                <div className='ml-2'>
                                    <Input type='select'
                                           name='searchModDate'
                                           id='searchModDate'
                                           onChange={this.onSearchModDateChange}
                                           value={this.state.search.modDateSearch}
                                    >
                                        <option name='modDateSearch' value='N'>등록일기준</option>
                                        <option name='modDateSearch' value='Y'>최종수정일기준</option>
                                    </Input>
                                </div>

                                <Button className="ml-3" color="primary" onClick={this.search.bind(this, this.state.goodsState, this.state.deleted)}> 검 색 </Button>
                            </Flex>
                        </Div>
                    </Flex>
                </div>

                <FilterContainer gridApi={this.gridApi} columnApi={this.columnApi} excelFileName={'상품 목록'}>
                    <FilterGroup>
                        <InputFilter
                            gridApi={this.gridApi}
                            columns={[
                                {field: 'goodsNo', name: '상품번호', width: 80},
                                {field: 'goodsNm', name: '상품명', width: 140},
                                {field: 'tags', name: '#그룹 해시태그'},
                                {field: 'tags', name: '#상품 해시태그'},
                                {field: 'producerNo', name: '생산자번호'},
                                {field: 'producerFarmNm', name: '생산자명'},

                            ]}
                            isRealTime={true}
                        />
                    </FilterGroup>
                    <Hr/>
                    <FilterGroup>
                        <CheckboxFilter
                            gridApi={this.gridApi}
                            field={'directGoods'}
                            name={'종류'}
                            data={[
                                {value: '즉시', name: '즉시'},
                                {value: '공동구매', name: '공동구매'},
                            ]}
                        />
                    </FilterGroup>
                </FilterContainer>
                <Flex mb={10}>
                    <Space>
                        <MenuButton onClick={() => this.search(this.state.goodsState, this.state.deleted)}>새로고침</MenuButton>
                        <Input type='select' name='select' id='goodsState' style={{width: 200}} onChange={this.onStateChange}>
                            <option name='radio1' value='0'>판매중(기간내)</option>
                            <option name='radio2' value='1'>판매중</option>
                            <option name='radio3' value='2'>품절</option>
                            <option name='radio4' value='3'>판매중단</option>   {/* 판매기한만료, 판매중단 */}
                            <option name='radio5' value='4'>일시중지</option>
                        </Input>
                        <ExcelDownload data={this.state.excelData}
                                       fileName="전체판매중상품목록"
                                       sheetName="판매중상품"
                        />
                        <MenuButton bg={'green'} onClick={this.updateAllFeeRate}>수수료일괄수정</MenuButton>


                        {
                            (this.state.selectedRows.length > 0 && (this.state.goodsState === "0"||this.state.goodsState === "1")) && <MenuButton bg={'danger'} onClick={this.onGoodsPausedClick}>{this.state.selectedRows.length}건 일시중지</MenuButton>
                        }
                        {
                            (this.state.selectedRows.length > 0 && this.state.goodsState === "4") && <MenuButton bg={'green'} onClick={this.onGoodsUnPausedClick}>{this.state.selectedRows.length}건 판매재개</MenuButton>
                        }

                        {
                            this.state.goodsState === "3" && (
                                <Div ml={10}>
                                    <Checkbox bg={'danger'}
                                              onChange={this.onCheckboxChange}
                                              checked={this.state.deleted}
                                              size={'sm'}
                                    >
                                        삭제된 상품만 보기
                                    </Checkbox>
                                </Div>
                            )
                        }
                        {
                            (this.state.selectedRows.length > 0 && this.state.goodsState === "3" && !this.state.deleted) && <MenuButton bg={'danger'} onClick={this.onDeleteClick}>{this.state.selectedRows.length}건 삭제</MenuButton>
                        }
                        {
                            (this.state.selectedRows.length > 0 && this.state.goodsState === "3" && this.state.deleted) && <MenuButton bg={'green'} onClick={this.onRestoreClick}>{this.state.selectedRows.length}건 복원</MenuButton>
                        }

                        <MenuButton bg={'green'} onClick={this.multiTagSaveModalToggle}>해시태그 일괄등록</MenuButton>
                    </Space>


                    <Right>
                        총 {this.state.data.length} 건
                    </Right>
                </Flex>

                <div
                    id="myGrid"
                    className="ag-theme-balham"
                    style={{
                        height: '700px'
                    }}
                >
                    <AgGridReact
                        {...this.state.gridOptions}
                        rowData={this.state.data}
                    >
                    </AgGridReact>
                </div>


                <Modal size="lg" isOpen={this.state.isExcelUploadModal} toggle={this.excelUploadModalToggle} >
                    <ModalHeader toggle={this.excelUploadModalToggle}>
                        <span>수수료 일괄수정 엑셀 업로드</span><br/>
                        <small>* 현재 판매중인 상품의 엑셀 다운로드 후 수수료만 수정해서 업로드 하시면 됩니다.</small><br/>
                        <small>* 엑셀데이터가 100건 이상일 경우 나눠서 업로드해주세요!(데이터가 많을경우 오래 걸릴수 있습니다)</small>
                    </ModalHeader>
                    <ModalBody>
                        <div className="d-flex justify-content-center mb-3">
                            <div>
                                수수료만 수정가능합니다.<br/>
                                다른 항목은 엑셀에서 수정 후 업로드해도 실제로 반영되지 않습니다.<br/>
                            </div>
                        </div>
                        <div className="d-flex justify-content-center">
                            <div>
                                <FormGroup>
                                    <Input
                                        type="file"
                                        id="excelFile" name="excelFile"
                                        accept={'.xlsx'}
                                        innerRef={this.excelFile}
                                        onChange={this.onFeeRateExcelExportChk}
                                    />
                                </FormGroup>
                            </div>
                            <div>
                                <Button bg={'green'}
                                        size={'sm'}
                                        disabled={!this.state.isExcelUploadFileData}
                                        onClick={this.onFeeRateExcelUploadSave}>
                                    수수료파일 업로드
                                </Button>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button bc={'secondary'} onClick={this.cancelExcelModal}>취소</Button>
                    </ModalFooter>
                </Modal>


                <Modal isOpen={this.state.goodsTagsModalOpen} toggle={this.goodsTagsModalToggle} centered size={'xl'}>
                    <ModalHeader toggle={this.goodsTagsModalToggle}>상품 수정</ModalHeader>
                    <ModalBody style={{padding: 0}}>
                        <GoodsContent
                            goodsNo={this.state.selectedRow && this.state.selectedRow.goodsNo}
                            onClose={this.onGoodsTagsModalClose}
                        />
                    </ModalBody>
                </Modal>

                <Modal isOpen={this.state.multiTagSaveModalOpen} toggle={this.confirmClose} centered size={'xl'}>
                    <ModalHeader toggle={this.multiTagSaveModalToggle}>해시태그 일괄 등록/수정</ModalHeader>
                    <ModalBody style={{padding: 0}}>
                        <HashtagMultiSaveContent goodsList={this.state.selectedRows}/>
                    </ModalBody>
                </Modal>

                <Modal isOpen={this.state.goodsAuthMarkModalOpen} toggle={this.goodsAuthMarkModalToggle} centered size={'xl'}>
                    <ModalHeader toggle={this.goodsAuthMarkModalToggle}>인증마크 적용</ModalHeader>
                    <ModalBody style={{padding: 0}}>
                        <GoodsAuthMarksContent
                            goodsNo={this.state.selectedRow && this.state.selectedRow.goodsNo}
                            onClose={this.onGoodsAuthMarkModalClose}/>
                    </ModalBody>
                </Modal>
            </Div>
        );
    }
}

function OptionInfoList({options}) {
    let rowIndex = 0;
    return(
        <div
            style={{overflow: 'auto', maxHeight: ROW_MAX_HEIGHT}}
        >
            {
                options.map((o) => {
                    if (o.deleted) {
                        return null
                    }else{
                        rowIndex++
                    }
                    return <OptionInfoItem key={o.optionIndex} index={rowIndex} remainedCnt={o.remainedCnt} optionName={o.optionName} />
                })
            }
        </div>

    )
}

function OptionInfoItem({index, remainedCnt, optionName}){
    return(
        <Flex
            lineHeight={'18px'}
            alignItems={'flex-start'}
            // style={{height: 18, lineHeight: '18px'}}
        >
            <div>[{index}]</div>
            <Div mx={6} minWidth={30} fg={remainedCnt <= 0 ? 'danger' : 'black'} bold
                // style={{minWidth: 70, color: option.remainedCnt <= 0 ? color.danger : 'black'}}
            >{remainedCnt}</Div>
            <span>{optionName}</span>
        </Flex>
    )
}