import axios from 'axios'
import {cacheAdapterEnhancer} from "axios-extensions";
import SecureApi from "~/lib/secureApi";
const axiosSecure = axios.create({
    headers: { "Pragma": "no-cache" },
    xsrfHeaderName:"x-csrf-token",
    withCredentials: true,
    credentials: 'same-origin',
    // cacheAdapterEnhancer 적용. 기본 캐시동작은 해제
    // enabledByDefault:false 모든 네트워크 요청에 대해 캐싱된 데이터를 사용하지 않도록
    adapter: cacheAdapterEnhancer(axios.defaults.adapter, {
        enabledByDefault: false
    })
});
axiosSecure.interceptors.request.use(
    async (config) => {
        //csrf 세팅
        await SecureApi.getCsrf().then(({data})=>{
            const csrfData = data;
            if (csrfData) {
                config.headers['x-csrf-token'] = csrfData;
            }
            return config;
        }).catch(()=>{
            return config;
        });
        return config;
    },
    (err) => {
        return Promise.reject(err);
    }
);
export default axiosSecure;