import React, {useEffect, useState} from 'react'
import { Button } from 'reactstrap'

import 'react-toastify/dist/ReactToastify.css'
import { getProducerGoods } from '~/lib/goodsApi'
import { getGoodsStepList, getProducer } from '~/lib/producerApi'
import ComUtil from '~/util/ComUtil'
import WebFarmDiaryReg from '~/components/producer/web/farmDiary/WebFarmDiaryReg'

import { ProducerFullModalPopupWithNav } from '../../../common'
import { AgGridReact } from 'ag-grid-react';
import { Server } from '../../../Properties'
import Select from "react-select";
import {useHistory} from 'react-router-dom'

import moment from "moment-timezone";

const WebFarmDiaryList = (props) => {

    const history = useHistory();

    const [gridApi, setGridApi] = useState(null);

    const [dataList, setDataList] = useState([]);

    const [stepSeq, setStepSeq] = useState(null);
    const [consumerNo, setConsumerNo] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [selectGoods, setSelectGoods] = useState({
        goodsNo:0,
        goodsNm:'',
    });

    const agGrid = {
        columnDefs: [
            {
                headerName: "writingId", field: "writingId", cellRenderer: 'stepSeqRenderer'
            },
            {
                headerName: "단계", field: "stepIndex", width: 100,
                valueGetter: function(params) {
                    let v_Date = "시작";
                    if(params.data.stepIndex === 0) {
                        return '시작';
                    } else if(params.data.stepIndex === 100) {
                        v_Date = "생산";
                    } else if(params.data.stepIndex === 200) {
                        v_Date = "포장";
                    } else if(params.data.stepIndex === 300) {
                        v_Date = "발송";
                    }
                    return v_Date;
                },
            },
            {
                headerName: "작업명", field: "stepTitle", width: 150
            },
            {
                headerName: "작업내용", field: "content", width: 150
            },
            {
                headerName: "이미지", field: "images", width: 150,
                cellRenderer: 'diaryImageRenderer'
            },
            {
                headerName: "등록일시", field: "writeDate", width: 200,
                cellClass: "ag-grid-cell-link",
                cellRenderer: "diaryRegDateRenderer"
            },
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
        components: {
            diaryRegDateRenderer: diaryRegDateRenderer
        },
        frameworkComponents: {
            stepSeqRenderer: stepSeqRenderer,
            diaryImageRenderer: diaryImageRenderer
        },
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
        overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
        rowSelection: 'single',
        rowHeight:35,
    };

    //[이벤트] 그리드 로드 후 callback 이벤트 API init
    const onGridReady = params => {
        setGridApi(params.api);
    };

    function stepSeqRenderer ({value, data:rowData}) {
        return (<span className='text-primary' onClick={onStepSeqClick.bind(this, rowData)}><u>{rowData.writingId}</u></span>);
    }

    //이미지 렌더러
    function diaryImageRenderer ({value: images}) {
        if(images){
            return images.map(image => {
                let src = Server.getThumbnailURL() + image.imageUrl
                if(image.imageUrlPath){
                    src = Server.getImgTagServerURL() + image.imageUrlPath + image.imageUrl;
                }
                const Style = {
                    width: 30, height: 30, paddingRight: '1px'
                }
                return <img src={src} style={Style} alt={image.imageNm}/>
            })
        }else{
            return null
        }

    }

    //등록일시 렌더러
    function diaryRegDateRenderer ({value, data:rowData}) {
        return ComUtil.utcToString(value, 'YYYY-MM-DD HH:mm')
    }

    const onStepSeqClick = (data) => {
        setStepSeq(data.writingId);
        setConsumerNo(data.consumerNo);
        setIsOpen(true);
    }

    useEffect(() => {
        async function fetch() {
            let loginUser = await getProducer();
            if(!loginUser){
                //admin은 웹전용이라서, window로 이동하는 것이 더 잘됨. //this.props.history.push('/admin');
                history.push('/producer/webLogin')
            }

            await getSearch();
        }
        fetch();

    }, []);

    useEffect(() => {
        if(selectGoods.goodsNo > 0) {
            getSearch();
        }
    }, [selectGoods.goodsNo]);

    // 조회
    const getSearch = async () => {
        if(gridApi) {
            //ag-grid 레이지로딩중 보이기
            gridApi.showLoadingOverlay();
        }
        const { data } = await getGoodsStepList(selectGoods.goodsNo)
        setDataList(data)
        if(gridApi) {
            //ag-grid 레이지로딩중 보이기
            gridApi.hideOverlay();
        }
    }

    // 상품 온체인지
    const onGoodsChange = (data) => {
        setSelectGoods( data)
    }

    const onClose = (data) => {
        setStepSeq(null);
        setIsOpen(false);
        if(data.isSearch){
            getSearch();
        }
    }

    const onNewPostClick = () => {
        setStepSeq(null);
        setIsOpen(true);
    }


    return(
        <>
            <div className='mt-2'>
                {/*<div className='text-secondary small'> - 상품의 품목과 생산일지가 등록된 품목이 같을 경우, 해당 생산일지는 동일 품목에 등록된 모든 상품에 노출이 됩니다.</div>*/}
                <div className='text-secondary small'> - 재배이력은 내용이 변경되는 경우 일지를 수정하는 것보다는 새롭게 등록하는 것이 좋습니다. (수정은 오타, 사진 변경 등에만 해주세요)</div>
                <div className='text-secondary small'> - 복사된 상품의 경우 재배이력을 등록하면, 원본상품에 등록/관리 됩니다.</div>
            </div>

            <div>
                <div className='text-right'>
                    <span>
                        {
                            selectGoods.goodsNo > 0 &&
                            <span>선택한상품:({selectGoods.goodsNo}){selectGoods.goodsNm}</span>
                        }
                    </span>
                </div>
            </div>

            <div className={'d-flex'}>
                <div className={'p-1 flex-grow-1'}>
                    <WebFarmDiaryGoodsList onChange={onGoodsChange} />
                </div>
                <div className={'p-1 flex-grow-1'}>
                    <div className='p-2 d-flex align-items-center록'>
                        <div>총 {ComUtil.addCommas(dataList.length)} 개</div>
                        <div className='flex-grow-1 text-right'>
                            <Button color={'info'} size={'sm'} onClick={onNewPostClick} disabled={selectGoods.goodsNo === 0 ? true:false} >생산일지 등록</Button>
                        </div>
                    </div>

                    <div
                        id="myGrid"
                        style={{
                            height: "calc(100vh - 180px)",
                        }}
                        className="ag-theme-balham"
                    >
                        <AgGridReact
                            columnDefs={agGrid.columnDefs}  //컬럼 세팅
                            defaultColDef={agGrid.defaultColDef}
                            rowSelection={agGrid.rowSelection}  //멀티체크 가능 여부
                            rowHeight={agGrid.rowHeight}
                            overlayLoadingTemplate={agGrid.overlayLoadingTemplate}
                            overlayNoRowsTemplate={agGrid.overlayNoRowsTemplate}
                            rowData={dataList}
                            components={agGrid.components}  //custom renderer 지정, 물론 정해져있는 api도 있음
                            frameworkComponents={agGrid.frameworkComponents}
                            onGridReady={onGridReady}   //그리드 init(최초한번실행)
                        >
                        </AgGridReact>
                    </div>
                </div>
            </div>



            <ProducerFullModalPopupWithNav show={isOpen} title={stepSeq ? '생산일지수정' : '생산일지작성'} onClose={onClose}>
                <WebFarmDiaryReg writingId={stepSeq} goodsNo={selectGoods.goodsNo} consumerNo={consumerNo}/>
            </ProducerFullModalPopupWithNav>
        </>
    )

}

const WebFarmDiaryGoodsList = (props) => {

    const [gridApi, setGridApi] = useState(null);
    const [dataList, setDataList] = useState([]);

    const agGrid = {
        columnDefs: [
            {headerName: "상품번호", field: "goodsNo", sort:'desc', width: 80},
            {headerName: "상품명", field: "goodsNm", width: 250},
            {headerName: "원본상품", field: "reviewGoodsNo", width: 80, cellRenderer: 'reviewGoodsNoRenderer'},
            {headerName: "상태", field: "confirm", width: 80, cellRenderer: 'goodsStateRenderer'},
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
        // components: {
        //     diaryRegDateRenderer: diaryRegDateRenderer
        // },
        frameworkComponents: {
            reviewGoodsNoRenderer: reviewGoodsNoRenderer,
            goodsStateRenderer: goodsStateRenderer,
        },
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
        overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
        rowSelection: 'single',
        rowHeight:35,
    };


    const getStatus = (rowData) => {
        let toDate = ComUtil.utcToString(moment());
        let saleDateEnd = rowData.saleEnd ? ComUtil.utcToString(rowData.saleEnd) : null;

        //console.log(rowData.goodsNo, toDate,saleDateEnd);

        let status;

        if (!rowData.confirm) {
            status = '임시저장'
        } else {
            status = '판매중'
            if (rowData.salePaused) {
                status = '일시중지'
            }
            if (rowData.saleStopped) {
                status = '판매중단'
            }
            if (rowData.remainedCnt <= 0) {
                status += '|품절'
            }

            if (saleDateEnd) {
                let newResult = saleDateEnd.replace(/\./gi, "-")
                let diffSaleResult = ComUtil.compareDate(newResult, toDate);
                if (diffSaleResult === -1) {
                    status += '|판매기한만료'
                }
            }
        }
        return status
    }

    //reviewGoodsNo가 goodsNo와 같으면 복사상품이 아님 ''리턴
    function reviewGoodsNoRenderer({data:rowData}) {
        return <div>{(rowData.reviewGoodsNo != rowData.goodsNo)? rowData.reviewGoodsNo:''}</div>
    }
    function goodsStateRenderer({data:rowData}) {
        const status = getStatus(rowData)
        return <div>{status}</div>
    }

    //[이벤트] 그리드 로드 후 callback 이벤트 API init
    const onGridReady = params => {
        setGridApi(params.api);
    };

    useEffect(() => {
        async function fetch() {
            await getSearch();
        }
        fetch();

    }, []);

    // 상품 품목명 가져오기
    const getSearch = async () => {

        if(gridApi) {
            //ag-grid 레이지로딩중 보이기
            gridApi.showLoadingOverlay();
        }
        const { data } = await getProducerGoods();
        const resData = await Promise.all(data.filter(goods=>goods.dealGoods))
        //setDataList(data) //전체상품 출력시.
        setDataList(resData) //공구상품만 출력

        if(gridApi) {
            //ag-grid 레이지로딩중 보이기
            gridApi.hideOverlay();
        }


    }

    const onSelectionChanged = (event) => {
        const rowNodes = event.api.getSelectedNodes();
        const rows = rowNodes.map((rowNode => rowNode.data));
        const row = rows[0];
        //console.log("goodsSelected===",row);
        props.onChange(row)
    }

    return(
        <>
            <div className='p-2 d-flex align-items-center'>
                <div>총 {ComUtil.addCommas(dataList.length)} 개</div>
                <div className='flex-grow-1 text-right'>
                </div>
            </div>
            <div
                id="myGrid"
                style={{
                    height: "calc(100vh - 170px)",
                }}
                className="ag-theme-balham"
            >
                <AgGridReact
                    columnDefs={agGrid.columnDefs}  //컬럼 세팅
                    defaultColDef={agGrid.defaultColDef}
                    rowSelection={agGrid.rowSelection}  //멀티체크 가능 여부
                    rowHeight={agGrid.rowHeight}
                    overlayLoadingTemplate={agGrid.overlayLoadingTemplate}
                    overlayNoRowsTemplate={agGrid.overlayNoRowsTemplate}
                    rowData={dataList}
                    components={agGrid.components}  //custom renderer 지정, 물론 정해져있는 api도 있음
                    frameworkComponents={agGrid.frameworkComponents}
                    onRowClicked={onSelectionChanged.bind(this)}
                    onGridReady={onGridReady}   //그리드 init(최초한번실행)
                >
                </AgGridReact>
            </div>
        </>
    )
}

export default WebFarmDiaryList