import React from "react";
import {Div} from "~/styledComponents/shared";

//기본
const TEMPLATE_TEYP_BASIC = 'BASIC'
//돼지
const TEMPLATE_TEYP_AHP = 'AHP'
//소
const TEMPLATE_TEYP_AHC = 'AHC'

/**
 * SummerNoteEditor.css 의 [커스텀 템플릿 class] 참조
 * (bootstrap v4 클래스와 적절히 섞어 사용 함)
 * 아래 codepen 에서 테스트 가능
 * https://codepen.io/ksmark8543/pen/LYeorXJ?editors=1100
 **/

const BASIC_TEMPLATE_CONTENT =
    `
            <div class="note-custom-template-container">
                <img src="/templateImages/shopblySuggestion.jpg" class="" />
                <img src="https://shopbly.shop/imagesContents/2022/03/Ho0JfJ7eRVzW.png" class="" />
                <section class="note-custom-text-box">
                <div class="note-custom-text-box-title-lg font-weight-bold">어머니의 따뜻한 마음으로 여수 돌산 갓김치 상품명 작성 20px</div>
                <div class="note-custom-text-box-desc">
                  청정의 도시, 여수에서 재배된 깨끗하고 신선한 재료만을 담아서 여러분께 보내드립니다.
                  전라도 김치의 깊고 시원하며, 깔끔한 맛에 빠져보세요. 14px
                </div>
                </section>
                
                <img src="https://shopbly.shop/imagesContents/2022/03/7nWwwC43iyqE.png" class="" />
                
                <section class="note-custom-text-box">
                <div class="note-custom-text-box-title-sm font-weight-bold">
                  돌산에 재배된 갓으로 만든 100% 국내산 갓김치 상품명 작성 15px
                </div>
                <div class="note-custom-text-box-desc">
                  전라남도 여수시 돌산에서 재배된 갓으로 만들었 습니다.
                  매콤하면서도 갓 특유의 톡 쏘는 맛과 향은 식욕을 돋우게 합니다.
                  취향에 따라 생김치의 식감을 살려 바로 드려도 좋고, 냉장 숙성하여 익혀 먹어도 맛있습니다.
                  우리 민족 본연의 맛을 살린 갓김치를 드셔보세요. 14px
                </div>
                </section>
                
                <img src="https://shopbly.shop/imagesContents/2022/03/5vHoWzX5DBBO.png" class="" />
                
                <section class="note-custom-text-box">
                <div class="d-flex">
                  <div class="vertical-line"></div>
                  <div>
                    <div class="note-custom-text-box-title-md font-weight-bold">
                      천사물산을 소개합니다 18px
                    </div>
                    <div class="note-custom-text-box-desc">
                      3대째 내려오는 천사물산은 40년 전통 남도 손맛으로 많은 분들께 사랑받고 있습니다.
                      이 세상 모든 식탁 위에 천사갓김치가 놓이는 그날까지 저희 갓김치 3대는 끊임없이 연구하고 노력하겠습니다.
                      같은 여수 지방이라도 다른 곳과 차별화가 있는 천사갓김치를 믿어주신다면 최선을 다해 고객님 식탁 위까지 맛있는 김치로 보답하겠습니다. 14px
                    </div>
                  </div>
                </div>
                </section>
                
                <div class="note-custom-check-point-title font-weight-bold">샵블리 체크포인트</div>
                <section class="note-custom-text-green-box">
                <li class="note-custom-checkbox">
                  <span>일이삼사오육칠팔구십일이삼사오육칠팔일이삼사오육칠팔구십</span>
                </li>
                <li class="note-custom-checkbox">
                  <span>선물용으로 좋은 깔끔한 패키지</span>
                </li>
                    <li class="note-custom-checkbox">
                  <span>일이삼사오육칠팔구십일이삼사오육칠팔 두줄의 경우 이렇게 쓰여요</span>
                </li>
                </section>
                
                <div class="note-custom-check-point-title font-weight-bold">크기 비교</div>
                <img src="https://shopbly.shop/imagesContents/2022/03/7nWwwC43iyqE.png" class="" />
                <div class="note-custom-check-point-title font-weight-bold">이렇게 포장됩니다</div>
                <img src="https://shopbly.shop/imagesContents/2022/03/7nWwwC43iyqE.png" class="" />
                <div class="note-custom-pack-small-text">
                포장방법은 업체 사정에 따라 달라질 수 있습니다.
                </div>
            </div>
        `

