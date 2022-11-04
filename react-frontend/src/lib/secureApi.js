import axios from 'axios'
import { Server } from "../components/Properties";
const getCsrf = () => axios(Server.getRestAPIHost() + '/getCsrfToken', { method: "get", withCredentials: true, credentials: 'same-origin' })
export default {
    getCsrf
}