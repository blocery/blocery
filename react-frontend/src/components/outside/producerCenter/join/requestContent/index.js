import React, {useEffect, useState} from 'react';
import {Div, Flex, GridColumns, Img, WhiteSpace} from '~/styledComponents/shared'
import {getBankInfoList, getProducerTemp} from '~/lib/producerApi'
import {color} from "~/styledComponents/Properties";
import styled from 'styled-components'
import {Spinner} from "reactstrap";
import {getValue} from "~/styledComponents/Util";
import {Required} from "~/styledComponents/ShopBlyLayouts";
import {Server} from "~/components/Properties";
import {TYPE_OF_IMAGE} from "~/lib/bloceryConst";
import ComUtil from "~/util/ComUtil";
import SingleFileUploader from "~/components/common/ImageUploader/SingleFileUploader";

const Container = styled(Div)`
    border-radius: 4px;
    background-color: ${color.white};
    padding: 16px;
    border: 1px solid #dddddd;
`

const Row = styled(Div)`
    margin-top: ${getValue(8)};
`

const Title = styled(Div)`
    font-size: 16px;
    font-weight: bold;    
`

const Label = styled(Div)`
    font-size: 13px;
    color: ${color.dark}
`
const Content = styled(Div)`
    
`

const RequestContent = ({coRegistrationNo, readOnly = false}) => {
    console.log(coRegistrationNo)
    const [state, setState] = useState()
    const [bankList, setBankList] = useState([])

    useEffect(() => {
        async function fetch() {
            await bindBankData()
            await search()
        }

        fetch()
    }, [])

    const search = async () => {
        const {data} = await getProducerTemp(coRegistrationNo);
        console.log(data);
        setState(data)
    }

    //은행 데이터 바인딩 정보
    const bindBankData = async () => {
        const {data: itemsData} = await getBankInfoList();
        const bankList = itemsData.map(item => ({
            value: item.code,
            label: item.name
        }))

        setBankList(bankList)
    }

    if (!state) return <Flex justifyContent={'center'} minHeight={400}><Spinner /></Flex>

    return (
        <GridColumns colGap={16} rowGap={16} bg={'background'} repeat={ComUtil.isPcWeb() ? 2 : 1} p={16}>
            <Container>
                <Title>기본정보</Title>
                <Row>
                    <Label>사업자등록번호<Required/></Label>
                    <Content>{state.coRegistrationNo}</Content>
                </Row>
                <Row>
                    <Label>상호명<Required/></Label>
                    <Content>{state.farmName}</Content>
                </Row>
                <Row>
                    <Label>대표자명<Required/></Label>
                    <Content>{state.name}</Content>
                </Row>
                <Row>
                    <Label>사업장 주소<Required/></Label>
                    <Content>{`${state.shopZipNo ? state.shopZipNo : null} ${state.shopAddress ? state.shopAddress : null} ${state.shopAddressDetail ? state.shopAddressDetail : null}`}</Content>
                </Row>
                <Row>
                    <Label>사업자등록증<Required/></Label>
                    <Content>
                        {
                            readOnly ? state.businessLicenseFile ? state.businessLicenseFile.fileName : '미등록' :
                                <SingleFileUploader name={'businessLicenseFile'} file={state.businessLicenseFile} fileKey={coRegistrationNo} />
                        }
                    </Content>
                </Row>
            </Container>



            <Container>
                <Title>정산계좌 정보</Title>
                <Row>
                    <Label>은행명<Required/></Label>
                    <Content>{bankList.length > 0 ? bankList.find(item => item.value === state.payoutBankCode).label : '없음'}</Content>
                </Row>
                <Row>
                    <Label>은행 계좌번호<Required/></Label>
                    <Content>{state.payoutAccount}</Content>
                </Row>
                <Row>
                    <Label>예금주명<Required/></Label>
                    <Content>{state.payoutAccountName}</Content>
                </Row>
                <Row>
                    <Label>통장사본 이미지<Required/></Label>
                    <Content>
                        {
                            readOnly ? state.bankbookFile ? state.bankbookFile.fileName : '미등록' :
                                <SingleFileUploader name={'bankbookFile'} file={state.bankbookFile} fileKey={coRegistrationNo} />
                        }
                    </Content>
                </Row>
            </Container>

            <Container>
                <Title>판매/운영정보</Title>
                <Row>
                    <Label>고객센터 전화번호<Required/></Label>
                    <Content>{state.shopPhone}</Content>
                </Row>
                <Row>
                    <Label>업종<Required/></Label>
                    <Content>{state.shopBizType}</Content>
                </Row>


                <Row>
                    <Label>통신판매업번호<Required/></Label>
                    <Content>{state.comSaleNumber}</Content>
                </Row>
                <Row>
                    <Label>주요취급상품</Label>
                    <Content>{state.shopMainItems}</Content>
                </Row>
                <Row>
                    <Label>통신판매등록증<Required/></Label>
                    <Content>
                        {
                            readOnly ? state.comSaleFile ? state.comSaleFile.fileName : '미등록' :
                                <SingleFileUploader name={'comSaleFile'} file={state.comSaleFile} fileKey={coRegistrationNo} />
                        }
                    </Content>
                </Row>
            </Container>



            <Container>
                <Title>상품정보</Title>
                <Row>
                    <Label>상품견적서</Label>
                    <Content>
                        {
                            readOnly ?
                                state.estimatedGoodsFile ? state.estimatedGoodsFile.fileName : '미등록' :
                                <SingleFileUploader name={'estimatedGoodsFile'} file={state.estimatedGoodsFile} fileKey={coRegistrationNo} />
                        }
                    </Content>
                </Row>
                <Row>
                    <Label>관련 링크/메모</Label>
                    <Content>{state.goodsMemo}</Content>
                </Row>
            </Container>



            <Container>
                <Title>프로필 정보</Title>
                {/*<Row>*/}
                {/*    <Label>프로필 사진</Label>*/}
                {/*    <Div overflow={'auto'}>*/}
                {/*        {*/}
                {/*            state.profileImages.map(image =>*/}
                {/*                <Img width={60} height={60} style={{marginRight: 10}} src={Server.getThumbnailURL(TYPE_OF_IMAGE.SQUARE)+image.imageUrl} alt={image.imageNm} />*/}
                {/*            )*/}
                {/*        }*/}
                {/*    </Div>*/}
                {/*</Row>*/}
                {/*<Row>*/}
                {/*    <Label>상점 배경사진</Label>*/}
                {/*    <Div overflow={'auto'}>*/}
                {/*        {*/}
                {/*            state.profileBackgroundImages.map(image =>*/}
                {/*                <Img rounded={2} width={60} height={60} style={{marginRight: 10}} src={Server.getThumbnailURL(TYPE_OF_IMAGE.SQUARE)+image.imageUrl} alt={image.imageNm} />*/}
                {/*            )*/}
                {/*        }*/}
                {/*    </Div>*/}
                {/*</Row>*/}
                <Row>
                    <Label>한줄소개(생산자소개)</Label>
                    <WhiteSpace>{state.shopIntroduce}</WhiteSpace>
                </Row>
            </Container>


            <Container>
                <Title>계약담당자</Title>
                <Row>
                    <Label>담당자명<Required/></Label>
                    <Content>{state.charger}</Content>
                </Row>
                <Row>
                    <Label>담당자 휴대폰번호<Required/></Label>
                    <Content>{state.chargerPhone}</Content>
                    <Div fg={'danger'} fontSize={13} mt={8}>관리자 심사 후 카카오톡으로 전송됩니다.</Div>
                </Row>
                <Row>
                    <Label>담당자 이메일</Label>
                    <Content>{state.chargerEmail}</Content>
                </Row>
                <Row>
                    <Label>메모</Label>
                    <Content>{state.memo}</Content>
                </Row>
            </Container>

        </GridColumns>
    );
};

export default RequestContent;
