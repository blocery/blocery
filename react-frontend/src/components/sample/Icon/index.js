import React from 'react';
import {Div, GridColumns} from "~/styledComponents/shared";
// import {IconBackArrow} from '~/components/common/icons'

import {RiInformationLine, RiCoupon3Line, RiDownloadLine, RiChatQuoteLine, RiKakaoTalkFill, RiSearchLine}
from 'react-icons/ri'

import {FaImages, FaSpinner, FaStar, FaUserAltSlash, FaCertificate, FaComments, FaCheck, FaBackspace, FaRandom, FaGift, FaSmile, FaStamp, FaMedal, FaMobileAlt, FaRegSmileBeam, FaCheckCircle, FaClock, FaBolt, FaCoins, FaShoppingCart, FaBoxOpen}
from 'react-icons/fa'

import {BsCaretDownFill, BsCaretUpFill, BsChat, BsList, BsCheckCircle, BsBookmark, BsBookmarkFill, BsPerson, BsPencilSquare}
from 'react-icons/bs'

import {FiBox, FiCheckCircle, FiShoppingCart, FiSettings}
from 'react-icons/fi'

import {AiOutlineInfo, AiOutlineSafetyCertificate, AiOutlineInfoCircle, AiOutlinePlus, AiOutlineMinus, AiFillClockCircle, AiFillCloseSquare, AiOutlineGift}
from 'react-icons/ai'

import { GoCheck }
from "react-icons/go"

import {ImAngry, ImQuotesLeft, ImQuotesRight}
from 'react-icons/im'

import {IoMdRefresh, IoMdHeart, IoMdHeartEmpty, IoIosArrowUp, IoIosArrowDown, IoIosArrowForward, IoIosArrowBack, IoIosArrowRoundForward, IoMdCloseCircle}
from 'react-icons/io'

import {IoDiceSharp, IoChatbubble, IoEllipse}
from 'react-icons/io5'

import {MdClose}
from "react-icons/md"

import {GiCheckMark, GiPartyFlags}
from 'react-icons/gi'

import {HiHashtag} from 'react-icons/hi'

const Content = ({children}) => <GridColumns repeat={repeat} colGap={10} rowGap={10} mt={20} p={10} bc={'light'}>{children}</GridColumns>

const Item = ({icon, name}) =>
    <Div textAlign={'center'}>
        <Div>{icon}</Div>
        <Div fg={'dark'}>{name}</Div>
    </Div>

const repeat = 6

