import axios from 'axios'
import axiosSecure from "~/lib/axiosSecure";
import { Server } from "../components/Properties";

// 적립예정 포인트내역 조회
export const getMyTodayReservedPoint = (signal) => axios(Server.getRestAPIHost() + '/point/getMyTodayReservedPoint', { method: "get", withCredentials: true, credentials: 'same-origin', signal })

// 적립완료 포인트 내역 조회
export const getMyPointList = ({isPaging = false, limit = 5, page = 1}) => axios(Server.getRestAPIHost() + '/point/getMyPointList', { method: "get", params: {isPaging, limit, page}, withCredentials: true, credentials: 'same-origin' })

// 전환완료 포인트 내역 조회
export const getMyPointBlyHistory = () => axios(Server.getRestAPIHost() + '/point/getMyPointBlyHistory', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 포인트 블리 변환
export const exchangePointToBly = (point) => axios(Server.getRestAPIHost() + '/point/exchangePointToBly', { method: "post", params: {point:point}, withCredentials: true, credentials: 'same-origin' })

// 포인트 쿠폰 변환(블록체인미사용자용, 드물게 사용)
export const exchangePointToCoupon = (point) => axios(Server.getRestAPIHost() + '/point/exchangePointToCoupon', { method: "post", params: {point:point}, withCredentials: true, credentials: 'same-origin' })

// 3년간 구매금액 총 합계
export const getTotalOrderPrice3Year = () => axios(Server.getRestAPIHost() + '/getTotalOrderPrice3Year', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 다음등급까지 필요한 점수 
export const getLackNextLevelScore = () => axios(Server.getRestAPIHost() + '/point/getLackNextLevelScore', { method: "get", withCredentials: true, credentials: 'same-origin' })
