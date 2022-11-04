import axios from 'axios'
import axiosCache from "~/lib/axiosCache";
import { Server } from "../components/Properties";

/* DealGoodsHome */
export const getDealGoodsHomeInfo = () => axios(Server.getRestAPIHost() + '/dealGoods/home', { method: "get", withCredentials: true, credentials: 'same-origin'})

export const getCurrentReservedDealGoods = (forceUpdate = true, signal) => axiosCache.get(Server.getRestAPIHost() + '/dealGoods/currentReserved', { withCredentials: true, credentials: 'same-origin', forceUpdate: forceUpdate, cache: true, signal })
export const getCurrentDealGoods = () => axios(Server.getRestAPIHost() + '/dealGoods/current', { method: "get", withCredentials: true, credentials: 'same-origin'})
export const getReservedDealGoods = () => axios(Server.getRestAPIHost() + '/dealGoods/reserved', { method: "get", withCredentials: true, credentials: 'same-origin'})
export const getFinishedDealGoods = (forceUpdate = true, signal) => axiosCache.get(Server.getRestAPIHost() + '/dealGoods/finished', { withCredentials: true, credentials: 'same-origin', forceUpdate, cache: true, signal})

export const getAllDealGoods = () => axios(Server.getRestAPIHost() + '/dealGoods/all', { method: "get", withCredentials: true, credentials: 'same-origin'})


/* DealGoods Detail */


/* Admin */
// export const modifyGoodsStepName = (goodsNo, stepList) => axios(Server.getRestAPIHost() + '/dealGoods/modifyGoodsStepName', { method: "post", params: {goodsNo: goodsNo} , data: stepList, withCredentials: true, credentials: 'same-origin'})
export const modifyExtraReward = (goodsNo, rewardList) => axios(Server.getRestAPIHost() + '/dealGoods/modifyExtraReward', { method: "post", params: {goodsNo: goodsNo} , data: rewardList, withCredentials: true, credentials: 'same-origin'})
export const updateRecommenderRate = (goodsNo, rate) => axios(Server.getRestAPIHost() + '/dealGoods/updateRecommenderRate', { method: "post", params: {goodsNo: goodsNo, dealRecommenderRate: rate} , withCredentials: true, credentials: 'same-origin'})