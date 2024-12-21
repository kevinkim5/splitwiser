import axios, { isAxiosError, AxiosError } from 'axios'

const baseAPI = axios.create({
  baseURL: process.env.NEXT_APP_SERVER_URL,
  withCredentials: true,
})

export const getAPICall = async (url: string) => {
  try {
    const res = await baseAPI.get(url)
    return res.data
  } catch (err) {
    console.log(err)
    const errors = err as Error | AxiosError
    if (!isAxiosError(errors)) {
      throw errors
    } else {
      if (errors?.response?.status === 403) return { isLoggedIn: false }
      throw errors?.response?.data?.error
    }
  }
}

export const postAPICall = async (url: string, dataObj: object) => {
  try {
    const res = await baseAPI.post(url, dataObj)
    return res.data
  } catch (err) {
    const errors = err as Error | AxiosError
    if (!isAxiosError(errors)) {
      throw errors
    } else {
      console.error(err)
      throw errors?.response?.data?.error
    }
  }
}
