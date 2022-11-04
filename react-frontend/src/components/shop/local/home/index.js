import React, {useState, useEffect} from 'react';
import {Div, Hr, Img, Link, Space, Span} from "~/styledComponents/shared";
import HomeNavigation from "~/components/common/navs/HomeNavigation";
import LocalStoreCard from "~/components/shop/local/home/LocalStoreCard";
import {Ul} from "~/styledComponents/shared/Layouts";
import loadable from "@loadable/component";
import LocalAddressCard from "~/components/shop/local/components/LocalAddressCard";
import Number from '~/components/common/reactSpring/Number'
import {getAllLocalfoodFarmerCount} from '~/lib/shopApi'
import {color} from "~/styledComponents/Properties";
import {getValue} from "~/styledComponents/Util";
// import LocalDeliveryInfo from "~/images/background/localDeliveryInfo.jpg";
import styled from 'styled-components'
import ShopBlyLayouts from "~/styledComponents/ShopBlyLayouts";
import StoreSelectionToggle from "~/components/common/storeSelectionToggle";
import ComUtil from "~/util/ComUtil";
import AboutLocalfood from '~/images/banner/aboutLocalfood.jpg'
const OpenBeta = styled.div`
      font-size: 12px;
      position: absolute;
      bottom: 100%;
      left: 100%;
      background: ${color.danger};
      color: white;
      padding: 8px 12px;
      font-weight: bold;
      border-radius: 4px;
      transform: rotate(-15deg);
      transform-origin: left bottom;
     box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset;
     width: max-content; 
    
    &::after {
      content: "";
      position: absolute;
      top: 4px;
      right: 4px;
      display: block-inline;
      width: 3px;
      height: 3px;
      background-color: white;
      border-radius: 50%;
    }
    &::before {
      content: "";
      position: absolute;
      top: 4px;
      left: 4px;
      display: block-inline;
      width: 3px;
      height: 3px;
      background-color: white;
      border-radius: 50%;
    }    
`

//로컬푸드 매장 목록.
const LOCALFOOD_STORE = [
    {disabled:false, //farmName:'옥천살림협동조합',
        producerNo:157},
    //옥천 가오픈 용도 (위에꺼 코멘트 하고 아래꺼로 배포)
    // {disabled:true, farmName:'옥천살림협동조합', producerNo:'', shopAddress:'충북 옥천군 옥천읍 금장로 82', shopAddressDetail: '', shopMainItems: '신선야채류, 가공품류', shopIntroduce: '', profileBackgroundImages: [{
    //         imageNm: "옥천.jpeg",
    //         imageNo: 0,
    //         imageThumbUrl: null,
    //         imageUrl: "2022/06/5mDw4aYPFrf9.jpeg",
    //         imageUrlPath: ""
    //     }], tags:['옥천로컬푸드 직매장', '옥천/대전 배송']},

    {disabled:true, farmName:'완주로컬푸드',      producerNo:'', shopAddress:'전라북도 완주군 구이면 모악산길 95 완주로컬푸드', shopMainItems:'딸기, 블랙베리, 곶감',shopIntroduce:'농업과 밥상을 살리는 로컬푸드 1번지, 완주로컬푸드',
        shopAddressDetail: '',
        // profileImages: [{
        //     imageNm: "완주.png",
        //     imageNo: 0,
        //     imageThumbUrl: null,
        //     imageUrl: "2022/05/ffXsBCq5VtPn.png",
        //     imageUrlPath: ""
        // }],
        profileBackgroundImages: [
            {
                imageNm: "완주.png",
                imageNo: 0,
                imageThumbUrl: null,
                imageUrl: "2022/05/ffXsBCq5VtPn.png",
                imageUrlPath: ""
            }
        ],
        tags: ['완주로컬푸드', '국산의힘']
    },
    {disabled:true, farmName:'파주 해스밀래 로컬푸드',  producerNo:'', shopAddress:'경기 파주시 탄현면 성동리 678', shopMainItems:'장단콩 즉석두부, 장단콩 즉석순두부, 해스밀래누룽지, 해스밀래베이커리, 파주쌀', shopIntroduce:'농업-가공-서비스가 한데 어우러진 6차산업의 농촌 융복합단지',
        shopAddressDetail: '',
        // profileImages: [{
        //     imageNm: "화성.png",
        //     imageNo: 0,
        //     imageThumbUrl: null,
        //     imageUrl: "2022/05/BpUDt9HwhvMC.png",
        //     imageUrlPath: ""
        // }],
        profileBackgroundImages: [
            {
                imageNm: "파주해스밀래.jpg",
                imageNo: 0,
                imageThumbUrl: null,
                imageUrl: "2022/10/kRcNYVsPXSPk.jpg",
                imageUrlPath: ""
            }
        ],
        tags: ['파주로컬푸드', '해스밀래', '장단콩']
    },
]

const Banner = loadable(() => import('~/components/shop/store/banner'))


const Local = () => {

    const [farmerCount, setFarmerCount] = useState(null)

    useEffect(() => {
        async function fetchAll() {
            const {data} = await getAllLocalfoodFarmerCount()
            setFarmerCount(data)
        }

        fetchAll()
    }, []);


    return (
        <div>
            {/*<HomeNavigation homeUrl={'/'} hideLine={false}></HomeNavigation>*/}

            <Banner localfoodBanner />

            <Link to={'/event?no=87'} mt={10}>
                <Img src={AboutLocalfood} alt={'로컬푸드 더 알아보기'}/>
            </Link>

            <LocalAddressCard style={{mt: 10, mb: 70}} readOnly={true}/>

            <Div fontSize={24} px={16} mb={25}>
                <b>
                    <Span relative>
                        {/*<OpenBeta>GRAND OPEN</OpenBeta>*/}
                        지금,
                    </Span>
                {` 샵블리에서는 `}
                {
                    farmerCount !== null && <span style={{color: color.green}}><Number value={farmerCount}/>명의 로컬푸드 농가</span>
                }
                와 함께하고 있습니다.
                </b>
            </Div>

            {/*<Div px={16} mb={45}>*/}
            {/*    <img style={{width: '100%', borderRadius: getValue(8)}} src={LocalDeliveryInfo} alt={'로컬푸드 상품 배송안내'}/>*/}
            {/*    <ShopBlyLayouts.Alert mt={16}>*/}
            {/*        매장 재고 부족시 상품이 부분취소될 수 있습니다.*/}
            {/*    </ShopBlyLayouts.Alert>*/}
            {/*</Div>*/}

            {/*<Div mb={50}>*/}
            {/*    <Banner localfoodBanner/>*/}
            {/*</Div>*/}

            <div>
                {/*<Div fontSize={24} mb={29} px={16}><strong>로컬푸드</strong></Div>*/}


                {
                    //매장카드 ////////////
                    LOCALFOOD_STORE.map( store =>
                        <LocalStoreCard
                            store={store}
                        />
                    )}


            </div>



            <Div bg={'veryLight'} mt={20} py={20} px={16} fontSize={14} >
                <Ul>
                    <li>본 로컬 서비스는 고객님의 배송지 주소를 기반으로 운영이 됩니다.</li>
                    <li>현재 로컬푸드 상품은 해당 로컬푸드 인근 지역만 배송을 지원합니다.</li>
                    <li style={{listStyle: 'none'}}> (추후 전국 빠른배송으로 확대할 예정입니다.)</li>
                </Ul>
            </Div>
        </div>
    );
};

export default Local;
