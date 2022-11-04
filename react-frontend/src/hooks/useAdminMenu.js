import React, {useState} from 'react';
import PropTypes from 'prop-types';
import ComUtil from "~/util/ComUtil";
import {smUrl} from "~/router/AdminContainer";
import {useRecoilState} from "recoil";
import {adminFavoriteMenuListState} from "~/recoilState";

const useAdminMenu = (props) => {
    const [adminFavoriteMenuList, setAdminFavoriteMenuList] = useRecoilState(adminFavoriteMenuListState)

    const initFavoriteMenu = () => {
        const adminFavoriteMenuList = ComUtil.getLocalStorage("adminFavoriteMenuList", [])
        console.log({adminFavoriteMenuList: adminFavoriteMenuList})
        localStorage.setItem("adminFavoriteMenuList", JSON.stringify(adminFavoriteMenuList))
        setAdminFavoriteMenuList(adminFavoriteMenuList)
    }

    const clearAll = () => {
        setAdminFavoriteMenuList([])
        localStorage.setItem('adminFavoriteMenuList', JSON.stringify([]))
    }

    //추가시 url, name 필수
    //삭제시 url 필수
    const addFavoriteMenu = (url, name) => {
        //원본 쿠키에서 read
        const lsSubMenuList = ComUtil.getLocalStorage('adminFavoriteMenuList', [])

        // const url = smUrl(subMenu)

        const foundSubMenuIndex = lsSubMenuList.findIndex(item => item.url === url)

        //있으면 제거
        if (foundSubMenuIndex > -1) {
            lsSubMenuList.splice(foundSubMenuIndex, 1)
        }else{
            //없으면 추가
            lsSubMenuList.push({url: url, name: name})
        }

        //쿠키반영
        localStorage.setItem('adminFavoriteMenuList', JSON.stringify(lsSubMenuList))

        //리코일 반영
        setAdminFavoriteMenuList(lsSubMenuList)

        console.log({lsSubMenuList: lsSubMenuList})
    }

    const removeFavoriteMenuByUrl = () => {

    }

    const isFavoriteMenu = (subMenu) => {
        const url = smUrl(subMenu)
        const foundSubMenuIndex = adminFavoriteMenuList.findIndex(item => item.url === url)
        if (foundSubMenuIndex > -1)
            return true;

        return false;
    }

    return {initFavoriteMenu, adminFavoriteMenuList, addFavoriteMenu, isFavoriteMenu, clearAll}
};
export default useAdminMenu;