const AHP_TEMPLATE_CONTENT =
    `
            <div class="note-custom-template-container">
                <img src="/templateImages/shopblySuggestion.jpg" class="" />
                <img src="https://shopbly.shop/imagesContents/2022/03/Ho0JfJ7eRVzW.png" class="" />
                <section class="note-custom-text-box">
                <div class="note-custom-text-box-title-lg font-weight-bold">어머니의 따뜻한 마음으로 여수 돌산 갓김치 상품명 작성 20px</div>
                <div class="note-custom-text-box-desc">
                  청정의 도시, 여수에서 재배된 깨끗하고 신선한 재료만을 담아서 여러분께 보내드립니다.
                  전라도 김치의 깊고 시원하며, 깔끔한 맛에 빠져보세요. 14px
                </div>
                </section>
                
                <img src="https://shopbly.shop/imagesContents/2022/03/7nWwwC43iyqE.png" class="" />
                
                <section class="note-custom-text-box">
                <div class="note-custom-text-box-title-sm font-weight-bold">
                  돌산에 재배된 갓으로 만든 100% 국내산 갓김치 상품명 작성 15px
                </div>
                <div class="note-custom-text-box-desc">
                  전라남도 여수시 돌산에서 재배된 갓으로 만들었 습니다.
                  매콤하면서도 갓 특유의 톡 쏘는 맛과 향은 식욕을 돋우게 합니다.
                  취향에 따라 생김치의 식감을 살려 바로 드려도 좋고, 냉장 숙성하여 익혀 먹어도 맛있습니다.
                  우리 민족 본연의 맛을 살린 갓김치를 드셔보세요. 14px
                </div>
                </section>
                
                <img src="https://shopbly.shop/imagesContents/2022/03/5vHoWzX5DBBO.png" class="" />
                
                <section class="note-custom-text-box">
                <div class="d-flex">
                  <div class="vertical-line"></div>
                  <div>
                    <div class="note-custom-text-box-title-md font-weight-bold">
                      천사물산을 소개합니다 18px
                    </div>
                    <div class="note-custom-text-box-desc">
                      3대째 내려오는 천사물산은 40년 전통 남도 손맛으로 많은 분들께 사랑받고 있습니다.
                      이 세상 모든 식탁 위에 천사갓김치가 놓이는 그날까지 저희 갓김치 3대는 끊임없이 연구하고 노력하겠습니다.
                      같은 여수 지방이라도 다른 곳과 차별화가 있는 천사갓김치를 믿어주신다면 최선을 다해 고객님 식탁 위까지 맛있는 김치로 보답하겠습니다. 14px
                    </div>
                  </div>
                </div>
                </section>
                
                <div class="note-custom-check-point-title font-weight-bold">샵블리 체크포인트</div>
                <section class="note-custom-text-green-box">
                <li class="note-custom-checkbox">
                  <span>일이삼사오육칠팔구십일이삼사오육칠팔일이삼사오육칠팔구십</span>
                </li>
                <li class="note-custom-checkbox">
                  <span>선물용으로 좋은 깔끔한 패키지</span>
                </li>
                    <li class="note-custom-checkbox">
                  <span>일이삼사오육칠팔구십일이삼사오육칠팔 두줄의 경우 이렇게 쓰여요</span>
                </li>
                </section>
                
                <div class="note-custom-check-point-title font-weight-bold">크기 비교</div>
                <img src="https://shopbly.shop/imagesContents/2022/03/7nWwwC43iyqE.png" class="" />
                <div class="note-custom-check-point-title font-weight-bold">이렇게 포장됩니다</div>
                <img src="https://shopbly.shop/imagesContents/2022/03/7nWwwC43iyqE.png" class="" />
                <div class="note-custom-pack-small-text">
                포장방법은 업체 사정에 따라 달라질 수 있습니다.
                </div>
                
                <div class="note-custom-check-point-title font-weight-bold">요리별 쓰면 좋은 부위</div>
                <img src="/templateImages/pork.jpg" class="" />
            </div>
        `

