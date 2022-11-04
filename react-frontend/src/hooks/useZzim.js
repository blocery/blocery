import React from 'react';
import {useRecoilState} from "recoil";
import {consumerZzimListState} from "~/recoilState";
import {getZzimList, addZzim, deleteZzim} from "~/lib/shopApi";


const useZzim = () => {
    const [zzimList, setZzimList] = useRecoilState(consumerZzimListState)

    const isZzim = (goodsNo) => {
        return zzimList.includes(goodsNo)
    }

    const clear = () => {
        setZzimList([])
    }

    const addOrRemoveZzim = async (goodsNo) => {
        try {
            const index = zzimList.indexOf(goodsNo)

            if (index === -1) {
                const {data} = await addZzim(goodsNo)
                console.log("addZzim goodsNo: " + goodsNo + "data: "+data )

                if (data) {
                    const newZzim = zzimList.concat(goodsNo)
                    setZzimList(newZzim)
                    //todo
                    return true
                }
                //미 로그인
                return null
            }else{
                const {data} = await deleteZzim(goodsNo)
                console.log("deleteZzim goodsNo: " + goodsNo + "data: "+data )

                if (data) {
                    const newZzim = Object.assign([], zzimList)

                    //제거
                    newZzim.splice(index, 1)
                    setZzimList(newZzim)
                    return false
                }
                //미 로그인
                return null
            }
        }catch (error) {
            console.log(error.message)
            reFetch()
        }
        return false
    }

    const reFetch = async () => {
        const {data} = await getZzimList()
        // console.log({zzimList: data})
        if (data){
            setZzimList(data)
        }else{
            setZzimList([])
        }
    }

    return {isZzim, zzimList, addOrRemoveZzim, reFetch, clear}
}
export default useZzim