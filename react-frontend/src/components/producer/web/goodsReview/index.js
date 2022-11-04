import React, { Component, Fragment } from 'react';
import { Button, FormGroup,  Modal, ModalBody, ModalFooter } from 'reactstrap'
import ComUtil from '~/util/ComUtil'
import { Server } from '~/components/Properties'
import { getGoodsReviewListByProducerNo } from '~/lib/producerApi'
import { getLoginProducerUser } from '~/lib/loginApi'
import { IconStarGroup } from '~/components/common'

//ag-grid
import { AgGridReact } from 'ag-grid-react';
import FilterContainer from "~/components/common/gridFilter/FilterContainer";
import {Div, FilterGroup, Hr} from "~/styledComponents/shared";
import InputFilter from "~/components/common/gridFilter/InputFilter";
import CheckboxFilter from "~/components/common/gridFilter/CheckboxFilter";
import SearchDates from "~/components/common/search/SearchDates";
import moment from "moment-timezone";

export default class WebGoodsReviewList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null,
            columnDefs: this.getColumnDefs(),
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
                formatCurrencyRenderer: this.formatCurrencyRenderer,
                formatDateRenderer: this.formatDateRenderer
            },
            frameworkComponents: {
                goodsReviewContentPhotoRenderer: this.goodsReviewContentPhotoRenderer,
                goodsReviewScoreRenderer: this.goodsReviewScoreRenderer,
                directGoodsRenderer: this.directGoodsRenderer
            },
            rowSelection: 'single',
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
            totalListCnt:0,

            filterItems: {
                items: [],
                starsItems: []
            },

            searchFilter: {
                stars: [],
                startAll: true
            },

            zoomModalOpen: false,

            search: {
                selectedGubun: 'month', //'months': 최초화면을 1달(months)로 설정.
                startDate: moment(moment().toDate()).add(-1,"months"),
                endDate: moment(moment().toDate()),
            },

        }
    }

    //[이벤트] 그리드 로드 후 callback 이벤트
    onGridReady(params) {
        //API init
        this.gridApi = params.api;
        this.columnApi = params.columnApi;
        //console.log("onGridReady");

        this.gridApi.resetRowHeights();
    }

    getRowHeight(params) {
        return 50;
    }

    // Ag-Grid column Info
    getColumnDefs () {

        let orderSeqColumn = {
            headerName: "주문번호",
            field: "orderSeq",
            width: 100,
            cellStyle: this.getCellStyle,
            filterParams: {
                clearButton: true
            }
        };

        let goodsNoColumn = {
            headerName: "상품번호", field: "goodsNo",
            width: 100,
            cellStyle:this.getCellStyle,
            filterParams: {
                clearButton: true //클리어버튼
            }
        };

        let goodsNameColumn = {
            headerName: "상품명", field: "goodsNm",
            width: 300,
            cellStyle:ComUtil.getCellStyle,
            filterParams: {
                clearButton: true //클리어버튼
            }
        };

        let goodsReviewContentColumn = {
            headerName: "후기내용", field: "goodsReviewContent",
            suppressFilter: true, //no filter
            suppressSizeToFit: true,
            width: 280,
            autoHeight:true,    //row크기자동
            cellStyle:ComUtil.getCellStyle({whiteSpace:"pre-line"}),
            filterParams: {
                clearButton: true //클리어버튼
            }

        };

        let goodsReviewContentPhotoColumn = {
            headerName: "후기사진",
            field: "goodsReviewImages",
            cellRenderer: 'goodsReviewContentPhotoRenderer',
            suppressFilter: true, //no filter
            suppressSizeToFit: true,
            width: 150,
            autoHeight:true,
            cellStyle:ComUtil.getCellStyle,
            filterParams: {
                clearButton: true //클리어버튼
            }
        };

        let goodsReviewDateColumn = {
            headerName: "후기작성일", field: "goodsReviewDate",
            suppressSizeToFit: true,
            width: 130,
            cellStyle:ComUtil.getCellStyle,
            filterParams: {
                clearButton: true //클리어버튼
            },
            valueGetter: function(params) {
                //console.log("params",params);
                //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                return ComUtil.utcToString(params.data.goodsReviewDate,'YYYY-MM-DD HH:mm');
            },
            sort:"desc"
        };

        let consumerName = {
            headerName: "작성자", field: "consumerName",
            suppressSizeToFit: true,
            width: 80,
            cellStyle:ComUtil.getCellStyle,
            filterParams: {
                clearButton: true //클리어버튼
            }
        };

        let scoreColumn = {
            headerName: "평점",
            field: "score",
            cellRenderer: 'goodsReviewScoreRenderer',
            suppressSizeToFit: true,
            width: 120,
            cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
            filterParams: {
                clearButton: true //클리어버튼
            }
        };

        let likeColumn = {
            headerName: "좋아요", field: "likesCount",
            suppressSizeToFit: true,
            width: 80,
            cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
            filterParams: {
                clearButton: true //클리어버튼
            }
        };

        let columnDefs = [
            orderSeqColumn,
            goodsNoColumn,
            goodsNameColumn,
            goodsReviewContentColumn,       //후기내용
            goodsReviewContentPhotoColumn,  //후기사진
            goodsReviewDateColumn,  //후기작성
            consumerName,
            scoreColumn,    //평점
            likeColumn
        ];

        return columnDefs
    }

    //Ag-Grid Cell 숫자콤마적용 렌더러
    formatCurrencyRenderer = ({value, data:rowData}) => {
        //console.log("rowData",rowData);
        return ComUtil.addCommas(value);
    }
    //Ag-Grid Cell 날짜변환 렌더러
    formatDateRenderer = ({value, data:rowData}) => {
        return (value ? ComUtil.utcToString(value) : '미지정')
    }

    //Ag-Grid Cell 후기사진 렌더러
    goodsReviewContentPhotoRenderer = ({value: images, data:rowData}) => {

        // return (<ImageGalleryModal images={images} modalImages={images} />);

        return images.map((image,idx) => {
            const src_url = Server.getThumbnailURL() + image.imageUrl;
            const origin_url = Server.getImageURL() + image.imageUrl;
            const style = {
                width: 30, height: 30, paddingRight: '1px'
            };
            return (
                <img src={src_url} style={style} alt={'상품후기 사진'} onClick={this.zoomReviewPicture.bind(this, origin_url)}/>
            )
        });
    }


    zoomReviewPicture = (origin_url) => {

        this.setState({
            zoomModalOpen: true,
            modalImageUrl: origin_url
        })
        // window.open(image, 'img', 'width=640, height=480')
    }

    onCloseModal = () => {
        this.setState({
            zoomModalOpen: false
        })
    }

    //즉시 예약상품 랜더
    directGoodsRenderer = ({value, data:rowData}) => {
        let directGoodsText = rowData.directGoods ? "즉시" : "예약";
        return (<span>{directGoodsText}</span>)
    }

    //Ag-Grid Cell 평점 렌더러
    goodsReviewScoreRenderer = ({value: score, data:rowData}) => {
        return (
            <div>
                <IconStarGroup score={score} />&nbsp;&nbsp;{score}
            </div>
        );
    }

    //Ag-Grid 주문상태 필터링용 온체인지 이벤트 (데이터 동기화)
    onGridFilterChanged () {
        //필터링된 데이터 push
        let sortedData = [];
        this.gridApi.forEachNodeAfterFilterAndSort(function(node, index) {
            sortedData.push(node.data);
        });

        this.setState({
            totalListCnt: sortedData.length
        });
    }

    componentDidMount = async() => {
        //로그인 체크
        const loginUser = await getLoginProducerUser();
        if (!loginUser) {
            this.props.history.push('/producer/webLogin')
        }
        this.setState({
            producerNo: loginUser.uniqueNo
        });

        this.search()
        this.setFilter()

    }

    //새로고침 버튼
    onRefreshClick = async () => {
        this.search();
    }

    // 주문조회 (search)
    search = async () => {
        if(this.gridApi) {
            //ag-grid 레이지로딩중 보이기
            this.gridApi.showLoadingOverlay();
        }

        const searchInfo = Object.assign({},this.state.search)
        const startDate = searchInfo.startDate ? moment(searchInfo.startDate).format('YYYYMMDD'):null;
        const endDate = searchInfo.endDate ? moment(searchInfo.endDate).format('YYYYMMDD'):null;
        let dataParams = {
            stars:this.state.searchFilter.stars,
            startDate:startDate,
            endDate:endDate
        };
        const { status, data } = await getGoodsReviewListByProducerNo(dataParams);
        //console.log(data);
        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return
        }

        this.setState({
            data: data,
            totalListCnt: data.length,
            columnDefs: this.getColumnDefs()
        })

        //ag-grid api
        if(this.gridApi){
            //ag-grid 레이지로딩중 감추기
            this.gridApi.hideOverlay();

            //ag-grid 높이 리셋 및 렌더링
            // Following line dymanic set height to row on content
            this.gridApi.resetRowHeights();
        }
    }

    setFilter = async() => {
        const filterItems = Object.assign({}, this.state.filterItems);
        let starsItems = [10, 8, 6, 4, 2];
        filterItems.starsItems = starsItems;
        this.setState({
            filterItems: filterItems
        })
    }

    //검색 버튼
    onFilterSearchClick = async () => {
        // filter값 적용해서 검색하기
        await this.search();
    }

    // 초기화 버튼
    onInitClick= () => {
        const filter = Object.assign({}, this.state.searchFilter)
        filter.stars = [];
        this.setState({
            searchFilter: filter
        },()=>{
            this.search();
        });
    }

    onStarChecked = (e) => {
        const filter = Object.assign({}, this.state.searchFilter)

        if(e.target.value === 'all') {
            if(e.target.checked) {
                // 전체선택이기에 별의 모든 체크 지우기
                filter.stars = [2, 4, 6, 8, 10];
                filter.startAll = true;
            } else {
                filter.stars = [];
                filter.startAll = false;
            }

        } else {
            filter.startAll = false;
            const index = filter.stars.indexOf(parseInt(e.target.value));
            if(index < 0) {
                filter.stars.push(parseInt(e.target.value));
            } else {
                filter.stars.splice(index, 1)
            }
        }

        this.setState({
            searchFilter: filter
        })
    }
    copy = ({value}) => {
        ComUtil.copyTextToClipboard(value, '', '');
    }

    onDatesChange = async (data) => {
        await this.setState({
            search: {
                startDate: data.startDate,
                endDate: data.endDate,
                selectedGubun: data.gubun
            }
        });
    }

    render() {
        const state = this.state
        return(
            <Fragment>
                <FormGroup>
                    <div className='border p-3'>
                        <div className='pt-1 pb-1'>
                            <div className='pb-3 d-flex'>
                                <Div>
                                    {/*<Flex>*/}
                                    <SearchDates
                                        isHiddenAll={true}
                                        isCurrenYeartHidden={true}
                                        gubun={this.state.search.selectedGubun}
                                        startDate={this.state.search.startDate}
                                        endDate={this.state.search.endDate}
                                        onChange={this.onDatesChange}
                                    />
                                    {/*<Button className="ml-3" color="primary" onClick={() => this.search(true)}> 검 색 </Button>*/}
                                    {/*</Flex>*/}
                                </Div>
                            </div>
                            <hr className='p-0 m-0' />
                            <div className='pt-3 d-flex'>
                                <div className='d-flex align-items-center'>
                                    <div className='textBoldLarge' fontSize={'small'}> 평점 </div>
                                    <div className='d-flex'>
                                        <div className='d-flex align-items-center ml-3'>
                                            <input type="checkbox" id='checkAll' name="checkAll" className='mr-2' checked={state.searchFilter.startAll} value="all" onChange={this.onStarChecked} />
                                            <label for='checkAll' className='m-0'>전체 </label>
                                        </div>

                                        {
                                            state.filterItems.starsItems.map(item =>
                                                <div key={'star'+item} className='d-flex align-items-center ml-4 mr-2'>
                                                    <input type="checkbox" id={'check'+item} name={item} className='mr-2' checked={state.searchFilter.stars.includes(item)} value={item} onChange={this.onStarChecked} />
                                                    <label for={'check'+item} className='m-0'><IconStarGroup score={item}/>  </label>
                                                </div>
                                            )
                                        }

                                    </div>
                                </div>
                                <div className='ml-auto d-flex'>
                                    <Button color={'info'} size={'sm'} onClick={this.onFilterSearchClick}>
                                        <span fontSize={'small'}>검색</span>
                                    </Button>

                                    <Button color={'secondary'} size={'sm'} className='ml-2' onClick={this.onInitClick}>
                                        <span fontSize={'small'}>초기화 </span>
                                    </Button>

                                </div>
                            </div>
                        </div>
                    </div>
                </FormGroup>

                <FilterContainer gridApi={this.gridApi} columnApi={this.columnApi} excelFileName={'상품후기 목록'}>
                    <FilterGroup>
                        <InputFilter
                            gridApi={this.gridApi}
                            columns={[
                                {field: 'orderSeq', name: '주문번호', width: 80},
                                {field: 'goodsNo', name: '상품번호', width: 80},
                                {field: 'goodsNm', name: '상품명'},
                                {field: 'goodsReviewContent', name: '후기내용'},
                                {field: 'consumerName', name: '작성자'},
                                {field: 'goodsReviewScoreRenderer', name: '평점'},
                            ]}
                            isRealTime={true}
                        />
                    </FilterGroup>
                    <Hr/>
                    <FilterGroup>
                        <CheckboxFilter
                            gridApi={this.gridApi}
                            field={'score'}
                            name={'평점'}
                            data={[
                                {value: 2, name: '2점'},
                                {value: 4, name: '4점'},
                                {value: 6, name: '6점'},
                                {value: 8, name: '8점'},
                                {value: 10, name: '10점'},
                            ]}
                        />
                    </FilterGroup>
                </FilterContainer>


                <div className="d-flex p-1">
                    <div className="">
                        총 {this.state.totalListCnt} 개
                    </div>

                </div>
                <div
                    id="myGrid"
                    style={{
                        height: "calc(100vh - 180px)"
                    }}
                    className='ag-theme-balham'
                >
                    <AgGridReact
                        columnDefs={this.state.columnDefs}  //컬럼 세팅
                        defaultColDef={this.state.defaultColDef}
                        rowSelection={this.state.rowSelection}  //멀티체크 가능 여부
                        getRowHeight={this.getRowHeight}
                        overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                        overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                        onGridReady={this.onGridReady.bind(this)}   //그리드 init(최초한번실행)
                        rowData={this.state.data}
                        components={this.state.components}  //custom renderer 지정, 물론 정해져있는 api도 있음
                        frameworkComponents={this.state.frameworkComponents}
                        suppressMovableColumns={true} //헤더고정시키
                        onFilterChanged={this.onGridFilterChanged.bind(this)} //필터온체인지 이벤트
                        onCellDoubleClicked={this.copy}
                    >
                    </AgGridReact>
                </div>

                <Modal isOpen={this.state.zoomModalOpen} centered>
                    <ModalBody>
                        <img src={this.state.modalImageUrl} className='w-100' alt={'상품후기 사진'} />
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.onCloseModal}>확인</Button>
                    </ModalFooter>
                </Modal>

            </Fragment>
        );
    }
}