const AHC_TEMPLATE_CONTENT =
    `
            <div class="note-custom-template-container">
                <img src="/templateImages/shopblySuggestion.jpg" class="" />
                <img src="https://shopbly.shop/imagesContents/2022/03/Ho0JfJ7eRVzW.png" class="" />
                <section class="note-custom-text-box">
                <div class="note-custom-text-box-title-lg font-weight-bold">어머니의 따뜻한 마음으로 여수 돌산 갓김치 상품명 작성 20px</div>
                <div class="note-custom-text-box-desc">
                  청정의 도시, 여수에서 재배된 깨끗하고 신선한 재료만을 담아서 여러분께 보내드립니다.
                  전라도 김치의 깊고 시원하며, 깔끔한 맛에 빠져보세요. 14px
                </div>
                </section>
                
                <img src="https://shopbly.shop/imagesContents/2022/03/7nWwwC43iyqE.png" class="" />
                
                <section class="note-custom-text-box">
                <div class="note-custom-text-box-title-sm font-weight-bold">
                  돌산에 재배된 갓으로 만든 100% 국내산 갓김치 상품명 작성 15px
                </div>
                <div class="note-custom-text-box-desc">
                  전라남도 여수시 돌산에서 재배된 갓으로 만들었 습니다.
                  매콤하면서도 갓 특유의 톡 쏘는 맛과 향은 식욕을 돋우게 합니다.
                  취향에 따라 생김치의 식감을 살려 바로 드려도 좋고, 냉장 숙성하여 익혀 먹어도 맛있습니다.
                  우리 민족 본연의 맛을 살린 갓김치를 드셔보세요. 14px
                </div>
                </section>
                
                <img src="https://shopbly.shop/imagesContents/2022/03/5vHoWzX5DBBO.png" class="" />
                
                <section class="note-custom-text-box">
                <div class="d-flex">
                  <div class="vertical-line"></div>
                  <div>
                    <div class="note-custom-text-box-title-md font-weight-bold">
                      천사물산을 소개합니다 18px
                    </div>
                    <div class="note-custom-text-box-desc">
                      3대째 내려오는 천사물산은 40년 전통 남도 손맛으로 많은 분들께 사랑받고 있습니다.
                      이 세상 모든 식탁 위에 천사갓김치가 놓이는 그날까지 저희 갓김치 3대는 끊임없이 연구하고 노력하겠습니다.
                      같은 여수 지방이라도 다른 곳과 차별화가 있는 천사갓김치를 믿어주신다면 최선을 다해 고객님 식탁 위까지 맛있는 김치로 보답하겠습니다. 14px
                    </div>
                  </div>
                </div>
                </section>
                
                <div class="note-custom-check-point-title font-weight-bold">샵블리 체크포인트</div>
                <section class="note-custom-text-green-box">
                <li class="note-custom-checkbox">
                  <span>일이삼사오육칠팔구십일이삼사오육칠팔일이삼사오육칠팔구십</span>
                </li>
                <li class="note-custom-checkbox">
                  <span>선물용으로 좋은 깔끔한 패키지</span>
                </li>
                    <li class="note-custom-checkbox">
                  <span>일이삼사오육칠팔구십일이삼사오육칠팔 두줄의 경우 이렇게 쓰여요</span>
                </li>
                </section>
                
                <div class="note-custom-check-point-title font-weight-bold">크기 비교</div>
                <img src="https://shopbly.shop/imagesContents/2022/03/7nWwwC43iyqE.png" class="" />
                <div class="note-custom-check-point-title font-weight-bold">이렇게 포장됩니다</div>
                <img src="https://shopbly.shop/imagesContents/2022/03/7nWwwC43iyqE.png" class="" />
                <div class="note-custom-pack-small-text">
                포장방법은 업체 사정에 따라 달라질 수 있습니다.
                </div>
                
                <div class="note-custom-check-point-title font-weight-bold">요리별 쓰면 좋은 부위</div>
                <img src="/templateImages/beef.jpg" class="" />
            </div>
        `

export default class Template {

    //상품상세 템플릿양식
    static goodsDrlTemplateType(type){
        let returnVal = "";
        if(type === TEMPLATE_TEYP_BASIC){
            returnVal = BASIC_TEMPLATE_CONTENT;
        }else if(type === TEMPLATE_TEYP_AHP){
            returnVal = AHP_TEMPLATE_CONTENT;
        }else if(type === TEMPLATE_TEYP_AHC){
            returnVal = AHC_TEMPLATE_CONTENT;
        }
        return returnVal;
    }

}