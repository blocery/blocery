import React, {useEffect} from 'react';
import FeedList from "~/components/shop/home_bef/lounge/FeedList";
import Footer from '~/components/common/footer'
import TG from '~/components/common/tg/TG'
import ComUtil from '~/util/ComUtil'
import {Div, Divider} from "~/styledComponents/shared";

const Lounge = (props) => {

    useEffect(() => {
        if (ComUtil.isIeBrowser()) {
            alert('Internet Explorer는 지원하지 않습니다. Chrome 혹은 Edge브라우저를 이용해 주세요')
        }
    }, [])

    return (
        <div>
            <Divider />
            <FeedList />
            <Footer/>
            {/*{WIDERPLANET SCRIPT START 2022.06.07}*/}
            <TG ty={"Home"} />
            {/*{WIDERPLANET SCRIPT END 2022.06.07}*/}
        </div>
    );
};
export default Lounge;