const Icon = (props) => {
    return (
        <Div p={16}>
            <h5>샵블리(shop)에서 사용중인 react-icons</h5>
            <small>쇼핑몰 아이콘만 해당되며, 신규 아이콘 사용시 이 페이지에 꼭 등록 이후 사용 해 주세요!!</small>

            {/* ri */}
            <Content>
                <Item icon={<RiInformationLine />} name={'RiInformationLine'} />
                <Item icon={<RiCoupon3Line />} name={'RiCoupon3Line'} />
                <Item icon={<RiDownloadLine />} name={'RiDownloadLine'} />
                <Item icon={<RiChatQuoteLine />} name={'RiChatQuoteLine'} />
                <Item icon={<RiKakaoTalkFill />} name={'RiKakaoTalkFill'} />
                <Item icon={<RiSearchLine />} name={'RiSearchLine'} />
            </Content>
            <Content>
                {/* fa */}
                <Item icon={<FaImages />} name={'FaImages'} />
                <Item icon={<FaSpinner />} name={'FaSpinner'} />
                <Item icon={<FaStar />} name={'FaStar'} />
                <Item icon={<FaUserAltSlash />} name={'FaUserAltSlash'} />
                <Item icon={<FaCertificate />} name={'FaCertificate'} />
                <Item icon={<FaComments />} name={'FaComments'} />
                <Item icon={<FaCheck />} name={'FaCheck'} />
                <Item icon={<FaBackspace />} name={'FaBackspace'} />
                <Item icon={<FaRandom />} name={'FaRandom'} />
                <Item icon={<FaGift />} name={'FaGift'} />
                <Item icon={<FaSmile />} name={'FaSmile'} />
                <Item icon={<FaStamp />} name={'FaStamp'} />
                <Item icon={<FaMedal />} name={'FaMedal'} />
                <Item icon={<FaMobileAlt />} name={'FaMobileAlt'} />
                <Item icon={<FaRegSmileBeam />} name={'FaRegSmileBeam'} />
                <Item icon={<FaCheckCircle />} name={'FaCheckCircle'} />
                <Item icon={<FaClock />} name={'FaClock'} />
                <Item icon={<FaBolt />} name={'FaBolt'} />
                <Item icon={<FaCoins />} name={'FaCoins'} />
                <Item icon={<FaShoppingCart />} name={'FaShoppingCart'} />
                <Item icon={<FaBoxOpen />} name={'FaBoxOpen'} />
            </Content>
            <Content>
                {/* bs */}
                <Item icon={<BsCaretDownFill />} name={'BsCaretDownFill'} />
                <Item icon={<BsCaretUpFill />} name={'BsCaretUpFill'} />
                <Item icon={<BsChat />} name={'BsChat'} />
                <Item icon={<BsList />} name={'BsList'} />
                <Item icon={<BsCheckCircle />} name={'BsCheckCircle'} />
                <Item icon={<BsPerson />} name={'BsPerson'} />
                <Item icon={<BsBookmark />} name={'BsBookmark'} />
                <Item icon={<BsBookmarkFill />} name={'BsBookmarkFill'} />
                <Item icon={<BsPencilSquare />} name={'BsPencilSquare'} />
            </Content>
            <Content>
                {/* fi */}
                <Item icon={<FiBox />} name={'FiBox'} />
                <Item icon={<FiCheckCircle />} name={'FiCheckCircle'} />
                <Item icon={<FiShoppingCart />} name={'FiShoppingCart'} />
                <Item icon={<FiSettings />} name={'FiSettings'} />
            </Content>
            <Content>
                {/* ai */}
                <Item icon={<AiOutlineInfo />} name={'AiOutlineInfo'} />
                <Item icon={<AiOutlineSafetyCertificate />} name={'AiOutlineSafetyCertificate'} />
                <Item icon={<AiOutlineInfoCircle />} name={'AiOutlineInfoCircle'} />
                <Item icon={<AiOutlinePlus />} name={'AiOutlinePlus'} />
                <Item icon={<AiOutlineMinus />} name={'AiOutlineMinus'} />
                <Item icon={<AiFillClockCircle />} name={'AiFillClockCircle'} />
                <Item icon={<AiFillCloseSquare />} name={'AiFillCloseSquare'} />
                <Item icon={<AiOutlineGift />} name={'AiOutlineGift'} />
            </Content>

            <Content>
                {/* go */}
                <Item icon={<GoCheck />} name={'GoCheck'} />
            </Content>
            <Content>
                {/* im */}
                <Item icon={<ImAngry />} name={'ImAngry'} />
                <Item icon={<ImQuotesLeft />} name={'ImQuotesLeft'} />
                <Item icon={<ImQuotesRight />} name={'ImQuotesRight'} />
            </Content>
            <Content>
                {/* io */}
                <Item icon={<IoMdRefresh />} name={'IoMdRefresh'} />
                <Item icon={<IoMdHeart />} name={'IoMdHeart'} />
                <Item icon={<IoMdHeartEmpty />} name={'IoMdHeartEmpty'} />
                <Item icon={<IoIosArrowUp />} name={'IoIosArrowUp'} />
                <Item icon={<IoIosArrowDown />} name={'IoIosArrowDown'} />
                <Item icon={<IoIosArrowForward />} name={'IoIosArrowForward'} />
                <Item icon={<IoIosArrowBack />} name={'IoIosArrowBack'} />
                <Item icon={<IoIosArrowRoundForward />} name={'IoIosArrowRoundForward'} />
                <Item icon={<IoMdCloseCircle />} name={'IoMdCloseCircle'} />

            </Content>
            <Content>
                {/* io5 */}
                <Item icon={<IoDiceSharp />} name={'IoDiceSharp'} />
                <Item icon={<IoChatbubble />} name={'IoChatbubble'} />
                <Item icon={<IoEllipse />} name={'IoEllipse'} />
            </Content>
            <Content>
                {/* md */}
                <Item icon={<MdClose />} name={'MdClose'} />
            </Content>

            <Content>
                {/* gi */}
                <Item icon={<GiCheckMark />} name={'GiCheckMark'} />
                <Item icon={<GiPartyFlags />} name={'GiPartyFlags'} />
            </Content>

            <Content>
                {/* hi */}
                <Item icon={<HiHashtag />} name={'HiHashtag'} />
            </Content>




        </Div>
    );
};


export default Icon;
