import React, { useState, useEffect, Fragment } from 'react';
import {getLoginAdminUser} from '~/lib/loginApi';
import {getAllDealGoods, updateRecommenderRate} from '~/lib/dealApi';
import {AgGridReact} from 'ag-grid-react';
import {Div, FilterGroup, Flex, Hr, Space, Span} from '~/styledComponents/shared';
import ComUtil from "~/util/ComUtil";
import InputFilter from "~/components/common/gridFilter/InputFilter";
import FilterContainer from "~/components/common/gridFilter/FilterContainer";
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
// import DealGoodsStepName from "./DealGoodsStepName";
import DealGoodsExtraReward from "~/components/admin/dealGoodsList/DealGoodsExtraReward";
import {MenuButton, SmButton} from "~/styledComponents/shared/AdminLayouts";
import {B2cGoodsSearch} from "~/components/common";
import AdditionalDealContent from "~/components/admin/dealGoodsList/AdditionalDealContent";
import HashtagMultiSaveContent from "~/components/admin/goodsList/MultiTagManagerContent";

// function StepNamesModal({isOpen, onCancel, children}) {
//     return(
//         <Modal isOpen={isOpen} toggle={onCancel} centered size={'xl'}>
//             <ModalHeader toggle={onCancel}>이력추적단계</ModalHeader>
//             <ModalBody>
//                 {children}
//             </ModalBody>
//         </Modal>
//     )
// }

function ExtraRewardsModal({isOpen, onCancel, children}) {
    return(
        <Modal isOpen={isOpen} toggle={onCancel} centered size={'xl'}>
            <ModalHeader toggle={onCancel}>추가 적립</ModalHeader>
            <ModalBody>
                {children}
            </ModalBody>
        </Modal>
    )
}

