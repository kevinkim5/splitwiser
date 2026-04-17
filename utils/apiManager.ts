import axios, { isAxiosError, AxiosError } from 'axios'

const baseAPI = axios.create({
  baseURL: '',
  withCredentials: true,
})

function extractError(err: unknown): string {
  const errors = err as Error | AxiosError
  if (!isAxiosError(errors)) {
    return errors?.message || 'An unexpected error occurred'
  }
  return errors?.response?.data?.error || 'An unexpected error occurred'
}

export const getAPICall = async (url: string) => {
  try {
    const res = await baseAPI.get(url)
    return res.data
  } catch (err) {
    if (isAxiosError(err) && err.response?.status === 401) {
      return null
    }
    throw extractError(err)
  }
}

export const postAPICall = async (url: string, dataObj: object) => {
  try {
    const res = await baseAPI.post(url, dataObj)
    return res.data
  } catch (err) {
    throw extractError(err)
  }
}

export const putAPICall = async (url: string, dataObj: object) => {
  try {
    const res = await baseAPI.put(url, dataObj)
    return res.data
  } catch (err) {
    throw extractError(err)
  }
}

export const patchAPICall = async (url: string, dataObj: object) => {
  try {
    const res = await baseAPI.patch(url, dataObj)
    return res.data
  } catch (err) {
    throw extractError(err)
  }
}

export const deleteAPICall = async (url: string) => {
  try {
    const res = await baseAPI.delete(url)
    return res.data
  } catch (err) {
    throw extractError(err)
  }
}
