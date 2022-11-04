import React, { useEffect, useState }  from 'react'
import {CartLink} from '~/components/common'
import { MarketBlyMainLogo } from '~/components/common/logo'
import { IconSearch, IconNotification, IconSearchWhite, IconNotificationWhite, IconShoppingCartWhite } from '~/components/common/icons'
import Css from './B2cHeader.module.scss'
import {Link} from '~/styledComponents/shared'
import { isNewNotifiation } from "~/lib/shopApi";
import {RiSearchLine} from 'react-icons/ri'

import classNames from 'classnames'
const B2cHeader = (props) => {
    const {mypage, category, mdPick, underline} = props
    const [isNewNotification, setIsNewNotification] = useState(false);

    //console.log('B2cHeader mypage', mypage)

    useEffect(() => {
        getNewNotification();
    }, []);

    const getNewNotification = async() => {
        const {data:newNotification} = await isNewNotifiation();
        //console.log("newNotification : ", newNotification);
        setIsNewNotification(newNotification);
    }

    return(

        <div className={classNames(Css.header,  mypage && Css.greenHeader,  underline && Css.underline)}>
            <div>
                {
                    mypage ? <span className={Css.myPage}>마이페이지</span> :
                        category ? <span className={Css.category}>카테고리</span> :
                            mdPick ? <span className={Css.category}>기획전</span> :(
                                <Link to={'/'} className={'text-dark f1'} >
                                    <MarketBlyMainLogo style={{height: 40}} />
                                </Link>
                            )

                }
            </div>
            <div>

                <div>
                    <Link to={'/search'}>
                        {
                            (mypage)?  <IconSearchWhite />
                                :  <IconSearch />
                        }

                    </Link>
                </div>
                <div>
                    <Link to={'/mypage/notificationList'} noti={isNewNotification ? 1 : 0} notiRight={-5}>
                        {
                            (mypage)?  <IconNotificationWhite />
                                :  <IconNotification />
                        }
                    </Link>
                </div>
                <CartLink />
            </div>

        </div>
    )
}
export default B2cHeader

// const B2cHeader = () => (
//     <div
//         className={'d-flex align-items-center bg-white text-dark pt-3 pb-3 pl-3 pr-3 position-relative'}
//         style={{height: '56px'}}
//     >
//         <Link to={'/home/1'}
//               className={'text-dark f1'}
//               >
//             <MarketBlyMainLogo style={{height: 40}} />
//         </Link>
//         <div className={'ml-auto d-flex'}>
//             <CartLink />
//             <IconSearch style={{marginRight: 27}} />
//             <IconNotification />
//         </div>
//     </div>
// )
// export default B2cHeader