const DealGoodsList = (props) => {

    const [dealGoodsList, setDealGoodsList] = useState([]);
    const [gridApi, setGridApi] = useState(null);
    const [columnApi, setColumnApi] = useState(null)
    const [isStepNameOpen, setIsStepNameOpen] = useState(false)
    const [isRewardOpen, setIsRewardOpen] = useState(false)
    const [selectedGoods, setSelectedGoods] = useState({})

    const [selectedGoodsList, setSelectedGoodsList] = useState([])

    const [fCountOpen, setFCountOpen] = useState(false)

    const [agGrid, setAgGrid] = useState({
        columnDefs: [
            {
                headerName: "상품번호", field: "goodsNo", sort:"desc",  width: 110,
                headerCheckboxSelection: true,
                headerCheckboxSelectionFilteredOnly: true,  //전체 체크시 필터된 것만 체크
                checkboxSelection: true,
            },
            {headerName: "생산자No", field: "producerNo", width: 90},
            {headerName: "생산자", field: "producerFarmNm", width: 140},
            {headerName: "상품명", field: "goodsNm", width: 300},
            {
                headerName: "옵션개수", field: "options", width: 90,
                valueGetter: function(params) {
                    return params.data.options.length;
                }
            },
            {
                headerName: "옵션명", field: "options", width: 300,
                valueGetter: function(params) {
                    let optionNames = '';
                    if(params.data.options.length > 1) {
                        params.data.options.map(item => {
                            optionNames = optionNames + item.optionName + ' // ';
                        })
                    }
                    return optionNames;
                }
            },
            {
                headerName: "판매가격", field: "currentPrice", width: 150,
                valueGetter: function(params) {
                    let optionPrice = params.data.currentPrice;
                    if(params.data.options.length > 1) {
                        optionPrice = '';
                        params.data.options.map(item => {
                            optionPrice = optionPrice + item.optionPrice + ' // ';
                        })
                    }
                    return optionPrice;
                }
            },
            {
                headerName: "#해시태그", field: "tags", width: 300,
                valueGetter: function ({data}){
                    if (!data.tags) return ''
                    return data.tags.map(tag => '#'+tag)
                },
                cellRenderer: "tagsRenderer"
            },
            {
                headerName: "상품상태", field: "confirm", width: 100,
                valueGetter: function (params) {
                    if (!params.data.confirm) {
                        return '임시저장'
                    } else if (params.data.salePaused) {
                        return '일시중지'
                    } else if (params.data.saleStopped) {
                        return '판매중단'
                    } else {
                        return '판매중'
                    }
                },
            },
            {headerName: "남은수량", field: "remainedCnt", width: 90},
            {headerName: "공구시작일", field: "dealStartDate", width: 120},
            {headerName: "공구마감일", field: "dealEndDate", width: 120},
            {headerName: "최소수량", field: "dealMinCount", width: 90},
            {headerName: "최대수량", field: "dealMaxCount", width: 90},
            // {headerName: "이력추적", field: "stepNames", cellRenderer: 'stepNameRenderer', width: 250},
            {headerName: "공유추가적립(%)", field: "dealRecommenderRate", cellRenderer: 'dealRecommenderRateRenderer', width: 130},
            {headerName: "추가적립단계", field: "extraRewardList", cellRenderer: 'extraRewardRenderer', width: 250},
            {headerName: "참여자수 제어", field: "fkDealCount", cellRenderer: 'fkDealCountRenderer', width: 250},

        ],
        defaultColDef: {
            width: 200,
            resizable: true,
            filter: true,
            sortable: true,
            floatingFilter: false,
            filterParams: {
                newRowsAction: 'keep'
            }
        },
        frameworkComponents: {
            tagsRenderer: tagsRenderer,
            // stepNameRenderer: stepNameRenderer,
            extraRewardRenderer: extraRewardRenderer,
            dealRecommenderRateRenderer: dealRecommenderRateRenderer,
            fkDealCountRenderer: fkDealCountRenderer
        },
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
        overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
    })

    useEffect(() => {
        async function fetch(){
            await search();
        }
        fetch();
    }, []);

    function tagsRenderer({data}) {
        return (
            <Flex>
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

    const search = async() => {
        await checkLogin();

        if (gridApi) {
            //ag-grid 레이지로딩중 보이기
            gridApi.showLoadingOverlay();
        }

        const {data:list} = await getAllDealGoods();
        console.log({list});
        setDealGoodsList(list);

        if (gridApi) {
            //ag-grid 레이지로딩중 보이기
            gridApi.hideOverlay();
        }
    }

    const checkLogin = async() => {
        let user = await getLoginAdminUser();

        if (!user || user.email.indexOf('ezfarm') < 0) {
            window.location = '/admin/login'
        }
    }

    const copy = ({value}) => {
        ComUtil.copyTextToClipboard(value, '', '');
    }

    //[이벤트] 그리드 로드 후 callback 이벤트 API init
    const onGridReady = params => {
        setGridApi(params.api)
        setColumnApi(params.columnApi)
    };

    // function stepNameRenderer({value, data:rowData}) {
    //     let steps = rowData.stepNames ? rowData.stepNames : [];
    //     let list = [];
    //     steps.map(data => {
    //         list.push(data.stepName + ', ');
    //     })
    //
    //     return (
    //         <div className={'d-flex'}>
    //             <span>{list}</span>
    //             <div className={'ml-auto'}>
    //                 <Button size='sm' onClick={onCllickStepName.bind(this, rowData)}>수정</Button>
    //             </div>
    //         </div>
    //     )
    // }

    function dealRecommenderRateRenderer({value, data:rowData}) {
        return (
            <div>
                <SmButton mr={10} onClick={onCllickRecommenderRate.bind(this, rowData)}>수정</SmButton>
                <span>{rowData.dealRecommenderRate}</span>
            </div>
        )
    }

    function extraRewardRenderer({value, data:rowData}) {
        let steps = rowData.extraRewards ? rowData.extraRewards : [];
        let list = [];
        steps.map(data => {
            list.push(data.dealCount + '개, ');
        })
        return (
            <div className={'d-flex'}>
                <div className={'mr-1'}>
                    <SmButton onClick={onCllickReward.bind(this, rowData)}>수정</SmButton>
                </div>
                <span>{list}</span>
            </div>
        )
    }

    function fkDealCountRenderer({value, data}) {
        return (
            <Flex>
                <SmButton mr={3} onClick={onFkDealCountClick.bind(this, data)}>
                    수정
                </SmButton>
                <Div>
                    {
                        `총 ${data.dealCount}명 (${data.dealCount - data.fkDealCount} / ${data.fkDealCount})`
                    }
                </Div>
            </Flex>
        )
    }

    const onCllickRecommenderRate = async(rowData) => {
        const rate = window.prompt("수정할 수수료를 입력해주세요.")
        if (!rate) {
            return
        }

        if(!window.confirm(`${rate}%로 수수료를 수정하시겠습니까?`)) {
            return false
        } else {
            const {data} = await updateRecommenderRate(rowData.goodsNo, rate);
            if(data) {
                alert('수수료 수정을 완료했습니다.')
                search();
            } else {
                alert('관리자 로그인을 확인해주세요.')
            }
        }
    }

    const onCllickStepName = (rowData) => {
        setSelectedGoods(rowData);
        toggle('stepName')
    }

    const onCllickReward = (rowData) => {
        console.log(rowData)
        setSelectedGoods(rowData);
        toggle('reward')
    }

    const onFkDealCountClick = (rowData) => {
        setSelectedGoods(rowData);
        fkDealCountToggle()
    }
    const fkDealCountToggle = () => setFCountOpen(!fCountOpen)


    // const setStepNameFinished = async() => {
    //     await search();
    //     toggle('stepName')
    // }

    const setRewardFinished = async() => {
        await search();
        toggle('reward')
    }

    function toggle(which){
        if(which === 'stepName') {
            setIsStepNameOpen(!isStepNameOpen)
        } else {
            setIsRewardOpen(!isRewardOpen)
        }
    }

    const onSelectionChanged = () => {
        // this.setState({
        //     selectedRows: gridApi.getSelectedRows()
        // })
        console.log('onSelectionChanged',gridApi.getSelectedRows())
        setSelectedGoodsList(gridApi.getSelectedRows())
    }

    const [multiTagSaveModalOpen, setMultiTagSaveModalOpen] = useState(false)

    const multiTagSaveModalToggle = () => {
        setMultiTagSaveModalOpen(!multiTagSaveModalOpen)
    }

    const confirmClose = () => {
        if (!window.confirm('창을 닫으시겠습니까?')) {
            return false
        }

        multiTagSaveModalToggle()

        return true
    }

    return (
        <Div p={16}>
            <FilterContainer gridApi={gridApi} columnApi={columnApi} excelFileName={'공동구매상품'}>
                <FilterGroup>
                    <InputFilter
                        gridApi={gridApi}
                        columns={[
                            {field: 'goodsNo', name: '상품번호', width: 80},
                            {field: 'goodsNm', name: '상품명', width: 140},
                            {field: 'producerNo', name: '생산자번호'},
                            {field: 'producerFarmNm', name: '생산자명'},
                        ]}
                        isRealTime={true}
                    />
                </FilterGroup>
            </FilterContainer>
            <Space mb={10}>
                <MenuButton onClick={search}>새로고침</MenuButton>
                <MenuButton bg={'green'} onClick={multiTagSaveModalToggle}>해시태그 일괄등록</MenuButton>
            </Space>
            <div
                id="myGrid"
                className="ag-theme-balham"
                style={{
                    height: '700px'
                }}
            >
                <AgGridReact
                    onGridReady={onGridReady}
                    columnDefs={agGrid.columnDefs}
                    defaultColDef={agGrid.defaultColDef}
                    rowSelection={'multiple'}  //멀티체크 가능 여부
                    suppressRowClickSelection={false}   //false : 셀 클릭시 체크박스도 체크 true: 셀클릭시 체크박스 체크 안함
                    rowData={dealGoodsList}
                    frameworkComponents={agGrid.frameworkComponents}
                    overlayLoadingTemplate={agGrid.overlayLoadingTemplate}
                    overlayNoRowsTemplate={agGrid.overlayNoRowsTemplate}
                    onCellDoubleClicked={copy}
                    onSelectionChanged={onSelectionChanged.bind(this)}
                >
                </AgGridReact>
            </div>
            {/*<StepNamesModal isOpen={isStepNameOpen} onCancel={toggle.bind(this,'stepName')} >*/}
            {/*    <DealGoodsStepName data={selectedGoods.stepNames} goodsNo = {selectedGoods.goodsNo} onClose={setStepNameFinished}/>*/}
            {/*</StepNamesModal>*/}
            <ExtraRewardsModal isOpen={isRewardOpen} onCancel={toggle.bind(this,'reward')} >
                <DealGoodsExtraReward data={selectedGoods.extraRewards} goodsNo = {selectedGoods.goodsNo} onClose={setRewardFinished}/>
            </ExtraRewardsModal>

            {/* 딜 수량 세팅 모달 */}
            <Modal size="lg" isOpen={fCountOpen}
                   toggle={fkDealCountToggle} >
                <ModalHeader toggle={fkDealCountToggle}>
                    딜 수량 및 참여자 수 조절
                </ModalHeader>
                <ModalBody>
                    <AdditionalDealContent goodsNo={selectedGoods.goodsNo} onClose={fkDealCountToggle}/>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={fkDealCountToggle}>취소</Button>
                </ModalFooter>
            </Modal>


            <Modal isOpen={multiTagSaveModalOpen} toggle={confirmClose} centered size={'xl'}>
                <ModalHeader toggle={multiTagSaveModalToggle}>해시태그 일괄 등록/수정</ModalHeader>
                <ModalBody style={{padding: 0}}>
                    <HashtagMultiSaveContent goodsList={selectedGoodsList}/>
                </ModalBody>
            </Modal>

        </Div>
    )
}

export default DealGoodsList

