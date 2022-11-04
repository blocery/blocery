import React from 'react';
import BasicNavigation from "~/components/common/navs/BasicNavigation";
import {MarketBlyMainLogo} from "~/components/common/logo";
import CartLinkButton from "~/components/common/buttons/CartLinkButton";
import {Flex, GridColumns, Link, Space} from "~/styledComponents/shared";
import SearchButton from "~/components/common/buttons/SearchButton";
import NotificationButton from "~/components/common/buttons/NotificationLinkButton";
import ZzimLinkButton from "~/components/common/buttons/ZzimLinkButton";
import StarredProducerGoodsLinkButton from "~/components/common/buttons/StarredProducerGoodsLinkButton";
import {getValue} from "~/styledComponents/Util";
// import StoreSelectionToggle from "~/components/common/storeSelectionToggle";
const RightContent = ({history}) => {
    return(
       <GridColumns colGap={0} rowGap={0} repeat={2} pr={10}
                    height={'100%'}
                    custom={`
        & > div {
            width: ${getValue(50)};
            height: 100%;
        }
       `}>
           {/*<SearchButton />*/}
           <NotificationButton/>
           {/* 찜하기 상품 링크 */}
           <ZzimLinkButton />
           {/* 단골상품 링크 */}
           {/*<StarredProducerGoodsLinkButton />*/}
       </GridColumns>
    )
}

const HomeNavigation = ({children, homeUrl = '/', hideLine = true}) => {
    return (
        <BasicNavigation
            hideLine={hideLine}
            leftContent={<Link to={homeUrl} ml={16}><MarketBlyMainLogo  /></Link>}
            rightContent={<RightContent />}
        >
            {children}
        </BasicNavigation>
    );
};

export default HomeNavigation;
